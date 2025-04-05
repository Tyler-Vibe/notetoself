import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all models from the database
    const models = Object.keys(db).filter(key => 
      typeof db[key] === 'object' && 
      db[key] !== null && 
      !['$on', '$connect', '$disconnect', '$transaction', '$use'].includes(key)
    );
    
    // Check if the Tab model exists
    const hasTabModel = models.includes('tab');
    
    // Try to query the database
    let tabsTableExists = false;
    try {
      await db.$queryRaw`SELECT 1 FROM Tab LIMIT 1`;
      tabsTableExists = true;
    } catch (error) {
      console.error('Error checking Tab table:', error);
    }
    
    // Get database info
    const databaseInfo = {
      provider: db._engineConfig?.activeProvider,
      models,
      hasTabModel,
      tabsTableExists
    };
    
    return NextResponse.json({
      status: 'Database connection successful',
      databaseInfo
    });
  } catch (error) {
    console.error('Database connection error:', error);
    return NextResponse.json({
      status: 'Database connection failed',
      error: error.message
    }, { status: 500 });
  }
} 