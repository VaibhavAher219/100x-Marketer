import { Instagram, Youtube, Film, ExternalLink } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        {/* Left Side - Logo */}
        <p className="text-xl font-bold text-gray-900">
          100xmarketers
        </p>
        
        {/* Center - Social Media Icons */}
        <div className="flex gap-4">
          <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <a
              href="https://www.instagram.com/100x.marketers"
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 rounded-full flex items-center justify-center"
            >
              <Instagram className="w-5 h-5 text-gray-600" />
            </a>
          </div>
          <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <a
              href="https://www.youtube.com/@100xmarketersclub"
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 rounded-full flex items-center justify-center"
            >
              <Youtube className="w-5 h-5 text-gray-600" />
            </a>
          </div>
          <div className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <a
              href="https://www.instagram.com/100x.marketers"
              target="_blank"
              rel="noopener noreferrer"
              className="w-6 h-6 rounded-full flex items-center justify-center"
            >
              <Film className="w-5 h-5 text-gray-600" />
            </a>
          </div>
        </div>
        
        {/* Right Side - Powered by Mesha */}
        <a
          href="https://trymesha.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-600 hover:text-gray-900 transition-colors font-semibold flex items-center"
        >
          Powered by Mesha
          <ExternalLink className="ml-1 h-3 w-3" />
        </a>
      </div>
    </footer>
  );
} 