import Link from 'next/link';
import { Note } from '../types/note';
import Tag from './Tag';
import { truncateText, detectUrls } from '../utils/linkUtils';
import { useState, useEffect } from 'react';

interface NoteCardProps {
  note: Note;
  highlightedAttachments?: string[];
}

export default function NoteCard({ note, highlightedAttachments = [] }: NoteCardProps) {
  const [contentWithLinks, setContentWithLinks] = useState<string>(note.content);
  
  // Format the date
  const formattedDate = new Date(note.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  
  // Truncate content for preview
  const truncatedContent = truncateText(note.content, 150);
  
  // Handle click on the card to navigate to the note
  const handleCardClick = (e: React.MouseEvent) => {
    // If the click was on a link, don't navigate to the note
    if ((e.target as HTMLElement).tagName === 'A') {
      e.stopPropagation();
    }
  };
  
  return (
    <div 
      className="h-full bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow p-5 border border-gray-200 dark:border-gray-700"
      onClick={handleCardClick}
    >
      {note.tags && note.tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {note.tags.map(tag => (
            <Tag key={tag} type={tag} small />
          ))}
        </div>
      )}
      
      <Link href={`/notes/${note.id}`}>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
          {note.title}
        </h2>
      </Link>
      
      <div className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
        {truncatedContent.split(/(https?:\/\/[^\s]+)/g).map((part, index) => {
          if (part.match(/^https?:\/\//)) {
            return (
              <a 
                key={index}
                href={part}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
                onClick={(e) => e.stopPropagation()}
              >
                {part}
              </a>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
      
      <div className="text-sm text-gray-500 dark:text-gray-400">
        Last updated: {formattedDate}
      </div>
      
      {highlightedAttachments.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
            Matching attachments:
          </p>
          <ul className="mt-1 text-xs text-blue-500 dark:text-blue-300">
            {highlightedAttachments.map((filename, index) => (
              <li key={index} className="truncate">
                {filename}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 