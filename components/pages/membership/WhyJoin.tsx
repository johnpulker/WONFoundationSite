"use client";

import { motion } from "framer-motion";

const levels = [
  {
    name: "General",
    displayName: "General Membership",
    price: "$35",
    period: "per year",
    description: "Collaborate with women who share our vision. A network of experienced leaders at all levels of public service. Support and mentor women who serve in the public sector.",
    features: [
      "Premium training and programs",
      "Access to the Membership Directory",
      "Reduced price for networking breakfasts, workshops and other WONF events",
      "Timely notification of additional resources and events",
    ],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
  {
    name: "Sustaining",
    displayName: "Sustaining Membership",
    price: "$100",
    period: "per year",
    description: "Support WONF's long-term strategies to advance women in leadership.",
    features: [
      "All General Membership Benefits",
      "Sneak peeks to special events",
      "Acknowledgement of additional support in the membership directory",
      "Acknowledgement of additional support on the website",
    ],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    name: "Youth",
    displayName: "Youth Membership",
    price: "$10",
    period: "per year",
    description: "For college and high school students. 25 years of age and under.",
    features: [
      "All General Membership Benefits",
    ],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

const benefits = [
  {
    title: "Leadership Development",
    description: "Access exclusive mentoring programs and transformative leadership training designed for women who lead.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    title: "Networking Circles",
    description: "Connect with trailblazing women leaders and build relationships that open doors and create opportunities.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    title: "Recognition & Awards",
    description: "Be celebrated at our WONder Women banquet and join a legacy of honored women achievers.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
  {
    title: "Exclusive Events",
    description: "Attend member-only galas, workshops, and intimate gatherings that create lasting memories.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Community & Support",
    description: "Join a sisterhood that champions your success and stands beside you in every chapter of your journey.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
  {
    title: "Resources & Growth",
    description: "Access curated tools, guides, and insights that fuel your personal and professional evolution.",
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

export default function WhyJoin() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Hero Banner */}
      <div className="section-banner mb-16">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-40 h-40 opacity-10">
          <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="70" cy="30" r="25" stroke="#E7C418" strokeWidth="1"/>
            <circle cx="70" cy="30" r="18" stroke="#E7C418" strokeWidth="1"/>
            <circle cx="70" cy="30" r="10" stroke="#E7C418" strokeWidth="1"/>
          </svg>
        </div>
        
        <div className="absolute bottom-0 left-0 w-32 h-32 opacity-10">
          <svg viewBox="0 0 100 100" fill="none">
            <path d="M0 100 Q 50 50 100 100" stroke="#E7C418" strokeWidth="1" fill="none"/>
            <path d="M10 100 Q 50 60 90 100" stroke="#E7C418" strokeWidth="1" fill="none"/>
          </svg>
        </div>
        
        <div className="relative z-10 text-center max-w-3xl mx-auto">
          <motion.span 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-block uppercase text-sm font-semibold tracking-widest text-[#E7C418] mb-4"
          >
            Membership Benefits
          </motion.span>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-6"
          >
            Join the Movement
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-xl md:text-2xl text-white/80 font-light"
          >
            Empowered women empower women.
          </motion.p>
        </div>
        
        {/* Bottom decorative wave */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#E7C418]/40 to-transparent" />
      </div>

      {/* Choose Your Path Section */}
      <div className="relative mb-16">
        {/* Background pattern */}
        <div className="absolute inset-0 -mx-4 sm:-mx-6 lg:-mx-8 section-gradient-mauve rounded-3xl" />
        
        <div className="relative py-12">
          {/* Mission Statement */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center mb-8"
          >
            <p className="text-xl md:text-2xl text-neutral-700 font-medium max-w-3xl mx-auto">
              Join us in our mission to empower women leaders of today and mentor women leaders of tomorrow!
            </p>
          </motion.div>

          {/* Section Header */}
          <div className="text-center mb-8">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="text-3xl md:text-4xl lg:text-5xl font-heading text-primary mb-6"
            >
              MEMBERSHIP LEVELS
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-base md:text-lg text-neutral-600 max-w-3xl mx-auto mb-2"
            >
              All memberships are for 1 year; from July 1st thru June 30th
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              className="text-sm md:text-base text-neutral-600 max-w-3xl mx-auto mb-8"
            >
              <span className="font-semibold text-primary">Added Bonus:</span> New members joining January through June, of the current year, membership will be through June 30th of the following year.
            </motion.p>
          </div>

          {/* Ready to Unlock Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="text-center mb-12"
          >
            <p className="text-2xl md:text-3xl font-heading text-primary mb-4">
              Ready to unlock your potential?
            </p>
            <p className="text-lg md:text-xl text-neutral-700 mb-6">
              Explore Membership Levels
            </p>
          </motion.div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {levels.map((level, index) => (
              <motion.div
                key={level.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                className="relative"
              >
                <div className="h-full rounded-2xl overflow-hidden transition-all duration-300 bg-white shadow-xl hover:shadow-2xl">
                  <div className="p-8">
                    {/* Icon */}
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-6 bg-gradient-to-br from-[#871c1c]/10 to-[#E7C418]/10">
                      <span className="text-[#871c1c]">
                        {level.icon}
                      </span>
                    </div>
                    
                    {/* Name & Price */}
                    <h3 className="text-2xl font-heading mb-2 text-primary">
                      {level.displayName}
                    </h3>
                    
                    <div className="mb-4">
                      <span className="text-5xl font-heading font-bold text-primary">
                        {level.price}
                      </span>
                      <span className="ml-2 text-neutral-500">
                        {level.period}
                      </span>
                    </div>
                    
                    {/* Description */}
                    <p className="mb-6 leading-relaxed text-neutral-600">
                      {level.description}
                    </p>
                    
                    {/* Divider */}
                    <div className="h-px mb-6 bg-gradient-to-r from-transparent via-neutral-200 to-transparent" />
                    
                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                      {level.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <span className="inline-flex items-center justify-center w-5 h-5 rounded-full mr-3 flex-shrink-0 mt-0.5 bg-gradient-to-br from-[#E7C418] to-[#C9A814]">
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span className="text-neutral-700">
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    {/* CTA Button */}
                    <button
                      onClick={() => {
                        // Set the level in URL and scroll to join section
                        const url = new URL(window.location.href);
                        url.searchParams.set('level', level.name);
                        window.history.pushState({}, '', url);
                        
                        const joinSection = document.getElementById("join");
                        if (joinSection) {
                          joinSection.scrollIntoView({ behavior: "smooth", block: "start" });
                        }
                      }}
                      className="w-full py-4 rounded-lg font-semibold text-lg transition-all duration-300 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white shadow-md hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Select {level.name}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Introduction */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="text-center mb-16 max-w-3xl mx-auto"
      >
        <p className="text-lg md:text-xl text-neutral-700 leading-relaxed">
          Join a network of <span className="font-semibold text-[#871c1c]">extraordinary women</span> who are 
          making a difference in their communities. Our members gain access to exclusive programs, events, 
          and resources designed to support their <span className="font-semibold text-[#871c1c]">leadership journey</span>.
        </p>
      </motion.div>

      {/* Benefits Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {benefits.map((benefit, index) => (
          <motion.div
            key={benefit.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 * index }}
            className="group"
          >
            <div className="card-premium h-full p-8 relative overflow-hidden">
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#871c1c]/5 to-[#E7C418]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon */}
              <div className="relative z-10 w-14 h-14 rounded-xl bg-gradient-to-br from-[#871c1c] to-[#6b1515] flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <span className="text-[#E7C418]">{benefit.icon}</span>
              </div>
              
              {/* Content */}
              <h3 className="relative z-10 text-xl font-heading text-primary mb-3 group-hover:text-[#6b1515] transition-colors">
                {benefit.title}
              </h3>
              
              <p className="relative z-10 text-neutral-600 leading-relaxed">
                {benefit.description}
              </p>
              
              {/* Corner accent */}
              <div className="absolute bottom-0 right-0 w-16 h-16 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
                  <path d="M64 64 L64 32 Q64 64 32 64 Z" fill="url(#goldGrad)" opacity="0.1"/>
                  <defs>
                    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E7C418"/>
                      <stop offset="100%" stopColor="#C9A814"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
