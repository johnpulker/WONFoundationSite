"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

interface Honoree {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  year: number;
  photo_url: string | null;
}

export default function WonderWomenSpotlight() {
  const [honorees, setHonorees] = useState<Honoree[]>([]);
  const [loading, setLoading] = useState(true);
  const displayYear = 2025; // Home page shows 2025 WONder Women

  useEffect(() => {
    async function fetchHonorees() {
      try {
        const response = await fetch(`/api/honorees/list?current_year=true`);
        if (response.ok) {
          const data = await response.json();
          setHonorees(data.honorees || []);
        }
      } catch (error) {
        console.error('Error fetching honorees:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchHonorees();
  }, []);

  // Don't show section if no honorees
  if (!loading && honorees.length === 0) {
    return null;
  }

  return (
    <section className="py-20 md:py-32 lg:py-40 relative overflow-hidden">
      {/* Subtle radial gradient accent - light blush center */}
      <div 
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, rgba(250, 246, 248, 0.8) 0%, rgba(246, 233, 228, 0.4) 50%, rgba(250, 246, 248, 0.6) 100%)"
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Header - Premium treatment with gold divider */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <h2 
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-primary mb-6"
            style={{
              fontFamily: 'var(--font-cursive)',
            }}
          >
            {displayYear} WONder Women
          </h2>
          {/* Premium gold divider - centered, 2-4px */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="h-px w-16 bg-accent" />
            <div className="h-1 w-24 bg-accent" />
            <div className="h-px w-16 bg-accent" />
          </div>
          <p className="text-xl md:text-2xl text-neutral-700 max-w-2xl mx-auto font-light leading-relaxed italic">
            Celebrating visionaries shaping communities and futures.
          </p>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Honoree Cards - Premium layout with subtle stagger */}
        {!loading && honorees.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 items-stretch">
            {honorees.map((woman, index) => (
              <motion.div
                key={woman.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: "easeOut"
                }}
                className="h-full flex"
              >
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="w-full h-full flex"
                >
                  <Card className="overflow-hidden bg-white shadow-[0_10px_30px_-5px_rgba(0,0,0,0.12)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.18)] transition-all duration-300 rounded-xl border border-neutral-100 group w-full h-full flex flex-col">
                    {/* Photo area - Portrait arch shape with border and gradient overlay */}
                    <div className="aspect-[3/4] bg-gradient-to-br from-[#f6e9e4] to-[#faf5f1] relative flex items-center justify-center overflow-hidden flex-shrink-0 rounded-t-[2rem]">
                      {woman.photo_url ? (
                        <Image
                          src={woman.photo_url}
                          alt={woman.name}
                          fill
                          className="object-cover rounded-t-[2rem]"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl font-heading text-[#871c1c]/30">
                            {woman.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                      
                      {/* Soft gradient overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent rounded-t-[2rem]" />
                      
                      {/* Brand color border stroke */}
                      <div className="absolute inset-0 border-2 border-primary/10 rounded-t-[2rem] pointer-events-none" />
                    </div>
                    
                    {/* Card content with better hierarchy - flex-grow to fill space */}
                    <div className="p-6 text-center flex flex-col flex-grow">
                      <h3 className="text-2xl md:text-3xl font-heading font-bold text-neutral-900 mb-2 group-hover:text-primary transition-colors">
                        {woman.name}
                      </h3>
                      {woman.title && (
                        <p className="text-sm md:text-base text-neutral-600 italic mb-2 font-light">
                          {woman.title}
                        </p>
                      )}
                      {woman.bio && (
                        <p className="text-sm text-neutral-700 mb-4 leading-relaxed flex-grow line-clamp-3">
                          {woman.bio}
                        </p>
                      )}
                      <Link 
                        href={`/wonder-women#${woman.id}`}
                        className="inline-flex items-center gap-2 text-primary font-semibold hover:text-accent transition-colors group mt-auto"
                      >
                        <span>{woman.year} Honoree</span>
                        <svg
                          className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}

        {/* View All Button - Visually anchored with background section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="text-center"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-full py-6 px-8 inline-block">
            <Link href="/wonder-women">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="primary" size="lg" className="px-10 py-4 text-lg shadow-md hover:shadow-lg">
                  View All Honorees
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
