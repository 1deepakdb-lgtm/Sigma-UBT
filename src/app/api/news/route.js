import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireInstituteOrAdmin } from '@/lib/rbac';

const DATA_DIR = path.join(process.cwd(), 'data');
const NOTICES_FILE = path.join(DATA_DIR, 'notices.json');

// Helper to safely read notices
async function getStoredNotices() {
  try {
    const raw = await readFile(NOTICES_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (err) {
    return [];
  }
}

// Helper to safely write notices
async function saveNotices(notices) {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(NOTICES_FILE, JSON.stringify(notices, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save notices to disk:', err);
  }
}

// GET: Return notices, with optional institute-level and study track language filtering
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const instituteParam = searchParams.get('institute');
    const roleParam = searchParams.get('role'); // 'student', 'institute', 'admin'
    const languageParam = (searchParams.get('language') || searchParams.get('track') || '').trim().toLowerCase();

    const allNotices = await getStoredNotices();

    let filtered = allNotices;

    // Strict isolation for students and institutes
    if (roleParam === 'student' || roleParam === 'institute') {
      if (instituteParam) {
        const cleanInst = instituteParam.trim().toLowerCase();
        filtered = allNotices.filter((n) => {
          // Global notices (for all students across all institutes)
          if (!n.instituteName || n.targetAudience === 'all') return true;
          // Target institute matches
          const target = (n.targetAudience || n.instituteName || '').trim().toLowerCase();
          const inst = (n.instituteName || '').trim().toLowerCase();
          return target === cleanInst || inst === cleanInst;
        });
      } else {
        // Without institute assigned, student only receives global notices
        filtered = allNotices.filter((n) => !n.instituteName || n.targetAudience === 'all');
      }
    }

    // Filter by Study Track language if specified (and not 'both' or 'all')
    if (languageParam && languageParam !== 'all' && languageParam !== 'both') {
      filtered = filtered.filter((n) => {
        const nLang = (n.language || n.track || 'all').trim().toLowerCase();
        return nLang === 'all' || nLang === languageParam;
      });
    }

    return NextResponse.json({ success: true, notices: filtered, total: filtered.length }, { status: 200 });
  } catch (err) {
    console.error('GET /api/news error:', err);
    return NextResponse.json({ success: false, notices: [] }, { status: 500 });
  }
}

// POST: Publish a new notice (Superadmin for all or specific institute; Institute for own students; Korean / Japanese / All tracks)
export async function POST(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const body = await req.json();
    const {
      title,
      content,
      category = 'notice',
      isPopup = false,
      fileUrl = null,
      fileName = '',
      fileType = '',
      fileSize = 0,
      instituteName = null,
      instituteId = null,
      targetAudience = 'all',
      language = 'all'
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const currentNotices = await getStoredNotices();

    const isAdmin = session.role === 'admin';
    const isGlobal = isAdmin && targetAudience === 'all';
    const assignedInst = isGlobal ? null : (isAdmin ? (instituteName || targetAudience || null) : (session.name || session.instituteName || session.username));
    const assignedInstId = isGlobal ? null : (isAdmin ? (instituteId || null) : (session.instituteId || null));
    const chosenTarget = isGlobal ? 'all' : (assignedInst || 'all');
    const targetLanguage = (language || body.track || 'all').trim().toLowerCase();

    const newItem = {
      id: Date.now(),
      category: category === 'news' ? 'news' : 'notice',
      title: String(title).trim(),
      content: String(content).trim(),
      isPopup: Boolean(isPopup),
      fileUrl: fileUrl || null,
      fileName: fileName || '',
      fileType: fileType || '',
      fileSize: Number(fileSize) || 0,
      targetAudience: chosenTarget,
      instituteName: assignedInst,
      instituteId: assignedInstId,
      publishedBy: isAdmin ? 'admin' : 'institute',
      language: targetLanguage, // 'all' | 'korean' | 'japanese'
      track: targetLanguage,
      date: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString()
    };

    const updated = [newItem, ...currentNotices];
    await saveNotices(updated);

    return NextResponse.json({ success: true, notice: newItem, notices: updated }, { status: 201 });
  } catch (err) {
    console.error('POST /api/news error:', err);
    return NextResponse.json({ error: 'Failed to publish notice' }, { status: 500 });
  }
}

// DELETE: Delete a notice by ID (Admin or publishing Institute)
export async function DELETE(req) {
  try {
    const { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) return errorResponse;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notice ID is required' }, { status: 400 });
    }

    const currentNotices = await getStoredNotices();
    const noticeToDelete = currentNotices.find((n) => String(n.id) === String(id));

    if (!noticeToDelete) {
      return NextResponse.json({ success: true, notices: currentNotices });
    }

    // Ownership check: non-admins can only delete notices that belong to their own institute
    if (session.role !== 'admin') {
      if (noticeToDelete.instituteId && noticeToDelete.instituteId !== session.instituteId) {
        return NextResponse.json({ error: 'Forbidden: You can only delete your own institute notices.' }, { status: 403 });
      }
    }

    const updated = currentNotices.filter((n) => String(n.id) !== String(id));
    await saveNotices(updated);

    return NextResponse.json({ success: true, notices: updated }, { status: 200 });
  } catch (err) {
    console.error('DELETE /api/news error:', err);
    return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 });
  }
}
