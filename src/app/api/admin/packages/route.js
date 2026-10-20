import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireInstituteOrAdmin, ROLES } from '@/lib/rbac';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const instituteId = searchParams.get('instituteId');
    const creatorName = searchParams.get('creatorName');
    const all = searchParams.get('all') === 'true';
    const superadmin = searchParams.get('superadmin') === 'true';

    // If super admin or all=true requested
    const isSuperAdminView = all || superadmin;

    // Filter sets based on institute isolation
    let setsWhere = {};
    let packagesWhere = {};

    if (!isSuperAdminView && (instituteId || creatorName)) {
      // Institutes can ONLY see global published sets OR their own private sets
      const orConditions = [{ isPublished: true }];
      if (instituteId) orConditions.push({ creatorInstituteId: instituteId });
      if (creatorName) orConditions.push({ creatorInstituteName: creatorName });

      setsWhere = { OR: orConditions };
      packagesWhere = {
        OR: [
          { isPublished: true },
          ...(instituteId ? [{ creatorInstituteId: instituteId }] : []),
          ...(creatorName ? [{ creatorInstituteName: creatorName }] : [])
        ]
      };
    }

    const packages = await prisma.examPackage.findMany({
      where: packagesWhere,
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
      where: setsWhere,
      include: {
        package: true,
        _count: { select: { questions: true } }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({ packages, sets });
  } catch (err) {
    console.error('Error fetching packages and sets:', err);
    return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const {
      action,
      packageName,
      setName,
      packageId,
      setId,
      duration = 3000,
      setType = 'UBT',
      creatorInstituteId = null,
      creatorInstituteName = null,
      isPrivate = null,
      isPublished = null,
      description = ''
    } = body;

    const isAdmin = session?.role === ROLES.ADMIN || body.superadmin === true;

    // 1. CREATE PACKAGE
    if (action === 'create_package') {
      if (!packageName) return NextResponse.json({ error: 'Package name is required' }, { status: 400 });

      const finalIsPrivate = isPrivate !== null ? isPrivate : !isAdmin;
      const finalIsPublished = isPublished !== null ? isPublished : isAdmin;

      const created = await prisma.examPackage.create({
        data: {
          name: packageName,
          description: description || null,
          creatorInstituteId: creatorInstituteId || session?.instituteId || null,
          creatorInstituteName: creatorInstituteName || (isAdmin ? 'Super Admin' : null),
          isPrivate: finalIsPrivate,
          isPublished: finalIsPublished
        }
      });
      return NextResponse.json({ success: true, package: created });
    }

    // 2. CREATE SET (For Institute's private bucket or Super Admin)
    if (action === 'create_set') {
      if (!setName) return NextResponse.json({ error: 'Set name is required' }, { status: 400 });

      const finalIsPrivate = isPrivate !== null ? isPrivate : !isAdmin;
      const finalIsPublished = isPublished !== null ? isPublished : isAdmin;

      const created = await prisma.examSet.create({
        data: {
          name: setName.trim().toUpperCase(),
          packageName: packageName || null,
          packageId: packageId || null,
          duration: Number(duration) || 3000,
          setType: setType || 'UBT',
          creatorInstituteId: creatorInstituteId || session?.instituteId || null,
          creatorInstituteName: creatorInstituteName || (isAdmin ? 'Super Admin' : 'Institute'),
          isPrivate: finalIsPrivate,
          isPublished: finalIsPublished
        }
      });
      return NextResponse.json({ success: true, set: created });
    }

    // 3. TOGGLE PUBLISH SET (SUPER ADMIN EXCLUSIVE AUTHORITY)
    if (action === 'toggle_publish_set') {
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden. Only Super Admin has authority to publish questions/sets for other institutes.' },
          { status: 403 }
        );
      }

      if (!setId && !setName) {
        return NextResponse.json({ error: 'Set ID or Set Name is required' }, { status: 400 });
      }

      let targetSet = null;
      if (setId) {
        targetSet = await prisma.examSet.findUnique({ where: { id: setId } });
      }
      if (!targetSet && setName) {
        targetSet = await prisma.examSet.findFirst({
          where: { name: setName.trim().toUpperCase() }
        });
      }

      const newPublishedState = isPublished !== undefined ? Boolean(isPublished) : (targetSet ? !targetSet.isPublished : true);

      let updated;
      if (targetSet) {
        updated = await prisma.examSet.update({
          where: { id: targetSet.id },
          data: {
            isPublished: newPublishedState,
            isPrivate: !newPublishedState
          }
        });
      } else {
        updated = await prisma.examSet.create({
          data: {
            name: (setName || setId).trim().toUpperCase(),
            packageName: packageName || 'Full Set UBT',
            duration: Number(duration) || 3000,
            setType: setType || 'UBT',
            creatorInstituteId: creatorInstituteId || null,
            creatorInstituteName: creatorInstituteName || 'Institute',
            isPublished: newPublishedState,
            isPrivate: !newPublishedState
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: newPublishedState
          ? `Set "${updated.name}" is now PUBLISHED and accessible to all institutes.`
          : `Set "${updated.name}" is now UNPUBLISHED (private to creator institute).`,
        set: updated
      });
    }

    // 4. DELETE SET
    if (action === 'delete_set') {
      if (!setId) return NextResponse.json({ error: 'Set ID is required' }, { status: 400 });
      await prisma.examSet.delete({ where: { id: setId } });
      return NextResponse.json({ success: true, message: 'Exam set deleted successfully' });
    }

    // 5. DELETE PACKAGE
    if (action === 'delete_package') {
      if (!packageId) return NextResponse.json({ error: 'Package ID is required' }, { status: 400 });
      await prisma.examPackage.delete({ where: { id: packageId } });
      return NextResponse.json({ success: true, message: 'Package deleted successfully' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err) {
    console.error('Error in package/set action:', err);
    return NextResponse.json({ error: 'Failed to process request: ' + err.message }, { status: 500 });
  }
}
