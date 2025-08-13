import Header from "@/components/shared/Header";
import Footer from "@/components/shared/Footer";

import JobsHero from "@/components/jobs/JobsHero";
import WhyChooseOurJobs from "@/components/jobs/WhyChooseOurJobs";
import JobCategories from "@/components/jobs/JobCategories";
import FeaturedCompanies from "@/components/jobs/FeaturedCompanies";
import HowItWorks from "@/components/jobs/HowItWorks";
import JobsCTA from "@/components/jobs/JobsCTA";
import JobListings from "@/components/jobs/JobListings";

export const metadata = {
  title: "Jobs - 100x Marketers | AI Marketing Career Opportunities",
  description: "Launch your AI marketing career with curated job opportunities from top companies hiring 100x marketers.",
};

export default function JobsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex flex-col">
        <JobsHero />
        <WhyChooseOurJobs />
        <JobCategories />
        <JobListings />
        <FeaturedCompanies />
        <HowItWorks />
        <JobsCTA />
      </main>
      <Footer />
    </div>
  );
}