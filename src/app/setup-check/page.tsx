'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface TableCheck {
  name: string;
  exists: boolean;
  error?: string;
}

export default function SetupCheckPage() {
  const [checks, setChecks] = useState<TableCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check environment variables first
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      setChecks([{
        name: 'Environment Variables',
        exists: false,
        error: 'NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY is missing'
      }]);
      setLoading(false);
      return;
    }

    checkDatabaseSetup();
  }, []);

  const checkDatabaseSetup = async () => {
    const tables = ['profiles', 'employers', 'candidates', 'jobs', 'applications', 'company_profiles', 'employee_testimonials', 'office_locations', 'company_followers'];
    const results: TableCheck[] = [];

    // Set a timeout for the entire check
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Database check timeout')), 10000);
    });

    try {
      for (const table of tables) {
        try {
          // Race the query against a timeout
          const queryPromise = supabase
            .from(table)
            .select('*')
            .limit(1);

          const { error } = await Promise.race([queryPromise, timeoutPromise]);

          if (error) {
            results.push({
              name: table,
              exists: false,
              error: error.message
            });
          } else {
            results.push({
              name: table,
              exists: true
            });
          }
        } catch (error) {
          results.push({
            name: table,
            exists: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }
    } catch {
      // If the entire check times out, mark all tables as unknown
      for (const table of tables) {
        if (!results.find(r => r.name === table)) {
          results.push({
            name: table,
            exists: false,
            error: 'Connection timeout - check your Supabase configuration'
          });
        }
      }
    }

    setChecks(results);
    setLoading(false);
  };

  const allTablesExist = checks.every(check => check.exists);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Database Setup Check
          </h1>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Checking database setup...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {checks.map((check) => (
                <div
                  key={check.name}
                  className={`flex items-center p-4 rounded-lg border ${
                    check.exists
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  {check.exists ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 mr-3" />
                  )}
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      Table: {check.name}
                    </p>
                    {check.error && (
                      <p className="text-sm text-red-600 mt-1">
                        Error: {check.error}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="mt-8 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                <div className="flex items-start">
                  <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">
                      {allTablesExist ? 'Database Setup Complete!' : 'Database Setup Required'}
                    </h3>
                    {allTablesExist ? (
                      <p className="text-sm text-gray-700">
                        All required tables exist. You can now use the job portal system.
                        <br />
                        <a href="/jobs" className="text-blue-600 hover:text-blue-700 font-medium">
                          Go to Jobs Page →
                        </a>
                      </p>
                    ) : (
                      <div className="text-sm text-gray-700">
                        <p className="mb-2">
                          Some tables are missing. Please run the database migration:
                        </p>
                        <ol className="list-decimal list-inside space-y-1 mb-3">
                          <li>Go to your Supabase dashboard</li>
                          <li>Navigate to the SQL Editor</li>
                          <li>Copy and paste the contents of <code className="bg-gray-200 px-1 rounded">supabase/migrations/001_create_job_portal_schema.sql</code></li>
                          <li>Run the SQL script</li>
                          <li>Refresh this page to check again</li>
                        </ol>
                        <button
                          onClick={() => {
                            setLoading(true);
                            checkDatabaseSetup();
                          }}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Check Again
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}