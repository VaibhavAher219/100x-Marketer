import { Badge } from "@/components/ui/badge";
import Marquee from "react-fast-marquee";

const companies = [
  { name: "TechFlow", logo: "🚀", industry: "SaaS" },
  { name: "DataDriven", logo: "📊", industry: "Analytics" },
  { name: "AIMarketing Co", logo: "🤖", industry: "AI/ML" },
  { name: "GrowthLabs", logo: "📈", industry: "Growth" },
  { name: "ContentAI", logo: "✨", industry: "Content" },
  { name: "AutomateX", logo: "⚡", industry: "Automation" },
  { name: "ScaleUp", logo: "🎯", industry: "Startup" },
  { name: "MarketingPro", logo: "💡", industry: "Agency" },
  { name: "InnovateTech", logo: "🔥", industry: "Technology" },
  { name: "FutureMarketing", logo: "🌟", industry: "Digital" }
];

function CompanyCard({ company }: { company: typeof companies[0] }) {
  return (
    <div className="mx-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 min-w-[280px] group hover:-translate-y-1">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300">
          {company.logo}
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
            {company.name}
          </h3>
          <p className="text-gray-500 text-sm">{company.industry}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Badge variant="outline" className="text-green-600 border-green-600">
          Hiring Now
        </Badge>
        <span className="text-sm text-gray-500">5-12 open roles</span>
      </div>
    </div>
  );
}

export default function FeaturedCompanies() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700">
            Featured Companies
          </Badge>
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Join{" "}
            <span className="text-blue-600">Industry Leaders</span>
          </h2>
          <p className="text-gray-600 text-xl max-w-3xl mx-auto leading-relaxed">
            Top companies are actively hiring AI marketing professionals. Your next opportunity awaits.
          </p>
        </div>
      </div>

      {/* Companies Marquee */}
      <Marquee gradient={false} speed={40} className="py-4">
        {companies.map((company, index) => (
          <CompanyCard key={index} company={company} />
        ))}
      </Marquee>

      {/* Second row in opposite direction */}
      <Marquee gradient={false} speed={40} direction="right" className="py-4">
        {companies.slice().reverse().map((company, index) => (
          <CompanyCard key={index} company={company} />
        ))}
      </Marquee>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="text-center bg-white rounded-3xl p-12 shadow-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Want to see your company here?
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Partner with us to find the best AI marketing talent. Join 150+ companies already hiring through our platform.
          </p>
          <button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg">
            Become a Partner
          </button>
        </div>
      </div>
    </section>
  );
}