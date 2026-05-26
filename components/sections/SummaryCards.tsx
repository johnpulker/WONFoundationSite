"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function SummaryCards() {
  return (
    <section className="py-20 md:py-32 lg:py-40 bg-[#F4F5F9]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header - Centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-12"
        >
          <div className="mb-6">
            <span 
              className="text-5xl md:text-6xl lg:text-7xl xl:text-8xl text-primary font-bold"
              style={{
                fontFamily: 'var(--font-cursive)',
              }}
            >
              Who We Are
            </span>
          </div>
          <div className="h-[1px] w-20 bg-accent mx-auto mb-6"></div>
        </motion.div>
      </div>

      {/* Main Content - Full Width White Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="bg-white shadow-lg"
        >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Left Column - Text Content */}
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
            <p className="text-2xl md:text-3xl lg:text-4xl text-neutral-700 leading-relaxed text-left">
              The Women Officials Network Foundation (WONF) is dedicated to{" "}
              <span className="font-semibold text-primary">empowering women leaders</span> of today 
              and <span className="font-semibold text-primary">mentoring women leaders</span> of tomorrow.{" "}
              Through our programs, events, and community, 
              we create opportunities for women to step into their power and make a difference.{" "}
              Our foundation provides <span className="font-semibold">leadership development</span>, 
              networking opportunities, recognition through our{" "}
              <span className="font-semibold text-primary">WONder Women awards</span>, and a{" "}
              <span className="italic">supportive community that champions women</span> in public service and leadership roles.
            </p>
          </div>

          {/* Right Column - Photo Collage with Glowy Borders */}
          <div className="p-8 md:p-12 lg:p-16 flex items-center justify-center relative">
            <div className="relative w-full max-w-2xl">
              {/* First Photo - kids.jpg */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                whileInView={{ opacity: 1, scale: 1, rotate: -2 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative h-64 md:h-80 lg:h-96 w-full mb-6 md:mb-8 z-10"
                style={{
                  border: '4px solid transparent',
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #E7C418, #F0D43A, #E7C418, #C9A814) border-box',
                  boxShadow: '0 0 20px rgba(231, 196, 24, 0.5), 0 0 40px rgba(231, 196, 24, 0.3), inset 0 0 10px rgba(231, 196, 24, 0.2)',
                  transform: 'rotate(-2deg)',
                }}
              >
                <Image
                  src="/kids.jpg"
                  alt="Women Officials Network Foundation"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </motion.div>

              {/* Second Photo - Pinkdress.JPG */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 2 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="relative h-64 md:h-80 lg:h-96 w-full -mt-6 md:-mt-8 ml-auto z-20"
                style={{
                  border: '4px solid transparent',
                  background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, #E7C418, #F0D43A, #E7C418, #C9A814) border-box',
                  boxShadow: '0 0 20px rgba(231, 196, 24, 0.5), 0 0 40px rgba(231, 196, 24, 0.3), inset 0 0 10px rgba(231, 196, 24, 0.2)',
                  transform: 'rotate(2deg)',
                  maxWidth: '90%',
                }}
              >
                <Image
                  src="/Pinkdress.JPG"
                  alt="Women Officials Network Foundation"
                  fill
                  className="object-contain"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
        </motion.div>
      </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

