import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Configure Next.js to handle large file uploads
export const config = {
  api: {
    bodyParser: false, // Disables the default body parser
    responseLimit: false, // Removes the response size limit
  },
};

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const noteId = params.id;

    // Check if the note exists
    const note = await prisma.note.findUnique({
      where: { id: noteId },
    });

    if (!note) {
      return NextResponse.json(
        { message: 'Note not found' },
        { status: 404 }
      );
    }

    // Process the form data with no size limits
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Generate a unique filename
    const uniqueFilename = `${Date.now()}-${file.name.replace(/\s+/g, '-')}`;
    const relativePath = `/uploads/${uniqueFilename}`; // Path relative to public directory
    const fullPath = path.join(process.cwd(), 'public', relativePath);

    // Convert file to ArrayBuffer and then to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Write the file to disk
    await writeFile(fullPath, buffer);

    // Save file information to the database - store the path correctly
    const savedFile = await prisma.file.create({
      data: {
        filename: file.name,
        path: relativePath, // Store the path relative to public directory
        mimetype: file.type,
        size: buffer.length,
        noteId: noteId,
      },
    });

    console.log('Uploading file:', file.name, 'to note:', noteId);
    console.log('File path:', relativePath);
    console.log('Full path:', fullPath);

    // After saving to database
    console.log('File saved to database:', savedFile);

    return NextResponse.json(savedFile, { status: 201 });
  } catch (error) {
    console.error('Error uploading file:', error);
    return NextResponse.json(
      { message: 'Failed to upload file', error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const noteId = params.id;

    const files = await prisma.file.findMany({
      where: { noteId: noteId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { message: 'Failed to fetch files', error: error.message },
      { status: 500 }
    );
  }
} 