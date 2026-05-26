"use client";

import { motion } from "framer-motion";

const steps = [
  {
    number: "01",
    title: "Choose Your Level",
    description: "Select the membership tier that aligns with your goals and aspirations.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Create Your Profile",
    description: "Sign up with your email and build your secure member profile in minutes.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Complete Payment",
    description: "Pay securely via PayPal. Your membership activates instantly.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  {
    number: "04",
    title: "Begin Your Journey",
    description: "Access your portal, register for events, and connect with your new community.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
];

export default function HowItWorks() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Section Header */}
      <div className="text-center mb-16">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="inline-block text-sm font-semibold tracking-widest text-[#C9A814] uppercase mb-4"
        >
          ✦ Simple Process ✦
        </motion.span>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl lg:text-5xl font-heading text-primary mb-4"
        >
          Your Path to Membership
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-lg text-neutral-600 max-w-2xl mx-auto"
        >
          Four simple steps to join our community of empowered women.
        </motion.p>
        
        {/* Decorative underline */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="w-24 h-0.5 bg-gradient-to-r from-[#E7C418] to-[#F0D43A] mx-auto mt-6"
        />
      </div>

      {/* Timeline Steps - Desktop */}
      <div className="hidden lg:block relative">
        {/* Connecting line */}
        <div className="absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-[#E7C418]/20 via-[#871c1c]/20 to-[#E7C418]/20" />
        
        <div className="grid grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.15 }}
              className="relative text-center"
            >
              {/* Step Number Circle */}
              <div className="relative inline-block mb-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-white to-neutral-50 shadow-xl flex items-center justify-center relative z-10 border-4 border-white">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#871c1c] to-[#6b1515] flex flex-col items-center justify-center">
                    <span className="text-[#E7C418] mb-1">{step.icon}</span>
                    <span className="text-2xl font-heading font-bold text-white">{step.number}</span>
                  </div>
                </div>
                
                {/* Connecting dot on the line */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#E7C418] shadow-lg z-20" style={{ top: '100%', marginTop: '-8px' }} />
              </div>
              
              {/* Content */}
              <h3 className="text-xl font-heading text-primary mb-3">
                {step.title}
              </h3>
              <p className="text-neutral-600 leading-relaxed px-4">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline Steps - Mobile/Tablet */}
      <div className="lg:hidden">
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#E7C418]/30 via-[#871c1c]/30 to-[#E7C418]/30" />
          
          <div className="space-y-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                className="relative flex items-start gap-6 pl-4"
              >
                {/* Step Circle */}
                <div className="relative flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#871c1c] to-[#6b1515] flex items-center justify-center shadow-lg z-10 relative">
                    <span className="text-[#E7C418]">{step.icon}</span>
                  </div>
                  {/* Dot on line */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[#E7C418]" />
                </div>
                
                {/* Content Card */}
                <div className="flex-grow card-premium p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-bold text-[#E7C418] tracking-wider">
                      STEP {step.number}
                    </span>
                  </div>
                  <h3 className="text-xl font-heading text-primary mb-2">
                    {step.title}
                  </h3>
                  <p className="text-neutral-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="text-center mt-16"
      >
        <div className="inline-flex items-center gap-4 px-8 py-4 bg-gradient-to-r from-[#871c1c]/5 to-[#E7C418]/5 rounded-full">
          <span className="text-[#E7C418] text-xl">⏱</span>
          <p className="text-neutral-700">
            <span className="font-semibold text-[#871c1c]">Less than 5 minutes</span> to complete your registration
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
