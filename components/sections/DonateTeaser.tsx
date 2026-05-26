"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

export default function DonateTeaser() {
  return (
    <section className="pt-20 md:pt-32 lg:pt-40 pb-12 md:pb-16 relative overflow-hidden">
      {/* Background Image - Grayscale and Faint */}
      <div className="absolute inset-0 opacity-20">
        <Image
          src="/group.jpg"
          alt=""
          fill
          className="object-cover grayscale"
          priority
        />
      </div>
      
      {/* Elegant Sky Blue Gradient overlay - Lighter */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-400/30 via-blue-300/25 to-cyan-200/30" />
      
      {/* Subtle abstract feminine line art - multiple decorative elements */}
      <div className="absolute top-0 right-8 w-80 h-80 opacity-[0.08] pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          <path
            d="M50 100 Q100 50, 150 100 T250 100"
            stroke="#871c1c"
            strokeWidth="2"
            className="transform -rotate-12"
          />
          <circle cx="100" cy="100" r="30" stroke="#871c1c" strokeWidth="1.5" />
        </svg>
      </div>
      
      {/* Additional decorative element - top left */}
      <div className="absolute top-20 left-12 w-64 h-64 opacity-[0.06] pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          <circle cx="50" cy="120" r="25" stroke="#871c1c" strokeWidth="1.5" />
          <path
            d="M30 120 Q20 80, 50 50 Q80 20, 120 40"
            stroke="#871c1c"
            strokeWidth="2"
            className="transform rotate-45"
          />
        </svg>
      </div>
      
      {/* Additional decorative element - bottom right */}
      <div className="absolute bottom-16 right-16 w-72 h-72 opacity-[0.07] pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          <circle cx="150" cy="50" r="28" stroke="#871c1c" strokeWidth="1.5" />
          <path
            d="M130 50 Q110 30, 90 50 Q70 70, 90 90 Q110 110, 130 90"
            stroke="#871c1c"
            strokeWidth="2"
            className="transform -rotate-30"
          />
        </svg>
      </div>
      
      {/* Additional decorative element - center left */}
      <div className="absolute top-1/2 left-8 -translate-y-1/2 w-56 h-56 opacity-[0.05] pointer-events-none">
        <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
          <circle cx="40" cy="100" r="20" stroke="#871c1c" strokeWidth="1.5" />
          <path
            d="M20 100 Q10 60, 40 30 Q70 0, 110 20"
            stroke="#871c1c"
            strokeWidth="2"
          />
        </svg>
      </div>
      
      {/* Brand color band behind CTA area */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-primary/5 to-transparent" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Premium headline */}
          <h2 
            className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-primary mb-6"
            style={{
              fontFamily: 'var(--font-cursive)',
            }}
          >
            Change Starts Here
          </h2>
          
          {/* Impactful, emotional copy */}
          <div className="space-y-4 mb-8">
            <p className="text-xl md:text-2xl text-neutral-700 leading-relaxed font-light">
              Your support cultivates leaders, training, programs, and mentorship.
            </p>
            <p className="text-lg md:text-xl text-neutral-600 italic font-light mb-6">
              Every contribution, big or small, drives real change.
            </p>
          </div>
          
          {/* CTA centered */}
          <div className="flex justify-center items-center mb-6">
            <Link href="/donate">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  variant="gold" 
                  size="lg"
                  className="rounded-full px-12 py-5 text-xl font-semibold hover:!bg-accent-dark transition-all duration-200"
                  style={{
                    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)"
                  }}
                >
                  <span className="flex items-center gap-2">
                    Donate Now
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </span>
                </Button>
              </motion.div>
            </Link>
          </div>
          
          {/* Micro reassurance for trust building */}
          <p className="text-base md:text-lg text-neutral-500 font-light">
            All donations are secure and tax-deductible.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

