"use client";

import { motion } from "framer-motion";

export default function MissionVision() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
    >
      {/* Top Flourish - Elegant Leaf Cluster */}
      <div className="flex justify-center mb-6">
        <svg className="w-12 h-12 text-accent/50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M12 2c-2 0-4 1-5 3-1-2-3-3-5-3v8c0 5 5 10 10 10s10-5 10-10V2c-2 0-4 1-5 3-1-2-3-3-5-3z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8c1 2 3 3 4 3s3-1 4-3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
        </svg>
      </div>

      {/* Section Header */}
      <div className="mb-12">
        <div className="mb-4">
          <span className="text-xs uppercase tracking-[0.15em] text-primary font-semibold">
            Our Foundation
          </span>
        </div>
        <div className="h-[1px] w-20 bg-accent mb-6"></div>
        <h2 className="text-5xl md:text-6xl font-heading text-primary mb-10 leading-tight font-bold">
          Mission & Vision
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Mission Card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative group"
        >
          <div className="relative h-full bg-gradient-to-br from-primary/90 via-primary/85 to-primary-dark/90 p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden">
            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6">
                <div className="w-14 h-14 bg-accent/20 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-accent" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-heading text-white mb-6 leading-tight">
                Our Mission
              </h3>
              
              <div className="h-1 w-16 bg-accent mb-6"></div>
              
              <p className="text-lg text-white/95 leading-relaxed">
                To empower women leaders of today and mentor women leaders of tomorrow through 
                leadership development, networking, recognition, and community support.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Vision Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative group"
        >
          <div className="relative h-full bg-white p-8 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 border border-neutral-200 overflow-hidden">
            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-6">
                <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center">
                  <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
              </div>
              
              <h3 className="text-3xl md:text-4xl font-heading text-primary mb-6 leading-tight">
                Our Vision
              </h3>
              
              <div className="h-1 w-16 bg-accent mb-6"></div>
              
              <p className="text-lg text-neutral-700 leading-relaxed">
                A world where women in leadership positions are supported, recognized, and empowered 
                to create positive change in their communities and beyond. We envision increasing the 
                number of women serving in elected and appointed public service positions, ensuring 
                diverse voices shape our civic landscape.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

