import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/auth';
import prisma from '@/lib/prisma';

/**
 * Standard Role Hierarchy and Permissions
 */
export const ROLES = {
  ADMIN: 'admin',
  INSTITUTE: 'institute',
  STUDENT: 'student',
  STAFF: 'staff',
};

/**
 * Require authentication and one or more allowed roles.
 * Can be called inside any Next.js Route Handler.
 *
 * @param {Request} req
 * @param {string[]} allowedRoles
 * @returns {Promise<{ session: object | null, errorResponse: NextResponse | null }>}
 */
export async function requireRole(req, allowedRoles = []) {
  const session = await getSessionUser(req);

  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        {
          error: 'Unauthorized',
          message: 'Authentication required. Please log in.'
        },
        { status: 401 }
      )
    };
  }

  // If specific roles are required, check role membership
  if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    return {
      session,
      errorResponse: NextResponse.json(
        {
          error: 'Forbidden',
          message: `Access denied. Role '${session.role}' is not authorized for this resource.`
        },
        { status: 403 }
      )
    };
  }

  // If user belongs to an institute, check institute subscription expiry
  if (session.instituteId && (session.role === ROLES.INSTITUTE || session.role === ROLES.STUDENT || session.role === ROLES.STAFF)) {
    const institute = await prisma.institute.findUnique({
      where: { id: session.instituteId },
      select: { status: true, expireDate: true }
    });

    if (institute) {
      const isExpired = new Date(institute.expireDate + 'T23:59:59') < new Date();
      if (isExpired || institute.status === 'Expired') {
        return {
          session,
          errorResponse: NextResponse.json(
            {
              error: 'Forbidden',
              message: 'Institute subscription has expired. Please contact administration.'
            },
            { status: 403 }
          )
        };
      }
    }
  }

  return { session, errorResponse: null };
}

/**
 * Check if the request is from a Super Admin
 */
export async function requireAdmin(req) {
  return requireRole(req, [ROLES.ADMIN]);
}

/**
 * Check if the request is from an Institute Admin, Staff, or Super Admin
 */
export async function requireInstituteOrAdmin(req) {
  return requireRole(req, [ROLES.ADMIN, ROLES.INSTITUTE, ROLES.STAFF]);
}

/**
 * Check if the request is strictly from an Institute Admin or Super Admin (not Staff)
 */
export async function requireInstituteAdmin(req) {
  return requireRole(req, [ROLES.ADMIN, ROLES.INSTITUTE]);
}

/**
 * Check if the request is from a Student
 */
export async function requireStudent(req) {
  return requireRole(req, [ROLES.STUDENT, ROLES.ADMIN, ROLES.INSTITUTE]);
}
