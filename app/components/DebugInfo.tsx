'use client';

import { useNotes } from '../context/NotesContext';

export default function DebugInfo() {
  const { notes, isLoading, error } = useNotes();
  
  if (isLoading) return <div>Loading notes...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg mt-8 text-sm">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <p>Total notes: {notes.length}</p>
      <div className="mt-2">
        <p className="font-semibold">First note:</p>
        {notes.length > 0 ? (
          <pre className="bg-gray-200 dark:bg-gray-700 p-2 rounded overflow-auto mt-1">
            {JSON.stringify(notes[0], null, 2)}
          </pre>
        ) : (
          <p>No notes available</p>
        )}
      </div>
    </div>
  );
} 