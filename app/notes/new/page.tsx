'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useNotes } from '../../context/NotesContext';
import TagSelector from '../../components/TagSelector';
import FileUpload from '../../components/FileUpload';
import FileList from '../../components/FileList';
import { TagType } from '../../types/note';
import { toast } from 'react-hot-toast';

export default function NewNotePage() {
  const router = useRouter();
  const { addNote } = useNotes();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState<TagType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteId, setNoteId] = useState<string | null>(null);
  const [refreshFiles, setRefreshFiles] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const newNote = await addNote(title, content, selectedTags);
      
      if (newNote && newNote.id) {
        setNoteId(newNote.id);
        toast.success('Note created successfully! You can now attach files.');
      } else {
        throw new Error('Failed to create note: No note ID returned');
      }
    } catch (err) {
      console.error('Error creating note:', err);
      setError(err instanceof Error ? err.message : 'Failed to create note');
      toast.error('Failed to create note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUploaded = () => {
    setRefreshFiles(prev => prev + 1);
  };

  const handleContinue = () => {
    if (noteId) {
      router.push(`/notes/${noteId}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/" 
            className="text-blue-500 hover:text-blue-600 flex items-center"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 mr-1" 
              viewBox="0 0 20 20" 
              fill="currentColor"
            >
              <path 
                fillRule="evenodd" 
                d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" 
                clipRule="evenodd" 
              />
            </svg>
            Back to Notes
          </Link>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">Create New Note</h1>

          {!noteId ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label 
                  htmlFor="title" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter note title"
                  required
                />
              </div>

              <div>
                <label 
                  htmlFor="content" 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Content
                </label>
                <textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter note content"
                  required
                />
              </div>

              <div>
                <label 
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Tags
                </label>
                <TagSelector
                  selectedTags={selectedTags}
                  onChange={setSelectedTags}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`
                    bg-blue-500 text-white px-6 py-2 rounded-lg transition-colors
                    ${isSubmitting 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-blue-600'
                    }
                  `}
                >
                  {isSubmitting ? 'Creating...' : 'Create Note'}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                <p className="text-green-800 dark:text-green-200">
                  Note created successfully! You can now attach files to this note.
                </p>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Attach Files</h2>
                <FileUpload noteId={noteId} onFileUploaded={handleFileUploaded} />
                
                <div className="mt-6">
                  <FileList noteId={noteId} refreshTrigger={refreshFiles} />
                </div>
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={handleContinue}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Continue to Note
                </button>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 