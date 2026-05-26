"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function DEIStatement() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Top Flourish */}
      <div className="flex justify-center mb-6">
        <svg className="w-12 h-12 text-accent/50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M12 2c-2 0-4 1-5 3-1-2-3-3-5-3v8c0 5 5 10 10 10s10-5 10-10V2c-2 0-4 1-5 3-1-2-3-3-5-3z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8c1 2 3 3 4 3s3-1 4-3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
        </svg>
      </div>

      {/* Section Header */}
      <div className="mb-12">
        <div className="mb-4">
          <span className="text-xs uppercase tracking-[0.15em] text-primary font-semibold">
            Our Commitment
          </span>
        </div>
        <div className="h-[1px] w-20 bg-accent mb-6"></div>
        <h2 className="text-5xl md:text-6xl font-heading text-primary mb-10 leading-tight font-bold">
          Diversity, Equity, and Inclusion Statement
        </h2>
      </div>

      {/* Statement Content */}
      <div className="bg-white rounded-2xl p-8 md:p-12 shadow-md border border-neutral-200">
        <div className="max-w-4xl mx-auto">
          <p 
            className="text-lg md:text-xl text-neutral-700 leading-relaxed mb-8 italic"
            style={{
              fontFamily: 'var(--font-cursive)',
            }}
          >
            The Women Official&apos;s Network Foundation is committed to diversity, equity, and inclusion as we carry out our mission to empower women leaders of today and mentor women leaders of tomorrow. As a membership body, our strength is our promise to be inclusive, with intentional strategies to welcome and uplift all women. Creating a culture of equality for all women who aspire to leadership roles isn&apos;t just the right thing to do, it&apos;s also the smart thing to do. To be engaged, you must feel included. We strive to build and nurture a culture where inclusiveness is a reflex, not an initiative. When there is a deep sense of pride, passion, equality, and belonging, we render better results. We respect and value diverse life experiences and heritages and ensure that all voices are valued and heard. We&apos;re better when we&apos;re equal!
          </p>
          
          {/* Bylaws Button */}
          <div className="flex justify-center mt-8 pt-8 border-t border-neutral-200">
            <Link
              href="/bylaws"
              className="inline-flex items-center gap-3 px-10 py-4 text-lg bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <span>Bylaws</span>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

