"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

/* ───────────────────────────────────────────────
   2025 Legacy Sponsors (static logos in /public/sponsors/)
   ─────────────────────────────────────────────── */
const legacy2025 = {
  presenting: {
    tier: "Presenting Phenomenal Women Sponsor",
    logos: ["lawrencetech.jpg"],
  },
  leadingLady: {
    tier: "Leading Lady Sponsors",
    logos: ["IBW.png", "Oaklanduniversity.png"],
  },
  girlPower: {
    tier: "Girl Power Sponsors",
    logos: [
      "Comericabank.jpg",
      "jmg-logo-small.jpg",
      "mann-law-grp-logo.jpg",
      "bernardwealthmanaglogo-media-larger.png",
      "13th-congressional-district-logo.jpg",
      "occ-horizontal-green1.png",
      "all-pro-color-logo.png",
      "pictures-of-hope-logo.jpg",
      "forever-fresh-logo.jpg",
      "v-2-north-on-woodward-full-logo-wbe.png",
    ],
  },
};

/* ───────────────────────────────────────────────
   Tier visual config for dynamic sponsors
   ─────────────────────────────────────────────── */
const TIER_CONFIG: Record<string, { label: string; emoji: string; gradient: string; border: string; textColor: string }> = {
  SHERO: {
    label: "SHERO Sponsors",
    emoji: "👑",
    gradient: "from-[#871c1c]/20 via-[#871c1c]/10 to-[#871c1c]/20",
    border: "border-[#871c1c]/40",
    textColor: "text-[#871c1c]",
  },
  HERSTORY: {
    label: "HERSTORY Sponsors",
    emoji: "✨",
    gradient: "from-[#5a1a6e]/20 via-[#5a1a6e]/10 to-[#5a1a6e]/20",
    border: "border-[#5a1a6e]/40",
    textColor: "text-[#5a1a6e]",
  },
  "LEADING LADY": {
    label: "LEADING LADY Sponsors",
    emoji: "⭐",
    gradient: "from-[#C9A814]/30 via-[#C9A814]/20 to-[#C9A814]/30",
    border: "border-[#C9A814]/40",
    textColor: "text-[#C9A814]",
  },
  "GIRL POWER": {
    label: "GIRL POWER Sponsors",
    emoji: "💪",
    gradient: "from-[#1a5c8a]/15 via-[#1a5c8a]/10 to-[#1a5c8a]/15",
    border: "border-[#1a5c8a]/30",
    textColor: "text-[#1a5c8a]",
  },
};

const TIER_ORDER = ["SHERO", "HERSTORY", "LEADING LADY", "GIRL POWER"];

interface Sponsor {
  name: string;
  tier: string;
  amount: number;
}

/* ───────────────────────────────────────────────
   Dynamic sponsor name card
   ─────────────────────────────────────────────── */
function SponsorNameCard({ name, tier, index }: { name: string; tier: string; index: number }) {
  const config = TIER_CONFIG[tier.toUpperCase()];
  const borderColor = config?.border || "border-neutral-200";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
      className={`flex items-center justify-center bg-white rounded-xl shadow-md p-6 border ${borderColor} hover:shadow-lg transition-all duration-300`}
    >
      <p className={`text-center font-semibold text-lg ${config?.textColor || "text-neutral-800"}`}>
        {name}
      </p>
    </motion.div>
  );
}

