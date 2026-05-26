"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Image from "next/image";

interface GalleryPhoto {
  id: string;
  image_url: string;
  caption: string;
  year: number;
  category: string;
  aspect_ratio: 'landscape' | 'portrait' | 'square';
}

const categories = [
  { id: "all", label: "All Photos" },
  { id: "2025-ww", label: "2025 WW" },
  { id: "2024-ww", label: "2024 WW" },
  { id: "2023-ww", label: "2023 WW" },
  { id: "2022-ww", label: "2022 WW" },
  { id: "networking", label: "Networking" },
  { id: "events", label: "Events" },
  { id: "speaker", label: "Speakers" },
];

export default function PhotoGallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryPhoto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<GalleryPhoto | null>(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/gallery-photos/list', { cache: 'no-store' });
      if (!response.ok) {
        console.error("Error fetching gallery photos:", response.statusText);
        return;
      }
      const data = await response.json();
      setGalleryImages(data.photos || []);
    } catch (err) {
      console.error("Error fetching gallery photos:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredImages = selectedCategory === "all" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-[#E7C418] to-[#C9A814] mb-4 shadow-lg"
          >
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-5xl font-heading text-primary mb-4"
          >
            Moments of Celebration
          </motion.h2>
          
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="h-px w-16 bg-[#E7C418]/40" />
            <div className="h-1 w-24 bg-gradient-to-r from-[#E7C418] to-[#F0D43A]" />
            <div className="h-px w-16 bg-[#E7C418]/40" />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-lg text-neutral-600 max-w-2xl mx-auto"
          >
            Capturing the joy, connection, and inspiration from our WONder Women events.
          </motion.p>
        </div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-wrap justify-center gap-3 mb-12"
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white shadow-lg"
                  : "bg-white border border-neutral-200 text-neutral-600 hover:border-[#E7C418] hover:text-[#871c1c] hover:shadow-md"
              }`}
            >
              {category.label}
            </button>
          ))}
        </motion.div>

        {/* Masonry-style Gallery Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12 bg-neutral-50 rounded-xl">
            <p className="text-neutral-500">No photos available yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              layout
              className={`group cursor-pointer ${
                image.aspect_ratio === 'portrait' ? 'md:row-span-2' : ''
              }`}
              onClick={() => setSelectedImage(image)}
            >
              <div className="relative h-full rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500">
                {/* Image Container */}
                <div className={`relative overflow-hidden ${
                  image.aspect_ratio === 'portrait' ? 'aspect-[3/4]' : 
                  image.aspect_ratio === 'square' ? 'aspect-square' : 'aspect-video'
                }`}>
                  <Image
                    src={image.image_url}
                    alt={image.caption}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized
                  />
                  
                  {/* Content - visible by default */}
                  <div className="absolute bottom-0 left-0 right-0 p-3 opacity-100 transition-all duration-500">
                    <div className="bg-gradient-to-t from-white/85 via-white/60 to-white/30 backdrop-blur-md rounded-lg px-3 py-2.5 shadow-lg">
                      <h4 className="text-[#871c1c] font-heading text-sm font-semibold drop-shadow-[0_1px_2px_rgba(255,255,255,0.8)]">{image.caption}</h4>
                    </div>
                  </div>
                  
                  {/* View icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100 shadow-lg">
                    <svg className="w-5 h-5 text-[#871c1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
                
                {/* Year badge - always visible */}
                <div className="absolute top-4 left-4">
                  <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold bg-gradient-to-r from-[#E7C418] to-[#C9A814] text-white shadow-md">
                    {image.year}
                  </span>
                </div>
              </div>
            </motion.div>
            ))}
          </div>
        )}

        {/* Decorative bottom flourish */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="flex justify-center mt-16"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-[#E7C418]/40" />
            <span className="text-[#E7C418] text-2xl">✦</span>
            <span className="text-[#871c1c] text-lg">✦</span>
            <span className="text-[#E7C418] text-2xl">✦</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-[#E7C418]/40" />
          </div>
        </motion.div>
      </motion.div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image container */}
            <div className="relative rounded-2xl overflow-hidden aspect-video">
              <Image
                src={selectedImage.image_url}
                alt={selectedImage.caption}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
            
            {/* Caption */}
            <div className="mt-4 text-center">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold bg-gradient-to-r from-[#E7C418] to-[#C9A814] text-white shadow-md mb-2">
                {selectedImage.year}
              </span>
              <h4 className="text-white text-xl font-heading">{selectedImage.caption}</h4>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
