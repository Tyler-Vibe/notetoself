'use client';

import { useState, useRef } from 'react';
import { toast } from 'react-hot-toast';

interface FileUploadProps {
  noteId: string;
  onFileUploaded?: () => void;
}

export default function FileUpload({ noteId, onFileUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Create a simulated progress indicator
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 5;
          return newProgress > 90 ? 90 : newProgress; // Cap at 90% until actual completion
        });
      }, 100);

      // Upload each file
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`/api/notes/${noteId}/files`, {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to upload file');
        }

        // Update the search index for this file
        await updateSearchIndex(file.name, noteId);
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Complete the progress
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Notify parent component that files were uploaded
      if (onFileUploaded) {
        onFileUploaded();
      }
      
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload file');
    } finally {
      // Reset after a short delay to show the completed progress
      setTimeout(() => {
        setIsUploading(false);
        setUploadProgress(0);
      }, 1000);
    }
  };

  // Function to update the search index
  const updateSearchIndex = async (filename: string, noteId: string) => {
    try {
      // This is optional - you could implement a specific endpoint to update search indices
      // For now, we'll just rely on the files being in the database
      console.log(`File "${filename}" added to search index for note ${noteId}`);
    } catch (error) {
      console.error('Error updating search index:', error);
    }
  };

  return (
    <div className="mt-4">
      <label className="block mb-2">
        <span className="sr-only">Choose files</span>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={isUploading}
          multiple
          className="block w-full text-sm text-gray-500 dark:text-gray-400
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            dark:file:bg-blue-900 dark:file:text-blue-200
            hover:file:bg-blue-100 dark:hover:file:bg-blue-800
            file:cursor-pointer file:transition-colors
            disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </label>
      
      {isUploading && (
        <div className="mt-2">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-in-out" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Uploading... {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
} 