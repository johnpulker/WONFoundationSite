"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function BylawsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#faf8f5] to-[#f6f3ef]">
      {/* Background Pattern */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-5">
        <div 
          className="w-full h-full bg-repeat"
          style={{
            backgroundImage: 'url(/goldenvines.png)',
            backgroundSize: 'auto',
            backgroundPosition: 'center',
          }}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <Link
            href="/about#dei"
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary transition-colors group"
          >
            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to About</span>
          </Link>
        </motion.div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-neutral-100"
        >
          {/* Header Section */}
          <div className="relative bg-gradient-to-br from-[#871c1c] to-[#a02323] p-8 md:p-12">
            {/* Decorative Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div 
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 20px 20px, white 2px, transparent 2px)`,
                  backgroundSize: '40px 40px'
                }}
              />
            </div>

            <div className="relative z-10 text-center">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold text-white mb-4">
                Bylaws
              </h1>
              <p className="text-white/90 text-lg">
                Women Official&apos;s Network Foundation
              </p>
            </div>
          </div>

          {/* PDF Section */}
          <div className="p-8 md:p-12">
            <div className="max-w-3xl mx-auto text-center">
              {/* Decorative Divider */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#E7C418]" />
                <div className="w-2 h-2 rounded-full bg-[#E7C418]" />
                <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#E7C418]" />
              </div>

              {/* PDF Viewer/Download */}
              <div className="bg-neutral-50 rounded-2xl p-8 border-2 border-dashed border-neutral-200 mb-8">
                <div className="mb-6">
                  <svg className="w-16 h-16 mx-auto text-primary mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h2 className="text-2xl font-heading text-primary mb-2">WONF Bylaws</h2>
                  <p className="text-neutral-600">View or download the official bylaws document</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="/wonf-bylaws.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>View PDF</span>
                  </a>
                  <a
                    href="/wonf-bylaws.pdf"
                    download="wonf-bylaws.pdf"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-primary text-primary font-semibold rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>

              {/* Embedded PDF Viewer */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200">
                <iframe
                  src="/wonf-bylaws.pdf"
                  className="w-full h-[600px] md:h-[800px] rounded-lg"
                  title="WONF Bylaws PDF"
                />
              </div>
            </div>
          </div>

          {/* Footer Accent */}
          <div className="h-2 bg-gradient-to-r from-[#871c1c] to-[#a02323]" />
        </motion.div>
      </div>
    </div>
  );
}

