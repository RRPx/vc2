'use client';

import { useState, useEffect } from 'react';
import { healthCheck } from '@/lib/api';

export default function ApiTest() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [message, setMessage] = useState('');

  useEffect(() => {
    checkApi();
  }, []);

  const checkApi = async () => {
    setStatus('checking');
    setMessage('Checking API connection...');
    
    try {
      const isConnected = await healthCheck();
      if (isConnected) {
        setStatus('connected');
        setMessage('API is connected and working!');
      } else {
        setStatus('error');
        setMessage('API health check failed');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(`API Error: ${error.message}`);
      console.error('API test error:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 p-4 rounded-lg shadow-lg bg-white max-w-sm">
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${
          status === 'checking' ? 'bg-yellow-500 animate-pulse' :
          status === 'connected' ? 'bg-green-500' : 'bg-red-500'
        }`} />
        <span className="text-sm font-medium">
          {status === 'checking' ? 'Checking...' :
           status === 'connected' ? 'API Connected' : 'API Error'}
        </span>
      </div>
      <p className="text-xs text-gray-600 mt-1">{message}</p>
      {status === 'error' && (
        <button
          onClick={checkApi}
          className="mt-2 text-xs bg-blue-500 text-white px-2 py-1 rounded"
        >
          Retry
        </button>
      )}
    </div>
  );
}