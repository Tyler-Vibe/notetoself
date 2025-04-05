'use client';

import { useState } from 'react';

export default function DatabaseTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const testDatabase = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/notes');
      if (!response.ok) throw new Error('Failed to fetch notes');
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Database Connection Test</h2>
      <button
        onClick={testDatabase}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        disabled={loading}
      >
        {loading ? 'Testing...' : 'Test Database Connection'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          Error: {error}
        </div>
      )}
      
      {result && (
        <div className="mt-4">
          <p>Found {result.length} notes in database</p>
          <pre className="mt-2 p-3 bg-gray-100 dark:bg-gray-700 rounded overflow-auto">
            {JSON.stringify(result[0], null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
} 