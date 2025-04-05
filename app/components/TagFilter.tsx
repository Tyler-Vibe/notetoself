'use client';

import { useState } from 'react';
import { TagType } from '../types/note';

interface TagFilterProps {
  selectedTags: TagType[];
  onChange: (tags: TagType[]) => void;
}

export default function TagFilter({ selectedTags, onChange }: TagFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // All available tag options
  const tagOptions: TagType[] = ['work', 'personal', 'important', 'idea', 'todo'];
  
  const toggleTag = (tag: TagType) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };
  
  const clearTags = () => {
    onChange([]);
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
        </svg>
        <span className="text-gray-700 dark:text-gray-300">
          {selectedTags.length === 0 
            ? 'Filter by tags' 
            : `${selectedTags.length} tag${selectedTags.length > 1 ? 's' : ''} selected`}
        </span>
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isOpen && (
        <div className="absolute z-10 mt-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <div className="p-3">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by tags</h3>
              {selectedTags.length > 0 && (
                <button 
                  onClick={clearTags}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear all
                </button>
              )}
            </div>
            
            <div className="space-y-2">
              {tagOptions.map(tag => (
                <div key={tag} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`tag-${tag}`}
                    checked={selectedTags.includes(tag)}
                    onChange={() => toggleTag(tag)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label 
                    htmlFor={`tag-${tag}`}
                    className="ml-2 text-sm text-gray-700 dark:text-gray-300 capitalize"
                  >
                    {tag}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {selectedTags.map(tag => (
            <span 
              key={tag}
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            >
              {tag}
              <button
                type="button"
                onClick={() => toggleTag(tag)}
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-blue-400 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200 focus:outline-none"
              >
                <span className="sr-only">Remove tag {tag}</span>
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
} 