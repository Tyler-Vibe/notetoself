import { NextRequest, NextResponse } from 'next/server';
import { db, prisma } from '@/app/lib/db';

// Use a consistent database client
const dbClient = db || prisma;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    
    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }
    
    console.log(`Searching tabs for query: "${query}"`);
    
    // Check if the database client is available
    if (!dbClient || !dbClient.tab) {
      console.error('Database client or Tab model is not available');
      return NextResponse.json({ 
        error: 'Database connection issue',
        details: 'The database client is not properly initialized'
      }, { status: 500 });
    }
    
    try {
      const tabResults = await dbClient.tab.findMany({
        where: {
          OR: [
            { name: { contains: query } },
            { content: { contains: query } }
          ]
        },
        include: {
          note: {
            select: {
              id: true,
              title: true
            }
          }
        }
      });
      
      console.log(`Found ${tabResults.length} tab results for query: "${query}"`);
      
      const formattedResults = tabResults.map(tab => {
        const isNameMatch = tab.name.toLowerCase().includes(query.toLowerCase());
        let matchText = '';
        let matchType: 'name' | 'content' = 'content';
        
        if (isNameMatch) {
          matchText = tab.name;
          matchType = 'name';
        } else {
          // Get a snippet of the matching content
          const content = tab.content || '';
          const index = content.toLowerCase().indexOf(query.toLowerCase());
          const start = Math.max(0, index - 30);
          const end = Math.min(content.length, index + query.length + 30);
          matchText = (start > 0 ? '...' : '') + 
                      content.substring(start, end) + 
                      (end < content.length ? '...' : '');
        }
        
        return {
          noteId: tab.noteId,
          noteTitle: tab.note.title,
          tabId: tab.id,
          tabName: tab.name,
          matchText,
          matchType
        };
      });
      
      return NextResponse.json(formattedResults);
    } catch (dbError) {
      console.error('Database error when searching tabs:', dbError);
      throw dbError;
    }
  } catch (error) {
    console.error('Error searching tabs:', error);
    return NextResponse.json({ error: 'Failed to search tabs' }, { status: 500 });
  }
} 