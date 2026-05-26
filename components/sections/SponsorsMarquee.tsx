"use client";

import Image from "next/image";

const sponsors = [
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

export default function SponsorsMarquee() {
  // Duplicate sponsors array multiple times for seamless looping
  // Using 4 copies ensures all sponsors scroll through before looping
  const duplicatedSponsors = [...sponsors, ...sponsors, ...sponsors, ...sponsors];

  return (
    <section className="w-full bg-neutral-50 border-t border-neutral-200 py-10 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Optional heading */}
        <div className="text-center mb-6 md:mb-8">
          <p 
            className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary"
            style={{
              fontFamily: 'var(--font-cursive)',
            }}
          >
            Our Sponsors
          </p>
        </div>

        {/* Marquee Container */}
        <div className="relative overflow-hidden w-full">
          <div className="flex animate-marquee-sponsors" style={{ width: 'max-content' }}>
            {duplicatedSponsors.map((sponsor, index) => (
              <div
                key={`${sponsor}-${index}`}
                className="flex-shrink-0 mx-6 md:mx-8 flex items-center justify-center"
                style={{ width: "250px", height: "120px" }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={`/sponsors/${sponsor}`}
                    alt={`Sponsor ${sponsor.replace(/[-_]/g, " ").replace(/\.[^/.]+$/, "")}`}
                    fill
                    className="object-contain"
                    sizes="250px"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

