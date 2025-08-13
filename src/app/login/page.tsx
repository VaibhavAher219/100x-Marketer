import { Suspense } from "react"
import LoginForm from "@/components/auth/LoginForm"
import AuthDebug from "@/components/auth/AuthDebug"
import AuthRedirect from "@/components/auth/AuthRedirect"

export const metadata = {
  title: "Login - 100x Marketers",
  description: "Sign in to access your AI marketing career opportunities",
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthRedirect>
        <div className="min-h-screen flex">
          <AuthDebug />
          {/* Left Side - Login Form */}
          <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 bg-white">
            <LoginForm />
          </div>

      {/* Right Side - Colorful Pattern */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
        {/* Geometric Pattern */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="grid grid-cols-6 gap-4 transform rotate-12 opacity-80">
            {/* Row 1 */}
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-lg"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-pink-400 to-pink-500 rounded-lg"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-blue-500 rounded-lg"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-lg"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-500 rounded-lg"></div>
            
            {/* Row 2 */}
            <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-red-500 rounded-full"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-500 rounded-lg"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-orange-400 to-orange-500 rounded-full"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-500 rounded-lg"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-500 rounded-full"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-violet-400 to-violet-500 rounded-lg"></div>
            
            {/* Row 3 */}
            <div className="w-16 h-16 bg-gradient-to-br from-lime-400 to-lime-500 rounded-lg"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-rose-400 to-rose-500 rounded-full"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-sky-400 to-sky-500 rounded-lg"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-500 rounded-lg"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-fuchsia-400 to-fuchsia-500 rounded-full"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-slate-400 to-slate-500 rounded-lg"></div>
            
            {/* Row 4 */}
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-full"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg"></div>
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg"></div>
          </div>
        </div>

        {/* Floating Elements */}
        <div className="absolute top-20 left-20 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-500 rounded-full opacity-60 animate-float"></div>
        <div className="absolute bottom-32 right-32 w-32 h-32 bg-gradient-to-br from-purple-400 to-purple-500 rounded-lg opacity-50 animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-20 w-20 h-20 bg-gradient-to-br from-pink-400 to-pink-500 rounded-full opacity-70 animate-float" style={{ animationDelay: '4s' }}></div>

        {/* Main Content */}
        <div className="absolute bottom-20 left-20 right-20 text-center">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Find the job made for you.
          </h2>
          <p className="text-lg text-gray-600">
            Browse over 130K jobs at top companies and fast growing startups.
          </p>
        </div>
      </div>
    </div>
    </AuthRedirect>
    </Suspense>
  )
}