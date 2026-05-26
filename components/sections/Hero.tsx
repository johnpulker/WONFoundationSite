"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 1], [1, 0]);

  return (
    <section 
      ref={ref}
      className="relative w-full h-screen flex items-center overflow-hidden bg-gradient-to-br from-neutral-100 via-primary/10 to-neutral-50"
    >
      {/* Background image with parallax and refined grading */}
      <motion.div 
        className="absolute inset-0"
        style={{ y }}
      >
        <Image
          src="/imgs/womancape.jpg"
          alt="Empowered women leaders"
          fill
          priority
          quality={90}
          className="object-cover"
          style={{
            filter: "contrast(1.1) saturate(1.0) brightness(1.1)",
          }}
        />
      </motion.div>
      
      {/* Light plum/burgundy gradient overlay - refined tint */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#871c1c]/50 via-[#871c1c]/30 via-50% to-[#871c1c]/20" />
      
      {/* Additional light overlay for text readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/20 via-transparent to-transparent" />
      
      {/* Radial vignette to ground text area */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-transparent to-[#1a0a12]/20" 
        style={{
          background: "radial-gradient(ellipse at center bottom, transparent 0%, rgba(26, 10, 18, 0.2) 70%)"
        }}
      />
      
      {/* Subtle texture overlay to reduce stock feel */}
      <div 
        className="absolute inset-0 opacity-8"
        style={{
          backgroundImage: "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.1) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Content - Asymmetric layout, refined composition */}
      <motion.div 
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full z-10"
        style={{ opacity }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-screen py-16 lg:py-20">
          {/* Text block - shifted left for premium asymmetric feel, reduced headroom */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-6 lg:col-start-2 text-left"
          >
            {/* Main heading with refined hierarchy - "Empower Women" dominant */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading text-white mb-3 leading-[1.08] tracking-[-0.02em]">
              <span className="block font-bold drop-shadow-2xl">Empowered Women</span>
              <span className="block text-accent mt-2 font-semibold text-[0.85em] tracking-[0.01em] drop-shadow-xl italic">
                Empower Women.
              </span>
            </h1>

            {/* Tagline - refined typography with letter spacing and brightness */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="text-lg md:text-xl lg:text-2xl text-neutral-100 mb-8 max-w-xl leading-relaxed font-light italic tracking-wide drop-shadow-lg"
              style={{ letterSpacing: "0.02em" }}
            >
              Supporting women leaders of today and mentoring women leaders of tomorrow.
            </motion.p>

          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

