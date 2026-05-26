"use client";

import { motion } from "framer-motion";

const programs = [
  {
    title: "Professional Development",
    tagline: "Sharpen your edge",
    description: "Workshops and training sessions on topics like leading with purpose, mastering your communication, self advocacy, visioning, mental-physical health and wellness, estate planning, financial literacy, and career advancement that prepare you for every next step.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    accent: "from-[#871c1c] to-[#a02323]",
  },
  {
    title: "Community Building",
    tagline: "Forge lasting bonds",
    description: "Regular networking events that connect trailblazing women and create opportunities for collaboration, mentorship, and mutual support.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    accent: "from-[#E7C418] to-[#C9A814]",
  },
  {
    title: "Special Events",
    tagline: "Celebrate together",
    description: "Annual meetings, celebrations, and community service events that bring our network together to honor achievements and strengthen connections.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    accent: "from-[#871c1c] to-[#6b1515]",
  },
];

export default function NetworkingTraining() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 pattern-dots opacity-50 pointer-events-none" />
      
      {/* Section Header */}
      <div className="relative mb-12 text-center">
        {/* Decorative elements */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="absolute left-1/2 -translate-x-1/2 top-0 w-32 h-px bg-gradient-to-r from-transparent via-[#E7C418]/50 to-transparent"
        />
        
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="inline-block text-sm font-semibold tracking-widest text-[#C9A814] uppercase mt-8 mb-4"
        >
          ✦ Build Your Network ✦
        </motion.span>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl font-heading text-primary mb-4"
        >
          Networking & Training
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-xl text-neutral-600 max-w-2xl mx-auto"
        >
          Be seen. Be supported. Be unstoppable.
        </motion.p>
        
        {/* Bottom decorative line */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-24 h-0.5 bg-gradient-to-r from-[#E7C418] to-[#F0D43A] mx-auto mt-6"
        />
      </div>

      {/* Program Cards */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {programs.map((program, index) => (
          <motion.div
            key={program.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 + index * 0.15, duration: 0.6 }}
            className="group relative"
          >
            <div className="card-premium h-full flex flex-col overflow-hidden">
              {/* Top Accent Bar */}
              <div className={`h-1.5 bg-gradient-to-r ${program.accent}`} />
              
              <div className="p-6 md:p-8 flex flex-col flex-grow">
                {/* Icon Container */}
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br ${program.accent} mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-white">{program.icon}</span>
                </div>
                
                {/* Title */}
                <h3 className="text-xl font-heading text-primary mb-2">
                  {program.title}
                </h3>
                
                {/* Tagline */}
                <p className="text-sm font-medium text-[#C9A814] mb-4 tracking-wide">
                  {program.tagline}
                </p>
                
                {/* Description */}
                <p className="text-neutral-600 leading-relaxed flex-grow">
                  {program.description}
                </p>
                
                {/* Decorative corner flourish */}
                <div className="absolute bottom-3 right-3 w-8 h-8 opacity-0 group-hover:opacity-20 transition-opacity duration-300">
                  <svg viewBox="0 0 32 32" fill="none">
                    <path d="M32 0L32 32L0 32" stroke="#E7C418" strokeWidth="1"/>
                  </svg>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Bottom Flourish */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="flex justify-center mt-12"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-px bg-gradient-to-r from-transparent to-[#E7C418]/40" />
          <span className="text-[#E7C418] text-xl">❖</span>
          <div className="w-12 h-px bg-gradient-to-l from-transparent to-[#E7C418]/40" />
        </div>
      </motion.div>
    </motion.div>
  );
}
