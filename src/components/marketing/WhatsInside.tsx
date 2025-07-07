"use client";

import { CheckCircle2, Star, Sparkles, Trophy, Users, BookOpen, Award, Video, Clock, CalendarDays, TerminalSquare, FileBox, Infinity } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function WhatsInside() {
  const features = [
    {
      icon: <CalendarDays className="w-6 h-6" />,
      title: "4 Weeks Cohort",
      description: "Comprehensive program with structured learning path"
    },
    {
      icon: <TerminalSquare className="w-6 h-6" />,
      title: "Build Your Own GenAI Products",
      description: "Create real-world AI marketing solutions from scratch",
      featured: true
    },
    {
      icon: <Award className="w-6 h-6" />,
      title: "Professional Certificate",
      description: "Industry-recognized certification upon completion"
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "50+ Hours of Learning",
      description: "Extensive video content and hands-on practice"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Elite Community",
      description: "Network with top-tier marketing professionals"
    },
    {
      icon: <FileBox className="w-6 h-6" />,
      title: "Project-based Learning",
      description: "Build portfolio-worthy marketing AI projects"
    },
    {
      icon: <Infinity className="w-6 h-6" />,
      title: "Learn at your own pace",
      description: "Flexible learning with live interaction"
    }
  ];

  return (
    <section id="overview" className="py-24 bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Stars */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Content Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge 
            variant="secondary" 
            className="mb-6 bg-blue-50 text-blue-700 border-blue-200 px-4 py-2 text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Course Features
          </Badge>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 leading-tight">
            What's <span className="text-orange-500">included</span>?
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Experience the most comprehensive AI marketing curriculum designed for the modern marketer
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className={`group relative bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 h-full ${
                feature.featured ? 'lg:col-span-2' : ''
              }`}
            >
              <CardContent className="p-6 text-center h-full flex flex-col">
                {/* Icon Container */}
                <div className="mb-4">
                  <div className={`${feature.featured ? 'w-16 h-16' : 'w-14 h-14'} rounded-xl bg-gray-100 flex items-center justify-center text-gray-800 shadow-md group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-110 mx-auto`}>
                    {feature.featured ? (
                      <TerminalSquare className="w-8 h-8" />
                    ) : (
                      feature.icon
                    )}
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 flex flex-col">
                  <h3 className={`${feature.featured ? 'text-xl' : 'text-lg'} font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300`}>
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed flex-1">
                    {feature.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Primary Action Button */}
        <div className="text-center mt-16">
          <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all">
            Join the Marketing Revolution
            <Sparkles className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>

      <style jsx>{`
        @keyframes twinkle {
          0%, 100% {
            opacity: 0.2;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.2);
          }
        }
      `}</style>
    </section>
  );
} 