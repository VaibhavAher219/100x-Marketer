"use client";

import { useState, useEffect } from 'react';

interface SimpleFallbackBackgroundProps {
  className?: string;
}

interface Particle {
  left: number;
  top: number;
  duration: number;
  delay: number;
}

export default function SimpleFallbackBackground({ className = "" }: SimpleFallbackBackgroundProps) {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Generate particles only on client side to avoid hydration mismatch
    const generatedParticles: Particle[] = [...Array(20)].map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 3 + Math.random() * 4,
      delay: Math.random() * 3,
    }));
    
    setParticles(generatedParticles);
    setIsClient(true);
  }, []);

  return (
    <div className={`absolute inset-0 ${className}`}>
      {/* Floating particles using CSS */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Generate some floating dots */}
        {isClient && particles.map((particle, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-500 rounded-full opacity-30"
            style={{
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animation: `float ${particle.duration}s ease-in-out infinite`,
              animationDelay: `${particle.delay}s`,
            }}
          />
        ))}
      </div>
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5" />
      
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
            opacity: 0.2;
          }
          50% {
            transform: translateY(-20px) translateX(10px);
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
} 