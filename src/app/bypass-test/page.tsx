export default function BypassTestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Bypass Test</h1>
        <p className="text-gray-600 mb-6">This page should load without any redirects</p>
        <div className="space-y-4">
          <a 
            href="/candidate-setup" 
            className="block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Go to Candidate Setup (Direct Link)
          </a>
          <a 
            href="/candidate-dashboard" 
            className="block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Candidate Dashboard (Direct Link)
          </a>
          <a 
            href="/debug-state" 
            className="block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Go to Debug State
          </a>
        </div>
      </div>
    </div>
  )
}