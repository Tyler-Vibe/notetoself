'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useNotes } from './context/NotesContext';
import NoteCard from './components/NoteCard';
import { TabSearchResult } from './types/tab';

export default function Home() {
  const { notes, isLoading } = useNotes();
  const [searchTerm, setSearchTerm] = useState('');
  const [attachmentResults, setAttachmentResults] = useState<{noteId: string, filename: string}[]>([]);
  const [tabResults, setTabResults] = useState<TabSearchResult[]>([]);
  const [isSearchingAttachments, setIsSearchingAttachments] = useState(false);
  const [isSearchingTabs, setIsSearchingTabs] = useState(false);

  // Filter notes based on search term (including tags)
  const filteredNotes = notes.filter(note => {
    if (searchTerm === '') return true;
    
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    // Check if search term matches title or content
    const matchesContent = 
      note.title.toLowerCase().includes(lowerSearchTerm) ||
      note.content.toLowerCase().includes(lowerSearchTerm);
    
    // Check if search term matches any tag
    const matchesTags = note.tags && note.tags.some(tag => 
      tag.toLowerCase().includes(lowerSearchTerm)
    );
    
    return matchesContent || matchesTags;
  });

  // Search for attachments and tabs when search term changes
  useEffect(() => {
    const searchAttachmentsAndTabs = async () => {
      if (searchTerm.length < 2) {
        setAttachmentResults([]);
        setTabResults([]);
        return;
      }

      setIsSearchingAttachments(true);
      setIsSearchingTabs(true);
      
      try {
        // Search for attachments
        const attachmentResponse = await fetch(`/api/search/attachments?q=${encodeURIComponent(searchTerm)}`);
        if (attachmentResponse.ok) {
          const data = await attachmentResponse.json();
          setAttachmentResults(data);
        } else {
          console.error('Failed to search attachments');
          setAttachmentResults([]);
        }
      } catch (error) {
        console.error('Error searching attachments:', error);
        setAttachmentResults([]);
      } finally {
        setIsSearchingAttachments(false);
      }
      
      try {
        // Search for tabs using the dedicated search endpoint
        const tabResponse = await fetch(`/api/tabs/search?q=${encodeURIComponent(searchTerm)}`);
        if (tabResponse.ok) {
          const tabData = await tabResponse.json();
          console.log('Tab search results from API:', tabData);
          setTabResults(tabData);
        } else {
          console.error('Failed to search tabs');
          setTabResults([]);
        }
      } catch (error) {
        console.error('Error searching tabs:', error);
        setTabResults([]);
      } finally {
        setIsSearchingTabs(false);
      }
    };

    searchAttachmentsAndTabs();
  }, [searchTerm]);

  // Get unique note IDs from attachment results that aren't already in filtered notes
  const attachmentNoteIds = attachmentResults
    .map(result => result.noteId)
    .filter((noteId, index, self) => self.indexOf(noteId) === index);

  // Get unique note IDs from tab results that aren't already in filtered notes or attachment notes
  const tabNoteIds = tabResults
    .map(result => result.noteId)
    .filter((noteId, index, self) => self.indexOf(noteId) === index)
    .filter(noteId => 
      !filteredNotes.some(note => note.id === noteId) && 
      !attachmentNoteIds.includes(noteId)
    );

  // Get notes that match attachment search but not content/title search
  const attachmentOnlyNotes = notes.filter(note => 
    attachmentNoteIds.includes(note.id) && 
    !filteredNotes.some(filteredNote => filteredNote.id === note.id)
  );

  // Get notes that match tab search but not content/title/attachment search
  const tabOnlyNotes = notes.filter(note => 
    tabNoteIds.includes(note.id) && 
    !filteredNotes.some(filteredNote => filteredNote.id === note.id) &&
    !attachmentOnlyNotes.some(attachmentNote => attachmentNote.id === note.id)
  );

  // Combine all sets of notes
  const allFilteredNotes = [...filteredNotes, ...attachmentOnlyNotes, ...tabOnlyNotes];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 md:mb-0">My Notes</h1>
          <Link 
            href="/notes/new" 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Create New Note
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search notes by title, content, tags, attachments, or context tabs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            />
            {(isSearchingAttachments || isSearchingTabs) && (
              <div className="absolute right-3 top-2.5">
                <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
            )}
          </div>
        </div>

        {attachmentResults.length > 0 && (
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
            <h2 className="text-lg font-semibold text-blue-800 dark:text-blue-300 mb-2">
              Attachment matches:
            </h2>
            <ul className="text-sm text-blue-700 dark:text-blue-400">
              {attachmentResults.map((result, index) => (
                <li key={`attachment-${index}`} className="mb-1">
                  <Link href={`/notes/${result.noteId}`} className="hover:underline">
                    {result.filename}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {tabResults.length > 0 && (
          <div className="mb-6 p-4 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
            <h2 className="text-lg font-semibold text-purple-800 dark:text-purple-300 mb-2">
              Context tab matches ({tabResults.length}):
            </h2>
            <ul className="text-sm text-purple-700 dark:text-purple-400">
              {tabResults.map((result, index) => (
                <li key={`tab-${index}`} className="mb-2">
                  <Link 
                    href={`/notes/${result.noteId}?tab=${result.tabId}`} 
                    className="hover:underline font-medium"
                  >
                    {result.noteTitle} - {result.tabName}
                  </Link>
                  <p className="mt-1 text-xs text-purple-600 dark:text-purple-500">
                    {result.matchType === 'name' ? 'Tab name match' : result.matchText}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}

        {allFilteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">No notes found. Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allFilteredNotes.map(note => (
              <NoteCard 
                key={note.id} 
                note={note} 
                highlightedAttachments={attachmentResults
                  .filter(result => result.noteId === note.id)
                  .map(result => result.filename)
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
