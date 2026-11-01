import Image from "next/image";

/* Static 2025 sponsor logos in /public/sponsors/ */
const legacySponsors = [
  "all-pro-color-logo.png",
  "IBW.png",
  "lawrencetech.jpg",
  "mann-law-grp-logo.jpg",
  "Oaklanduniversity.png",
  "v-2-north-on-woodward-full-logo-wbe.png",
  "bernardwealthmanaglogo-media-larger.png",
  "UAW-Logo.png",
];

export default function SponsorsMarquee() {
  // Duplicate for seamless loop
  const duplicated = [...legacySponsors, ...legacySponsors, ...legacySponsors, ...legacySponsors];

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
            {duplicated.map((filename, index) => (
              <div
                key={`logo-${filename}-${index}`}
                className="flex-shrink-0 mx-6 md:mx-8 flex items-center justify-center"
                style={{ width: "250px", height: "120px" }}
              >
                <div className="relative w-full h-full">
                  <Image
                    src={`/sponsors/${filename}`}
                    alt={`Sponsor ${filename
                      .replace(/[-_]/g, " ")
                      .replace(/\.[^/.]+$/, "")}`}
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