export default function SponsorsDisplay() {
  const [sponsors2026, setSponsors2026] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sponsors/list")
      .then((res) => res.json())
      .then((data) => setSponsors2026(data.sponsors || []))
      .catch((err) => console.error("Failed to load 2026 sponsors:", err))
      .finally(() => setLoading(false));
  }, []);

  // Group 2026 sponsors by tier
  const grouped = TIER_ORDER.reduce<Record<string, Sponsor[]>>((acc, tier) => {
    acc[tier] = sponsors2026.filter(
      (s) => (s.tier || "").toUpperCase() === tier
    );
    return acc;
  }, {});

  const has2026Sponsors = sponsors2026.length > 0;

  return (
    <section className="w-full bg-gradient-to-b from-white via-neutral-50/50 to-neutral-100 py-16 md:py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* ════════════════════════════════════════════
            2026 Dynamic Sponsors (from database)
            ════════════════════════════════════════════ */}
        {(has2026Sponsors || loading) && (
          <>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12 md:mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-3">
                Our 2026 WONder Woman Award Sponsors
              </h2>
              <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#E7C418] to-transparent mx-auto" />
            </motion.div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : (
              <div className="space-y-10 mb-20">
                {TIER_ORDER.map((tier) => {
                  const tierSponsors = grouped[tier];
                  if (!tierSponsors || tierSponsors.length === 0) return null;
                  const config = TIER_CONFIG[tier];

                  return (
                    <motion.div
                      key={tier}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6 }}
                    >
                      <div className="text-center mb-6">
                        <div
                          className={`inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r ${config.gradient} rounded-full mb-4 border ${config.border}`}
                        >
                          <span className="text-lg">{config.emoji}</span>
                          <h3 className="text-sm md:text-base font-semibold text-neutral-700">
                            {config.label}
                          </h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 justify-items-center">
                        {tierSponsors.map((sponsor, i) => (
                          <SponsorNameCard
                            key={`${sponsor.name}-${i}`}
                            name={sponsor.name}
                            tier={tier}
                            index={i}
                          />
                        ))}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}

            {/* Divider between years */}
            <div className="flex items-center justify-center py-6 mb-8">
              <div className="h-px w-32 bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
            </div>
          </>
        )}

        {/* ════════════════════════════════════════════
            2025 Legacy Sponsors (hardcoded logos)
            ════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-3">
            Thanks to our 2025 WONder Woman Supporters
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#E7C418] to-transparent mx-auto" />
        </motion.div>

        <div className="relative">
          {/* Top Tier - Presenting Phenomenal Women Sponsor */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mb-12 md:mb-16"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#E7C418]/30 via-[#E7C418]/20 to-[#E7C418]/30 rounded-full mb-4 border border-[#E7C418]/40">
                <span className="text-xl">👑</span>
                <h3 className="text-base md:text-lg font-semibold text-neutral-800">
                  {legacy2025.presenting.tier}
                </h3>
              </div>
            </div>
            <div className="flex justify-center">
              {legacy2025.presenting.logos.map((logo, index) => (
                <motion.div
                  key={logo}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="relative w-72 h-40 md:w-96 md:h-48 bg-gradient-to-br from-white via-[#E7C418]/5 to-white rounded-2xl shadow-2xl p-8 border-2 border-[#E7C418] hover:border-[#C9A814] hover:shadow-[0_20px_50px_-12px_rgba(212,175,55,0.3)] transition-all duration-300"
                >
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-3 bg-gradient-to-r from-[#E7C418] via-[#C9A814] to-[#E7C418] rounded-full shadow-lg" />
                  <Image
                    src={`/sponsors/${logo}`}
                    alt={logo.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "")}
                    fill
                    className="object-contain"
                    sizes="384px"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Second Tier - Leading Lady Sponsors */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mb-10 md:mb-12"
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-primary/15 via-primary/10 to-primary/15 rounded-full mb-4 border border-primary/20">
                <span className="text-lg">⭐</span>
                <h3 className="text-sm md:text-base font-semibold text-neutral-700">
                  {legacy2025.leadingLady.tier}
                </h3>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {legacy2025.leadingLady.logos.map((logo, index) => (
                <motion.div
                  key={logo}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="relative w-56 h-36 md:w-64 md:h-40 bg-gradient-to-br from-white via-primary/5 to-white rounded-xl shadow-lg p-5 border border-primary/30 hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                >
                  <Image
                    src={`/sponsors/${logo}`}
                    alt={logo.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "")}
                    fill
                    className="object-contain"
                    sizes="256px"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Third Tier - Girl Power Sponsors */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-neutral-100 rounded-full mb-4 border border-neutral-200">
                <span className="text-base">💪</span>
                <h3 className="text-xs md:text-sm font-semibold text-neutral-600">
                  {legacy2025.girlPower.tier}
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {legacy2025.girlPower.logos.map((logo, index) => (
                <motion.div
                  key={logo}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.6 + index * 0.05 }}
                  className="relative w-full h-28 md:h-32 bg-white rounded-lg shadow-md p-4 border border-neutral-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300"
                >
                  <Image
                    src={`/sponsors/${logo}`}
                    alt={logo.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "")}
                    fill
                    className="object-contain"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
