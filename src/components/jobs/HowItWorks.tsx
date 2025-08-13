import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { UserPlus, Search, Briefcase } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Complete Your Profile",
    description: "Create a comprehensive profile showcasing your AI marketing skills, experience, and career goals. Our smart system learns what makes you unique.",
    features: ["AI Skills Assessment", "Portfolio Upload", "Career Preferences"]
  },
  {
    number: "02",
    icon: Search,
    title: "Get Matched with Opportunities",
    description: "Our AI-powered matching system connects you with roles that perfectly align with your skills and aspirations. No more endless scrolling through irrelevant jobs.",
    features: ["Smart Job Matching", "Personalized Recommendations", "Real-time Notifications"]
  },
  {
    number: "03",
    icon: Briefcase,
    title: "Apply and Get Hired",
    description: "Apply with confidence knowing you're a great fit. Track your applications, get feedback, and land your dream AI marketing role faster than ever.",
    features: ["One-click Applications", "Application Tracking", "Interview Preparation"]
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700">
            How It Works
          </Badge>
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Your Path to{" "}
            <span className="text-blue-600">Success</span>
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Three simple steps to transform your career and land your dream AI marketing role.
          </p>
        </div>

        <div className="relative">
          {/* Connection lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200 transform -translate-y-1/2" />
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <Card 
                  key={index} 
                  className="group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg bg-white relative overflow-hidden"
                >
                  {/* Background decoration */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700" />
                  
                  <CardContent className="p-8 relative z-10">
                    {/* Step number */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="text-6xl font-bold text-blue-100 group-hover:text-blue-200 transition-colors">
                        {step.number}
                      </div>
                      <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {step.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed mb-6 text-lg">
                      {step.description}
                    </p>
                    
                    {/* Features list */}
                    <ul className="space-y-2">
                      {step.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-sm text-gray-500">
                          <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mr-3" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-2 text-blue-600 font-medium mb-4">
            <span>Ready to get started?</span>
            <span className="animate-bounce">👆</span>
          </div>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-12 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            Start Your Journey
          </button>
        </div>
      </div>
    </section>
  );
}