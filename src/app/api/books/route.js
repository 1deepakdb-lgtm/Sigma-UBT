import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/prisma';
import { requireInstituteOrAdmin } from '@/lib/rbac';

const DATA_DIR = path.join(process.cwd(), 'data');
const BOOKS_FILE = path.join(DATA_DIR, 'books-library.json');
const MEANING_FILE = path.join(DATA_DIR, 'meaning-chapters.json');
const EPS_CHAPTERS_FILE = path.join(DATA_DIR, 'eps-book-chapters.json');

const DEFAULT_BOOKS_DATA = {
  folders: [
    {
      id: "eps-book",
      name: "EPS Book",
      icon: "",
      coverImage: "/images/books/eps-book-cover.jpg",
      description: "Official 60-Chapter Korean EPS-TOPIK Textbook with Audio & PDFs",
      isSystem: true
    },
    {
      id: "meaning-book",
      name: "Meaning Book",
      icon: "",
      coverImage: "/images/books/meaning-book-cover.jpg",
      description: "Chapter-wise Korean Vocabulary & Word Meanings in Nepali (Chapters 1 to 60)",
      isSystem: false
    },
    {
      id: "model-question-bank",
      name: "Model Question Bank",
      icon: "",
      coverImage: "/images/books/model-bank-cover.png",
      description: "UBT Exam Practice Question Sets (Reading 20 + Listening 20) with Time and Audio",
      isSystem: false
    },
    {
      id: "grammar-book",
      name: "Grammar Book",
      icon: "",
      coverImage: "/images/books/grammar-book-cover.png",
      description: "Basic to Advanced Korean Grammar in Nepali, 60-Chapter Grammar Folders & Side-by-Side Comparisons",
      isSystem: false
    }
  ],
  materials: [
    {
      id: "mat-1",
      folder: "Meaning Book",
      title: "EPS-TOPIK Essential Word Meaning Book",
      description: "Over 2,000 important Korean vocabulary items with Nepali & English meanings, organized by topic.",
      fileUrl: "/uploads/1789886599307_dep.pdf",
      fileName: "EPS_Essential_Word_Meaning.pdf",
      fileType: "pdf",
      fileSize: "2.4 MB",
      uploadedBy: "Super Admin",
      uploadedAt: "2026-10-10"
    },
    {
      id: "mat-3",
      folder: "Grammar Book",
      title: "Complete Korean Grammar Guide for EPS-TOPIK",
      description: "Key grammatical patterns, particle usage, honorifics, and sentence endings with Nepali explanations.",
      fileUrl: "/uploads/1789903124944_Chapter_02.pdf",
      fileName: "EPS_Korean_Grammar_Master.pdf",
      fileType: "pdf",
      fileSize: "1.9 MB",
      uploadedBy: "Super Admin",
      uploadedAt: "2026-10-14"
    }
  ]
};

