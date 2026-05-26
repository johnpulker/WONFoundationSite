"use client";

import { motion } from "framer-motion";
import Image from "next/image";

const benefits = [
  { 
    text: "Confidence-building strategies that unlock your potential",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    )
  },
  { 
    text: "Self-advocacy techniques for the boardroom and everyday life",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    )
  },
  { 
    text: "Leadership development tools from industry experts",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    )
  },
  { 
    text: "Networking opportunities with accomplished women",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    )
  },
  { 
    text: "Mentor connections that elevate your career and life goals",
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
      </svg>
    )
  },
];

export default function LeadershipMentoring() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Section Header with Gradient Strip */}
      <div className="relative mb-12">
        {/* Background accent */}
        <div className="absolute -left-4 md:-left-8 top-0 bottom-0 w-full max-w-3xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#871c1c]/5 via-[#E7C418]/5 to-transparent rounded-r-3xl" />
        </div>
        
        <div className="relative py-8 pl-4 md:pl-8">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#871c1c] to-[#6b1515] mb-4 shadow-lg"
          >
            <svg className="w-6 h-6 text-[#E7C418]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
            </svg>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl font-heading text-primary mb-3"
          >
        Leadership Mentoring
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-lg text-[#C9A814] font-medium"
          >
            Unlock confidence. Build presence. Lead boldly.
          </motion.p>
          
          {/* Gold underline */}
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="h-0.5 w-20 bg-gradient-to-r from-[#E7C418] to-[#F0D43A] mt-4 origin-left"
          />
        </div>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Card - Step Into Your Power */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="card-premium p-8 md:p-10"
        >
          {/* Card Header */}
          <div className="flex items-start gap-4 mb-6">
            <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[#871c1c]/10 to-[#E7C418]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#871c1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-2xl font-heading text-primary">
            Everyone Has A Leader In Them
          </h3>
          </div>
          
          <p className="text-neutral-700 leading-relaxed mb-5">
            Our leadership development and self-advocacy programs are designed to help you 
            embrace leadership with confidence. Learn practical strategies to{" "}
            <span className="font-semibold text-[#871c1c]">unlock your potential</span> and 
            emerge the leader in you!
          </p>
          
          <p className="text-neutral-700 leading-relaxed">
            These sessions are fun, engaging, and interactive, featuring{" "}
            <span className="font-semibold text-[#871c1c]">inspiring speakers</span>{" "}
            who share real-world insights and actionable advice. Our passion for youth development aims to bring empowerment, diversity, inclusion, and to create safe spaces where you feel welcomed to be you!
          </p>
          
          {/* Decorative corner */}
          <div className="absolute bottom-4 right-4 w-16 h-16 opacity-10">
            <svg viewBox="0 0 64 64" fill="none">
              <circle cx="48" cy="48" r="12" stroke="#E7C418" strokeWidth="1"/>
              <circle cx="48" cy="48" r="8" stroke="#E7C418" strokeWidth="1"/>
            </svg>
          </div>
        </motion.div>

        {/* Right Card - What You'll Gain */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="card-premium p-8 md:p-10"
        >
          {/* Card Header with plum accent */}
          <div className="bg-gradient-to-r from-[#871c1c] to-[#a02323] -mx-8 md:-mx-10 -mt-8 md:-mt-10 px-8 md:px-10 py-6 mb-8 rounded-t-xl">
            <h3 className="text-2xl font-heading text-white flex items-center gap-3">
              <span className="text-[#E7C418]">✦</span>
            What You&apos;ll Gain
          </h3>
          </div>
          
          <ul className="space-y-4">
            {benefits.map((benefit, index) => (
              <motion.li 
                key={index}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-start group"
              >
                <span className="gold-check mt-0.5">
                  {benefit.icon}
                </span>
                <span className="text-neutral-700 group-hover:text-neutral-900 transition-colors">
                  {benefit.text}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>
      </div>

      {/* Image Below Containers */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="mt-8 flex justify-center"
      >
        <div className="rounded-lg overflow-hidden shadow-md max-w-2xl w-full">
          <Image
            src="/circle.jpg"
            alt="Leadership Development"
            width={600}
            height={400}
            className="h-auto object-cover w-full"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
