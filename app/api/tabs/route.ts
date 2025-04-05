import { NextRequest, NextResponse } from 'next/server';
import { db, prisma } from '@/app/lib/db';
import { Tab } from '@/app/components/TabsManager';

// Use a consistent database client
const dbClient = db || prisma;

// GET /api/tabs?noteId=123
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const noteId = searchParams.get('noteId');
    
    if (!noteId) {
      return NextResponse.json({ error: 'Note ID is required' }, { status: 400 });
    }
    
    console.log(`Fetching tabs for note ID: ${noteId}`);
    
    try {
      // Check if the database client is available
      if (!dbClient || !dbClient.note) {
        console.error('Database client or Note model is not available');
        return NextResponse.json({ 
          error: 'Database connection issue',
          details: 'The database client is not properly initialized'
        }, { status: 500 });
      }
      
      // Check if the note exists first
      const noteExists = await dbClient.note.findUnique({
        where: { id: noteId }
      });
      
      if (!noteExists) {
        console.log(`Note with ID ${noteId} not found`);
        return NextResponse.json({ error: `Note with ID ${noteId} not found` }, { status: 404 });
      }
      
      // Try to fetch tabs
      const tabs = await dbClient.tab.findMany({
        where: { noteId },
        orderBy: { createdAt: 'asc' }
      });
      
      console.log(`Found ${tabs.length} tabs for note ID: ${noteId}`);
      return NextResponse.json(tabs);
    } catch (dbError) {
      console.error('Database error when fetching tabs:', dbError);
      
      // Check if this is a Prisma error related to missing table
      if (dbError.message && dbError.message.includes('does not exist in the current database')) {
        return NextResponse.json({ 
          error: 'The tabs table does not exist. You may need to run database migrations.',
          details: dbError.message
        }, { status: 500 });
      }
      
      throw dbError; // Re-throw to be caught by the outer try/catch
    }
  } catch (error) {
    console.error('Error fetching tabs:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch tabs',
      details: error.message
    }, { status: 500 });
  }
}

// POST /api/tabs
export async function POST(request: NextRequest) {
  try {
    const { noteId, tabs } = await request.json();
    
    if (!noteId || !tabs || !Array.isArray(tabs)) {
      return NextResponse.json({ error: 'Invalid request data' }, { status: 400 });
    }
    
    console.log(`Saving ${tabs.length} tabs for note ID: ${noteId}`);
    
    // Check if the database client is available
    if (!dbClient || !dbClient.note) {
      console.error('Database client or Note model is not available');
      return NextResponse.json({ 
        error: 'Database connection issue',
        details: 'The database client is not properly initialized'
      }, { status: 500 });
    }
    
    try {
      // Check if the note exists first
      const noteExists = await dbClient.note.findUnique({
        where: { id: noteId }
      });
      
      if (!noteExists) {
        console.log(`Note with ID ${noteId} not found`);
        return NextResponse.json({ error: `Note with ID ${noteId} not found` }, { status: 404 });
      }
      
      // Delete existing tabs for this note
      const deletedTabs = await dbClient.tab.deleteMany({
        where: { noteId }
      });
      console.log(`Deleted ${deletedTabs.count} existing tabs for note ID: ${noteId}`);
      
      // Create new tabs
      const createdTabs = await dbClient.tab.createMany({
        data: tabs.map(tab => ({
          id: tab.id,
          noteId,
          name: tab.name || 'Untitled',
          content: tab.content || '',
        }))
      });
      
      console.log(`Created ${createdTabs.count} new tabs for note ID: ${noteId}`);
      return NextResponse.json({ count: createdTabs.count });
    } catch (dbError) {
      console.error('Database error when saving tabs:', dbError);
      
      // Check if this is a Prisma error related to missing table
      if (dbError.message && dbError.message.includes('does not exist in the current database')) {
        return NextResponse.json({ 
          error: 'The tabs table does not exist. You may need to run database migrations.',
          details: dbError.message
        }, { status: 500 });
      }
      
      throw dbError; // Re-throw to be caught by the outer try/catch
    }
  } catch (error) {
    console.error('Error saving tabs:', error);
    return NextResponse.json({ error: 'Failed to save tabs' }, { status: 500 });
  }
}

// GET /api/tabs/search?q=query
export async function SEARCH(request: NextRequest) {
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
            { name: { contains: query, mode: 'insensitive' } },
            { content: { contains: query, mode: 'insensitive' } }
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