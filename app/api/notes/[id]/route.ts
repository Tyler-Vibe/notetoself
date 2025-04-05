import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    
    const note = await prisma.note.findUnique({
      where: { id },
    });
    
    if (!note) {
      return NextResponse.json(
        { message: 'Note not found' },
        { status: 404 }
      );
    }
    
    // Convert tagsJson back to tags array
    const formattedNote = {
      ...note,
      tags: note.tagsJson ? JSON.parse(note.tagsJson) : [],
    };
    
    return NextResponse.json(formattedNote);
  } catch (error) {
    console.error('Error fetching note:', error);
    return NextResponse.json(
      { message: 'Failed to fetch note', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const { title, content, tags } = await request.json();
    
    // Validate required fields
    if (!title || !content) {
      return NextResponse.json(
        { message: 'Title and content are required' },
        { status: 400 }
      );
    }
    
    // Check if note exists
    const existingNote = await prisma.note.findUnique({
      where: { id },
    });
    
    if (!existingNote) {
      return NextResponse.json(
        { message: 'Note not found' },
        { status: 404 }
      );
    }
    
    // Convert tags array to JSON string
    const tagsJson = JSON.stringify(tags || []);
    
    // Update the note
    const updatedNote = await prisma.note.update({
      where: { id },
      data: {
        title,
        content,
        tagsJson,
      },
    });
    
    // Convert tagsJson back to tags array for response
    const formattedNote = {
      ...updatedNote,
      tags: tags || [],
    };
    
    return NextResponse.json(formattedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    return NextResponse.json(
      { message: 'Failed to update note', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    
    // Check if note exists
    const existingNote = await prisma.note.findUnique({
      where: { id },
      include: {
        files: true, // Include files to delete them
      },
    });
    
    if (!existingNote) {
      return NextResponse.json(
        { message: 'Note not found' },
        { status: 404 }
      );
    }
    
    // Delete associated files from storage
    for (const file of existingNote.files) {
      try {
        // Get the full path to the file
        const filePath = path.join(process.cwd(), 'public', file.path);
        
        // Check if file exists before attempting to delete
        await fs.access(filePath);
        
        // Delete the file
        await fs.unlink(filePath);
        console.log(`Deleted file: ${filePath}`);
      } catch (fileError) {
        console.error(`Error deleting file ${file.path}:`, fileError);
        // Continue with deletion even if file removal fails
      }
    }
    
    // Delete the note (this will cascade delete files and tabs due to onDelete: Cascade)
    await prisma.note.delete({
      where: { id },
    });
    
    console.log(`Note with ID: ${id} deleted successfully`);
    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    return NextResponse.json(
      { message: 'Failed to delete note', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 