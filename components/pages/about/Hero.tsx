"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutHero() {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Hero Image with Overlay */}
      <div className="relative h-[60vh] min-h-[500px] max-h-[700px]">
        {/* Image with dimming */}
        <Image
          src="/AboutImage.jpg"
          alt="Women Officials Network Foundation"
          fill
          className="object-cover brightness-[0.65]"
          priority
          quality={95}
        />
        
        {/* Radial gradient overlay for spotlight effect */}
        <div 
          className="absolute inset-0 z-10"
          style={{
            background: 'radial-gradient(circle at 50% 50%, rgba(0,0,0,0.40) 0%, rgba(0,0,0,0.60) 40%, rgba(0,0,0,0.80) 100%)',
          }}
        />
        
        {/* Additional top-to-bottom gradient for depth */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark/20 via-transparent to-transparent z-10" />
        
        {/* Content Overlay - Positioned high up */}
        <div className="relative z-20 h-full flex items-start justify-center pt-8 md:pt-12">
          <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {/* Main Headline with text shadow - High up on page */}
              <h1 
                className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-bold text-white leading-tight"
                style={{
                  textShadow: '0 3px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.6)',
                }}
              >
                Our Story
              </h1>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Decorative Bottom Wave */}
      <div className="relative -mt-1">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-16 md:h-24"
          preserveAspectRatio="none"
        >
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </div>
  );
}

