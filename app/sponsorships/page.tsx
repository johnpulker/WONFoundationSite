"use client";

import SponsorHero from "@/components/pages/sponsorships/SponsorHero";
import SponsorshipTiers from "@/components/pages/sponsorships/SponsorshipTiers";

export default function SponsorshipsPage() {
  return (
    <div className="w-full relative min-h-screen">
      {/* Background Pattern — matches About page */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-[40vh] opacity-[0.12] blur-[0.5px]">
          <div
            className="w-full h-full bg-repeat"
            style={{
              backgroundImage: "url(/goldenvines.png)",
              backgroundSize: "auto",
              backgroundPosition: "center",
            }}
          />
        </div>
        <div className="absolute top-[40vh] left-0 right-0 h-[40vh] opacity-[0.08] blur-[0.5px]">
          <div
            className="w-full h-full bg-repeat"
            style={{
              backgroundImage: "url(/goldenvines.png)",
              backgroundSize: "auto",
              backgroundPosition: "center",
            }}
          />
        </div>
        <div className="absolute top-[80vh] left-0 right-0 bottom-0 opacity-[0.05] blur-[0.5px]">
          <div
            className="w-full h-full bg-repeat"
            style={{
              backgroundImage: "url(/goldenvines.png)",
              backgroundSize: "auto",
              backgroundPosition: "center",
            }}
          />
        </div>
      </div>

      {/* Page Hero Banner */}
      <div className="relative z-10 bg-gradient-to-br from-primary via-primary/95 to-primary-dark py-16 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-accent font-semibold mb-4">
            WON Foundation
          </p>
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-white leading-tight mb-4">
            Sponsorships
          </h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">
            40th Anniversary WONder Woman Awards &mdash; October 8, 2026
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 py-8">

        {/* Intro Section */}
        <section className="py-4 md:py-6 mb-4">
          <div
            className="backdrop-blur-sm rounded-[24px] px-6 md:px-10 pt-6 md:pt-10 pb-8 md:pb-12"
            style={{
              background: "rgba(255,252,248,0.98)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              border: "1px solid rgba(212,180,80,0.15)",
            }}
          >
            <SponsorHero />
          </div>
        </section>

        {/* Divider */}
        <div className="flex items-center justify-center py-3">
          <div className="h-px w-24 bg-gradient-to-r from-transparent via-neutral-300 to-transparent"></div>
        </div>

        {/* Sponsorship Tiers Section */}
        <section className="py-4 md:py-6 mb-4">
          <div
            className="backdrop-blur-sm rounded-[24px] px-6 md:px-10 pt-6 md:pt-10 pb-8 md:pb-12"
            style={{
              background: "rgba(255,252,248,0.98)",
              boxShadow: "0 10px 30px rgba(0,0,0,0.05)",
              border: "1px solid rgba(212,180,80,0.15)",
            }}
          >
            <SponsorshipTiers />
          </div>
        </section>

        {/* Contact note */}
        <div className="text-center py-8 text-neutral-500 text-sm">
          Questions about sponsorships?{" "}
          <a href="/contact" className="text-primary underline hover:text-primary/80 transition-colors">
            Contact us
          </a>{" "}
          and we&apos;ll be happy to help.
        </div>

      </div>
    </div>
  );
}
