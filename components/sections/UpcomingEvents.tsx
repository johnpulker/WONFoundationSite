"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import ImageLightbox from "@/components/ui/ImageLightbox";

interface Event {
  id: string;
  slug: string;
  title: string;
  date: string;
  location: string;
  description: string;
  category?: string;
  featured?: boolean;
  price_cents?: number;
  image_url?: string | null;
}

export default function UpcomingEvents() {
  const router = useRouter();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  const handleViewAllEvents = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push('/programs-events?scroll=bottom');
  };

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch('/api/events/list');
        if (response.ok) {
          const data = await response.json();
          if (data.events && data.events.length > 0) {
            // Transform and take first 3 events
            const transformedEvents = data.events.slice(0, 3).map((e: any, index: number) => ({
              id: e.id,
              slug: e.slug,
              title: e.name,
              date: e.date,
              location: e.venue_name || e.city || 'TBD',
              description: e.description || '',
              category: e.price_cents > 0 ? 'Paid Event' : 'Free Event',
              featured: index === 0, // First event is featured
              price_cents: e.price_cents,
              image_url: e.image_url || null,
            }));
            setEvents(transformedEvents);
          }
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  // Show nothing if no events and done loading
  if (!loading && events.length === 0) {
    return null;
  }

  return (
    <section className="pt-8 pb-20 md:pt-12 md:pb-32 lg:pt-16 lg:pb-40 relative overflow-hidden">
      {/* Premium gradient field - champagne ivory with depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f9f4ef] to-[#f6f1eb]" />
      
      {/* Dot grid pattern - 15% opacity for clear visibility */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: "radial-gradient(circle, #871c1c 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />
      
      {/* Soft radial spotlight behind heading for depth and focus */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center top, rgba(90, 31, 58, 0.03) 0%, rgba(90, 31, 58, 0.01) 50%, transparent 100%)"
        }}
      />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-6"
        >
          <h2 
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-primary font-bold mb-2"
            style={{
              fontFamily: 'var(--font-cursive)',
            }}
          >
            What&apos;s Happening Next
          </h2>
          <div className="h-[1px] w-20 bg-accent mx-auto mb-4"></div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Events Grid */}
        {!loading && events.length > 0 && (
          <div className="flex flex-wrap justify-center gap-6 md:gap-8 max-w-7xl mx-auto">
            {events.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.08,
                  ease: "easeOut"
                }}
                className="w-full md:w-[48%] lg:w-[32%]"
              >
                <motion.div
                  whileHover={{ y: -2, scale: 1.01 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <Card className="h-full flex flex-col group cursor-pointer transition-all duration-300 hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.18)] overflow-hidden bg-white/95 backdrop-blur-sm relative">
                    {/* Color strip - Gold = Featured, Burgundy = Standard */}
                    <div className={`h-1 w-full ${
                      event.featured ? "bg-accent" : "bg-primary"
                    }`} />
                    
                    <div className="p-6 md:p-8 flex flex-col flex-grow">
                      {/* Featured badge */}
                      <div className="mb-3">
                        {event.featured && (
                          <span className="text-xs font-semibold text-accent uppercase tracking-wide">
                            Featured
                          </span>
                        )}
                      </div>
                      
                      {/* Date and Location */}
                      <div className="flex items-start gap-2 text-sm mb-3">
                        <svg className="w-4 h-4 text-neutral-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className="font-semibold text-primary whitespace-nowrap flex-shrink-0">
                            {new Date(event.date).toLocaleDateString("en-US", {
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                          {event.location && event.location !== "TBD" && (
                            <span className="text-neutral-500">• {event.location}</span>
                          )}
                        </div>
                      </div>

                      {/* Category Tag */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                          event.price_cents && event.price_cents > 0 
                            ? "text-[#E7C418] bg-[#E7C418]/10" 
                            : "text-green-600 bg-green-100"
                        }`}>
                          {event.category}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl md:text-2xl font-heading font-bold text-neutral-900 mb-4 leading-tight min-h-[3.5rem]">
                        {event.title}
                      </h3>

                      {/* Event Image - Below Title */}
                      {event.image_url && (
                        <div 
                          className="relative w-full h-48 md:h-64 mb-4 rounded-lg overflow-hidden cursor-pointer group/image"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setLightboxImage(event.image_url!);
                          }}
                        >
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors" />
                        </div>
                      )}
                      
                      {/* Description */}
                      <p className="text-neutral-700 mb-6 flex-grow font-medium">
                        {event.description}
                      </p>

                      {/* CTA Button */}
                      <Link href={`/events/${event.slug?.replace(/^events\//, '') || ''}`} className="mt-auto group flex justify-center">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button variant="primary" className="rounded-full px-6 w-full">
                            <span className="flex items-center justify-center gap-2">
                              {event.price_cents && event.price_cents > 0 ? "Get Tickets" : "Register Free"}
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
                            </span>
                          </Button>
                        </motion.div>
                      </Link>
                    </div>
                  </Card>
                </motion.div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Image Lightbox */}
        <ImageLightbox
          isOpen={!!lightboxImage}
          onClose={() => setLightboxImage(null)}
          imageUrl={lightboxImage || ""}
          alt="Event image"
        />

        {/* View All Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="mt-10 md:mt-12 text-center"
        >
          <Link 
            href="/programs-events" 
            onClick={handleViewAllEvents}
            className="group inline-flex items-center gap-2 text-primary font-semibold hover:text-primary-dark transition-colors"
          >
            <span>View All Events</span>
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
        </motion.div>
      </div>
    </section>
  );
}
