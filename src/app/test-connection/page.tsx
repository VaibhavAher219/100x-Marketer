'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<'testing' | 'success' | 'error'>('testing');
  const [error, setError] = useState<string>('');
  const [details, setDetails] = useState<unknown>({});

  useEffect(() => {
    testConnection();
  }, []);

  // Hide this page in production
  if (process.env.NODE_ENV === 'production') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page Not Available</h1>
          <p className="text-gray-600">This debug page is not available in production.</p>
        </div>
      </div>
    )
  }

  const testConnection = async () => {
    try {
      setConnectionStatus('testing');
      
      // Test 1: Basic connection
      console.log('Testing Supabase connection...');
      
      // Test 2: Try to get session (this should work even without tables)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      console.log('Session test:', { sessionData, sessionError });
      
      // Test 3: Try a simple query to see if we can connect to the database
      const { data, error } = await supabase
        .from('profiles')
        .select('count')
        .limit(1);
      
      console.log('Database query test:', { data, error });
      
      if (error) {
        if (error.message.includes('relation "profiles" does not exist')) {
          setDetails({
            connection: 'SUCCESS',
            database: 'CONNECTED',
            tables: 'MISSING',
            message: 'Connection successful but tables need to be created',
            error: error.message
          });
          setConnectionStatus('error');
          setError('Database tables not found. Please run the migration.');
        } else {
          setDetails({
            connection: 'SUCCESS',
            database: 'ERROR',
            error: error.message
          });
          setConnectionStatus('error');
          setError(`Database error: ${error.message}`);
        }
      } else {
        setDetails({
          connection: 'SUCCESS',
          database: 'CONNECTED',
          tables: 'EXISTS',
          message: 'All systems operational'
        });
        setConnectionStatus('success');
      }
    } catch (err) {
      console.error('Connection test failed:', err);
      setDetails({
        connection: 'FAILED',
        error: err instanceof Error ? err.message : 'Unknown error'
      });
      setConnectionStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown connection error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Supabase Connection Test
          </h1>

          <div className="mb-6">
            <div className={`p-4 rounded-lg ${
              connectionStatus === 'testing' ? 'bg-blue-50 border-blue-200' :
              connectionStatus === 'success' ? 'bg-green-50 border-green-200' :
              'bg-red-50 border-red-200'
            } border`}>
              <div className="flex items-center">
                {connectionStatus === 'testing' && (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600 mr-3"></div>
                )}
                <span className={`font-medium ${
                  connectionStatus === 'testing' ? 'text-blue-800' :
                  connectionStatus === 'success' ? 'text-green-800' :
                  'text-red-800'
                }`}>
                  {connectionStatus === 'testing' && 'Testing connection...'}
                  {connectionStatus === 'success' && 'Connection successful!'}
                  {connectionStatus === 'error' && 'Connection issues detected'}
                </span>
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Environment Variables</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <p><strong>SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
                <p><strong>SUPABASE_ANON_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
                {process.env.NEXT_PUBLIC_SUPABASE_URL && (
                  <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/https?:\/\/([^.]+)\..*/, 'https://$1.supabase.co (masked)')}</p>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Connection Details</h3>
              <div className="bg-gray-100 p-4 rounded-lg">
                <pre className="text-sm overflow-auto">
                  {JSON.stringify(details, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                onClick={testConnection}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Test Again
              </button>
              <button
                onClick={() => window.location.href = '/setup-check'}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Database Setup Check
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Go Home
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}