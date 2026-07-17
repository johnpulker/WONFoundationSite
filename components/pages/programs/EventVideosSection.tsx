"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface EventVideo {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string;
  event_date: string | null;
  year: number;
  video_order: number;
}

function getYouTubeEmbedUrl(url: string): string | null {
  try {
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
    if (shortMatch) return `https://www.youtube.com/embed/${shortMatch[1]}`

    const fullMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
    if (fullMatch) return `https://www.youtube.com/embed/${fullMatch[1]}`

    if (url.includes('youtube.com/embed/')) return url

    return null
  } catch {
    return null
  }
}

function formatEventDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

export default function EventVideosSection() {
  const [videos, setVideos] = useState<EventVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch('/api/event-videos/list', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        setVideos(data.videos || []);
      } catch (err) {
        console.error('Error fetching event videos:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-10 h-10 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (videos.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <span className="w-8 h-px bg-[#E7C418]" />
          <span className="text-[#871c1c] text-sm font-semibold uppercase tracking-widest">Watch</span>
          <span className="w-8 h-px bg-[#E7C418]" />
        </div>
        <h2 className="text-4xl md:text-5xl font-heading font-bold text-neutral-900 mb-4">
          Event Videos
        </h2>
        <p className="text-lg text-neutral-600 max-w-xl mx-auto">
          Relive the highlights from our events and celebrations.
        </p>
      </div>

      {/* 3-Column Video Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video, index) => {
          const embedUrl = getYouTubeEmbedUrl(video.youtube_url);
          return (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className="bg-white rounded-xl border border-neutral-100 shadow-sm overflow-hidden"
            >
              {/* Embed */}
              <div className="relative w-full aspect-video bg-black">
                {embedUrl ? (
                  <iframe
                    src={embedUrl}
                    title={video.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                    <p className="text-neutral-400 text-sm">Video unavailable</p>
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-sm font-bold text-neutral-900 leading-snug">{video.title}</h3>
                  <span className="flex-shrink-0 px-2 py-0.5 bg-[#871c1c]/10 text-[#871c1c] text-xs font-semibold rounded-full">
                    {video.year}
                  </span>
                </div>
                {video.event_date && (
                  <p className="text-xs text-neutral-400">{formatEventDate(video.event_date)}</p>
                )}
                {video.description && (
                  <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{video.description}</p>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
