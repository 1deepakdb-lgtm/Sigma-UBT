import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

const MANIFEST_PATH = path.join(process.cwd(), 'data', 'r2-japanese-manifest.json');

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const levelParam = searchParams.get('level'); // e.g. "N5", "N4", "N3", "N2", "N1"
    const typeParam = searchParams.get('type'); // "minna" or "n3" or "full"

    let manifest = null;
    try {
      const raw = await readFile(MANIFEST_PATH, 'utf-8');
      manifest = JSON.parse(raw);
    } catch (err) {
      // Manifest not generated yet
    }

    if (!manifest) {
      return NextResponse.json({
        success: false,
        error: 'Japanese R2 manifest not found yet',
        minnaLessons: [],
        n3Units: [],
        fullBooks: []
      }, { status: 200 });
    }

    let minnaLessons = manifest.minnaLessons || [];
    let n3Units = manifest.n3Units || [];
    let n2Units = manifest.n2Units || [];
    let n1Units = manifest.n1Units || [];
    let fullBooks = manifest.fullBooks || [];

    if (levelParam) {
      const lvl = levelParam.toUpperCase();
      minnaLessons = minnaLessons.filter(m => m.level === lvl);
      n3Units = n3Units.filter(u => u.level === lvl);
      n2Units = n2Units.filter(u => u.level === lvl);
      n1Units = n1Units.filter(u => u.level === lvl);
      fullBooks = fullBooks.filter(b => b.level === lvl);
    }

    return NextResponse.json({
      success: true,
      minnaLessons,
      n3Units,
      n2Units,
      n1Units,
      fullBooks,
      generatedAt: manifest.generatedAt
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Error fetching Japanese R2 books:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
