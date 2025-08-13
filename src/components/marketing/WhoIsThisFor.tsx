import { CheckCircle2, Bot, BrainCircuit, Code } from "lucide-react";

export default function WhoIsThisFor() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-12 flex flex-col md:flex-row gap-12">
          {/* Left Column - Text */}
          <div className="flex-1">
            <h2 className="text-3xl font-bold mb-6">
              This course is ideal if you&apos;re
            </h2>
            
            <ul className="flex flex-col gap-y-3">
              <li className="flex items-center gap-x-3">
                <CheckCircle2 className="text-blue-600 w-5 h-5 shrink-0" />
                <span>Trying to improve your marketing skills</span>
              </li>
              <li className="flex items-center gap-x-3">
                <CheckCircle2 className="text-blue-600 w-5 h-5 shrink-0" />
                <span>Looking to leverage the power of AI</span>
              </li>
              <li className="flex items-center gap-x-3">
                <CheckCircle2 className="text-blue-600 w-5 h-5 shrink-0" />
                <span>Seeking a career boost and to upskill</span>
              </li>
              <li className="flex items-center gap-x-3">
                <CheckCircle2 className="text-blue-600 w-5 h-5 shrink-0" />
                <span>Trying to get promoted or hired</span>
              </li>
              <li className="flex items-center gap-x-3">
                <CheckCircle2 className="text-blue-600 w-5 h-5 shrink-0" />
                <span>Launching winning campaigns</span>
              </li>
            </ul>
          </div>
          
          {/* Right Column - Visuals */}
          <div className="flex-1 relative flex items-center justify-center min-h-96">
            {/* Smaller Orbit */}
            <div className="absolute w-48 h-48 border border-dashed border-white/30 rounded-full animate-[orbit_20s_linear_infinite]">
              {/* Icon at top of smaller orbit */}
              <div className="absolute w-10 h-10 bg-blue-400 rounded-full p-2 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <Bot className="w-full h-full text-slate-900" />
              </div>
            </div>
            
            {/* Larger Orbit */}
            <div className="absolute w-72 h-72 border border-dashed border-white/30 rounded-full animate-[orbit_30s_linear_infinite_reverse]">
              {/* Icon at top of larger orbit */}
              <div className="absolute w-10 h-10 bg-blue-400 rounded-full p-2 top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <BrainCircuit className="w-full h-full text-slate-900" />
              </div>
              
              {/* Icon at bottom of larger orbit */}
              <div className="absolute w-10 h-10 bg-blue-400 rounded-full p-2 bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
                <Code className="w-full h-full text-slate-900" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 