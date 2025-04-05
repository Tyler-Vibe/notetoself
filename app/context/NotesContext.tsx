'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Note } from '../types/note';

interface NotesContextType {
  notes: Note[];
  addNote: (title: string, content: string, tags: TagType[]) => Promise<void>;
  updateNote: (id: string, title: string, content: string, tags: TagType[]) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch notes on mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) {
        throw new Error('Failed to fetch notes');
      }
      const data = await response.json();
      
      // Make sure each note has a tags array
      const notesWithTags = data.map((note: any) => ({
        ...note,
        tags: note.tagsJson ? JSON.parse(note.tagsJson) : [],
      }));
      
      setNotes(notesWithTags);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addNote = async (title: string, content: string, tags: TagType[] = []) => {
    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, tags }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create note');
      }

      const newNote = await response.json();
      
      // Make sure we have a valid note with an ID before updating state
      if (!newNote || !newNote.id) {
        throw new Error('Invalid note data returned from API');
      }
      
      setNotes(prevNotes => [newNote, ...prevNotes]);
      return newNote; // Make sure to return the new note
    } catch (error) {
      console.error('Error adding note:', error);
      throw error; // Re-throw to handle in the component
    }
  };

  const updateNote = async (id: string, title: string, content: string, tags: TagType[]) => {
    try {
      const response = await fetch(`/api/notes/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, tags }),
      });

      if (!response.ok) throw new Error('Failed to update note');
      const updatedNote = await response.json();
      setNotes(prevNotes => 
        prevNotes.map(note => 
          note.id === id ? updatedNote : note
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update note');
      throw err;
    }
  };

  const deleteNote = async (id: string) => {
    try {
      console.log(`Deleting note with ID: ${id}`);
      const response = await fetch(`/api/notes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete note');
      }
      
      // Remove the note from state
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      console.log(`Note with ID: ${id} deleted successfully`);
      return true;
    } catch (err) {
      console.error('Error deleting note:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete note');
      throw err;
    }
  };

  return (
    <NotesContext.Provider 
      value={{ 
        notes, 
        addNote, 
        updateNote,
        deleteNote, 
        isLoading, 
        error 
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
} 