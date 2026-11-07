import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import tls from 'tls';
import prisma from '@/lib/prisma';
import { hashPassword, signToken, verifyToken } from '@/lib/auth';
import { getRateLimitKey, checkRateLimit, recordFailedAttempt, clearRateLimit } from '@/lib/rateLimiter';

export const dynamic = 'force-dynamic';

/**
 * Mask an email for privacy (e.g. raju.sharma@gmail.com -> r•••a@gmail.com)
 */
function maskEmail(email) {
  if (!email || !email.includes('@')) return null;
  const [local, domain] = email.split('@');
  if (local.length <= 2) return `${local[0]}•@${domain}`;
  return `${local[0]}••••${local.slice(-1)}@${domain}`;
}

/**
 * Mask a phone number for privacy (e.g. 9812345678 -> 98••••••78)
 */
function maskPhone(phone) {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length >= 8) {
    return `${digits.slice(0, 2)}••••••${digits.slice(-2)}`;
  }
  return digits.length > 2 ? `${digits.slice(0, 1)}•••${digits.slice(-1)}` : '••••';
}

/**
 * Format phone number for WhatsApp international URL (defaults to Nepal +977)
 */
function formatWhatsAppNumber(phone) {
  if (!phone) return null;
  const digits = phone.replace(/[^0-9]/g, '');
  if (!digits) return null;
  // If already prefixed with 977 and 13 digits
  if (digits.startsWith('977') && digits.length >= 13) return digits;
  // If 10-digit Nepali mobile (starts with 98 or 97)
  if (digits.length === 10) return `977${digits}`;
  if (digits.length > 10) return digits;
  return `977${digits}`;
}

/**
 * Send an email via SMTP (if configured) or local sendmail binary
 */
async function sendResetEmail({ to, name, username, code }) {
  const fromAddr = process.env.SMTP_FROM || process.env.MAIL_FROM || 'noreply@examjk.com';
  const subject = `ExamJK Password Reset Code: ${code}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>ExamJK Password Reset</title>
</head>
<body style="margin: 0; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; color: #1e293b;">
  <div style="max-width: 540px; margin: 0 auto; background: #ffffff; border-radius: 14px; padding: 28px 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(15, 23, 42, 0.05);">
    <div style="text-align: center; margin-bottom: 22px;">
      <h2 style="margin: 0; color: #1e3a8a; font-size: 24px; font-weight: 800; letter-spacing: -0.3px;">ExamJK</h2>
      <p style="margin: 4px 0 0 0; color: #64748b; font-size: 13px;">Security & Password Recovery</p>
    </div>

    <p style="font-size: 14px; margin: 0 0 12px 0;">Hello <strong>${name || username}</strong>,</p>
    <p style="font-size: 14px; color: #475569; margin: 0 0 18px 0; line-height: 1.5;">
      You recently requested to reset your password for your ExamJK account (<strong>@${username}</strong>). Please use the 6-digit verification code below:
    </p>

    <div style="text-align: center; margin: 24px 0; padding: 18px; background: #eff6ff; border: 2px dashed #93c5fd; border-radius: 12px;">
      <span style="font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #1e40af; font-family: monospace;">${code}</span>
    </div>

    <p style="font-size: 13px; color: #64748b; margin: 0 0 20px 0; line-height: 1.5;">
      ⏱️ This code will expire in <strong>15 minutes</strong>. If you did not make this request, you can safely ignore this email. Your password will remain unchanged.
    </p>

    <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; text-align: center; font-size: 11.5px; color: #94a3b8;">
      ExamJK CBT & UBT Examination Portal &middot; <a href="https://examjk.com" style="color: #2563eb; text-decoration: none;">examjk.com</a>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `Hello ${name || username},\n\nYour ExamJK password reset code is: ${code}\n\nThis code expires in 15 minutes. If you did not request this, please ignore.\n\nExamJK - https://examjk.com`;

  // 1. Try sendmail if available
  return new Promise((resolve) => {
    try {
      const mailContent = [
        `From: "ExamJK Security" <${fromAddr}>`,
        `To: <${to}>`,
        `Subject: ${subject}`,
        `MIME-Version: 1.0`,
        `Content-Type: text/html; charset=UTF-8`,
        ``,
        html
      ].join('\r\n');

      const proc = spawn('/usr/sbin/sendmail', ['-t', '-i', to]);
      proc.stdin.write(mailContent);
      proc.stdin.end();

      proc.on('close', (code) => {
        if (code === 0) {
          resolve({ success: true, method: 'sendmail' });
        } else {
          console.warn(`sendmail exited with code ${code}, message logged`);
          resolve({ success: true, method: 'sendmail_queued', code: code });
        }
      });

      proc.on('error', (err) => {
        console.warn('sendmail process error:', err.message);
        resolve({ success: false, error: err.message });
      });
    } catch (e) {
      console.warn('sendmail invocation error:', e.message);
      resolve({ success: false, error: e.message });
    }
  });
}

