"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Modal from "@/components/ui/Modal";

interface Honoree {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  year: number;
}

export default function CurrentYear() {
  const [honorees, setHonorees] = useState<Honoree[]>([]);
  const [selectedHonoree, setSelectedHonoree] = useState<Honoree | null>(null);
  const [loading, setLoading] = useState(true);
  const [displayYear, setDisplayYear] = useState<number | null>(null);

  useEffect(() => {
    async function fetchHonorees() {
      try {
        const response = await fetch(`/api/honorees/list?current_year=true`, { cache: 'no-store' });
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

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Banquet CTA Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mb-12"
        >
          <div className="relative overflow-hidden rounded-2xl">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#871c1c] via-[#a02323] to-[#871c1c]" />

            {/* Gold accent overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#E7C418]/20 via-transparent to-[#E7C418]/10" />

            {/* Pattern overlay */}
            <div className="absolute inset-0 opacity-5">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 20px 20px, #E7C418 2px, transparent 2px)`,
                backgroundSize: '40px 40px'
              }} />
            </div>

            {/* Content */}
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="text-center md:text-left max-w-3xl">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#E7C418]/20 rounded-full mb-4">
                  <span className="text-[#E7C418] text-sm">✦</span>
                  <span className="text-[#E7C418] text-sm font-semibold tracking-wider uppercase">Save the Date</span>
                </div>
                <h3 className="text-3xl md:text-4xl font-heading text-white mb-3">
                  2026 WONder Women Awards Banquet
                </h3>
                <p className="text-white/80 text-lg max-w-xl">
                  Join us for an unforgettable evening. Experience inspiring stories, meaningful connections, and the power of women in leadership. Check back soon for more exciting details.
                </p>
              </div>

              <button className="flex-shrink-0 px-8 py-4 bg-gradient-to-r from-[#E7C418] to-[#C9A814] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                Oct 8, 2026
              </button>
            </div>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Honoree Cards - Compact Grid */}
        {!loading && honorees.length > 0 && (
          <>
            {/* Dynamic section title */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <span
                className="inline-block text-4xl md:text-5xl lg:text-6xl font-semibold text-primary tracking-tight"
                style={{ fontFamily: 'var(--font-cursive)' }}
              >
                {displayYear} WONder Women
              </span>
              <div className="flex items-center justify-center gap-4 mt-5">
                <div className="h-px w-12 md:w-20 bg-[#E7C418]/40" />
                <div className="h-1 w-16 md:w-24 bg-gradient-to-r from-[#E7C418] to-[#C9A814] rounded-full" />
                <div className="h-px w-12 md:w-20 bg-[#E7C418]/40" />
              </div>
              <p className="text-neutral-500 text-sm mt-4">
                {honorees.length} honoree{honorees.length !== 1 ? 's' : ''} &middot; Click to read bio
              </p>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {honorees.map((honoree, index) => (
                <motion.div
                  key={honoree.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="group cursor-pointer"
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
          </>
        )}

        {/* Empty State */}
        {!loading && honorees.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#871c1c]/10 to-[#E7C418]/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-[#871c1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-heading text-primary mb-2">No Honorees Yet</h3>
          </div>
        )}
      </motion.div>

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
