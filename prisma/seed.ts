import { PrismaClient } from '@prisma/client';
import { notes } from '../app/data/notes';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');
  
  // Clear existing data
  await prisma.note.deleteMany({});
  console.log('Cleared existing notes');
  
  // Insert seed data
  for (const note of notes) {
    await prisma.note.create({
      data: {
        title: note.title,
        content: note.content,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
        tagsJson: JSON.stringify(note.tags || []),
      },
    });
  }
  
  console.log(`Database has been seeded with ${notes.length} notes`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 