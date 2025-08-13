import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Target, TrendingUp } from "lucide-react";

export default function JobsCTA() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-12 lg:p-16 relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 rounded-full -translate-y-48 translate-x-48" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-purple-600/20 to-pink-600/20 rounded-full translate-y-36 -translate-x-36" />
          
          {/* Floating icons */}
          <div className="absolute top-20 left-20 text-blue-400 opacity-20">
            <Sparkles className="w-8 h-8 animate-pulse" />
          </div>
          <div className="absolute top-32 right-32 text-indigo-400 opacity-20">
            <Target className="w-6 h-6 animate-bounce" style={{ animationDelay: '1s' }} />
          </div>
          <div className="absolute bottom-24 right-24 text-purple-400 opacity-20">
            <TrendingUp className="w-7 h-7 animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
          
          <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            {/* Left content */}
            <div className="flex-1 text-center lg:text-left">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/20 text-blue-300 text-sm font-medium mb-6">
                🎯 Limited Time Offer
              </div>
              
              <h2 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Ready to{" "}
                <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Transform
                </span>{" "}
                Your Career?
              </h2>
              
              <p className="text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
                Join thousands of AI marketers who&apos;ve already accelerated their careers. Your dream job is just one click away.
              </p>
              
              {/* Benefits list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="text-gray-300">Free profile creation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="text-gray-300">AI-powered job matching</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="text-gray-300">Direct company access</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  <span className="text-gray-300">Career growth tracking</span>
                </div>
              </div>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                >
                  Get Started Now
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-gray-600 hover:border-blue-400 text-gray-300 hover:text-blue-400 px-8 py-4 text-lg transition-all duration-300 bg-transparent hover:bg-blue-600/10"
                >
                  View Sample Jobs
                </Button>
              </div>
            </div>
            
            {/* Right content - Stats */}
            <div className="flex-shrink-0">
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="text-3xl font-bold text-blue-400 mb-2">24h</div>
                  <div className="text-gray-400 text-sm">Average Response Time</div>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="text-3xl font-bold text-green-400 mb-2">89%</div>
                  <div className="text-gray-400 text-sm">Interview Success Rate</div>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="text-3xl font-bold text-purple-400 mb-2">$15k</div>
                  <div className="text-gray-400 text-sm">Average Salary Boost</div>
                </div>
                <div className="text-center p-6 bg-white/5 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="text-3xl font-bold text-indigo-400 mb-2">2.5x</div>
                  <div className="text-gray-400 text-sm">Faster Job Placement</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom testimonial */}
          <div className="relative z-10 mt-12 pt-8 border-t border-gray-700">
            <div className="flex items-center justify-center gap-4 text-center">
              <div className="flex -space-x-2">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  M
                </div>
                <div className="w-10 h-10 bg-gradient-to-r from-green-600 to-teal-600 rounded-full flex items-center justify-center text-white font-bold">
                  A
                </div>
              </div>
              <div className="text-gray-300">
                <span className="font-semibold">2,847 marketers</span> found their dream jobs this month
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}