"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ImageLightbox from "@/components/ui/ImageLightbox";

interface Event {
  id: string;
  slug?: string;
  title: string;
  date: string;
  location: string;
  description: string;
  registrationEnabled?: boolean;
  price_cents?: number;
  is_active?: boolean;
  image_url?: string | null;
}

export default function EventsSection() {
  const router = useRouter();
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Fetch events from database
  useEffect(() => {
    async function fetchEvents() {
      try {
        setLoading(true);
        
        // Fetch upcoming events
        const upcomingResponse = await fetch('/api/events/list');
        if (upcomingResponse.ok) {
          const data = await upcomingResponse.json();
          console.log('[EventsSection] Raw API response:', data);
          const events = (data.events || []).map((e: any) => ({
            id: e.id,
            slug: e.slug,
            title: e.name,
            date: e.date,
            location: e.venue_name || e.city || 'TBD',
            description: e.description || '',
            registrationEnabled: e.is_active,
            price_cents: e.price_cents,
            image_url: e.image_url || null,
          }));
          console.log('[EventsSection] Upcoming events loaded:', events.length, 'events');
          console.log('[EventsSection] Upcoming events data:', events);
          setUpcomingEvents(events);
        } else {
          const errorText = await upcomingResponse.text();
          console.error('[EventsSection] Failed to fetch upcoming events:', upcomingResponse.status, errorText);
        }
        
        // Fetch past events (includes inactive events)
        const pastResponse = await fetch('/api/events/list?only_past=true');
        if (pastResponse.ok) {
          const data = await pastResponse.json();
          const events = (data.events || []).map((e: any) => ({
            id: e.id,
            slug: e.slug,
            title: e.name,
            date: e.date,
            location: e.venue_name || e.city || 'TBD',
            description: e.description || '',
            registrationEnabled: false,
            price_cents: e.price_cents,
            is_active: e.is_active,
            image_url: e.image_url || null,
          }));
          console.log('[EventsSection] Past events loaded:', events.length, 'events');
          console.log('[EventsSection] Inactive events:', events.filter((e: any) => e.is_active === false).length);
          setPastEvents(events);
        } else {
          console.error('[EventsSection] Failed to fetch past events:', pastResponse.statusText);
        }
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      month: date.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
      day: date.getDate().toString(),
      year: date.getFullYear().toString(),
      full: date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    };
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Section Background */}
        <div className="absolute inset-0 -mx-4 sm:-mx-6 lg:-mx-8 section-gradient-warm rounded-3xl" />
        
        <div className="relative pt-4">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest text-[#C9A814] uppercase mb-3"
              >
                <span className="w-8 h-px bg-[#E7C418]" />
                Mark Your Calendar
              </motion.span>
              
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="text-3xl md:text-4xl font-heading text-primary mb-3"
              >
                {filter === "upcoming" ? "Upcoming Events" : "Past Events"}
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="text-lg text-neutral-600 max-w-xl"
              >
                Where connections are made and leaders are celebrated.
              </motion.p>
            </div>
            
            {/* Filter Buttons */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="flex gap-2 p-1 bg-white rounded-lg shadow-sm border border-neutral-100"
            >
            <button
              onClick={() => setFilter("upcoming")}
                className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-300 ${
                filter === "upcoming"
                    ? "bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white shadow-md"
                    : "text-neutral-600 hover:text-primary hover:bg-neutral-50"
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter("past")}
                className={`px-5 py-2.5 rounded-md text-sm font-semibold transition-all duration-300 ${
                filter === "past"
                    ? "bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white shadow-md"
                    : "text-neutral-600 hover:text-primary hover:bg-neutral-50"
              }`}
            >
                Past Events
            </button>
            </motion.div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!loading && (filter === "upcoming" ? upcomingEvents : pastEvents).length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#871c1c]/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-[#871c1c]/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-heading text-neutral-900 mb-1">
                {filter === "upcoming" ? "No Upcoming Events" : "No Past Events"}
              </h3>
              <p className="text-neutral-500 text-sm">
                {filter === "upcoming" 
                  ? "Check back soon for new events!" 
                  : "Past events will appear here."}
              </p>
        </div>
          )}

          {/* Events Grid */}
          {!loading && (filter === "upcoming" ? upcomingEvents : pastEvents).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {(filter === "upcoming" ? upcomingEvents : pastEvents).map((event, index) => {
              const dateInfo = formatDate(event.date);
              return (
            <motion.div
              key={event.id}
                  initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="group"
                >
                  <div className={`card-premium h-full flex flex-col overflow-hidden relative ${filter === "past" && event.is_active === false ? "opacity-75" : ""}`}>
                    {/* Date Badge & Location Strip */}
                    <div className="flex items-stretch">
                      {/* Date Badge */}
                      <div className="flex-shrink-0 w-20 bg-gradient-to-br from-[#871c1c] to-[#6b1515] p-4 flex flex-col items-center justify-center text-center">
                        <span className="text-[#E7C418] text-xs font-bold tracking-wider">
                          {dateInfo.month}
                        </span>
                        <span className="text-white text-2xl font-heading font-bold leading-tight">
                          {dateInfo.day}
                        </span>
                        <span className="text-white/60 text-xs">
                          {dateInfo.year}
                  </span>
                      </div>
                      
                      {/* Location Strip */}
                      <div className="flex-grow bg-gradient-to-r from-[#871c1c]/5 to-transparent p-4">
                          <div className="flex items-center gap-2 text-sm">
                            <svg className="w-4 h-4 text-[#871c1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="font-medium text-[#871c1c]">{event.location}</span>
                          </div>
                      </div>
                </div>
                    
                    {/* Content */}
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="text-lg font-heading text-primary line-clamp-2 group-hover:text-[#a02323] transition-colors flex-1">
                  {event.title}
                </h3>
                        {filter === "past" && event.is_active === false && (
                          <span className="flex-shrink-0 text-xs font-semibold text-neutral-500 bg-neutral-100 px-2 py-1 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      
                      {/* Event Type Tag */}
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${
                          event.price_cents && event.price_cents > 0 
                            ? "text-[#E7C418] bg-[#E7C418]/10" 
                            : "text-green-600 bg-green-100"
                        }`}>
                          {event.price_cents && event.price_cents > 0 ? "Paid Event" : "Free Event"}
                        </span>
                      </div>

                      {/* Event Image - Below Title and Tags, Above Description */}
                      {event.image_url && (
                        <div 
                          className="relative w-full mb-4 rounded-lg overflow-hidden cursor-pointer group/image" style={{ aspectRatio: '3/4' }}
                          onClick={() => setLightboxImage(event.image_url!)}
                        >
                          <img
                            src={event.image_url}
                            alt={event.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover/image:bg-black/10 transition-colors" />
                        </div>
                      )}
                      
                      <p className="text-neutral-600 text-sm leading-relaxed mb-6 flex-grow">
                  {event.description}
                </p>
                      
                      {/* Action Button */}
                {filter === "upcoming" && "registrationEnabled" in event && event.registrationEnabled ? (
                  event.slug ? (
                          <button
                      onClick={() => {
                        const cleanSlug = event.slug?.replace(/^events\//, '') || '';
                        router.push(`/events/${cleanSlug}`);
                      }}
                            className="w-full py-3 px-4 bg-gradient-to-r from-[#E7C418] to-[#C9A814] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <span>Register Now</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                        ) : (
                          <button
                      onClick={() => setSelectedEvent(event)}
                            className="w-full py-3 px-4 bg-gradient-to-r from-[#E7C418] to-[#C9A814] text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                          >
                            <span>Register Now</span>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </button>
                        )
                      ) : (
                        <button
                          onClick={() => setSelectedEvent(event)}
                          className="w-full py-3 px-4 border-2 border-[#871c1c] text-[#871c1c] font-semibold rounded-lg hover:bg-[#871c1c] hover:text-white transition-all duration-300 flex items-center justify-center gap-2"
                        >
                          <span>View Details</span>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                    
                    {/* Bottom accent line on hover */}
                    <div className="h-1 bg-gradient-to-r from-[#E7C418] via-[#871c1c] to-[#E7C418] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
            </motion.div>
              );
            })}
          </div>
          )}
        </div>
      </motion.div>

      {/* Image Lightbox */}
      <ImageLightbox
        isOpen={!!lightboxImage}
        onClose={() => setLightboxImage(null)}
        imageUrl={lightboxImage || ""}
        alt="Event image"
      />

      {/* Event Detail Modal */}
      <Modal
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        title={selectedEvent?.title}
        size="lg"
      >
        {selectedEvent && (
          <div>
            {/* Date & Location Badge */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#871c1c]/10 to-transparent rounded-lg">
                <svg className="w-5 h-5 text-[#871c1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="font-semibold text-[#871c1c]">
                  {formatDate(selectedEvent.date).full}
              </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#E7C418]/10 to-transparent rounded-lg">
                <svg className="w-5 h-5 text-[#C9A814]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="font-semibold text-[#C9A814]">{selectedEvent.location}</span>
              </div>
            </div>
            
            {/* Description */}
            <p className="text-neutral-700 leading-relaxed mb-8">
              {selectedEvent.description}
            </p>
            
            {/* Action */}
            {filter === "upcoming" && "registrationEnabled" in selectedEvent && selectedEvent.registrationEnabled && (
              selectedEvent.slug ? (
                <button
                  onClick={() => {
                    setSelectedEvent(null);
                    const cleanSlug = selectedEvent.slug?.replace(/^events\//, '') || '';
                    router.push(`/events/${cleanSlug}`);
                  }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-[#E7C418] to-[#C9A814] text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 text-lg"
                >
                  <span>Register for This Event</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              ) : (
                <div className="text-center py-4 px-6 bg-neutral-100 rounded-lg">
                  <span className="text-neutral-600 font-medium">Registration Coming Soon</span>
                </div>
              )
            )}
          </div>
        )}
      </Modal>
    </>
  );
}
