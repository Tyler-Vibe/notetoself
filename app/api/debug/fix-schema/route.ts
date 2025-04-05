import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import fs from 'fs';
import path from 'path';

export async function GET(request: NextRequest) {
  try {
    console.log('Fixing database schema...');
    
    // Only allow this in development
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json({
        status: 'Schema fix not allowed in production',
      }, { status: 403 });
    }
    
    // 1. Backup the current database
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    const backupPath = path.join(process.cwd(), 'prisma', `dev.db.backup-${Date.now()}`);
    
    if (fs.existsSync(dbPath)) {
      fs.copyFileSync(dbPath, backupPath);
      console.log(`Database backed up to ${backupPath}`);
    }
    
    // 2. Update the schema file
    const schemaPath = path.join(process.cwd(), 'prisma', 'schema.prisma');
    let schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Remove @db.Text
    schema = schema.replace(/@db\.Text/g, '');
    
    // Fix tags array
    schema = schema.replace(/tags\s+String\[\]/g, 'tagsJson String?');
    
    fs.writeFileSync(schemaPath, schema);
    console.log('Schema file updated');
    
    // 3. Run the migration
    const { exec } = require('child_process');
    exec('npx prisma migrate dev --name fix-sqlite-schema', (error, stdout, stderr) => {
      if (error) {
        console.error(`Migration error: ${error.message}`);
        return;
      }
      console.log(`Migration stdout: ${stdout}`);
      console.error(`Migration stderr: ${stderr}`);
    });
    
    return NextResponse.json({
      status: 'Schema fix initiated',
      message: 'The database schema is being updated. Check the server logs for progress.'
    });
  } catch (error) {
    console.error('Schema fix error:', error);
    return NextResponse.json({
      status: 'Schema fix failed',
      error: error.message
    }, { status: 500 });
  }
} 