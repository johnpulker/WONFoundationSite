"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";
import Modal from "@/components/ui/Modal";

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
  const [displayYear, setDisplayYear] = useState<number | null>(null);
  const [selectedHonoree, setSelectedHonoree] = useState<Honoree | null>(null);

  useEffect(() => {
    async function fetchHonorees() {
      try {
        const response = await fetch(`/api/honorees/list?current_year=true`);
        if (response.ok) {
          const data = await response.json();
          setHonorees(data.honorees || []);
          setDisplayYear(data.currentYear || null);
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
    <>
      <section className="py-20 md:py-32 lg:py-40 relative overflow-hidden">
        {/* Subtle radial gradient accent - light blush center */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, rgba(250, 246, 248, 0.8) 0%, rgba(246, 233, 228, 0.4) 50%, rgba(250, 246, 248, 0.6) 100%)"
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
          {/* Section Header */}
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
              {displayYear ?? ''} Wired WONder Women
            </h2>
            {/* Premium gold divider */}
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-12 md:w-20 bg-[#E7C418]/40" />
              <div className="h-1 w-16 md:w-24 bg-gradient-to-r from-[#E7C418] to-[#C9A814] rounded-full" />
              <div className="h-px w-12 md:w-20 bg-[#E7C418]/40" />
            </div>
            <p className="text-xl md:text-2xl text-neutral-700 max-w-2xl mx-auto font-light leading-relaxed italic">
              Celebrating visionaries shaping communities and futures.
            </p>
            {!loading && honorees.length > 0 && (
              <p className="text-neutral-500 text-sm mt-4">
                {honorees.length} honoree{honorees.length !== 1 ? 's' : ''} &middot; Click to read bio
              </p>
            )}
          </motion.div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Honoree Cards - Compact Grid matching Wonder Women page */}
          {!loading && honorees.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 md:gap-6 mb-16">
              {honorees.map((honoree, index) => (
                <motion.div
                  key={honoree.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group cursor-pointer w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.75rem)] md:w-[calc(25%-1rem)] lg:w-[calc(20%-1.2rem)]"
                  onClick={() => setSelectedHonoree(honoree)}
                >
                  <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-neutral-100 hover:border-[#E7C418]/30 transition-all duration-300 hover:-translate-y-1">
                    {/* Photo */}
                    <div className="aspect-square relative overflow-hidden bg-gradient-to-br from-[#f6e9e4] to-[#faf5f1]">
                      {honoree.photo_url ? (
                        <Image
                          src={honoree.photo_url}
                          alt={honoree.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#871c1c] to-[#a02323]">
                          <span className="text-white text-2xl md:text-3xl font-heading font-bold">
                            {honoree.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#871c1c]/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                        <span className="text-white text-xs font-semibold tracking-wide uppercase">View Bio</span>
                      </div>
                    </div>
                    {/* Name & Title */}
                    <div className="p-3 text-center">
                      <h3 className="text-sm md:text-base font-semibold text-neutral-900 leading-tight group-hover:text-[#871c1c] transition-colors">
                        {honoree.name}
                      </h3>
                      {honoree.title && (
                        <p className="text-xs text-neutral-500 mt-1 italic line-clamp-2 leading-snug">
                          {honoree.title}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* View All Button */}
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

      {/* Bio Modal */}
      <Modal
        isOpen={!!selectedHonoree}
        onClose={() => setSelectedHonoree(null)}
        title=""
        size="lg"
      >
        {selectedHonoree && (
          <div className="text-center">
            {/* Photo in modal */}
            {selectedHonoree.photo_url ? (
              <div className="w-40 h-40 mx-auto mb-6 relative rounded-full overflow-hidden shadow-xl ring-4 ring-[#E7C418]/30">
                <Image
                  src={selectedHonoree.photo_url}
                  alt={selectedHonoree.name}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-40 h-40 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#871c1c] to-[#a02323] flex items-center justify-center shadow-xl ring-4 ring-[#E7C418]/30">
                <span className="text-white text-4xl font-heading font-bold">
                  {selectedHonoree.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
            )}

            <h3 className="text-3xl font-heading text-primary mb-2">{selectedHonoree.name}</h3>
            {selectedHonoree.title && (
              <p className="text-[#E7C418] font-medium mb-6 italic">{selectedHonoree.title}</p>
            )}

            <div className="w-16 h-0.5 bg-gradient-to-r from-[#E7C418] to-[#871c1c] mx-auto mb-6" />

            {selectedHonoree.bio && (
              <p className="text-neutral-700 leading-relaxed text-left">
                {selectedHonoree.bio}
              </p>
            )}

            <div className="mt-8 flex justify-center gap-2">
              <span className="text-[#E7C418]">✦</span>
              <span className="text-[#871c1c] text-sm font-semibold">{selectedHonoree.year} WONder Woman</span>
              <span className="text-[#E7C418]">✦</span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
