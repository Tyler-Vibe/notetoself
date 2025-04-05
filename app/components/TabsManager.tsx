'use client';

import { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Tab {
  id: string;
  name: string;
  content: string;
}

interface TabsManagerProps {
  noteId: string;
  initialContent?: string;
  onTabsLoaded?: (tabs: Tab[]) => void;
  initialActiveTabId?: string;
}

export default function TabsManager({ noteId, initialContent = '', onTabsLoaded, initialActiveTabId }: TabsManagerProps) {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [isEditingTabName, setIsEditingTabName] = useState<string | null>(null);
  const [newTabName, setNewTabName] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // Use a ref to prevent infinite loops with onTabsLoaded
  const initialLoadRef = useRef(false);
  const tabsRef = useRef<Tab[]>([]);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load tabs from the database on component mount
  useEffect(() => {
    const fetchTabs = async () => {
      try {
        // Check database schema first
        const schemaOk = await checkAndRunMigration();
        if (!schemaOk) {
          console.log('Using localStorage fallback due to schema issues');
          // Try to load from localStorage
          const savedTabs = localStorage.getItem(`note-tabs-${noteId}`);
          if (savedTabs) {
            try {
              const parsedTabs = JSON.parse(savedTabs) as Tab[];
              console.log(`Loaded ${parsedTabs.length} tabs from localStorage fallback`);
              setTabs(parsedTabs);
              tabsRef.current = parsedTabs;
              
              if (initialActiveTabId && parsedTabs.some(tab => tab.id === initialActiveTabId)) {
                setActiveTabId(initialActiveTabId);
              } else {
                setActiveTabId(parsedTabs[0].id);
              }
              
              initialLoadRef.current = true;
              return;
            } catch (parseError) {
              console.error('Error parsing localStorage tabs:', parseError);
            }
          }
          
          createDefaultTab();
          initialLoadRef.current = true;
          return;
        }
        
        // Continue with normal fetch...
        console.log(`Fetching tabs for note: ${noteId}`);
        const response = await fetch(`/api/tabs?noteId=${noteId}`);
        
        if (response.ok) {
          const fetchedTabs = await response.json();
          
          if (fetchedTabs.length > 0) {
            console.log(`Loaded ${fetchedTabs.length} tabs from database for note: ${noteId}`, fetchedTabs);
            setTabs(fetchedTabs);
            tabsRef.current = fetchedTabs;
            
            // Set active tab based on initialActiveTabId or default to first tab
            if (initialActiveTabId && fetchedTabs.some(tab => tab.id === initialActiveTabId)) {
              setActiveTabId(initialActiveTabId);
            } else {
              setActiveTabId(fetchedTabs[0].id);
            }
          } else {
            console.log(`No tabs found in database for note: ${noteId}, creating default tab`);
            createDefaultTab();
          }
        } else {
          const errorText = await response.text();
          console.error(`Failed to fetch tabs (${response.status}):`, errorText);
          
          // If the note doesn't exist or other 4xx errors, create a default tab
          if (response.status >= 400 && response.status < 500) {
            console.log('Creating default tab due to client error');
            createDefaultTab();
          } else {
            // For server errors, try to use localStorage as fallback
            console.log('Trying localStorage fallback due to server error');
            const savedTabs = localStorage.getItem(`note-tabs-${noteId}`);
            if (savedTabs) {
              try {
                const parsedTabs = JSON.parse(savedTabs) as Tab[];
                console.log(`Loaded ${parsedTabs.length} tabs from localStorage fallback`);
                setTabs(parsedTabs);
                tabsRef.current = parsedTabs;
                
                if (initialActiveTabId && parsedTabs.some(tab => tab.id === initialActiveTabId)) {
                  setActiveTabId(initialActiveTabId);
                } else {
                  setActiveTabId(parsedTabs[0].id);
                }
              } catch (parseError) {
                console.error('Error parsing localStorage tabs:', parseError);
                createDefaultTab();
              }
            } else {
              createDefaultTab();
            }
          }
        }
      } catch (error) {
        console.error('Error fetching tabs:', error);
        createDefaultTab();
      } finally {
        initialLoadRef.current = true;
      }
    };
    
    fetchTabs();
  }, [noteId, initialContent, initialActiveTabId]);

  // Create a default tab
  const createDefaultTab = () => {
    const defaultTab: Tab = {
      id: uuidv4(),
      name: 'Main',
      content: initialContent
    };
    setTabs([defaultTab]);
    tabsRef.current = [defaultTab];
    setActiveTabId(defaultTab.id);
    
    // Save to database
    saveTabsToDatabase([defaultTab]);
  };

  // Notify parent component when tabs change
  useEffect(() => {
    if (initialLoadRef.current && onTabsLoaded && tabs.length > 0) {
      onTabsLoaded(tabs);
    }
  }, [tabs, onTabsLoaded]);

  // Save tabs to database with debounce
  useEffect(() => {
    if (tabs.length > 0 && initialLoadRef.current && JSON.stringify(tabs) !== JSON.stringify(tabsRef.current)) {
      // Clear any existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Set a new timeout to save after 1 second of inactivity
      saveTimeoutRef.current = setTimeout(() => {
        saveTabsToDatabase(tabs);
        tabsRef.current = [...tabs];
      }, 1000);
    }
    
    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [tabs, noteId]);

  const saveTabsToDatabase = async (tabsToSave: Tab[]) => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      console.log(`Saving ${tabsToSave.length} tabs to database for note: ${noteId}`);
      
      // Make sure content is a string, not too large for SQLite
      const processedTabs = tabsToSave.map(tab => ({
        ...tab,
        // Ensure content is a string and not too large (SQLite has limits)
        content: (tab.content || '').substring(0, 1000000) // Limit to 1MB
      }));
      
      // Save to localStorage as a backup first
      try {
        localStorage.setItem(`note-tabs-${noteId}`, JSON.stringify(processedTabs));
        console.log('Saved tabs to localStorage as backup');
      } catch (localStorageError) {
        console.error('Error saving to localStorage:', localStorageError);
      }
      
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId,
          tabs: processedTabs
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to save tabs (${response.status}):`, errorText);
        
        // We already saved to localStorage as a backup
        setSaveError('Saved locally only. Changes may not persist across devices.');
      } else {
        console.log('Tabs saved successfully to database');
        // Clear localStorage backup if it exists
        localStorage.removeItem(`note-tabs-${noteId}`);
      }
    } catch (error) {
      console.error('Error saving tabs:', error);
      setSaveError('Failed to save tabs. Changes may not persist.');
    } finally {
      setIsSaving(false);
    }
  };

  const createNewTab = () => {
    const newTab: Tab = {
      id: uuidv4(),
      name: `Tab ${tabs.length + 1}`,
      content: ''
    };
    
    setTabs([...tabs, newTab]);
    setActiveTabId(newTab.id);
    setIsEditingTabName(newTab.id);
    setNewTabName(newTab.name);
  };

  const deleteTab = (tabId: string) => {
    // Don't allow deleting the last tab
    if (tabs.length <= 1) return;
    
    const newTabs = tabs.filter(tab => tab.id !== tabId);
    setTabs(newTabs);
    
    // If the active tab was deleted, set the first tab as active
    if (activeTabId === tabId && newTabs.length > 0) {
      setActiveTabId(newTabs[0].id);
    }
  };

  const startEditingTabName = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      setIsEditingTabName(tabId);
      setNewTabName(tab.name);
    }
  };

  const saveTabName = () => {
    if (!isEditingTabName) return;
    
    setTabs(tabs.map(tab => 
      tab.id === isEditingTabName 
        ? { ...tab, name: newTabName || `Tab ${tabs.indexOf(tab) + 1}` } 
        : tab
    ));
    
    setIsEditingTabName(null);
  };

  const updateTabContent = (content: string) => {
    if (!activeTabId) return;
    
    setTabs(tabs.map(tab => 
      tab.id === activeTabId 
        ? { ...tab, content } 
        : tab
    ));
  };

  const activeTab = tabs.find(tab => tab.id === activeTabId);

  const migrateLocalStorageTabs = async () => {
    try {
      // Check if we have tabs in localStorage
      const savedTabs = localStorage.getItem(`note-tabs-${noteId}`);
      if (!savedTabs) return;
      
      console.log(`Found tabs in localStorage for note: ${noteId}, attempting migration`);
      
      // Parse the tabs
      const parsedTabs = JSON.parse(savedTabs) as Tab[];
      if (parsedTabs.length === 0) return;
      
      console.log(`Migrating ${parsedTabs.length} tabs from localStorage to database`);
      
      // Save to database
      const response = await fetch('/api/tabs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          noteId,
          tabs: parsedTabs
        }),
      });
      
      if (response.ok) {
        console.log('Successfully migrated tabs from localStorage to database');
        // Remove from localStorage
        localStorage.removeItem(`note-tabs-${noteId}`);
      } else {
        console.error('Failed to migrate tabs from localStorage to database');
      }
    } catch (error) {
      console.error('Error migrating tabs from localStorage:', error);
    }
  };

  // Call this function after fetching tabs
  useEffect(() => {
    if (initialLoadRef.current) {
      migrateLocalStorageTabs();
    }
  }, [initialLoadRef.current]);

  const checkAndRunMigration = async () => {
    try {
      console.log('Checking database schema...');
      const response = await fetch('/api/debug/db');
      
      if (response.ok) {
        const data = await response.json();
        console.log('Database info:', data);
        
        if (!data.databaseInfo.tabsTableExists) {
          console.error('Tabs table does not exist in the database');
          setSaveError('Database schema needs to be updated. Please contact the administrator.');
          return false;
        }
        
        return true;
      } else {
        console.error('Failed to check database schema');
        return false;
      }
    } catch (error) {
      console.error('Error checking database schema:', error);
      return false;
    }
  };

  return (
    <div className="mb-6">
      <div className="flex items-center border-b border-gray-200 dark:border-gray-700">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <div 
              key={tab.id}
              className={`flex items-center px-4 py-2 border-b-2 cursor-pointer ${
                activeTabId === tab.id 
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400' 
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTabId(tab.id)}
            >
              {isEditingTabName === tab.id ? (
                <input
                  type="text"
                  value={newTabName}
                  onChange={(e) => setNewTabName(e.target.value)}
                  onBlur={saveTabName}
                  onKeyDown={(e) => e.key === 'Enter' && saveTabName()}
                  className="bg-transparent border-b border-gray-300 dark:border-gray-600 focus:outline-none focus:border-blue-500 px-1 w-24"
                  autoFocus
                />
              ) : (
                <>
                  <span 
                    className="truncate max-w-[100px]"
                    onDoubleClick={() => startEditingTabName(tab.id)}
                  >
                    {tab.name}
                  </span>
                  {tabs.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTab(tab.id);
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={createNewTab}
          className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          title="Add new tab"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
        </button>
        
        {isSaving && (
          <div className="ml-2 text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <svg className="animate-spin h-3 w-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </div>
        )}
        
        {saveError && (
          <div className="ml-2 text-xs text-red-500">
            {saveError}
          </div>
        )}
      </div>
      
      <div className="mt-4">
        {activeTab && (
          <div className="prose dark:prose-invert max-w-none">
            <textarea
              value={activeTab.content}
              onChange={(e) => updateTabContent(e.target.value)}
              className="w-full h-64 p-4 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Enter your notes for this tab..."
            />
          </div>
        )}
      </div>
    </div>
  );
} 