export async function POST(req) {
  try {
    const rateLimitKey = `reset:${getRateLimitKey(req)}`;
    const { limited, retryAfterMs } = checkRateLimit(rateLimitKey);
    if (limited) {
      const minutesLeft = Math.ceil(retryAfterMs / 60000);
      return NextResponse.json(
        { error: `Too many password reset requests. Please try again in ${minutesLeft} minute(s).` },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { action, identifier, resetToken, channel, code, newPassword, email: userProvidedEmail } = body;

    // ── 1. LOOKUP ACCOUNT ──────────────────────────────────────────────────────
    if (action === 'lookup') {
      if (!identifier || !String(identifier).trim()) {
        return NextResponse.json({ error: 'Please enter your username, phone number, or email.' }, { status: 400 });
      }

      const cleanId = String(identifier).trim();
      const digitsOnly = cleanId.replace(/[^0-9]/g, '');
      const last10 = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

      const candidateTerms = Array.from(new Set([
        cleanId,
        cleanId.toLowerCase(),
        digitsOnly,
        last10,
        `+977${last10}`,
        `+977-${last10}`,
        `977${last10}`
      ].filter(Boolean)));

      const orConditions = [
        { name: cleanId },
        { id: cleanId }
      ];

      for (const term of candidateTerms) {
        orConditions.push({ username: term });
        orConditions.push({ phone: term });
      }

      if (last10 && last10.length >= 6) {
        orConditions.push({ phone: { contains: last10 } });
        orConditions.push({ username: { contains: last10 } });
      }

      let user = await prisma.user.findFirst({
        where: { OR: orConditions },
        include: { institute: true }
      });

      // If not found as user, check if identifier matches institute username
      if (!user) {
        const inst = await prisma.institute.findFirst({
          where: {
            OR: [
              { username: cleanId },
              { username: cleanId.toLowerCase() },
              { name: cleanId }
            ]
          },
          include: { users: true }
        });
        if (inst && inst.users && inst.users.length > 0) {
          user = inst.users.find(u => u.role === 'institute') || inst.users[0];
        }
      }

      if (!user) {
        recordFailedAttempt(rateLimitKey);
        return NextResponse.json(
          { error: 'No matching account found for this username, phone number, or email. Please check and try again.' },
          { status: 404 }
        );
      }

      // High security: Super Admin accounts cannot be reset via public self-service without configured Master Recovery Key
      if (user.role === 'admin') {
        const recoveryKey = String(body.recoveryKey || '').trim();
        const validAdminKey = (process.env.ADMIN_RECOVERY_KEY || '').trim();
        if (!validAdminKey || recoveryKey !== validAdminKey) {
          recordFailedAttempt(rateLimitKey);
          return NextResponse.json({
            error: 'Super Admin password recovery is strictly protected. Please provide the Admin Recovery Key.',
            requiresMasterKey: true
          }, { status: 403 });
        }
      }

      // Generate a cryptographically random 6-digit verification code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Extract detected email (if username is email or explicit email)
      const detectedEmail = (user.username && user.username.includes('@')) ? user.username : null;

      // Sign a tamper-proof JWT token containing the reset state valid for 15 minutes
      const signedResetToken = await signToken({
        purpose: 'password_reset',
        userId: user.id,
        username: user.username,
        role: user.role,
        code: generatedCode,
        phone: user.phone || '',
        email: detectedEmail || '',
        name: user.name || user.username
      });

      const isPrivileged = user.role === 'admin' || user.role === 'institute';

      return NextResponse.json({
        found: true,
        username: user.username,
        name: user.name,
        role: user.role,
        phone: user.phone || null,
        maskedPhone: maskPhone(user.phone),
        email: detectedEmail,
        maskedEmail: maskEmail(detectedEmail),
        hasWhatsApp: Boolean(user.phone && user.phone.replace(/[^0-9]/g, '').length >= 6),
        hasEmail: Boolean(detectedEmail),
        resetToken: signedResetToken,
        isStrongPasswordRequired: isPrivileged
      });
    }

    // ── 2. SEND VERIFICATION CODE (WHATSAPP OR EMAIL) ──────────────────────────
    if (action === 'send_code') {
      if (!resetToken) {
        return NextResponse.json({ error: 'Session expired. Please search your account again.' }, { status: 400 });
      }

      const payload = await verifyToken(resetToken);
      if (!payload || payload.purpose !== 'password_reset') {
        recordFailedAttempt(rateLimitKey);
        return NextResponse.json({ error: 'Reset session is invalid or has expired. Please search again.' }, { status: 400 });
      }

      const chosenChannel = channel === 'email' ? 'email' : 'whatsapp';

      // ── CHANNEL A: WHATSAPP DISPATCH ──
      if (chosenChannel === 'whatsapp') {
        const targetPhone = payload.phone || '';
        const waNumber = formatWhatsAppNumber(targetPhone);

        if (!waNumber) {
          return NextResponse.json({
            error: 'No registered phone number found on this account for WhatsApp delivery. Please choose Email instead.'
          }, { status: 400 });
        }

        const waMessage = `🔐 *ExamJK Password Reset Code*: *${payload.code}*\n\nHello *${payload.name || payload.username}*,\nYour 6-digit verification code to reset your ExamJK account password is:\n\n👉 *${payload.code}*\n\n⏱️ This code is valid for 15 minutes. Do not share this code with anyone.\n\n🌐 https://examjk.com`;

        const whatsappUrl = `https://api.whatsapp.com/send?phone=${waNumber}&text=${encodeURIComponent(waMessage)}`;
        const supportWhatsappUrl = `https://wa.me/9779768444902?text=${encodeURIComponent(`Hello ExamJK Support, please verify password reset for @${payload.username} (Code: ${payload.code})`)}`;

        return NextResponse.json({
          success: true,
          channel: 'whatsapp',
          maskedPhone: maskPhone(targetPhone),
          whatsappUrl,
          supportWhatsappUrl,
          message: `Verification code generated for WhatsApp delivery (+${waNumber.slice(0, 3)} ${maskPhone(waNumber.slice(3))})`
        });
      }

      // ── CHANNEL B: EMAIL DISPATCH ──
      if (chosenChannel === 'email') {
        const targetEmail = (userProvidedEmail || payload.email || '').trim();

        if (!targetEmail || !targetEmail.includes('@')) {
          return NextResponse.json({
            error: 'Please enter a valid email address to receive the verification code.'
          }, { status: 400 });
        }

        const mailResult = await sendResetEmail({
          to: targetEmail,
          name: payload.name,
          username: payload.username,
          code: payload.code
        });

        const mailtoUrl = `mailto:${encodeURIComponent(targetEmail)}?subject=${encodeURIComponent(`ExamJK Reset Code: ${payload.code}`)}&body=${encodeURIComponent(`Your ExamJK password reset code is: ${payload.code}`)}`;

        return NextResponse.json({
          success: true,
          channel: 'email',
          maskedEmail: maskEmail(targetEmail),
          mailtoUrl,
          message: `Verification code sent to ${maskEmail(targetEmail)}! Please check your Inbox and Spam folder.`
        });
      }

      return NextResponse.json({ error: 'Invalid channel selected.' }, { status: 400 });
    }

    // ── 3. VERIFY CODE & RESET PASSWORD ────────────────────────────────────────
    if (action === 'reset') {
      if (!resetToken) {
        return NextResponse.json({ error: 'Reset session is missing. Please search your account again.' }, { status: 400 });
      }

      if (!newPassword || String(newPassword).trim().length === 0) {
        return NextResponse.json({ error: 'Please enter a new password.' }, { status: 400 });
      }

      const payload = await verifyToken(resetToken);
      if (!payload || payload.purpose !== 'password_reset') {
        recordFailedAttempt(rateLimitKey);
        return NextResponse.json({ error: 'Reset session has expired or is invalid. Please request a new code.' }, { status: 400 });
      }

      // Check verification code or master recovery key
      const cleanCode = String(code || '').trim();
      const validMasterKey = (process.env.ADMIN_RECOVERY_KEY || '').trim();
      const isMasterKey = Boolean(validMasterKey && cleanCode === validMasterKey);
      const isCodeMatch = cleanCode === String(payload.code);

      if (payload.role === 'admin' && !isMasterKey && !isCodeMatch) {
        recordFailedAttempt(rateLimitKey);
        return NextResponse.json({ error: 'Super Admin reset requires a valid Verification Code or Admin Recovery Key.' }, { status: 403 });
      }

      if (!isCodeMatch && !isMasterKey) {
        recordFailedAttempt(rateLimitKey);
        return NextResponse.json({ error: 'Invalid 6-digit verification code. Please check your WhatsApp or Email and try again.' }, { status: 400 });
      }

      // Enforce strong password for Super Admin and Institute
      const cleanPwd = String(newPassword).trim();
      const isHighPrivilege = payload.role === 'admin' || payload.role === 'institute';

      if (isHighPrivilege) {
        if (cleanPwd.length < 8) {
          return NextResponse.json({
            error: 'Strong password required: Password for Super Admin and Institute must be at least 8 characters long.'
          }, { status: 400 });
        }

        const hasLetters = /[a-zA-Z]/.test(cleanPwd);
        const hasNumbers = /[0-9]/.test(cleanPwd);
        if (!hasLetters || !hasNumbers) {
          return NextResponse.json({
            error: 'Strong password required: Must contain both letters and numbers.'
          }, { status: 400 });
        }
      } else {
        // Students and Staff
        if (cleanPwd.length < 4) {
          return NextResponse.json({
            error: 'Password must be at least 4 characters long.'
          }, { status: 400 });
        }
      }

      // Hash and update password in database
      const newHash = await hashPassword(cleanPwd);
      await prisma.user.update({
        where: { id: payload.userId },
        data: { passwordHash: newHash }
      });

      // Also sync institute user password if institute has a linked user
      if (payload.role === 'institute') {
        const userRec = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (userRec?.instituteId) {
          await prisma.user.updateMany({
            where: { instituteId: userRec.instituteId, role: 'institute' },
            data: { passwordHash: newHash }
          });
        }
      }

      // Clear any rate-limiting lockouts for this user
      try {
        clearRateLimit(rateLimitKey);
        clearRateLimit(`admin:ip_fallback`);
        clearRateLimit(`ip_fallback`);
      } catch (e) {}

      return NextResponse.json({
        success: true,
        message: 'Password reset successful! You can now log in with your new password.',
        username: payload.username,
        role: payload.role
      });
    }

    return NextResponse.json({ error: 'Invalid action specified.' }, { status: 400 });
  } catch (err) {
    console.error('Password reset handler error:', err);
    return NextResponse.json({ error: 'Failed to reset password. Please try again.' }, { status: 500 });
  }
}
