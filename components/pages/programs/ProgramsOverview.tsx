"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function ProgramsOverview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative"
    >
      {/* Hero Banner Section with Background Image */}
      <div className="relative mb-12 overflow-hidden rounded-2xl py-16 md:py-20 px-6 md:px-12">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/women.jpg"
            alt=""
            fill
            className="object-cover"
            style={{
              objectPosition: '50% 20%',
            }}
            priority
            quality={90}
          />
        </div>
        
        {/* Elegant Gradient Overlay */}
        <div 
          className="absolute inset-0 z-[1]"
          style={{
            background: 'linear-gradient(135deg, rgba(135, 28, 28, 0.85) 0%, rgba(135, 28, 28, 0.70) 30%, rgba(231, 196, 24, 0.45) 70%, rgba(135, 28, 28, 0.85) 100%)',
          }}
        />
        
        {/* Additional subtle overlay for depth */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-b from-black/25 via-transparent to-black/35" />
        
        {/* Radial gradient accents for elegance */}
        <div 
          className="absolute inset-0 z-[1]"
          style={{
            background: 'radial-gradient(ellipse at top right, rgba(231, 196, 24, 0.2) 0%, transparent 60%)',
          }}
        />
        <div 
          className="absolute bottom-0 right-0 w-96 h-96 z-[1]"
          style={{
            background: 'radial-gradient(circle, rgba(231, 196, 24, 0.15) 0%, transparent 70%)',
          }}
        />
        
        {/* Decorative corner flourish */}
        <div className="absolute top-0 right-0 w-32 h-32 opacity-10 z-10">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 0C100 55.228 55.228 100 0 100" stroke="#E7C418" strokeWidth="2"/>
            <path d="M100 20C100 64.183 64.183 100 20 100" stroke="#E7C418" strokeWidth="1.5"/>
            <path d="M100 40C100 73.137 73.137 100 40 100" stroke="#E7C418" strokeWidth="1"/>
          </svg>
        </div>
        
        {/* Content */}
        <div className="relative z-10">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-block uppercase text-sm font-semibold tracking-widest text-[#E7C418] mb-4"
          >
            Programs & Events
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-6 max-w-3xl"
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.4)',
            }}
          >
            Where Women Rise
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-white/90 font-light max-w-2xl"
            style={{
              textShadow: '0 1px 4px rgba(0,0,0,0.3)',
            }}
          >
            Connection, learning, and leadership in motion.
          </motion.p>
        </div>
        
        {/* Bottom decorative line */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E7C418]/50 to-transparent z-10" />
      </div>

      {/* Intro Content */}
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="max-w-4xl mx-auto text-center"
        >
          <p className="text-lg md:text-xl text-neutral-700 leading-relaxed mb-6">
            WON Foundation offers a comprehensive range of programs designed to empower, connect, and recognize women leaders. From interactive mentoring sessions to networking events and our annual WONder Woman banquet, we provide opportunities for growth, connection, and celebration.
          </p>
          <p className="text-lg md:text-xl text-neutral-700 leading-relaxed">
            Our programs are designed to be fun, engaging, and interactive—creating spaces where women can step into their power, advocate for themselves, and support one another in their leadership journeys.
          </p>
        </motion.div>

        {/* Stats/Quick Facts Strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6"
        >
          {[
            { number: "20+", label: "Events Per Year", icon: "✦" },
            { number: "1000+", label: "Women Connected", icon: "✦" },
            { number: "25+", label: "Years of Impact", icon: "✦" },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 + index * 0.1 }}
              className="relative group"
            >
              <div className="card-premium p-6 text-center">
                <span className="text-[#E7C418] text-sm mb-2 block">{stat.icon}</span>
                <div className="text-3xl md:text-4xl font-heading font-bold text-primary mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-neutral-600 uppercase tracking-wider font-medium">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}
