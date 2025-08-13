import { Button } from "@/components/ui/button";

import SimpleFallbackBackground from "./SimpleFallbackBackground";
import SocialProof from "./SocialProof";

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pb-12 overflow-hidden bg-gradient-to-b from-slate-50 to-white">
      {/* 
        TESTING BACKGROUNDS:
        1. CSS Fallback (currently active) - floating blue dots
        2. TSParticles (commented out) - interactive particle system
        
        To switch: comment out the active one and uncomment the other
      */}
      
      {/* CSS Fallback Background - currently active */}
      <SimpleFallbackBackground className="absolute inset-0 z-0" />
      
      {/* TSParticles Background - uncomment to test */}
      {/* <AnimatedHeroBackground className="absolute inset-0 z-0" /> */}
      
      {/* Glow Effect */}
      <div className="absolute inset-0 z-10 bg-[radial-gradient(ellipse_at_center,rgba(59,130,246,0.15),transparent_70%)]"></div>
      
      {/* Content Wrapper - Constrained */}
      <div className="flex-1 flex items-center justify-center z-20 relative">
        <div className="max-w-7xl mx-auto text-center px-4 sm:px-6 lg:px-8 pt-24">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight opacity-0 animate-[fadeInUp_1s_ease-out_forwards]">
            Become an{" "}
            <span className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 bg-clip-text text-transparent">
              AI Powered Marketer
            </span>
          </h1>
          
          <div className="max-w-2xl mx-auto mb-8 opacity-0 animate-[fadeInUp_1s_ease-out_0.5s_forwards]">
            <p className="text-xl text-gray-600 mb-4 leading-relaxed">
              Learn how to use AI in marketing, from ads to conversion.
            </p>
            
            <p className="text-lg text-gray-500">
              It&apos;s free.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-[fadeInUp_1s_ease-out_1s_forwards]">
            <Button 
              variant="default"
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all"
            >
              Apply now
            </Button>
            <Button 
              variant="ghost"
              size="lg" 
              className="text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-lg transition-all"
            >
              Learn More
            </Button>
          </div>
        </div>
      </div>
      
      {/* Social Proof - Full Width */}
      <div className="z-20 relative w-full">
        <SocialProof />
      </div>
    </section>
  );
} 