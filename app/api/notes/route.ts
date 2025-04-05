import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/db';
import { TagType } from '@/app/types/note';

export async function GET() {
  try {
    const notesFromDb = await prisma.note.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Convert tagsJson back to tags array
    const notes = notesFromDb.map(note => ({
      ...note,
      tags: note.tagsJson ? JSON.parse(note.tagsJson) : [],
    }));
    
    return NextResponse.json(notes);
  } catch (error) {
    console.error('GET notes error:', error);
    return NextResponse.json({ error: 'Failed to fetch notes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('POST request body:', body);
    
    const { title, content, tags } = body;
    
    // Validate required fields
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }
    
    // Validate tags
    if (tags && !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Tags must be an array' }, { status: 400 });
    }

    const tagsJson = JSON.stringify(tags || []);

    const noteInDb = await prisma.note.create({
      data: {
        title,
        content,
        tagsJson,
      },
    });
    
    // Convert back to the expected format for the client
    const note = {
      ...noteInDb,
      tags: tags || [],
    };
    
    console.log('Created note:', note);
    return NextResponse.json(note);
  } catch (error) {
    console.error('POST note error:', error);
    return NextResponse.json({ 
      error: 'Failed to create note', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    console.log('PUT request body:', body);
    
    const { id, title, content, tags } = body;
    
    // Validate required fields
    if (!id || !title || !content) {
      return NextResponse.json({ error: 'ID, title, and content are required' }, { status: 400 });
    }
    
    // Validate tags
    if (tags && !Array.isArray(tags)) {
      return NextResponse.json({ error: 'Tags must be an array' }, { status: 400 });
    }

    const tagsJson = JSON.stringify(tags || []);

    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
        tagsJson,
      },
    });
    
    // Convert back to the expected format for the client
    const note = {
      ...updatedNote,
      tags: updatedNote.tagsJson ? JSON.parse(updatedNote.tagsJson) : [],
    };
    
    console.log('Updated note:', note);
    return NextResponse.json(note);
  } catch (error) {
    console.error('PUT note error:', error);
    return NextResponse.json({ 
      error: 'Failed to update note', 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 