import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { ChevronDown } from "lucide-react";

const faqData = [
  {
    question: "Is this really free? What's the catch?",
    answer: "Yes, it's completely free! We believe in democratizing AI marketing education. Our goal is to build a community of skilled AI marketers. There's no hidden fees, no upsells - just high-quality education."
  },
  {
    question: "I'm not tech-savvy. Can I still learn AI marketing?",
    answer: "Absolutely! This course is designed for marketers, not developers. We focus on practical applications and user-friendly tools. You'll learn to use AI marketing tools without needing any coding skills."
  },
  {
    question: "What AI marketing tools will I actually learn to use?",
    answer: "You'll master ChatGPT for copy and strategy, Midjourney for visual content, Runway for video creation, Synthesia for AI avatars, and Mesha for campaign automation and optimization. All practical, real-world tools."
  },
  {
    question: "How can AI actually improve my marketing ROI?",
    answer: "AI can automate repetitive tasks, personalize content at scale, optimize ad spend in real-time, predict customer behavior, and create high-converting content faster. Students typically see 2-3x improvement in campaign performance."
  },
  {
    question: "Will this help me get promoted or find a better marketing job?",
    answer: "Yes! AI marketing skills are in huge demand. You'll build a portfolio of real projects, get a professional certificate, and learn cutting-edge skills that set you apart from other marketers in the job market."
  },
  {
    question: "How much time do I need to commit each week?",
    answer: "The course is designed to be flexible. You can complete it in 4 weeks with 3-4 hours per week, or take longer if needed. All content is self-paced with optional live sessions for additional support."
  }
];

export default function FAQSection() {
  return (
    <section id="faq" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center max-w-4xl mx-auto">
          {/* Badge */}
          <Badge variant="secondary" className="mb-4 bg-blue-100 text-blue-700">
            FAQs
          </Badge>
          
          {/* Title */}
          <h2 className="text-4xl font-bold text-center mb-4 text-gray-900">
            You&apos;ll have <span className="text-blue-600">questions!</span>
          </h2>
          
          {/* Subtitle */}
          <p className="text-gray-600 text-center mb-12 max-w-2xl leading-relaxed">
            Everything you need to know about AI marketing and this free course.
          </p>
          
          {/* FAQ Accordion */}
          <div className="w-full max-w-3xl bg-white rounded-xl shadow-lg p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, index) => (
                <AccordionItem key={index} value={`faq-${index}`} className="border-b border-gray-100 last:border-b-0">
                  <AccordionTrigger className="py-6 text-left hover:no-underline [&[data-state=open]>svg]:rotate-180 transition-all">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-lg font-semibold pr-4 text-gray-900">{faq.question}</span>
                      <ChevronDown className="h-5 w-5 text-blue-600 shrink-0 transition-transform duration-200" />
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-6 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  );
} 