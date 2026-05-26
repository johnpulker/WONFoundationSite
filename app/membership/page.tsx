import SubNav from "@/components/SubNav";
import WhyJoin from "@/components/pages/membership/WhyJoin";
import HowItWorks from "@/components/pages/membership/HowItWorks";
import JoinRenewFlow from "@/components/pages/membership/JoinRenewFlow";
import { Suspense } from "react";

const subNavItems = [
  { id: "why-join", label: "Why Join" },
  { id: "how-it-works", label: "How It Works" },
  { id: "join", label: "Join / Renew" },
];

// Elegant Section Divider
function SectionDivider({ variant = "default" }: { variant?: "default" | "gold" | "wave" }) {
  if (variant === "wave") {
    return (
      <div className="relative py-12 md:py-16">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <svg className="w-full max-w-4xl h-16 text-[#E7C418]/10" viewBox="0 0 400 40" preserveAspectRatio="none">
            <path 
              d="M0 20 Q 100 0 200 20 T 400 20" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1"
            />
          </svg>
        </div>
        <div className="relative flex justify-center">
          <div className="px-6 bg-white">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-[#E7C418] to-[#C9A814] shadow-md" />
          </div>
        </div>
      </div>
    );
  }
  
  if (variant === "gold") {
    return (
      <div className="relative py-10 md:py-14">
        <div className="flex items-center justify-center">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#E7C418]/40" />
          <div className="mx-4 flex items-center gap-2">
            <span className="text-[#E7C418] text-lg">✦</span>
            <span className="text-[#871c1c] text-sm">✦</span>
            <span className="text-[#E7C418] text-lg">✦</span>
          </div>
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#E7C418]/40" />
        </div>
      </div>
    );
  }
  
  return (
    <div className="relative py-10 md:py-14">
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

export default function MembershipPage() {
  return (
    <div className="w-full bg-white">
      <SubNav items={subNavItems} />
      
      {/* Main Content Container */}
      <div className="relative">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 pattern-diagonal opacity-20 pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          {/* Why Join - Hero Section */}
          <section id="why-join" className="scroll-mt-24">
            <WhyJoin />
          </section>
          
          <SectionDivider variant="wave" />
          
          {/* How It Works Section */}
          <section id="how-it-works" className="scroll-mt-24">
            <HowItWorks />
          </section>
          
          <SectionDivider />
          
          {/* Join/Renew Section */}
          <section id="join" className="scroll-mt-24 pb-8">
            <Suspense fallback={
              <div className="text-center py-20">
                <div className="w-16 h-16 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-neutral-600">Loading...</p>
              </div>
            }>
              <JoinRenewFlow />
            </Suspense>
          </section>
        </div>
      </div>
      
      {/* Bottom Decorative Band */}
      <div className="h-2 bg-gradient-to-r from-[#871c1c] via-[#E7C418] to-[#871c1c]" />
    </div>
  );
}
