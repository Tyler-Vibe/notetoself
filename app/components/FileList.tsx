'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

interface File {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  createdAt: string;
}

interface FileListProps {
  noteId: string;
  refreshTrigger?: number;
}

export default function FileList({ noteId, refreshTrigger = 0 }: FileListProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteInProgress, setDeleteInProgress] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/notes/${noteId}/files`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch files');
        }

        const data = await response.json();
        console.log('Fetching files for note:', noteId);
        console.log('API response:', data);
        setFiles(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFiles();
  }, [noteId, refreshTrigger]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleDeleteFile = async (fileId: string) => {
    if (deleteInProgress) return;
    
    try {
      setDeleteInProgress(true);
      const response = await fetch(`/api/files/${fileId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete file');
      }
      
      // Update the UI by removing the deleted file
      setFiles(files.filter(file => file.id !== fileId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete file');
    } finally {
      setDeleteInProgress(false);
    }
  };

  // Helper function to get file icon based on mimetype
  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith('video/')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      );
    } else if (mimetype.startsWith('audio/')) {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      );
    } else if (mimetype === 'application/pdf') {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      );
    } else {
      return (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
  };

  // Render file card based on type
  const renderFileCard = (file: File) => {
    const isImage = file.mimetype.startsWith('image/');
    
    // Ensure the path is correct for display
    const filePath = file.path.startsWith('/') ? file.path : `/${file.path}`;
    
    return (
      <div 
        key={file.id} 
        className="flex flex-col items-center p-2 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        style={{ transform: 'scale(0.85)', transformOrigin: 'center top', margin: '-5px' }}
      >
        <div className="mb-1 w-full aspect-square flex items-center justify-center overflow-hidden rounded">
          {isImage ? (
            <div className="relative w-full h-full">
              <Image 
                src={filePath}
                alt={file.filename}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover"
                style={{ objectFit: 'cover' }}
              />
            </div>
          ) : (
            getFileIcon(file.mimetype)
          )}
        </div>
        <a 
          href={filePath}
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-600 hover:underline text-xs text-center truncate w-full"
          title={file.filename}
        >
          {file.filename.length > 30 ? `${file.filename.substring(0, 27)}...` : file.filename}
        </a>
        <p className="text-xs text-gray-500 mt-0.5">{formatFileSize(file.size)}</p>
        <button 
          onClick={() => handleDeleteFile(file.id)}
          disabled={deleteInProgress}
          className="mt-1 text-xs text-red-500 hover:text-red-700 disabled:opacity-50"
        >
          {deleteInProgress ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    );
  };

  if (isLoading) return <div className="text-sm text-gray-500">Loading files...</div>;
  if (error) return <div className="text-sm text-red-500">Error: {error}</div>;
  if (files.length === 0) return <div className="text-sm text-gray-500">No files attached</div>;

  return (
    <div className="mt-4">
      <h3 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">Attached Files</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-0 justify-start">
        {files.map(file => renderFileCard(file))}
      </div>
    </div>
  );
} 