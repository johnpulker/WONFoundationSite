"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function Overview() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Hero Banner with Gradient Background */}
      <div className="relative rounded-3xl overflow-hidden mb-16">
        {/* Multi-layered gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `
              linear-gradient(135deg, #871c1c 0%, #a02323 30%, #6b1515 60%, #871c1c 100%)
            `
          }}
        />
        
        {/* Decorative gold radial */}
        <div 
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at top right, rgba(212, 175, 55, 0.2) 0%, transparent 50%)"
          }}
        />
        
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <pattern id="stars" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
              <text x="10" y="15" fontSize="8" fill="#E7C418" textAnchor="middle">✦</text>
            </pattern>
            <rect width="100%" height="100%" fill="url(#stars)" />
          </svg>
        </div>
        
        {/* Corner decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-10">
          <svg viewBox="0 0 200 200" fill="none">
            <circle cx="150" cy="50" r="80" stroke="#E7C418" strokeWidth="1"/>
            <circle cx="150" cy="50" r="60" stroke="#E7C418" strokeWidth="1"/>
            <circle cx="150" cy="50" r="40" stroke="#E7C418" strokeWidth="1"/>
          </svg>
        </div>
        
        {/* Content */}
        <div className="relative z-10 py-16 md:py-24 px-8 md:px-16 text-center">
          {/* Award icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#E7C418] to-[#C9A814] mb-6 shadow-2xl"
          >
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          </motion.div>
          
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="inline-block uppercase text-sm font-semibold tracking-[0.3em] text-[#E7C418] mb-4"
          >
            Celebrating Excellence
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-5xl md:text-6xl lg:text-7xl font-heading text-white mb-6"
          >
            WONder Women
          </motion.h1>
          
          {/* Gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex items-center justify-center gap-4 mb-8"
          >
            <div className="h-px w-16 bg-[#E7C418]/50" />
            <div className="h-1 w-24 bg-gradient-to-r from-[#E7C418] to-[#F0D43A]" />
            <div className="h-px w-16 bg-[#E7C418]/50" />
          </motion.div>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-xl md:text-2xl text-white/90 font-light max-w-3xl mx-auto italic"
          >
            Honoring visionary women who lead with courage, inspire with purpose, 
            and transform communities with their extraordinary impact.
          </motion.p>
        </div>
        
        {/* Bottom wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-8 md:h-12">
            <path 
              d="M0,60 C300,120 600,0 900,60 C1050,90 1150,60 1200,60 L1200,120 L0,120 Z" 
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Content Section with Color Accents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left - Text Content */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <div className="relative">
            {/* Accent bar */}
            <div className="absolute -left-4 top-0 w-1 h-full bg-gradient-to-b from-[#E7C418] via-[#871c1c] to-[#E7C418] rounded-full" />
            
            <div className="pl-6">
              <h2 className="text-2xl md:text-3xl font-heading text-primary mb-6">
                A Legacy of Leadership
              </h2>
              
              <p className="text-lg text-neutral-700 leading-relaxed mb-6">
                The <span className="font-semibold text-[#871c1c]">WONder Woman award</span> celebrates 
                the courage and leadership of extraordinary women who step forward to make a difference 
                in their communities. Each year, we honor women who have demonstrated exceptional 
                leadership, resilience, and commitment to public service.
              </p>
              
              <p className="text-lg text-neutral-700 leading-relaxed">
                Our annual <span className="font-semibold text-[#871c1c]">WONder Woman banquet</span> brings 
                together our community to recognize these trailblazing women and celebrate their 
                contributions. The event features inspiring speeches, networking opportunities, and 
                a celebration of the power of women in leadership.
              </p>
            </div>
          </div>
        </motion.div>
        
        {/* Right - Stats with Color */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4"
        >
          {[
            { number: "40", label: "Years of Excellence", color: "from-[#871c1c] to-[#a02323]" },
            { number: "100+", label: "Women Honored", color: "from-[#E7C418] to-[#C9A814]" },
            { number: "1000+", label: "Lives Impacted", color: "from-[#a02323] to-[#871c1c]" },
            { number: "∞", label: "Inspiration Given", color: "from-[#C9A814] to-[#E7C418]" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + index * 0.1 }}
              className="group"
            >
              <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.color} p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                <div className="relative z-10">
                  <span className="block text-4xl md:text-5xl font-heading font-bold text-white mb-2">
                    {stat.number}
                  </span>
                  <span className="text-sm text-white/80 uppercase tracking-wider font-medium">
                    {stat.label}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Quote Section */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5 }}
        className="mt-16 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-[#871c1c]/5 via-[#E7C418]/10 to-[#871c1c]/5 rounded-3xl" />
        
        <div className="relative p-8 md:p-12 text-center">
          <span className="text-6xl text-[#E7C418] font-heading leading-none">&ldquo;</span>
          <blockquote className="text-xl md:text-2xl text-neutral-700 font-heading italic max-w-3xl mx-auto -mt-6">
            Empowered women empower women. When we lift each other up, 
            we all rise together.
          </blockquote>
          <div className="mt-6 flex items-center justify-center gap-3">
            <div className="w-12 h-px bg-[#E7C418]" />
            <span className="text-sm text-[#871c1c] font-semibold uppercase tracking-wider">WON Foundation</span>
            <div className="w-12 h-px bg-[#E7C418]" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
