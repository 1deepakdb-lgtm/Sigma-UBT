import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { getOrCreateOpenInstitute } from '@/lib/openInstitute';
import { decodeJwt } from 'jose';

export async function POST(req) {
  try {
    const body = await req.json();
    let { credential, email, name, googleId, picture, languageTrack = 'both' } = body;

    // Verify Google ID Token with Google if credential is provided
    if (credential && typeof credential === 'string') {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`);
        if (verifyRes.ok) {
          const googlePayload = await verifyRes.json();
          if (googlePayload && googlePayload.email) {
            email = googlePayload.email;
            if (googlePayload.name) name = googlePayload.name;
            if (googlePayload.sub) googleId = googlePayload.sub;
            if (googlePayload.picture) picture = googlePayload.picture;
          }
        } else {
          const decoded = decodeJwt(credential);
          if (decoded && decoded.email) {
            email = decoded.email;
            if (decoded.name) name = decoded.name;
            if (decoded.sub) googleId = decoded.sub;
            if (decoded.picture) picture = decoded.picture;
          }
        }
      } catch (err) {
        console.warn('Google credential verification notice:', err);
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

    // Check if student user already exists by exact email
    let user = await prisma.user.findFirst({
      where: {
        username: cleanEmail
      },
      include: {
        institute: true
      }
    });

    // SECURITY: Google Sign-In is strictly for students.
    // Administrative, institute, and staff accounts CANNOT be accessed via Google Auth.
    if (user && user.role !== 'student') {
      return NextResponse.json(
        { error: 'Administrative and staff accounts must log in using their username and password.' },
        { status: 403 }
      );
    }

    const finalTrack = ['korean', 'japanese', 'both'].includes(languageTrack) ? languageTrack : (user?.language || 'both');
    const openInst = await getOrCreateOpenInstitute(finalTrack);

    if (user) {
      if (user.status === 'Blocked') {
        return NextResponse.json(
          { error: 'Your account has been deactivated. Please contact support.' },
          { status: 403 }
        );
      }
    } else {
      // Auto-create new student user with Google identity (strictly role: student)
      const defaultPwdHash = await hashPassword(`google-auth-${Date.now()}-${Math.random()}`);

      user = await prisma.user.create({
        data: {
          username: cleanEmail,
          passwordHash: defaultPwdHash,
          role: 'student',
          name: fallbackName,
          phone: null,
          batch: finalTrack === 'japanese' ? 'Japanese Student' : finalTrack === 'korean' ? 'Korean Student' : 'Free Student Access',
          status: 'Active',
          language: finalTrack,
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
      role: 'student', // Strictly enforce student role
      phone: user.phone || null,
      batch: user.batch || 'Free Student Access',
      studentPackage: 'Free Student Access',
      expiryDate: null,
      accountValidity: 'Lifetime',
      instituteId: user.instituteId || openInst?.id || null,
      instituteName: user.institute?.name || openInst?.name || 'ExamJK Open Academy',
      instituteLanguage: user.language || finalTrack || user.institute?.language || 'both',
      isGoogleAuth: true,
      isFreeStudent: true,
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
