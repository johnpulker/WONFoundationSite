"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

/* Static 2025 sponsor logos in /public/sponsors/ */
const legacySponsors = [
  "13th-congressional-district-logo.jpg",
  "all-pro-color-logo.png",
  "bernardwealthmanaglogo-media-larger.png",
  "Comericabank.jpg",
  "forever-fresh-logo.jpg",
  "IBW.png",
  "jmg-logo-small.jpg",
  "lawrencetech.jpg",
  "mann-law-grp-logo.jpg",
  "Oaklanduniversity.png",
  "occ-horizontal-green1.png",
  "pictures-of-hope-logo.jpg",
  "v-2-north-on-woodward-full-logo-wbe.png",
];

interface DynamicSponsor {
  name: string;
  tier: string;
  amount: number;
}

function SponsorNameBadge({ name }: { name: string }) {
  return (
    <div
      className="flex-shrink-0 mx-6 md:mx-8 flex items-center justify-center"
      style={{ minWidth: "200px", height: "120px" }}
    >
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 px-6 py-4 flex items-center justify-center h-full w-full">
        <p className="text-primary font-semibold text-base text-center leading-tight">
          {name}
        </p>
      </div>
    </div>
  );
}

export default function SponsorsMarquee() {
  const [dynamicSponsors, setDynamicSponsors] = useState<DynamicSponsor[]>([]);

  useEffect(() => {
    fetch("/api/sponsors/list")
      .then((res) => res.json())
      .then((data) => setDynamicSponsors(data.sponsors || []))
      .catch((err) => console.error("Failed to load sponsors:", err));
  }, []);

  // Build the combined items list: logo items + name-badge items
  type MarqueeItem =
    | { type: "logo"; filename: string }
    | { type: "name"; name: string };

  const items: MarqueeItem[] = [
    ...legacySponsors.map((f): MarqueeItem => ({ type: "logo", filename: f })),
    ...dynamicSponsors
      .filter((s) => s.name && s.name !== "Anonymous Sponsor")
      .map((s): MarqueeItem => ({ type: "name", name: s.name })),
  ];

  // Duplicate for seamless loop
  const duplicated = [...items, ...items, ...items, ...items];

  return (
    <section className="w-full bg-neutral-50 border-t border-neutral-200 py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-6 md:mb-8">
          <p
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary"
            style={{
              fontFamily: "var(--font-cursive)",
            }}
          >
            Our Sponsors
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative overflow-hidden w-full">
          <div
            className="flex animate-marquee-sponsors"
            style={{ width: "max-content" }}
          >
            {duplicated.map((item, index) =>
              item.type === "logo" ? (
                <div
                  key={`logo-${item.filename}-${index}`}
                  className="flex-shrink-0 mx-6 md:mx-8 flex items-center justify-center"
                  style={{ width: "250px", height: "120px" }}
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={`/sponsors/${item.filename}`}
                      alt={`Sponsor ${item.filename
                        .replace(/[-_]/g, " ")
                        .replace(/\.[^/.]+$/, "")}`}
                      fill
                      className="object-contain"
                      sizes="250px"
                    />
                  </div>
                </div>
              ) : (
                <SponsorNameBadge
                  key={`name-${item.name}-${index}`}
                  name={item.name}
                />
              )
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
