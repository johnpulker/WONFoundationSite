"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import SubNav from "@/components/SubNav";
import AboutHero from "@/components/pages/about/Hero";
import Overview from "@/components/pages/about/Overview";
import MissionVision from "@/components/pages/about/MissionVision";
import History from "@/components/pages/about/History";
import BoardDirectory from "@/components/pages/about/BoardDirectory";
import Committees from "@/components/pages/about/Committees";
import DEIStatement from "@/components/pages/about/DEIStatement";
import Image from "next/image";

const subNavItems = [
  { id: "history", label: "Our Story" },
  { id: "mission", label: "Mission & Vision" },
  { id: "overview", label: "Overview" },
  { id: "board", label: "Board Directory" },
  { id: "committees", label: "Committees" },
  { id: "dei", label: "DEI Statement" },
];

export default function AboutPage() {
  const pathname = usePathname();
  const hasScrolledRef = useRef(false);

  useEffect(() => {
    // Reset scroll flag when pathname changes
    hasScrolledRef.current = false;
  }, [pathname]);

  useEffect(() => {
    // Handle hash scrolling when navigating from other pages
    const scrollToHash = (force = false) => {
      if (hasScrolledRef.current && !force) return;
      
      // Check both window.location.hash and the URL
      const hashFromUrl = window.location.hash || window.location.href.split('#')[1];
      const hash = hashFromUrl ? hashFromUrl.replace('#', '') : '';
      
      if (!hash) return;

      const performScroll = () => {
        const element = document.getElementById(hash);
        
        if (element) {
          hasScrolledRef.current = true;
          // Calculate offset for sticky nav (96px = 24 * 4px)
          const offset = 96;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
          return true;
        }
        return false;
      };

      // Try immediately
      if (performScroll()) return;

      // If not found, try multiple times with increasing delays
      let attempts = 0;
      const maxAttempts = 40; // Try for up to 4 seconds
      
      const tryScroll = () => {
        attempts++;
        if (performScroll()) return;
        
        if (attempts < maxAttempts) {
          setTimeout(tryScroll, 100);
        }
      };

      // Start trying after a short delay to let page render
      setTimeout(tryScroll, 100);
    };

    // Use requestAnimationFrame to check after browser paint
    const rafCheck = () => {
      requestAnimationFrame(() => {
        scrollToHash();
      });
    };

    // Run on mount and when pathname changes
    rafCheck();
    setTimeout(rafCheck, 100);
    setTimeout(rafCheck, 300);
    setTimeout(rafCheck, 600);

    // Also listen for hash changes and popstate (browser back/forward)
    const handleHashChange = () => {
      hasScrolledRef.current = false;
      setTimeout(() => scrollToHash(true), 50);
    };

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [pathname]);

  return (
    <div className="w-full relative min-h-screen">
      {/* Background Pattern with Hierarchy - Stronger at top, fades down */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Top section - stronger vines */}
        <div className="absolute top-0 left-0 right-0 h-[40vh] opacity-[0.12] blur-[0.5px]">
          <div 
            className="w-full h-full bg-repeat"
            style={{
              backgroundImage: 'url(/goldenvines.png)',
              backgroundSize: 'auto',
              backgroundPosition: 'center',
            }}
          />
        </div>
        {/* Middle section - medium vines */}
        <div className="absolute top-[40vh] left-0 right-0 h-[40vh] opacity-[0.08] blur-[0.5px]">
          <div 
            className="w-full h-full bg-repeat"
            style={{
              backgroundImage: 'url(/goldenvines.png)',
              backgroundSize: 'auto',
              backgroundPosition: 'center',
            }}
          />
        </div>
        {/* Bottom section - lighter vines */}
        <div className="absolute top-[80vh] left-0 right-0 bottom-0 opacity-[0.05] blur-[0.5px]">
          <div 
            className="w-full h-full bg-repeat"
            style={{
              backgroundImage: 'url(/goldenvines.png)',
              backgroundSize: 'auto',
              backgroundPosition: 'center',
            }}
          />
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <AboutHero />
      </div>
      
      {/* Sub Navigation */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-neutral-200 relative">
        <SubNav items={subNavItems} />
      </div>

      {/* Content Sections with Soft Transparent Cards */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-6">
        <section id="history" className="py-4 md:py-6 scroll-mt-24 mb-4">
          <div 
            className="backdrop-blur-sm rounded-[24px] px-6 md:px-10 pt-6 md:pt-10 pb-8 md:pb-12"
            style={{
              background: 'rgba(255,252,248,0.98)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              border: '1px solid rgba(212,180,80,0.15)',
            }}
          >
            <History />
          </div>
        </section>
        
        {/* Section Divider */}
        <div className="flex items-center justify-center py-2">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
        </div>
        
        <section id="mission" className="py-4 md:py-6 scroll-mt-24 mb-2">
          <div 
            className="backdrop-blur-sm rounded-[24px] px-6 md:px-10 pt-6 md:pt-10 pb-8 md:pb-12"
            style={{
              background: 'rgba(255,252,248,0.98)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              border: '1px solid rgba(212,180,80,0.15)',
            }}
          >
            <MissionVision />
          </div>
        </section>
        
        {/* Section Divider */}
        <div className="flex items-center justify-center py-3">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
        </div>
        
        <section id="overview" className="py-4 md:py-6 scroll-mt-24 mb-2">
          <div 
            className="backdrop-blur-sm rounded-[24px] px-6 md:px-10 pt-6 md:pt-10 pb-8 md:pb-12"
            style={{
              background: 'rgba(255,252,248,0.98)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              border: '1px solid rgba(212,180,80,0.15)',
            }}
          >
            <Overview />
          </div>
        </section>
      </div>

      {/* Image Section - Full Width Outside Container */}
      <div className="relative z-10 py-6 mb-4">
        <div className="flex justify-center px-4 sm:px-6 lg:px-8">
          <div className="relative w-full max-w-[98vw] lg:max-w-[95vw] rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src="/unnamed.png"
              alt=""
              width={2400}
              height={1200}
              className="w-full h-auto object-cover"
              sizes="(max-width: 768px) 100vw, 2400px"
            />
          </div>
        </div>
      </div>

      {/* Content Sections Continue */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-6">
        <section id="board" className="py-4 md:py-6 scroll-mt-24 mb-4">
          <div 
            className="backdrop-blur-sm rounded-[24px] px-6 md:px-10 pt-6 md:pt-10 pb-8 md:pb-12"
            style={{
              background: 'rgba(255,252,248,0.98)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              border: '1px solid rgba(212,180,80,0.15)',
            }}
          >
            <BoardDirectory />
          </div>
        </section>
        
        {/* Section Divider */}
        <div className="flex items-center justify-center py-2">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
        </div>
        
        <section id="committees" className="py-4 md:py-6 scroll-mt-24 mb-2">
          <div 
            className="backdrop-blur-sm rounded-[24px] px-6 md:px-10 pt-6 md:pt-10 pb-8 md:pb-12"
            style={{
              background: 'rgba(255,252,248,0.98)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              border: '1px solid rgba(212,180,80,0.15)',
            }}
          >
            <Committees />
          </div>
        </section>
        
        {/* Section Divider */}
        <div className="flex items-center justify-center py-2">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
        </div>
        
        <section id="dei" className="py-4 md:py-6 scroll-mt-24 mb-2">
          <div 
            className="backdrop-blur-sm rounded-[24px] px-6 md:px-10 pt-6 md:pt-10 pb-8 md:pb-12"
            style={{
              background: 'rgba(255,252,248,0.98)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.05)',
              border: '1px solid rgba(212,180,80,0.15)',
            }}
          >
            <DEIStatement />
          </div>
        </section>
      </div>
    </div>
  );
}















