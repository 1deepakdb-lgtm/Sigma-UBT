import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { getOrCreateOpenInstitute } from '@/lib/openInstitute';
import { decodeJwt } from 'jose';

export async function POST(req) {
  try {
    const body = await req.json();
    let { credential, email, name, googleId, picture, languageTrack = 'both' } = body;

    // Decode Google ID Token if passed from Google Identity Services
    if (credential && typeof credential === 'string') {
      try {
        const decoded = decodeJwt(credential);
        if (decoded) {
          if (decoded.email) email = decoded.email;
          if (decoded.name) name = decoded.name;
          if (decoded.sub) googleId = decoded.sub;
          if (decoded.picture) picture = decoded.picture;
        }
      } catch (err) {
        console.warn('Google credential decode error:', err);
      }
    }

    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid Google email account is required for Google Sign-In.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const fallbackName = name && name.trim() ? name.trim() : cleanEmail.split('@')[0];

    // Check if user already exists
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: cleanEmail },
          { username: cleanEmail.split('@')[0] }
        ]
      },
      include: {
        institute: true
      }
    });

    const openInst = await getOrCreateOpenInstitute(languageTrack);

    if (user) {
      if (user.status === 'Blocked') {
        return NextResponse.json(
          { error: 'Your account has been deactivated. Please contact support.' },
          { status: 403 }
        );
      }
    } else {
      // Auto-create new student user with Google identity
      const defaultPwdHash = await hashPassword(`google-auth-${Date.now()}-${Math.random()}`);

      user = await prisma.user.create({
        data: {
          username: cleanEmail,
          passwordHash: defaultPwdHash,
          role: 'student',
          name: fallbackName,
          phone: null,
          batch: 'Student',
          status: 'Active',
          instituteId: openInst?.id || null
        },
        include: {
          institute: true
        }
      });
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role || 'student',
      phone: user.phone || null,
      batch: user.batch || 'Free Student Access',
      studentPackage: 'Full Set UBT',
      expiryDate: (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
      })(),
      instituteId: user.instituteId || openInst?.id || null,
      instituteName: user.institute?.name || openInst?.name || 'ExamJK Open Academy',
      instituteLanguage: languageTrack || user.institute?.language || 'both',
      isGoogleAuth: true,
      picture: picture || null
    };

    const token = await signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Google Sign-In successful! Free student access active.',
      user: tokenPayload
    });

    response.cookies.set('sigma_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/'
    });

    return response;
  } catch (err) {
    console.error('Google Auth route error:', err);
    return NextResponse.json(
      { error: 'Google authentication failed due to a server error. Please try again.' },
      { status: 500 }
    );
  }
}
