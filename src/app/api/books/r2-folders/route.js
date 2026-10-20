import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const MANIFEST_PATH = path.join(process.cwd(), 'data', 'r2-books-manifest.json');
const CHAPTERS_PATH = path.join(process.cwd(), 'data', 'eps-book-chapters.json');

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const chapterParam = searchParams.get('chapter');
    const partParam = searchParams.get('part');

    let manifest = null;
    try {
      const raw = await readFile(MANIFEST_PATH, 'utf-8');
      manifest = JSON.parse(raw);
    } catch (err) {
      // Manifest not ready yet, fallback to eps-book-chapters.json
    }

    if (!manifest) {
      try {
        const rawCh = await readFile(CHAPTERS_PATH, 'utf-8');
        const chapters = JSON.parse(rawCh);
        manifest = {
          chapters: chapters.map(c => ({
            folder: `Chapter ${c.chapter}`,
            chapter: c.chapter,
            bookPart: c.bookPart,
            titleKo: c.titleKo,
            titleNe: c.titleNe,
            titleEn: c.titleEn,
            pdfUrl: c.pdfUrl,
            audioTracks: c.audioTracks || []
          })),
          fullBooks: [],
          cover: null
        };
      } catch (e) {
        return NextResponse.json({ success: false, error: 'Book manifest not found yet' }, { status: 404 });
      }
    }

    let folders = manifest.chapters || [];

    // Filter by chapter if requested
    if (chapterParam !== null) {
      const num = parseInt(chapterParam, 10);
      const found = folders.find(f => f.chapter === num);
      if (!found) {
        return NextResponse.json({ success: false, error: `Chapter ${num} not found` }, { status: 404 });
      }
      return NextResponse.json({
        success: true,
        folder: found
      });
    }

    // Filter by book part if requested (1 or 2)
    if (partParam !== null) {
      const partNum = parseInt(partParam, 10);
      folders = folders.filter(f => f.bookPart === partNum);
    }

    return NextResponse.json({
      success: true,
      totalFolders: folders.length,
      fullBooks: manifest.fullBooks || [],
      cover: manifest.cover || null,
      folders
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error fetching R2 books folders:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
