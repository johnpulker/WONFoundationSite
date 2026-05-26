"use client";

import Image from "next/image";
import { motion } from "framer-motion";

const presentingSponsor = {
  tier: "Presenting Phenomenal Women Sponsor",
  logos: ["lawrencetech.jpg"],
};

const leadingLadySponsors = {
  tier: "Leading Lady Sponsors",
  logos: ["IBW.png", "Oaklanduniversity.png"],
};

const girlPowerSponsors = {
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
};

export default function SponsorsDisplay() {
  return (
    <section className="w-full bg-gradient-to-b from-white via-neutral-50/50 to-neutral-100 py-16 md:py-24 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
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

        {/* Podium/Tiered Layout - Triangle/Podium Structure */}
        <div className="relative">
          {/* Top Tier - Presenting Phenomenal Women Sponsor (Center, Largest - Podium Top) */}
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
                  {presentingSponsor.tier}
                </h3>
              </div>
            </div>
            <div className="flex justify-center">
              {presentingSponsor.logos.map((logo, index) => (
                <motion.div
                  key={logo}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="relative w-72 h-40 md:w-96 md:h-48 bg-gradient-to-br from-white via-[#E7C418]/5 to-white rounded-2xl shadow-2xl p-8 border-2 border-[#E7C418] hover:border-[#C9A814] hover:shadow-[0_20px_50px_-12px_rgba(212,175,55,0.3)] transition-all duration-300"
                >
                  {/* Decorative top accent */}
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

          {/* Second Tier - Leading Lady Sponsors (Two logos side by side - Podium Middle) */}
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
                  {leadingLadySponsors.tier}
                </h3>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-6 md:gap-10">
              {leadingLadySponsors.logos.map((logo, index) => (
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

          {/* Third Tier - Girl Power Sponsors (Grid of smaller logos - Podium Base) */}
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
                  {girlPowerSponsors.tier}
                </h3>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {girlPowerSponsors.logos.map((logo, index) => (
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

