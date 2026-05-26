"use client";

import { motion } from "framer-motion";

const levels = [
  {
    name: "General",
    displayName: "General Membership",
    price: "$50",
    period: "per year",
    description: "Full access to all WON Foundation programs, events, and the community you deserve.",
    features: [
      "Access to all events & programs",
      "Leadership mentoring sessions",
      "Networking opportunities",
      "Member directory access",
      "Monthly newsletter",
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
    description: "Elevated membership for women who want to make a deeper impact and receive premium recognition.",
    features: [
      "All General Membership benefits",
      "Priority event registration",
      "Recognition in annual report",
      "Exclusive sustaining member events",
      "VIP networking opportunities",
      "Special appreciation gifts",
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
    price: "$25",
    period: "per year",
    description: "Invest in the next generation of women leaders. For students and young professionals under 25.",
    features: [
      "All General Membership benefits",
      "Student-friendly pricing",
      "Personalized mentorship matching",
      "Career development resources",
      "Youth-focused events & workshops",
    ],
    icon: (
      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

export default function MembershipLevels() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 -mx-4 sm:-mx-6 lg:-mx-8 section-gradient-mauve rounded-3xl" />
      
      <div className="relative">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest text-[#C9A814] uppercase mb-4"
          >
            <span className="w-8 h-px bg-[#E7C418]" />
            Investment in You
            <span className="w-8 h-px bg-[#E7C418]" />
          </motion.span>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-3xl md:text-4xl lg:text-5xl font-heading text-primary mb-4"
          >
            Choose Your Path
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="text-lg text-neutral-600 max-w-2xl mx-auto"
          >
            Every level opens doors to connection, growth, and celebration.
          </motion.p>
        </div>

        {/* Ready to Unlock Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
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

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm text-neutral-500"
        >
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#E7C418]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Secure Payment</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#E7C418]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Instant Activation</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-[#E7C418]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>501(c)(3) Non-Profit</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
