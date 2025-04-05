import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export async function GET(request: NextRequest) {
  try {
    console.log('Running database migrations...');
    
    // Only allow this in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        status: 'Migration not allowed in production',
      }, { status: 403 });
    }
    
    // Run the migration command
    const { stdout, stderr } = await execAsync('npx prisma migrate dev --name add-tabs-table');
    
    return NextResponse.json({
      status: 'Migration completed',
      stdout,
      stderr
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({
      status: 'Migration failed',
      error: error.message,
      stdout: error.stdout,
      stderr: error.stderr
    }, { status: 500 });
  }
} 