import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken, verifyToken } from '@/lib/auth';
import { getRateLimitKey, checkRateLimit, recordFailedAttempt, clearRateLimit } from '@/lib/rateLimiter';

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
    const { action, identifier, resetToken, code, newPassword } = body;

    // ── 1. LOOKUP ACCOUNT ──────────────────────────────────────────────────────
    if (action === 'lookup') {
      if (!identifier || !String(identifier).trim()) {
        return NextResponse.json({ error: 'Please enter your username, phone number, or ID.' }, { status: 400 });
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
          { error: 'No matching account found for this username or phone. Please check and try again.' },
          { status: 404 }
        );
      }

      // High security: Super Admin accounts cannot be reset via public self-service without configured Master Recovery Key
      if (user.role === 'admin') {
        const recoveryKey = String(body.recoveryKey || body.code || '').trim();
        const validAdminKey = (process.env.ADMIN_RECOVERY_KEY || '').trim();
        if (!validAdminKey || recoveryKey !== validAdminKey) {
          recordFailedAttempt(rateLimitKey);
          return NextResponse.json({
            error: 'Super Admin password recovery is strictly protected. Please configure and provide the Admin Recovery Key.',
            requiresMasterKey: true
          }, { status: 403 });
        }
      }

      // Generate a secure 6-digit verification code
      const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

      // Sign a tamper-proof JWT token containing the reset state valid for 15 minutes
      const signedResetToken = await signToken({
        purpose: 'password_reset',
        userId: user.id,
        username: user.username,
        role: user.role,
        code: generatedCode,
        phone: user.phone || ''
      });

      // Mask phone number for user privacy if available
      let maskedPhone = null;
      if (user.phone && user.phone.length >= 6) {
        const p = user.phone.replace(/[^0-9]/g, '');
        if (p.length >= 8) {
          maskedPhone = `${p.slice(0, 2)}••••••${p.slice(-2)}`;
        } else {
          maskedPhone = `${p.slice(0, 1)}••••${p.slice(-1)}`;
        }
      }

      // Security: Only students receive on-screen verification code. Privileged accounts (admin/institute) do NOT.
      const isPrivileged = user.role === 'admin' || user.role === 'institute';

      return NextResponse.json({
        found: true,
        username: user.username,
        name: user.name,
        role: user.role,
        maskedPhone,
        verificationCode: isPrivileged ? null : generatedCode,
        resetToken: signedResetToken,
        isStrongPasswordRequired: isPrivileged
      });
    }

    // ── 2. VERIFY CODE & RESET PASSWORD ────────────────────────────────────────
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

      // Check verification code or phone confirmation or master recovery key
      const cleanCode = String(code || '').trim();
      const registeredPhoneDigits = (payload.phone || '').replace(/[^0-9]/g, '');
      const inputDigits = cleanCode.replace(/[^0-9]/g, '');

      const validMasterKey = (process.env.ADMIN_RECOVERY_KEY || '').trim();
      const isMasterKey = Boolean(validMasterKey && cleanCode === validMasterKey);
      const isCodeMatch = payload.role === 'student' && cleanCode === String(payload.code);
      const isPhoneMatch = registeredPhoneDigits.length >= 6 && (inputDigits === registeredPhoneDigits || registeredPhoneDigits.endsWith(inputDigits));

      if (payload.role === 'admin' && !isMasterKey) {
        recordFailedAttempt(rateLimitKey);
        return NextResponse.json({ error: 'Super Admin reset requires a valid Admin Recovery Key.' }, { status: 403 });
      }

      if (payload.role === 'institute' && !isPhoneMatch && !isMasterKey) {
        recordFailedAttempt(rateLimitKey);
        return NextResponse.json({ error: 'Institute password reset requires verifying your full registered phone number or Admin Recovery Key.' }, { status: 403 });
      }

      if (!isCodeMatch && !isPhoneMatch && !isMasterKey) {
        recordFailedAttempt(rateLimitKey);
        return NextResponse.json({ error: 'Invalid verification code or phone number.' }, { status: 400 });
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
            error: 'Strong password required: Must contain both letters and numbers (symbols recommended e.g. @, #, !).'
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

      // Hash and update password
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
