import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">404 - Not Found</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8">The note you're looking for doesn't exist or has been removed.</p>
      <Link 
        href="/" 
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
      >
        Back to Notes
      </Link>
    </div>
  );
} 