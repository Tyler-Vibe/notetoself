export interface TabSearchResult {
  noteId: string;
  noteTitle: string;
  tabId: string;
  tabName: string;
  matchText: string;
  matchType: 'name' | 'content';
}

export interface Tab {
  id: string;
  noteId: string;
  name: string;
  content: string;
  createdAt?: string;
  updatedAt?: string;
} 