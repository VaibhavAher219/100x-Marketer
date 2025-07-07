"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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
          <a 
            href="#overview" 
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
          >
            Overview
          </a>
          <a 
            href="#curriculum" 
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
          >
            Curriculum
          </a>
          <a 
            href="#student-projects" 
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
          >
            Student Projects
          </a>
          <a 
            href="#faq" 
            className="text-gray-700 hover:text-blue-600 transition-colors font-medium"
          >
            FAQ
          </a>
        </div>

        {/* Join Waitlist Button */}
        <Button variant="default" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 shadow-lg">
          Join Waitlist
        </Button>
      </nav>
    </header>
  );
} 