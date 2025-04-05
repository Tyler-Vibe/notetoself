import { Note } from "../types/note";

export const notes: Note[] = [
  {
    id: "1",
    title: "Meeting Notes",
    content: "Discussed project timeline and assigned tasks to team members.",
    createdAt: "2023-10-15T10:00:00Z",
    updatedAt: "2023-10-15T10:00:00Z",
    tags: ["project"],
  },
  {
    id: "2",
    title: "Shopping List",
    content: "Milk, eggs, bread, fruits, vegetables, chicken",
    createdAt: "2023-10-16T14:30:00Z",
    updatedAt: "2023-10-16T15:45:00Z",
    tags: ["personalinfo"],
  },
  {
    id: "3",
    title: "Book Recommendations",
    content: "1. Atomic Habits\n2. Deep Work\n3. The Psychology of Money",
    createdAt: "2023-10-17T09:15:00Z",
    updatedAt: "2023-10-17T09:15:00Z",
    tags: ["link"],
  },
  {
    id: "4",
    title: "Project Ideas",
    content: "- Build a personal finance tracker\n- Create a recipe app\n- Develop a habit tracker",
    createdAt: "2023-10-18T16:20:00Z",
    updatedAt: "2023-10-19T11:10:00Z",
    tags: ["project", "configuration"],
  },
  {
    id: "5",
    title: "Learning Goals",
    content: "- Master TypeScript\n- Improve React skills\n- Learn about databases",
    createdAt: "2023-10-20T08:45:00Z",
    updatedAt: "2023-10-20T08:45:00Z",
    tags: ["project", "personalinfo"],
  },
];

export function getAllNotes(): Note[] {
  return notes;
}

export function getNoteById(id: string): Note | undefined {
  return notes.find(note => note.id === id);
}

export function searchNotes(query: string, notesToSearch: Note[]): Note[] {
  const lowercaseQuery = query.toLowerCase();
  return notesToSearch.filter(note => 
    note.title.toLowerCase().includes(lowercaseQuery) || 
    note.content.toLowerCase().includes(lowercaseQuery)
  );
} 