import Image from "next/image";

/* ───────────────────────────────────────────────
   WONder Women Award sponsors, grouped by level.
   Logos live in /public/sponsors/. Edit this list to update the section.
   ─────────────────────────────────────────────── */
type SponsorLevel = {
  heading: string;
  amount: string;
  size: "large" | "medium" | "small";
  sponsors: { name: string; logo: string }[];
};

const sponsorLevels: SponsorLevel[] = [
  {
    heading: "PHENOMENAL WOMEN",
    amount: "$40,000",
    size: "large",
    sponsors: [{ name: "Lawrence Technological University", logo: "lawrencetech.jpg" }],
  },
  {
    heading: "LEADING LADY",
    amount: "$5,000",
    size: "medium",
    sponsors: [
      { name: "IBEW Local 58", logo: "IBW.png" },
      { name: "UAW Region 1", logo: "UAW-Logo.png" },
    ],
  },
  {
    heading: "GIRL POWER",
    amount: "$2,500",
    size: "small",
    sponsors: [
      { name: "Bernard Wealth Management", logo: "bernardwealthmanaglogo-media-larger.png" },
      { name: "Mann Law Group", logo: "mann-law-grp-logo.jpg" },
      { name: "North on Woodward", logo: "v-2-north-on-woodward-full-logo-wbe.png" },
      { name: "Oakland University", logo: "Oaklanduniversity.png" },
    ],
  },
];

const cardStyles = {
  large: {
    card: "w-72 h-40 md:w-96 md:h-48 p-8 rounded-2xl shadow-2xl border-2 border-[#E7C418] bg-gradient-to-br from-white via-[#E7C418]/5 to-white",
    sizes: "384px",
    heading: "text-2xl md:text-3xl text-neutral-900",
    amount: "text-[#C9A814]",
  },
  medium: {
    card: "w-56 h-36 md:w-64 md:h-40 p-5 rounded-xl shadow-lg border border-primary/30 bg-white",
    sizes: "256px",
    heading: "text-xl md:text-2xl text-neutral-900",
    amount: "text-primary",
  },
  small: {
    card: "w-full h-28 md:h-32 p-4 rounded-lg shadow-md border border-neutral-200 bg-white",
    sizes: "(max-width: 640px) 50vw, 25vw",
    heading: "text-lg md:text-xl text-neutral-800",
    amount: "text-neutral-600",
  },
};

export default function SponsorsDisplay() {
  return (
    <section className="w-full bg-gradient-to-b from-white via-neutral-50/50 to-neutral-100 py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-primary mb-3">
            Our 2026 WONder Woman Award Sponsors
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-transparent via-[#E7C418] to-transparent mx-auto" />
        </div>

        <div className="space-y-14 md:space-y-16">
          {sponsorLevels.map((level) => {
            const style = cardStyles[level.size];
            return (
              <div key={level.heading}>
                <div className="text-center mb-6 md:mb-8">
                  <h3 className={`font-heading font-bold tracking-wide ${style.heading}`}>
                    {level.heading}
                  </h3>
                  <p className={`mt-1 text-base md:text-lg font-semibold ${style.amount}`}>
                    {level.amount}
                  </p>
                </div>

                <div
                  className={
                    level.size === "small"
                      ? "grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto"
                      : "flex flex-wrap justify-center gap-6 md:gap-10"
                  }
                >
                  {level.sponsors.map((sponsor) => (
                    <div key={sponsor.logo} className={`relative ${style.card}`}>
                      <div className="relative w-full h-full">
                        <Image
                          src={`/sponsors/${sponsor.logo}`}
                          alt={sponsor.name}
                          fill
                          className="object-contain"
                          sizes={style.sizes}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
