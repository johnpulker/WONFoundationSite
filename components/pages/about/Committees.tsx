"use client";

import { motion } from "framer-motion";
import React from "react";
import Image from "next/image";

interface Committee {
  name: string;
  description: string;
  type: 'standing' | 'special';
  icon: React.ReactElement;
}

const committees: Committee[] = [
  {
    name: "Program Committee",
    description: "Responsible for planning the quarterly networking breakfast meetings and other networking events and work with the Training Subcommittee to provide training opportunities for women in the public arena.",
    type: 'standing',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    name: "Development Committee",
    description: "Work with the WONder Woman Banquet Subcommittee and any other fund-raising, grants, and development activities.",
    type: 'standing',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    name: "Leadership Committee",
    description: "At large members responsible for membership recruitment, engagement and retention. Elected members responsible for the nominations process for the Board of Directors and Leadership Committee members.",
    type: 'standing',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    name: "Leadership Development (Mentoring) Committee",
    description: "Build youth partnerships with focus on teens and young adults. Establish mentoring and embellish existing partnerships with Lawrence Tech University, Alternative for Girls, the Girl Scouts, various school districts, colleges, and community groups.",
    type: 'special',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
];

export default function Committees() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Top Flourish - Elegant Leaf Cluster */}
      <div className="flex justify-center mb-6">
        <svg className="w-12 h-12 text-accent/50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M12 2c-2 0-4 1-5 3-1-2-3-3-5-3v8c0 5 5 10 10 10s10-5 10-10V2c-2 0-4 1-5 3-1-2-3-3-5-3z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8c1 2 3 3 4 3s3-1 4-3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
        </svg>
      </div>

      {/* Section Header */}
      <div className="mb-8">
        <div className="mb-3">
          <span className="text-xs uppercase tracking-[0.15em] text-primary font-semibold">
            Get Involved
          </span>
        </div>
        <div className="h-[1px] w-20 bg-accent mb-4"></div>
        <h2 className="text-5xl md:text-6xl font-heading text-primary mb-6 leading-tight font-bold">
          Committees
        </h2>
      </div>

      {/* Standing Committees */}
      <div className="mb-8">
        <h3 className="text-2xl md:text-3xl font-heading text-primary mb-6 pb-3 border-b-2 border-accent/30">
          Standing Committees
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {committees
            .filter(committee => committee.type === 'standing')
            .map((committee, index) => (
              <motion.div
                key={committee.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div className="relative h-full bg-white rounded-2xl p-6 shadow-md hover:shadow-lg transition-all duration-300 border border-neutral-200 hover:border-primary/20 overflow-hidden">
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="mb-4 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      {committee.icon}
                    </div>
                    
                    {/* Title */}
                    <h3 className="text-xl md:text-2xl font-heading text-primary mb-3 leading-tight group-hover:text-primary-dark transition-colors">
                      {committee.name}
                    </h3>
                    
                    {/* Accent Line */}
                    <div className="h-1 w-16 bg-accent mb-4"></div>
                    
                    {/* Description */}
                    <p className="text-neutral-700 leading-relaxed text-sm md:text-base">
                      {committee.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>

      {/* Special Committees */}
      <div className="mb-8">
        <h3 className="text-2xl md:text-3xl font-heading text-primary mb-6 pb-3 border-b-2 border-accent/30 text-center">
          Special Committees
        </h3>
        <div className="flex justify-center">
          <div className="w-full max-w-6xl">
            {committees
              .filter(committee => committee.type === 'special')
              .map((committee, index) => (
                <motion.div
                  key={committee.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  {committee.name === "Leadership Development (Mentoring) Committee" ? (
                    /* Special layout for Mentoring Committee with text on left and image on right */
                    <div className="relative h-full w-full">
                      <div className="flex flex-col md:flex-row gap-8 items-stretch">
                        {/* Text Content Box - Left Side */}
                        <div className="flex-1 bg-white rounded-2xl p-8 md:p-10 lg:p-12 shadow-lg border border-neutral-200/50 hover:border-primary/30 transition-all duration-300 flex flex-col justify-between">
                          <div>
                            {/* Icon */}
                            <div className="mb-6 w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center text-primary shadow-sm">
                              {committee.icon}
                            </div>
                            
                            {/* Title */}
                            <h3 className="text-2xl md:text-3xl lg:text-4xl font-heading text-primary mb-4 leading-tight font-bold">
                              {committee.name}
                            </h3>
                            
                            {/* Accent Line */}
                            <div className="h-1 w-20 bg-gradient-to-r from-accent to-accent/60 mb-6"></div>
                            
                            {/* Description */}
                            <p className="text-neutral-700 leading-relaxed text-base md:text-lg lg:text-xl">
                              {committee.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Image - Right Side */}
                        <div className="flex-shrink-0 w-full md:w-96 lg:w-[450px] rounded-2xl overflow-hidden shadow-lg border border-neutral-200/50 hover:shadow-xl transition-all duration-300">
                          <div className="relative w-full h-full min-h-[300px] md:min-h-[450px] bg-neutral-50">
                            <Image
                              src="/mentoringpic.jpg"
                              alt="Mentoring"
                              fill
                              className="object-contain p-3"
                              sizes="(max-width: 768px) 100vw, 450px"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Standard layout for other committees */
                    <div className="relative h-full bg-white rounded-2xl p-8 md:p-10 shadow-md hover:shadow-lg transition-all duration-300 border border-neutral-200 hover:border-primary/20 overflow-hidden">
                      <div className="relative z-10">
                        {/* Icon */}
                        <div className="mb-6 w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                          {committee.icon}
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-2xl md:text-3xl font-heading text-primary mb-4 leading-tight group-hover:text-primary-dark transition-colors">
                          {committee.name}
                        </h3>
                        
                        {/* Accent Line */}
                        <div className="h-1 w-20 bg-accent mb-6"></div>
                        
                        {/* Description */}
                        <p className="text-neutral-700 leading-relaxed text-base md:text-lg">
                          {committee.description}
                        </p>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="mt-6 pt-6 border-t border-neutral-200"
      >
        <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
          <h3 className="text-2xl md:text-3xl font-heading text-primary mb-4">
            Interested in Joining a Committee?
          </h3>
          <p className="text-lg text-neutral-700 leading-relaxed mb-4">
            We&apos;d love to have you join one of our committees! Whether you&apos;re interested in program planning, development, leadership, or mentoring partnerships, there&apos;s a place for you.
          </p>
          <p className="text-lg text-neutral-700 leading-relaxed mb-4">
            For more information or to sign up for a committee, please{" "}
            <a 
              href="mailto:administrator@wonfoundation.net" 
              className="text-primary font-semibold hover:text-primary-dark underline transition-colors"
            >
              email administrator@wonfoundation.net
            </a>
            {" "}or{" "}
            <a 
              href="/contact?subject=Committees" 
              className="text-primary font-semibold hover:text-primary-dark underline transition-colors"
            >
              complete the contact form
            </a>
            .
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}







