import Header from "@/components/shared/Header";
import Hero from "@/components/marketing/Hero";
import WhatsInside from "@/components/marketing/WhatsInside";
import WhoIsThisFor from "@/components/marketing/WhoIsThisFor";
import ToolsSection from "@/components/marketing/ToolsSection";
import CurriculumSection from "@/components/marketing/CurriculumSection";
// import StudentProjects from "@/components/marketing/StudentProjects";
import FAQSection from "@/components/marketing/FAQSection";
import Footer from "@/components/shared/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="flex flex-col">
        <Hero />
        <WhatsInside />
        <WhoIsThisFor />
        <ToolsSection />
        <CurriculumSection />
        {/* <StudentProjects /> */}
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
