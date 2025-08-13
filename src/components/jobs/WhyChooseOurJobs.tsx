import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Users2, TrendingUp, Shield } from "lucide-react";

const benefits = [
  {
    icon: Target,
    title: "Curated AI Marketing Roles",
    description: "Hand-picked opportunities from companies specifically looking for AI-savvy marketers. No generic job listings.",
    color: "from-blue-500 to-blue-600"
  },
  {
    icon: Users2,
    title: "Direct Company Connections",
    description: "Skip the middleman. Connect directly with hiring managers and founders who value your AI marketing skills.",
    color: "from-indigo-500 to-indigo-600"
  },
  {
    icon: TrendingUp,
    title: "Skill-Matched Opportunities",
    description: "Our AI matches your specific skills with roles that fit perfectly. Higher success rates, better career growth.",
    color: "from-purple-500 to-purple-600"
  },
  {
    icon: Shield,
    title: "Career Growth Tracking",
    description: "Track your applications, get feedback, and receive personalized career advice to accelerate your growth.",
    color: "from-green-500 to-green-600"
  }
];

export default function WhyChooseOurJobs() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700">
            Why Choose Us
          </Badge>
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Your Success is{" "}
            <span className="text-blue-600">Our Priority</span>
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            We&apos;re not just another job board. We&apos;re your career partner in the AI marketing revolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {benefits.map((benefit, index) => {
            const IconComponent = benefit.icon;
            return (
              <Card 
                key={index} 
                className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border-0 shadow-lg overflow-hidden"
              >
                <CardContent className="p-8 relative">
                  {/* Background gradient effect */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${benefit.color} opacity-5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700`} />
                  
                  <div className="relative z-10">
                    <div className={`w-16 h-16 bg-gradient-to-r ${benefit.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                      {benefit.title}
                    </h3>
                    
                    <p className="text-gray-600 leading-relaxed text-lg">
                      {benefit.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats section */}
        <div className="mt-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold mb-2">2,500+</div>
              <div className="text-blue-100">Successful Placements</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">150+</div>
              <div className="text-blue-100">Partner Companies</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">$95k</div>
              <div className="text-blue-100">Average Starting Salary</div>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">30%</div>
              <div className="text-blue-100">Salary Increase</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}