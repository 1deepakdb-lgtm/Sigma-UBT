import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { getOrCreateOpenInstitute } from '@/lib/openInstitute';

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, identifier, password, languageTrack = 'both' } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Please enter your full name.' },
        { status: 400 }
      );
    }

    if (!identifier || !identifier.trim()) {
      return NextResponse.json(
        { error: 'Please enter your mobile phone number or email address.' },
        { status: 400 }
      );
    }

    const cleanInput = identifier.trim();
    const isEmail = cleanInput.includes('@');
    const digitsOnly = cleanInput.replace(/[^0-9]/g, '');
    const isPhone = !isEmail && digitsOnly.length >= 6;

    if (!password || password.length < 4) {
      return NextResponse.json(
        { error: 'Password must be at least 4 characters long.' },
        { status: 400 }
      );
    }

    // Determine primary username for the new account
    let usernameClean = isEmail
      ? cleanInput.toLowerCase()
      : (digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly);

    if (!usernameClean) {
      usernameClean = cleanInput;
    }

    // Check if account already exists
    const candidateTerms = Array.from(new Set([
      usernameClean,
      cleanInput,
      cleanInput.toLowerCase(),
      digitsOnly,
      digitsOnly.slice(-10),
      `+977${digitsOnly.slice(-10)}`
    ].filter(Boolean)));

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          ...candidateTerms.map(t => ({ username: t })),
          ...candidateTerms.map(t => ({ phone: t }))
        ]
      }
    });

    if (existingUser) {
      return NextResponse.json(
        {
          error: 'An account with this phone or email already exists. Please switch to the Sign In tab.',
          alreadyExists: true
        },
        { status: 409 }
      );
    }

    // Ensure open institute with free materials exists
    const openInst = await getOrCreateOpenInstitute(languageTrack);

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create the student user account
    const user = await prisma.user.create({
      data: {
        username: usernameClean,
        passwordHash,
        role: 'student',
        name: name.trim(),
        phone: isPhone ? digitsOnly : (isEmail ? null : cleanInput),
        batch: 'Free Student Access',
        status: 'Active',
        instituteId: openInst?.id || null
      },
      include: {
        institute: true
      }
    });

    const tokenPayload = {
      id: user.id,
      username: user.username,
      name: user.name,
      role: 'student',
      phone: user.phone || null,
      batch: 'Free Student Access',
      studentPackage: 'Full Set UBT',
      expiryDate: (() => {
        const d = new Date();
        d.setMonth(d.getMonth() + 1);
        return d.toISOString().split('T')[0];
      })(),
      instituteId: user.instituteId,
      instituteName: user.institute?.name || 'ExamJK Open Academy',
      instituteLanguage: languageTrack || 'both',
      isFreeStudent: true
    };

    const token = await signToken(tokenPayload);

    const response = NextResponse.json({
      success: true,
      message: 'Account created successfully! Free student access granted.',
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
    console.error('Registration error:', err);
    return NextResponse.json(
      { error: 'Registration failed due to a server error. Please try again.' },
      { status: 500 }
    );
  }
}
