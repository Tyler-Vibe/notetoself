import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Properly await the params object
    const params = await context.params;
    const fileId = params.id;

    // Find the file in the database
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }

    // Delete the physical file
    const filePath = path.join(process.cwd(), file.path);
    
    // Check if file exists before attempting to delete
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete the file record from the database
    await prisma.file.delete({
      where: { id: fileId },
    });

    return NextResponse.json(
      { message: 'File deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting file:', error);
    return NextResponse.json(
      { message: 'Failed to delete file', error: error.message },
      { status: 500 }
    );
  }
}

// Also update the GET handler
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // Properly await the params object
    const params = await context.params;
    const fileId = params.id;
    
    const file = await prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }

    const filePath = path.join(process.cwd(), file.path);
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { message: 'File not found on server' },
        { status: 404 }
      );
    }

    const fileBuffer = fs.readFileSync(filePath);
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': file.mimetype,
        'Content-Disposition': `attachment; filename="${file.filename}"`,
      },
    });
  } catch (error) {
    console.error('Error retrieving file:', error);
    return NextResponse.json(
      { message: 'Failed to retrieve file', error: error.message },
      { status: 500 }
    );
  }
} 