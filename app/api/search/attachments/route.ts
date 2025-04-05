import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    const lowercaseQuery = query.toLowerCase();

    // Fetch files and filter them in memory for case-insensitive search
    const allFiles = await prisma.file.findMany({
      select: {
        id: true,
        filename: true,
        noteId: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter files where filename contains the query (case-insensitive)
    const files = allFiles
      .filter(file => file.filename.toLowerCase().includes(lowercaseQuery))
      .slice(0, 20); // Limit to 20 results

    return NextResponse.json(files);
  } catch (error) {
    console.error('Error searching attachments:', error);
    return NextResponse.json(
      { message: 'Failed to search attachments', error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 