import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireInstituteOrAdmin } from '@/lib/rbac';

export async function GET(req) {
  try {
    const packages = await prisma.examPackage.findMany({
      include: {
        sets: {
          include: {
            _count: { select: { questions: true } }
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    const sets = await prisma.examSet.findMany({
      include: {
        package: true,
        _count: { select: { questions: true } }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ packages, sets });
  } catch (err) {
    console.error('Error fetching packages:', err);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const { action, packageName, setName, packageId } = body;

    if (action === 'create_package') {
      if (!packageName) return NextResponse.json({ error: 'Package name is required' }, { status: 400 });
      const created = await prisma.examPackage.create({
        data: { name: packageName }
      });
      return NextResponse.json({ success: true, package: created });
    }

    if (action === 'create_set') {
      if (!setName) return NextResponse.json({ error: 'Set name is required' }, { status: 400 });
      const created = await prisma.examSet.create({
        data: {
          name: setName,
          packageName: packageName || null,
          packageId: packageId || null
        }
      });
      return NextResponse.json({ success: true, set: created });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Error creating package/set:', err);
    return NextResponse.json({ error: 'Failed to create' }, { status: 500 });
  }
}
