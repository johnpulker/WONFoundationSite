"use client";

import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import Link from "next/link";
import Image from "next/image";

export default function MembershipTeaser() {
  return (
    <section className="py-24 md:py-32 lg:py-40 relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src="/diverse.jpg"
          alt=""
          fill
          className="object-cover"
          priority
        />
      </div>
      
      {/* Elegant Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/85 via-primary/80 to-primary/90" />
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="max-w-3xl mx-auto text-center"
        >
          {/* Headline with gold accent underline */}
          <div className="relative mb-8">
            <h2 
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6"
              style={{
                fontFamily: 'var(--font-cursive)',
              }}
            >
              Join a Network of Empowered Women
            </h2>
            {/* Gold accent line under headline */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-0.5 bg-accent" />
          </div>
          
          {/* Value statement - 2 lines with proper spacing */}
          <p className="text-xl md:text-2xl text-white/90 font-light italic leading-relaxed mb-12 max-w-2xl mx-auto">
            Connections that champion your rise.
          </p>
          
          {/* Enhanced buttons with better sizing and spacing */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <Link href="/membership">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  variant="gold" 
                  size="lg"
                  className="shadow-lg hover:shadow-xl px-10 py-4 text-lg"
                >
                  Become a Member
                </Button>
              </motion.div>
            </Link>
            <Link href="/membership#levels">
              <motion.div
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="text-white border-2 border-white hover:bg-white hover:text-[#871c1c] px-10 py-4 text-lg"
                >
                  Learn More
                </Button>
              </motion.div>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

