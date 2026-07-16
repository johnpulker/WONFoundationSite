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

function getYouTubeThumbnail(url: string): string | null {
  try {
    const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/)
    if (shortMatch) return `https://img.youtube.com/vi/${shortMatch[1]}/hqdefault.jpg`

    const fullMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/)
    if (fullMatch) return `https://img.youtube.com/vi/${fullMatch[1]}/hqdefault.jpg`

    const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/)
    if (embedMatch) return `https://img.youtube.com/vi/${embedMatch[1]}/hqdefault.jpg`

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
  const [activeVideo, setActiveVideo] = useState<EventVideo | null>(null);

  useEffect(() => {
    async function fetchVideos() {
      try {
        const response = await fetch('/api/event-videos/list', { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        const list: EventVideo[] = data.videos || [];
        setVideos(list);
        if (list.length > 0) setActiveVideo(list[0]);
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

  const featuredVideo = activeVideo ?? videos[0];
  const featuredEmbedUrl = getYouTubeEmbedUrl(featuredVideo.youtube_url);
  const otherVideos = videos.filter((v) => v.id !== featuredVideo.id);

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

      {/* Featured Video */}
      <div className="mb-10">
        <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-neutral-100">
          {/* Embed */}
          {featuredEmbedUrl ? (
            <div className="relative w-full aspect-video bg-black">
              <iframe
                key={featuredVideo.id}
                src={featuredEmbedUrl}
                title={featuredVideo.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 w-full h-full"
              />
            </div>
          ) : (
            <div className="relative w-full aspect-video bg-neutral-100 flex items-center justify-center">
              <p className="text-neutral-400 text-sm">Video unavailable</p>
            </div>
          )}

          {/* Caption */}
          <div className="px-6 py-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">{featuredVideo.title}</h3>
                {featuredVideo.event_date && (
                  <p className="text-sm text-neutral-500 mt-1">
                    {formatEventDate(featuredVideo.event_date)}
                  </p>
                )}
                {featuredVideo.description && (
                  <p className="text-neutral-600 text-sm mt-2">{featuredVideo.description}</p>
                )}
              </div>
              <span className="flex-shrink-0 px-3 py-1 bg-[#871c1c]/10 text-[#871c1c] text-xs font-semibold rounded-full">
                {featuredVideo.year}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Past Videos Grid */}
      {otherVideos.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider mb-4">
            More Videos
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {otherVideos.map((video, index) => {
              const thumbnail = getYouTubeThumbnail(video.youtube_url);
              return (
                <motion.button
                  key={video.id}
                  onClick={() => {
                    setActiveVideo(video);
                    // Scroll the featured player into view
                    document.getElementById('event-videos')?.scrollIntoView({
                      behavior: 'smooth', block: 'start',
                    });
                  }}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: index * 0.06 }}
                  className="group text-left bg-white rounded-xl border border-neutral-100 shadow-sm hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
                >
                  {/* Thumbnail */}
                  <div className="relative w-full aspect-video bg-neutral-100 overflow-hidden">
                    {thumbnail ? (
                      <img
                        src={thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-neutral-200">
                        <svg className="w-8 h-8 text-neutral-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    )}
                    {/* Play overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 transition-colors duration-200">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg">
                        <svg className="w-4 h-4 text-[#871c1c] ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-neutral-900 leading-snug group-hover:text-[#871c1c] transition-colors line-clamp-2">
                        {video.title}
                      </p>
                      <span className="flex-shrink-0 text-xs text-neutral-400 font-medium">{video.year}</span>
                    </div>
                    {video.event_date && (
                      <p className="text-xs text-neutral-400 mt-1">{formatEventDate(video.event_date)}</p>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
}