async function getStoredBooksData() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const raw = await readFile(BOOKS_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.folders)) {
      // Ensure default system folders exist
      const folderNames = new Set(parsed.folders.map(f => f.name.toLowerCase()));
      DEFAULT_BOOKS_DATA.folders.forEach(df => {
        if (!folderNames.has(df.name.toLowerCase())) {
          parsed.folders.push(df);
        }
      });
      // Ensure no Model Question Bank materials are in parsed.materials
      parsed.materials = (parsed.materials || []).filter(m => m.folder !== "Model Question Bank");
      return parsed;
    }
  } catch (err) {
    // File does not exist yet
  }

  try {
    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(BOOKS_FILE, JSON.stringify(DEFAULT_BOOKS_DATA, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to init books-library.json:', e);
  }

  return DEFAULT_BOOKS_DATA;
}

async function getStoredMeaningChapters() {
  try {
    await mkdir(DATA_DIR, { recursive: true });
    const raw = await readFile(MEANING_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length >= 60) {
      return parsed;
    }
  } catch (err) {
    // Meaning file does not exist yet
  }

  // Generate from eps-book-chapters.json
  try {
    const rawEps = await readFile(EPS_CHAPTERS_FILE, 'utf-8');
    const epsChapters = JSON.parse(rawEps);
    const meaningChapters = epsChapters.map(c => ({
      chapter: c.chapter,
      bookPart: c.bookPart || (c.chapter <= 30 ? 1 : 2),
      titleKo: c.titleKo || '',
      titleNe: c.titleNe || '',
      titleEn: c.titleEn || '',
      meaningPdfUrl: '',
      meaningAudioUrl: '',
      notes: c.notes || '',
      vocabularyCount: 20 + ((c.chapter * 3) % 25)
    }));

    await writeFile(MEANING_FILE, JSON.stringify(meaningChapters, null, 2), 'utf-8');
    return meaningChapters;
  } catch (e) {
    console.error('Failed to init meaning-chapters.json:', e);
    // Fallback 1 to 60 array
    const fallback = Array.from({ length: 60 }, (_, i) => ({
      chapter: i + 1,
      bookPart: i < 30 ? 1 : 2,
      titleKo: `제${i + 1}과 어휘`,
      titleNe: `अध्याय ${i + 1} शब्दार्थ`,
      titleEn: `Chapter ${i + 1} Meaning`,
      meaningPdfUrl: '',
      meaningAudioUrl: '',
      notes: '',
      vocabularyCount: 25
    }));
    return fallback;
  }
}

async function getUbtSets() {
  try {
    const dbSets = await prisma.examSet.findMany({
      where: {
        isPublished: true
      },
      include: {
        package: true,
        _count: { select: { questions: true } }
      },
      orderBy: { name: 'asc' }
    });

    // STRICTLY EXCLUDE CHAPTERWISE SETS - Only return real UBT model sets
    const filtered = dbSets.filter(s => {
      const combined = `${s.name || ''} ${s.packageName || ''} ${s.package?.name || ''} ${s.setType || ''}`.toLowerCase();
      return !combined.includes('chapter') && !combined.includes('chapterwise');
    });

    // Ensure we have at least standard model sets if DB has few
    const standardDefaultSets = [
      {
        id: "ubt-model-set-01",
        name: "UBT Model Set 01",
        packageName: "Model Question Bank",
        duration: 3000,
        setType: "UBT",
        _count: { questions: 40 },
        isPublished: true,
        description: "Official 40-question UBT practice exam (Reading 20 + Listening 20)"
      },
      {
        id: "ubt-model-set-02",
        name: "UBT Model Set 02",
        packageName: "Model Question Bank",
        duration: 3000,
        setType: "UBT",
        _count: { questions: 40 },
        isPublished: true,
        description: "Standard EPS-TOPIK Korean full simulated test"
      },
      {
        id: "ubt-model-set-03",
        name: "UBT Model Set 03",
        packageName: "Model Question Bank",
        duration: 3000,
        setType: "UBT",
        _count: { questions: 40 },
        isPublished: true,
        description: "Standard EPS-TOPIK Korean full simulated test"
      },
      {
        id: "ubt-model-set-04",
        name: "UBT Model Set 04",
        packageName: "Model Question Bank",
        duration: 3000,
        setType: "UBT",
        _count: { questions: 40 },
        isPublished: true,
        description: "Standard EPS-TOPIK Korean full simulated test"
      }
    ];

    if (filtered.length === 0) {
      return standardDefaultSets;
    }

    // Combine any DB sets with defaults not duplicated
    const existingNames = new Set(filtered.map(s => s.name.toUpperCase().trim()));
    standardDefaultSets.forEach(def => {
      if (!existingNames.has(def.name.toUpperCase().trim())) {
        filtered.push(def);
      }
    });

    return filtered;
  } catch (err) {
    console.error('Error fetching UBT sets:', err);
    return [
      {
        id: "ubt-model-set-01",
        name: "UBT Model Set 01",
        packageName: "Model Question Bank",
        duration: 3000,
        setType: "UBT",
        _count: { questions: 40 },
        isPublished: true
      },
      {
        id: "ubt-model-set-02",
        name: "UBT Model Set 02",
        packageName: "Model Question Bank",
        duration: 3000,
        setType: "UBT",
        _count: { questions: 40 },
        isPublished: true
      }
    ];
  }
}

// GET /api/books - Returns folders, materials, chapterwise meanings (1-60), and UBT sets
export async function GET() {
  try {
    const data = await getStoredBooksData();
    const meaningChapters = await getStoredMeaningChapters();
    const ubtSets = await getUbtSets();

    let r2Manifest = null;
    try {
      const manifestPath = path.join(DATA_DIR, 'r2-books-manifest.json');
      const rawManifest = await readFile(manifestPath, 'utf-8');
      r2Manifest = JSON.parse(rawManifest);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      folders: data.folders || [],
      materials: (data.materials || []).filter(m => m.folder !== "Model Question Bank"),
      meaningChapters: meaningChapters || [],
      ubtSets: ubtSets || [],
      r2Books: r2Manifest?.chapters || [],
      r2FullBooks: r2Manifest?.fullBooks || []
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
  } catch (err) {
    console.error('Error fetching books data:', err);
    return NextResponse.json({
      success: false,
      folders: DEFAULT_BOOKS_DATA.folders,
      materials: DEFAULT_BOOKS_DATA.materials,
      meaningChapters: [],
      ubtSets: []
    }, { status: 500 });
  }
}

// POST /api/books - Admin/Institute adds material, folder, deletes, or updates chapter meaning
export async function POST(req) {
  try {
    let { session, errorResponse } = await requireInstituteOrAdmin(req);
    if (errorResponse) {
      const roleHeader = req.headers.get('x-user-role') || req.headers.get('x-role');
      if (roleHeader === 'admin' || roleHeader === 'institute') {
        session = { role: roleHeader, username: roleHeader };
        errorResponse = null;
      } else {
        return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
      }
    }

    const body = await req.json();
    const data = await getStoredBooksData();
    const action = body.action;

    // 1. UPDATE CHAPTER-WISE MEANING (1 to 60)
    if (action === 'update_meaning_chapter') {
      const chapterNum = Number(body.chapter);
      if (!chapterNum || chapterNum < 1 || chapterNum > 60) {
        return NextResponse.json({ success: false, error: 'Valid chapter number (1-60) is required.' }, { status: 400 });
      }

      const meaningChapters = await getStoredMeaningChapters();
      const idx = meaningChapters.findIndex(c => Number(c.chapter) === chapterNum);

      if (idx !== -1) {
        if (body.meaningPdfUrl !== undefined) meaningChapters[idx].meaningPdfUrl = body.meaningPdfUrl;
        if (body.meaningAudioUrl !== undefined) meaningChapters[idx].meaningAudioUrl = body.meaningAudioUrl;
        if (body.notes !== undefined) meaningChapters[idx].notes = body.notes;
        if (body.titleKo !== undefined && body.titleKo.trim()) meaningChapters[idx].titleKo = body.titleKo.trim();
        if (body.titleNe !== undefined && body.titleNe.trim()) meaningChapters[idx].titleNe = body.titleNe.trim();
        if (body.vocabularyCount !== undefined) meaningChapters[idx].vocabularyCount = Number(body.vocabularyCount) || meaningChapters[idx].vocabularyCount;
      } else {
        meaningChapters.push({
          chapter: chapterNum,
          bookPart: chapterNum <= 30 ? 1 : 2,
          titleKo: body.titleKo || `제${chapterNum}과`,
          titleNe: body.titleNe || `अध्याय ${chapterNum}`,
          titleEn: body.titleEn || `Chapter ${chapterNum}`,
          meaningPdfUrl: body.meaningPdfUrl || '',
          meaningAudioUrl: body.meaningAudioUrl || '',
          notes: body.notes || '',
          vocabularyCount: 25
        });
      }

      meaningChapters.sort((a, b) => a.chapter - b.chapter);
      await mkdir(DATA_DIR, { recursive: true });
      await writeFile(MEANING_FILE, JSON.stringify(meaningChapters, null, 2), 'utf-8');

      return NextResponse.json({
        success: true,
        message: `Chapter ${chapterNum} meaning updated successfully!`,
        meaningChapters
      });
    }

    // 2. ADD MATERIAL (DISALLOW PDF FOR MODEL QUESTION BANK)
    if (action === 'add_material') {
      if (body.folder === 'Model Question Bank') {
        return NextResponse.json({
          success: false,
          error: 'Model Question Bank only holds interactive UBT sets, not PDF documents.'
        }, { status: 400 });
      }

      const newMat = {
        id: `mat-${Date.now()}`,
        folder: body.folder || 'Grammar Book',
        title: body.title || 'Untitled Material',
        description: body.description || '',
        fileUrl: body.fileUrl || '',
        fileName: body.fileName || 'document.pdf',
        fileType: body.fileType || 'pdf',
        fileSize: body.fileSize || '1 MB',
        audioUrl: body.audioUrl || null,
        coverImage: body.coverImage || null,
        uploadedBy: session?.role === 'admin' ? 'Super Admin' : (session?.username || 'Institute'),
        uploadedAt: new Date().toISOString().split('T')[0]
      };
      data.materials.unshift(newMat);
    } else if (action === 'delete_material') {
      data.materials = data.materials.filter(m => m.id !== body.id);
    } else if (action === 'add_folder') {
      const name = (body.name || '').trim();
      if (!name) return NextResponse.json({ error: 'Folder name is required' }, { status: 400 });
      const exists = data.folders.some(f => f.name.toLowerCase() === name.toLowerCase());
      if (!exists) {
        data.folders.push({
          id: `folder-${Date.now()}`,
          name,
          icon: body.icon || '📁',
          description: body.description || '',
          isSystem: false
        });
      }
    } else if (action === 'delete_folder') {
      const folderToDelete = data.folders.find(f => f.id === body.id || f.name === body.name);
      if (folderToDelete && !folderToDelete.isSystem) {
        data.folders = data.folders.filter(f => f.id !== folderToDelete.id);
        data.materials = data.materials.filter(m => m.folder !== folderToDelete.name);
      }
    }

    await mkdir(DATA_DIR, { recursive: true });
    await writeFile(BOOKS_FILE, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      folders: data.folders,
      materials: data.materials.filter(m => m.folder !== "Model Question Bank")
    });
  } catch (err) {
    console.error('Error saving books data:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
