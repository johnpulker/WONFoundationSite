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
  accentColor?: string;
}

const accentColors = [
  "from-[#871c1c] to-[#a02323]",
  "from-[#E7C418] to-[#C9A814]",
  "from-[#a02323] to-[#871c1c]",
];

export default function CurrentYear() {
  const [honorees, setHonorees] = useState<Honoree[]>([]);
  const [selectedHonoree, setSelectedHonoree] = useState<Honoree | null>(null);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    async function fetchHonorees() {
      try {
        const response = await fetch(`/api/honorees/list?current_year=true`, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          const honoreesWithColors = (data.honorees || []).map((h: Honoree, index: number) => ({
            ...h,
            accentColor: accentColors[index % accentColors.length],
          }));
          setHonorees(honoreesWithColors);
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

        {/* Honoree Cards - Arch Portrait Style like Home Page */}
        {!loading && honorees.length > 0 && (
          <>
            {/* Elegant section title above honorees */}
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
                2025 WONder Women
              </span>
              <div className="flex items-center justify-center gap-4 mt-5">
                <div className="h-px w-12 md:w-20 bg-[#E7C418]/40" />
                <div className="h-1 w-16 md:w-24 bg-gradient-to-r from-[#E7C418] to-[#C9A814] rounded-full" />
                <div className="h-px w-12 md:w-20 bg-[#E7C418]/40" />
              </div>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {honorees.map((honoree, index) => (
              <motion.div
                key={honoree.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="group cursor-pointer"
                onClick={() => setSelectedHonoree(honoree)}
              >
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ duration: 0.3 }}
                  className="h-full"
                >
                  <div className="h-full bg-white rounded-2xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(90,31,58,0.15)] hover:shadow-[0_20px_50px_-15px_rgba(90,31,58,0.25)] transition-all duration-500 border border-neutral-100">
                    {/* Photo area - Portrait arch shape */}
                    <div className="aspect-[3/4] relative overflow-hidden">
                      {/* Gradient background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-[#f6e9e4] to-[#faf5f1]" />
                      
                      {honoree.photo_url ? (
                        <Image
                          src={honoree.photo_url}
                          alt={honoree.name}
                          fill
                          className="object-cover rounded-t-[2.5rem] transition-transform duration-700 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl font-heading text-[#871c1c]/30">
                            {honoree.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                      )}
                      
                      {/* Gradient overlay for depth */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#871c1c]/20 via-transparent to-transparent rounded-t-[2.5rem]" />
                      
                      {/* Colored border stroke */}
                      <div className={`absolute inset-0 border-4 border-transparent bg-gradient-to-br ${honoree.accentColor} rounded-t-[2.5rem] opacity-0 group-hover:opacity-20 transition-opacity duration-500`} style={{ WebkitMask: 'linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)', WebkitMaskComposite: 'xor', maskComposite: 'exclude' }} />
                      
                      {/* Top decorative corner */}
                      <div className="absolute top-4 right-4 w-12 h-12 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className={`w-full h-full rounded-full bg-gradient-to-br ${honoree.accentColor} flex items-center justify-center shadow-lg`}>
                          <span className="text-white text-lg">✦</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Card content */}
                    <div className="p-6 text-center relative">
                      {/* Accent line at top */}
                      <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-20 h-1 bg-gradient-to-r ${honoree.accentColor} rounded-full`} />
                      
                      <h3 className="text-2xl font-heading font-bold text-primary mb-2 group-hover:text-[#6b1515] transition-colors pt-4">
                        {honoree.name}
                      </h3>
                      {honoree.title && (
                        <p className="text-sm text-neutral-600 italic mb-4 font-light leading-relaxed">
                          {honoree.title}
                        </p>
                      )}
                      
                      <button className={`inline-flex items-center gap-2 px-6 py-2 rounded-full bg-gradient-to-r ${honoree.accentColor} text-white text-sm font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300`}>
                        <span>Read Bio</span>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </motion.div>
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
              <div className={`w-40 h-40 mx-auto mb-6 rounded-full bg-gradient-to-br ${selectedHonoree.accentColor} flex items-center justify-center shadow-xl ring-4 ring-[#E7C418]/30`}>
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
