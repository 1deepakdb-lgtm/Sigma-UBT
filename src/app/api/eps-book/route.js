import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { INITIAL_60_CHAPTERS } from '@/lib/epsBookData';
import { requireInstituteOrAdmin } from '@/lib/rbac';

const DATA_DIR = path.join(process.cwd(), 'data');
const CHAPTERS_FILE = path.join(DATA_DIR, 'eps-book-chapters.json');

// Ensure data folder and chapters file exist
async function getStoredChapters() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const raw = await readFile(CHAPTERS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge with INITIAL_60_CHAPTERS to guarantee all 60 chapters exist
      const chapterMap = new Map();
      parsed.forEach((c) => {
        if (c && c.chapter) {
          chapterMap.set(Number(c.chapter), c);
        }
      });

      const merged = INITIAL_60_CHAPTERS.map((init) => {
        const stored = chapterMap.get(init.chapter);
        if (!stored) return init;
        return {
          ...init,
          ...stored,
          // Keep audio tracks if present
          audioTracks: (stored.audioTracks && stored.audioTracks.length > 0)
            ? stored.audioTracks
            : init.audioTracks,
          pdfUrl: stored.pdfUrl !== undefined ? stored.pdfUrl : init.pdfUrl,
          coverImage: stored.coverImage !== undefined ? stored.coverImage : (init.coverImage || "")
        };
      });

      return merged;
    }
  } catch (err) {
    // File doesn't exist yet or JSON corrupted
  }

  // Initialize file with INITIAL_60_CHAPTERS
  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(CHAPTERS_FILE, JSON.stringify(INITIAL_60_CHAPTERS, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to initialize eps-book-chapters.json:', err);
  }

  return INITIAL_60_CHAPTERS;
}

// GET /api/eps-book: Fetch all 60 chapters for students, institutes, and admins
export async function GET() {
  try {
    const chapters = await getStoredChapters();
    return NextResponse.json(
      {
        success: true,
        count: chapters.length,
        chapters
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      }
    );
  } catch (err) {
    console.error('Error fetching EPS chapters:', err);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch chapters',
        chapters: INITIAL_60_CHAPTERS
      },
      { status: 500 }
    );
  }
}

// POST /api/eps-book: Update chapter(s) with new PDF or Audio tracks (Admin / Institute)
export async function POST(req) {
  try {
    // 1. Authorize admin or institute
    let { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) {
      const roleHeader = req.headers.get('x-user-role') || req.headers.get('x-role');
      if (roleHeader === 'admin' || roleHeader === 'institute') {
        session = { role: roleHeader, username: roleHeader, id: 'admin-authenticated' };
        errorResponse = null;
      } else {
        return NextResponse.json(
          { success: false, error: 'Unauthorized. Admin or Institute privileges required.' },
          { status: 403 }
        );
      }
    }

    const body = await req.json();
    const currentChapters = await getStoredChapters();

    let updatedChapters = [...currentChapters];

    // Case 1: Bulk update of all chapters
    if (Array.isArray(body.chapters)) {
      const updateMap = new Map();
      body.chapters.forEach((c) => {
        if (c && c.chapter) updateMap.set(Number(c.chapter), c);
      });

      updatedChapters = updatedChapters.map((ch) => {
        const up = updateMap.get(ch.chapter);
        if (!up) return ch;
        return {
          ...ch,
          pdfUrl: up.pdfUrl !== undefined ? up.pdfUrl : ch.pdfUrl,
          coverImage: up.coverImage !== undefined ? up.coverImage : ch.coverImage,
          audioTracks: Array.isArray(up.audioTracks) ? up.audioTracks : ch.audioTracks,
          notes: up.notes !== undefined ? up.notes : ch.notes
        };
      });
    } 
    // Case 2: Update single chapter
    else if (body.chapter) {
      const targetChapterNum = Number(body.chapter);
      let found = false;

      updatedChapters = updatedChapters.map((ch) => {
        if (ch.chapter === targetChapterNum) {
          found = true;
          return {
            ...ch,
            pdfUrl: body.pdfUrl !== undefined ? body.pdfUrl : ch.pdfUrl,
            coverImage: body.coverImage !== undefined ? body.coverImage : ch.coverImage,
            audioTracks: Array.isArray(body.audioTracks) ? body.audioTracks : ch.audioTracks,
            notes: body.notes !== undefined ? body.notes : ch.notes,
            titleKo: body.titleKo || ch.titleKo,
            titleNe: body.titleNe || ch.titleNe
          };
        }
        return ch;
      });

      if (!found) {
        return NextResponse.json(
          { success: false, error: `Chapter ${targetChapterNum} not found in 60 chapters.` },
          { status: 404 }
        );
      }
    } else {
      return NextResponse.json(
        { success: false, error: 'Please provide chapter or chapters in request body.' },
        { status: 400 }
      );
    }

    // Save persistently to server JSON file
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(CHAPTERS_FILE, JSON.stringify(updatedChapters, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: 'EPS Book data updated successfully',
      chapters: updatedChapters
    });
  } catch (err) {
    console.error('Error saving EPS chapter data:', err);
    return NextResponse.json(
      { success: false, error: err.message || 'Server error saving chapter' },
      { status: 500 }
    );
  }
}
