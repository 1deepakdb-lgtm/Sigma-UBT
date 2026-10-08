import { NextResponse } from 'next/server';
import { readFile, writeFile, mkdir } from 'fs/promises';
import path from 'path';

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

// GET: Return all notices & news
export async function GET(req) {
  try {
    const notices = await getStoredNotices();
    return NextResponse.json({ success: true, notices }, { status: 200 });
  } catch (err) {
    console.error('GET /api/news error:', err);
    return NextResponse.json({ success: false, notices: [] }, { status: 500 });
  }
}

// POST: Publish a new notice or official news
export async function POST(req) {
  try {
    const body = await req.json();
    const { title, content, category = 'notice', isPopup = false, fileUrl = null, fileName = '', fileType = '', fileSize = 0 } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const currentNotices = await getStoredNotices();

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

// DELETE: Delete a notice by ID
export async function DELETE(req) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Notice ID is required' }, { status: 400 });
    }

    const currentNotices = await getStoredNotices();
    const updated = currentNotices.filter((n) => String(n.id) !== String(id));
    await saveNotices(updated);

    return NextResponse.json({ success: true, notices: updated }, { status: 200 });
  } catch (err) {
    console.error('DELETE /api/news error:', err);
    return NextResponse.json({ error: 'Failed to delete notice' }, { status: 500 });
  }
}
