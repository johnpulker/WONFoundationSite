import SubNav from "@/components/SubNav";
import Overview from "@/components/pages/wonder-women/Overview";
import CurrentYear from "@/components/pages/wonder-women/CurrentYear";
import PastHonorees from "@/components/pages/wonder-women/PastHonorees";
import PhotoGallery from "@/components/pages/wonder-women/PhotoGallery";
import SponsorsDisplay from "@/components/pages/wonder-women/SponsorsDisplay";

const subNavItems = [
  { id: "overview", label: "Overview" },
  { id: "current", label: "Honorees" },
  { id: "past", label: "Past Honorees" },
  { id: "archive", label: "Archive", href: "/wonder-women/archive" },
  { id: "gallery", label: "Gallery" },
  { id: "sponsors", label: "Sponsors" },
];

// Colorful Section Divider for Wonder Women page
function WonderDivider({ variant = "stars" }: { variant?: "stars" | "wave" | "gradient" }) {
  if (variant === "wave") {
    return (
      <div className="relative py-12 md:py-16 overflow-hidden">
        {/* Wave SVG */}
        <div className="absolute inset-0 flex items-center">
          <svg className="w-full h-16" viewBox="0 0 1200 60" preserveAspectRatio="none">
            <path 
              d="M0 30 Q 150 0 300 30 T 600 30 T 900 30 T 1200 30" 
              fill="none" 
              stroke="url(#waveGradient)" 
              strokeWidth="2"
            />
            <defs>
              <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#871c1c" stopOpacity="0.2" />
                <stop offset="50%" stopColor="#E7C418" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#871c1c" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <div className="relative flex justify-center">
          <div className="w-4 h-4 rounded-full bg-gradient-to-br from-[#E7C418] to-[#C9A814] shadow-lg" />
        </div>
      </div>
    );
  }
  
  if (variant === "gradient") {
    return (
      <div className="relative py-10 md:py-14">
        <div className="h-1 mx-auto max-w-md rounded-full bg-gradient-to-r from-transparent via-[#E7C418] to-transparent" />
      </div>
    );
  }
  
  // Stars variant (default)
  return (
    <div className="relative py-10 md:py-14">
      <div className="flex items-center justify-center gap-6">
        <div className="w-20 h-px bg-gradient-to-r from-transparent to-[#871c1c]/30" />
        <div className="flex items-center gap-3">
          <span className="text-[#E7C418] text-xl animate-pulse">✦</span>
          <span className="text-[#871c1c] text-2xl">★</span>
          <span className="text-[#E7C418] text-xl animate-pulse">✦</span>
        </div>
        <div className="w-20 h-px bg-gradient-to-l from-transparent to-[#871c1c]/30" />
      </div>
    </div>
  );
}

export default function WonderWomenPage() {
  return (
    <div className="w-full bg-white">
      <SubNav items={subNavItems} />
      
      {/* Main Content Container */}
      <div className="relative">
        {/* Radial gradient background */}
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse at 50% 0%, rgba(212, 175, 55, 0.05) 0%, transparent 50%)"
          }}
        />
        
        {/* Subtle pattern overlay */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, rgba(90, 31, 58, 0.03) 1px, transparent 1px)`,
              backgroundSize: '32px 32px'
            }}
          />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
          {/* Overview - Hero Section */}
          <section id="overview" className="scroll-mt-24">
            <Overview />
          </section>
          
          <WonderDivider variant="stars" />
          
          {/* Current Year Honorees */}
          <section id="current" className="scroll-mt-24">
            <CurrentYear />
          </section>
          
          <WonderDivider variant="wave" />
          
          {/* Past Honorees */}
          <section id="past" className="scroll-mt-24">
            <PastHonorees />
          </section>
          
          <WonderDivider variant="gradient" />
          
          {/* Photo Gallery */}
          <section id="gallery" className="scroll-mt-24 pb-8">
            <PhotoGallery />
          </section>
          
          <WonderDivider variant="stars" />
          
          {/* Sponsors Display */}
          <section id="sponsors" className="scroll-mt-24 pb-8">
            <SponsorsDisplay />
          </section>
        </div>
      </div>
      
      {/* Colorful Bottom Band */}
      <div className="relative h-3 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#871c1c] via-[#E7C418] to-[#871c1c]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E7C418] via-[#871c1c] to-[#E7C418] animate-pulse opacity-50" />
      </div>
    </div>
  );
}
