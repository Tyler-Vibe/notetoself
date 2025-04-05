import { Tab } from '../components/TabsManager';
import { Note } from '../types/note';

export interface TabSearchResult {
  noteId: string;
  noteTitle: string;
  tabId: string;
  tabName: string;
  matchText: string;
  matchType: 'name' | 'content';
}

export function searchTabs(query: string, notes: Note[]): TabSearchResult[] {
  if (!query || query.length < 2) return [];
  
  const lowerQuery = query.toLowerCase();
  const results: TabSearchResult[] = [];
  
  // For browser environments only
  if (typeof window === 'undefined') {
    console.error('Not in browser environment');
    return results;
  }
  
  console.log(`Searching ${notes.length} notes for tabs with query: "${query}"`);
  
  // First, get all localStorage keys
  const allKeys = Object.keys(localStorage);
  const tabKeys = allKeys.filter(key => key.startsWith('note-tabs-'));
  
  console.log(`Found ${tabKeys.length} tab entries in localStorage:`, tabKeys);
  
  // Process each tab key
  tabKeys.forEach(key => {
    try {
      // Extract note ID from the key
      const noteId = key.replace('note-tabs-', '');
      const note = notes.find(n => n.id === noteId);
      
      if (!note) {
        console.log(`Note not found for ID: ${noteId}`);
        return;
      }
      
      const savedTabsJson = localStorage.getItem(key);
      if (!savedTabsJson) {
        console.log(`No saved tabs found for key: ${key}`);
        return;
      }
      
      console.log(`Processing tabs for note: ${note.title} (${noteId})`);
      
      const tabs = JSON.parse(savedTabsJson) as Tab[];
      console.log(`Found ${tabs.length} tabs for note: ${note.title}`);
      
      tabs.forEach(tab => {
        // Search in tab name
        if (tab.name && tab.name.toLowerCase().includes(lowerQuery)) {
          console.log(`Match found in tab name: ${tab.name}`);
          results.push({
            noteId: note.id,
            noteTitle: note.title,
            tabId: tab.id,
            tabName: tab.name,
            matchText: tab.name,
            matchType: 'name'
          });
        }
        
        // Search in tab content
        if (tab.content && tab.content.toLowerCase().includes(lowerQuery)) {
          console.log(`Match found in tab content for tab: ${tab.name}`);
          // Get a snippet of the matching content
          const index = tab.content.toLowerCase().indexOf(lowerQuery);
          const start = Math.max(0, index - 30);
          const end = Math.min(tab.content.length, index + query.length + 30);
          const snippet = (start > 0 ? '...' : '') + 
                          tab.content.substring(start, end) + 
                          (end < tab.content.length ? '...' : '');
          
          results.push({
            noteId: note.id,
            noteTitle: note.title,
            tabId: tab.id,
            tabName: tab.name,
            matchText: snippet,
            matchType: 'content'
          });
        }
      });
    } catch (error) {
      console.error(`Error processing tabs for key ${key}:`, error);
    }
  });
  
  console.log(`Found ${results.length} tab search results:`, results);
  return results;
} 