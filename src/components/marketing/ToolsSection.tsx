import Marquee from "react-fast-marquee";
import { Badge } from "@/components/ui/badge";
import ToolCard from "./ToolCard";

export default function ToolsSection() {
  const tools = [
    { name: "Mesha", icon: "🚀" },
    { name: "ChatGPT", icon: "🤖" },
    { name: "Midjourney", icon: "🎨" },
    { name: "Runway", icon: "📹" },
    { name: "Synthesia", icon: "🎬" }
  ];

  return (
    <section className="py-20">
      {/* Header Content - Constrained */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700">
            Tools & Frameworks
          </Badge>
          
          {/* Main Title */}
          <h2 className="text-4xl font-bold mb-4 text-center text-gray-900">
            What will you <span className="text-blue-600">master</span>?
          </h2>
          
          {/* Subtitle */}
          <p className="text-gray-600 text-center mb-12 max-w-2xl leading-relaxed">
            Master the tools that are shaping the future of marketing.
          </p>
        </div>
      </div>
      
      {/* Animated Marquee - Full Width */}
      <Marquee gradient={false} speed={50}>
        {[...tools, ...tools].map((tool, index) => (
          <ToolCard key={index} icon={tool.icon} name={tool.name} />
        ))}
      </Marquee>
    </section>
  );
} 