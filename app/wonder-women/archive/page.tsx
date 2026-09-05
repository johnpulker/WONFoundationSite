"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Modal from "@/components/ui/Modal";

interface Honoree {
  id: string;
  name: string;
  title: string | null;
  bio: string | null;
  photo_url: string | null;
  year: number;
}

export default function ArchivePage() {
  const [honorees, setHonorees] = useState<Honoree[]>([]);
  const [selectedHonoree, setSelectedHonoree] = useState<Honoree | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // First, get the current (latest) year so we can exclude it
        const currentRes = await fetch('/api/honorees/list?current_year=true', { cache: 'no-store' });
        let excludeYear: number | null = null;
        if (currentRes.ok) {
          const currentData = await currentRes.json();
          excludeYear = currentData.currentYear || null;
          setCurrentYear(excludeYear);
        }

        // Fetch all honorees except the current year
        const url = excludeYear
          ? `/api/honorees/list?exclude_year=${excludeYear}`
          : '/api/honorees/list';
        const response = await fetch(url, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setHonorees(data.honorees || []);
        }
      } catch (error) {
        console.error('Error fetching archive honorees:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Group honorees by year
  const honoreesByYear = honorees.reduce((acc, h) => {
    if (!acc[h.year]) acc[h.year] = [];
    acc[h.year].push(h);
    return acc;
  }, {} as Record<number, Honoree[]>);

  const years = Object.keys(honoreesByYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="w-full bg-white min-h-screen">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#871c1c] via-[#a02323] to-[#6b1515] py-16 md:py-24">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="archiveStars" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <text x="10" y="15" fontSize="8" fill="#E7C418" textAnchor="middle">✦</text>
            </pattern>
            <rect width="100%" height="100%" fill="url(#archiveStars)" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-4"
              style={{ fontFamily: 'var(--font-cursive)' }}
            >
              WONder Women Archive
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-6">
              Past Honorees by Year
            </p>
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="h-px w-16 bg-[#E7C418]/50" />
              <div className="h-1 w-24 bg-gradient-to-r from-[#E7C418] to-[#F0D43A]" />
              <div className="h-px w-16 bg-[#E7C418]/50" />
            </div>
            <Link
              href="/wonder-women"
              className="inline-flex items-center gap-2 text-white/90 hover:text-white transition-colors text-sm md:text-base"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to WONder Women
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Empty State */}
        {!loading && years.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#871c1c]/10 to-[#E7C418]/10 flex items-center justify-center">
              <svg className="w-10 h-10 text-[#871c1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-heading text-primary mb-2">No Past Honorees in Archive</h3>
            <p className="text-neutral-500 text-sm">
              Honorees added through the admin panel will appear here after the current year.
            </p>
          </div>
        )}

        {/* Year Jump Links */}
        {!loading && years.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-12"
          >
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
              <span className="text-sm text-neutral-500 mr-2">Jump to:</span>
              {years.map((year) => (
                <a
                  key={year}
                  href={`#year-${year}`}
                  className="px-4 py-2 text-sm font-semibold rounded-full border border-neutral-200 text-neutral-700 hover:bg-[#871c1c] hover:text-white hover:border-[#871c1c] transition-all duration-200"
                >
                  {year}
                </a>
              ))}
            </div>
          </motion.div>
        )}

        {/* Honorees grouped by year */}
        {!loading && years.length > 0 && (
          <div className="space-y-16">
            {years.map((year, yearIndex) => (
              <motion.div
                key={year}
                id={`year-${year}`}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="scroll-mt-24"
              >
                {/* Year heading */}
                <div className="text-center mb-8">
                  <h2
                    className="text-3xl md:text-4xl font-semibold text-primary"
                    style={{ fontFamily: 'var(--font-cursive)' }}
                  >
                    {year} WONder Women
                  </h2>
                  <div className="flex items-center justify-center gap-3 mt-3">
                    <div className="h-px w-12 bg-[#E7C418]/40" />
                    <div className="h-0.5 w-16 bg-gradient-to-r from-[#E7C418] to-[#C9A814] rounded-full" />
                    <div className="h-px w-12 bg-[#E7C418]/40" />
                  </div>
                  <p className="text-neutral-500 text-sm mt-2">
                    {honoreesByYear[year].length} honoree{honoreesByYear[year].length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Compact grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
                  {honoreesByYear[year]
                    .sort((a, b) => (a.honoree_order ?? 0) - (b.honoree_order ?? 0))
                    .map((honoree, index) => (
                    <motion.div
                      key={honoree.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
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
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom decorative band */}
      <div className="relative h-3 overflow-hidden mt-16">
        <div className="absolute inset-0 bg-gradient-to-r from-[#871c1c] via-[#E7C418] to-[#871c1c]" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#E7C418] via-[#871c1c] to-[#E7C418] animate-pulse opacity-50" />
      </div>

      {/* Bio Modal */}
      <Modal
        isOpen={!!selectedHonoree}
        onClose={() => setSelectedHonoree(null)}
        title=""
        size="lg"
      >
        {selectedHonoree && (
          <div className="text-center">
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
    </div>
  );
}
