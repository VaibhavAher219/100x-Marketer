"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ChevronDown, User, Building2, LogOut } from "lucide-react";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, profile, employer, signOut, loading, isEmployer, isCandidate } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Logic for showing/hiding header on scroll direction
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setVisible(false); // Scrolling down
      } else {
        setVisible(true); // Scrolling up
      }
      setLastScrollY(currentScrollY);

      // Logic for changing header background
      if (currentScrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 p-4 ${
        scrolled
          ? 'bg-white/90 shadow-md backdrop-blur-sm'
          : 'bg-transparent shadow-none'
      } ${!visible ? '-translate-y-full' : ''}`}
    >
      {/* Main Navigation */}
      <nav className="flex items-center justify-between max-w-7xl mx-auto">
        {/* Logo */}
        <div className="font-bold text-xl text-gray-900 transition-colors duration-300">
          100x<span className="text-blue-600">Marketers</span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-8">
          <Link 
            href="/#overview" 
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            prefetch={false}
          >
            Overview
          </Link>
          <Link 
            href="/#curriculum" 
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            prefetch={false}
          >
            Curriculum
          </Link>
          <Link 
            href="/#student-projects" 
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            prefetch={false}
          >
            Student Projects
          </Link>
          <Link 
            href="/jobs" 
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            prefetch={false}
          >
            Jobs
          </Link>
          <Link 
            href="/blog" 
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            prefetch={false}
          >
            Blog
          </Link>
          <Link 
            href="/#faq" 
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
            prefetch={false}
          >
            FAQ
          </Link>
        </div>

        {/* Authentication & User Menu */}
        {loading ? (
          <div className="w-24 h-10 bg-gray-200 animate-pulse rounded"></div>
        ) : user ? (
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                {isEmployer ? (
                  <Building2 className="w-4 h-4" />
                ) : isCandidate ? (
                  <User className="w-4 h-4" />
                ) : (
                  <User className="w-4 h-4" />
                )}
              </div>
              <span className="text-sm font-medium">
                {profile?.first_name || user.email?.split('@')[0]}
              </span>
              <ChevronDown className="w-4 h-4" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border py-2 z-50">
                <div className="px-4 py-2 border-b">
                  <p className="text-sm font-medium text-gray-900">
                    {profile?.first_name && profile?.last_name 
                      ? `${profile.first_name} ${profile.last_name}`
                      : user.email
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {isEmployer && employer?.company_name && `${employer.company_name} • `}
                    {isEmployer ? 'Employer' : isCandidate ? 'Candidate' : 'User'}
                  </p>
                </div>

                <div className="py-2">
                  {isEmployer && (
                    <>
                      <Link
                        href="/employer-dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/post-job"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Post Job
                      </Link>
                    </>
                  )}

                  {isCandidate && (
                    <>
                      <Link
                        href="/candidate-dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/jobs"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        onClick={() => setShowUserMenu(false)}
                      >
                        Browse Jobs
                      </Link>
                    </>
                  )}

                  {!isEmployer && !isCandidate && (
                    <Link
                      href="/select-role"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                      onClick={() => setShowUserMenu(false)}
                    >
                      Complete Setup
                    </Link>
                  )}
                </div>

                <div className="border-t pt-2">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      signOut();
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="outline" className="border-gray-300 hover:border-gray-400">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 shadow-lg">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
}