'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useNotes } from '../../context/NotesContext';
import { notFound, useSearchParams, useRouter } from 'next/navigation';
import TextWithLinks from '../../components/TextWithLinks';
import Tag from '../../components/Tag';
import FileList from '../../components/FileList';
import FileUpload from '../../components/FileUpload';
import TabsManager, { Tab } from '../../components/TabsManager';
import { useParams } from 'next/navigation';

export default function NotePage() {
  const { notes, deleteNote } = useNotes();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const noteId = params.id as string;
  const tabId = searchParams.get('tab');
  
  const [note, setNote] = useState(notes.find(n => n.id === noteId));
  const [isLoading, setIsLoading] = useState(true);
  const [refreshFiles, setRefreshFiles] = useState(0);
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const foundNote = notes.find(n => n.id === noteId);
    setNote(foundNote);
    setIsLoading(false);
    
    // If a tab ID is specified in the URL, set it as active
    if (tabId) {
      setActiveTabId(tabId);
    }
  }, [notes, noteId, tabId]);

  const handleFileUploaded = () => {
    setRefreshFiles(prev => prev + 1);
  };
  
  const handleTabsLoaded = (loadedTabs: Tab[]) => {
    setTabs(loadedTabs);
    
    // If a tab ID is specified in the URL, set it as active
    if (tabId && loadedTabs.some(tab => tab.id === tabId)) {
      setActiveTabId(tabId);
    }
  };

  const handleDeleteNote = async () => {
    setIsDeleting(true);
    try {
      await deleteNote(noteId);
      
      // Use window.location for a full page navigation to avoid router issues
      window.location.href = '/';
    } catch (error) {
      console.error('Error deleting note:', error);
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!note) {
    return notFound();
  }

  // Format the dates
  const createdDate = new Date(note.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const updatedDate = new Date(note.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="mb-4 md:mb-0">
            <Link 
              href="/" 
              className="text-blue-500 hover:text-blue-600 flex items-center mb-2"
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
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">{note.title}</h1>
          </div>
          <div className="flex space-x-3">
            <Link 
              href={`/notes/${note.id}/edit`} 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Edit Note
            </Link>
            <button 
              onClick={() => setShowDeleteConfirmation(true)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Delete Note
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="mb-6">
            {note.tags && note.tags.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-4">
                {note.tags.map(tag => (
                  <Tag key={tag} type={tag} />
                ))}
              </div>
            )}
            
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>Created: {createdDate}</p>
              <p>Last updated: {updatedDate}</p>
            </div>
          </div>
          
          <div className="mb-8">
            <div className="prose dark:prose-invert max-w-none">
              {note.content.split('\n').map((paragraph, index) => (
                <TextWithLinks
                  key={index}
                  text={paragraph}
                  className="mb-4 text-gray-700 dark:text-gray-300"
                />
              ))}
            </div>
          </div>
          
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Context Tabs</h2>
            <TabsManager 
              noteId={noteId} 
              initialContent="" 
              onTabsLoaded={handleTabsLoaded}
              initialActiveTabId={tabId || undefined}
            />
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">Attachments</h2>
          <FileList noteId={noteId} refreshTrigger={refreshFiles} />
          <FileUpload noteId={noteId} onFileUploaded={handleFileUploaded} />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Delete Note</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              Are you sure you want to delete "{note.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteNote}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  'Delete Note'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 