import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bot, TrendingUp, PenTool, BarChart3, Users, Zap } from "lucide-react";

const jobCategories = [
  {
    id: "ai-specialist",
    name: "AI Marketing Specialist",
    icon: Bot,
    description: "Lead AI-driven marketing campaigns and automation strategies",
    jobCount: 45,
    salary: "$80k - $120k",
    growth: "+25%"
  },
  {
    id: "growth-hacker",
    name: "Growth Hacker",
    icon: TrendingUp,
    description: "Drive rapid user acquisition through data-driven experiments",
    jobCount: 32,
    salary: "$70k - $110k",
    growth: "+30%"
  },
  {
    id: "content-creator",
    name: "AI Content Creator",
    icon: PenTool,
    description: "Create compelling content using AI tools and creative strategies",
    jobCount: 28,
    salary: "$60k - $95k",
    growth: "+40%"
  },
  {
    id: "marketing-analyst",
    name: "Marketing Data Analyst",
    icon: BarChart3,
    description: "Analyze marketing performance and optimize campaigns with AI",
    jobCount: 38,
    salary: "$75k - $105k",
    growth: "+20%"
  },
  {
    id: "social-strategist",
    name: "Social Media AI Strategist",
    icon: Users,
    description: "Develop AI-powered social media strategies and campaigns",
    jobCount: 25,
    salary: "$65k - $100k",
    growth: "+35%"
  },
  {
    id: "automation-expert",
    name: "Marketing Automation Expert",
    icon: Zap,
    description: "Build and optimize automated marketing workflows and funnels",
    jobCount: 41,
    salary: "$85k - $125k",
    growth: "+28%"
  }
];

export default function JobCategories() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700">
            Job Categories
          </Badge>
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Find Your Perfect{" "}
            <span className="text-blue-600">AI Marketing</span> Role
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Explore high-demand roles in AI-powered marketing. Each category offers unique opportunities to grow your career.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {jobCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <Card 
                key={category.id} 
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-0 shadow-lg"
              >
                <CardContent className="p-8">
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-7 h-7 text-white" />
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {category.growth}
                    </Badge>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {category.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {category.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">
                        <strong className="text-gray-900">{category.jobCount}</strong> jobs
                      </span>
                      <span className="text-gray-500">
                        <strong className="text-gray-900">{category.salary}</strong>
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}