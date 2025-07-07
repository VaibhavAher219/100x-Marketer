import { ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const curriculumData = [
  {
    week: 'WEEK 1',
    moduleNumber: '1',
    subtitle: 'Foundations of Generative AI in Marketing',
    title: 'Gen AI x Marketing: Week 1 – Foundations',
    tags: ['1 LIVE SESSION', '1 ASSIGNMENT']
  },
  {
    week: 'WEEK 2',
    moduleNumber: '2',
    subtitle: 'Creative Automation & Content Generation',
    title: 'Week 2 – Creative Automation',
    tags: ['1 LIVE SESSION', '1 ASSIGNMENT']
  },
  {
    week: 'WEEK 3',
    moduleNumber: '3',
    subtitle: 'AI Agents in Marketing Workflows',
    title: 'Week 3 – Agents & Automation',
    tags: ['1 LIVE SESSION', '1 ASSIGNMENT']
  },
  {
    week: 'WEEK 4',
    moduleNumber: '4',
    subtitle: 'Revenue, AEO, and Conversions with Mesha',
    title: 'Week 4 – Launch with Mesha',
    tags: ['1 LIVE SESSION', '1 ASSIGNMENT']
  }
];

export default function CurriculumSection() {
  return (
    <section id="curriculum" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
          What will you <span className="text-blue-600">learn</span>?
        </h2>
        
        {/* Subtitle */}
        <p className="text-gray-600 text-center mb-16 max-w-2xl mx-auto leading-relaxed">
          Designed to make you an elite marketer, in a few weeks.
        </p>
        
        {/* Curriculum Timeline */}
        <div className="space-y-8">
          {curriculumData.map((module, index) => (
            <div key={index} className="flex gap-8">
              {/* Timeline Graphic (Left Part) */}
              <div className="relative flex-shrink-0 w-24">
                {/* Week Tag */}
                <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 w-fit mb-2">
                  {module.week}
                </Badge>
                
                {/* Circle */}
                <div className="w-4 h-4 bg-blue-600 rounded-full mb-2"></div>
                
                {/* Vertical Line */}
                {index < curriculumData.length - 1 && (
                  <div className="absolute left-2 top-16 w-0 h-24 border-l-2 border-dashed border-gray-300"></div>
                )}
              </div>
              
              {/* Content (Right Part) */}
              <div className="flex-1">
                <Card className="shadow-lg hover:shadow-xl transition-shadow border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center w-full gap-4">
                      {/* A) Module Number Icon */}
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-semibold text-sm">
                        {module.moduleNumber}
                      </div>
                      
                      {/* B) Text Content */}
                      <div className="flex-grow">
                        <p className="text-xs uppercase text-gray-500 font-medium tracking-wide mb-1">
                          {module.subtitle}
                        </p>
                        <p className="text-lg font-bold text-gray-900">
                          {module.title}
                        </p>
                      </div>
                      
                      {/* C) Tags */}
                      <div className="flex items-center gap-2">
                        {module.tags.map((tag, tagIndex) => (
                          <Badge 
                            key={tagIndex}
                            variant="secondary"
                            className="text-xs bg-gray-100 text-gray-700"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      
                      {/* D) Chevron Icon */}
                      <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 