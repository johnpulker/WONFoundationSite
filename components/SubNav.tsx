"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

interface SubNavItem {
  id: string;
  label: string;
}

interface SubNavProps {
  items: SubNavItem[];
  className?: string;
}

export default function SubNav({ items, className = "" }: SubNavProps) {
  const pathname = usePathname();
  const [activeSection, setActiveSection] = useState(items[0]?.id || "");

  // Scroll to top when pathname changes (new page)
  useEffect(() => {
    // Small delay to ensure content is rendered
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
      // Also scroll to first section after a brief moment to ensure it's visible
      if (items.length > 0) {
        setTimeout(() => {
          const firstSection = document.getElementById(items[0].id);
          if (firstSection) {
            const offset = 100;
            const elementPosition = firstSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
          }
        }, 100);
      }
    }, 50);

    return () => clearTimeout(timer);
  }, [pathname, items]);

  useEffect(() => {
    const handleScroll = () => {
      const sections = items.map((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          return { id: item.id, top: rect.top, bottom: rect.bottom };
        }
        return null;
      }).filter(Boolean) as Array<{ id: string; top: number; bottom: number }>;

      const current = sections.find(
        (section) => section.top <= 100 && section.bottom >= 100
      ) || sections[0];

      if (current) {
        setActiveSection(current.id);
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [items, pathname]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 100; // Account for sticky nav
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      setActiveSection(id);
    }
  };

  return (
    <nav className={`sticky top-16 md:top-20 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-100 ${className}`}>
      {/* Top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-[#871c1c] via-[#E7C418] to-[#871c1c]" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex overflow-x-auto scrollbar-hide -mb-px">
          {items.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`relative px-5 py-4 text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                activeSection === item.id
                  ? "text-[#871c1c]"
                  : "text-neutral-500 hover:text-[#871c1c]"
              }`}
            >
              {/* Label */}
              <span className="relative z-10">{item.label}</span>
              
              {/* Active Indicator */}
              {activeSection === item.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#E7C418] to-[#871c1c]"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              
              {/* Hover background */}
              <span className={`absolute inset-x-2 inset-y-1 rounded-lg transition-colors duration-200 ${
                activeSection === item.id ? "bg-[#871c1c]/5" : "hover:bg-neutral-50"
              }`} />
            </motion.button>
          ))}
        </div>
      </div>
    </nav>
  );
}
