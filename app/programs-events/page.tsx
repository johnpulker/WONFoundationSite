"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SubNav from "@/components/SubNav";
import ProgramsOverview from "@/components/pages/programs/ProgramsOverview";
import LeadershipMentoring from "@/components/pages/programs/LeadershipMentoring";
import NetworkingTraining from "@/components/pages/programs/NetworkingTraining";
import EventsSection from "@/components/pages/programs/EventsSection";

const subNavItems = [
  { id: "overview", label: "Overview" },
  { id: "mentoring", label: "Leadership Mentoring" },
  { id: "networking", label: "Networking & Training" },
  { id: "events", label: "Events" },
];

// Section Divider Component
function SectionDivider() {
  return (
    <div className="relative py-8 md:py-12">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-4xl flex items-center">
          <div className="flex-grow h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
        </div>
      </div>
      <div className="relative flex justify-center">
        <div className="px-6 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#E7C418]" />
            <div className="w-2 h-2 rounded-full bg-[#871c1c]" />
            <div className="w-1.5 h-1.5 rounded-full bg-[#E7C418]" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgramsEventsContent() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // If scroll=bottom query param is present, scroll to bottom
    if (searchParams.get('scroll') === 'bottom') {
      const scrollToBottom = () => {
        requestAnimationFrame(() => {
          // Try to scroll to the bottom element first
          const bottomElement = document.getElementById('page-bottom');
          if (bottomElement) {
            bottomElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
            return;
          }
          
          // Fallback: scroll to absolute bottom of document
          const bodyHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
          );
          
          window.scrollTo({
            top: bodyHeight,
            left: 0,
            behavior: 'smooth'
          });
        });
      };
      
      // Try multiple times to account for async content loading
      scrollToBottom();
      setTimeout(scrollToBottom, 100);
      setTimeout(scrollToBottom, 300);
      setTimeout(scrollToBottom, 600);
      setTimeout(scrollToBottom, 1000);
      setTimeout(scrollToBottom, 2000);
      
      // Listen for load event
      if (document.readyState === 'complete') {
        scrollToBottom();
      } else {
        const handleLoad = () => {
          setTimeout(scrollToBottom, 100);
          window.removeEventListener('load', handleLoad);
        };
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }
  }, [searchParams]);

  return (
    <div className="w-full bg-white">
      <SubNav items={subNavItems} />
      
      {/* Main Content Container */}
      <div className="relative">
        {/* Subtle background texture */}
        <div className="absolute inset-0 pattern-diagonal opacity-30 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          {/* Programs Overview - Hero Section */}
          <section id="overview" className="scroll-mt-24">
            <ProgramsOverview />
          </section>
          
          <SectionDivider />
          
          {/* Leadership Mentoring Section */}
          <section id="mentoring" className="scroll-mt-24">
            <LeadershipMentoring />
          </section>
          
          <SectionDivider />
          
          {/* Networking & Training Section */}
          <section id="networking" className="scroll-mt-24">
            <NetworkingTraining />
          </section>
          
          <SectionDivider />
          
          {/* Events Section */}
          <section id="events" className="scroll-mt-24 pb-8">
            <EventsSection />
          </section>
        </div>
      </div>
      
      {/* Bottom Decorative Band */}
      <div id="page-bottom" className="h-2 bg-gradient-to-r from-[#871c1c] via-[#E7C418] to-[#871c1c]" />
    </div>
  );
}

export default function ProgramsEventsPage() {
  return (
    <Suspense fallback={<div className="w-full bg-white min-h-screen" />}>
      <ProgramsEventsContent />
    </Suspense>
  );
}
