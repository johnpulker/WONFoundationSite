"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export default function SponsorHero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative"
    >
      {/* Top Flourish */}
      <div className="flex justify-center mb-6">
        <svg className="w-12 h-12 text-accent/50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M12 2c-2 0-4 1-5 3-1-2-3-3-5-3v8c0 5 5 10 10 10s10-5 10-10V2c-2 0-4 1-5 3-1-2-3-3-5-3z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8c1 2 3 3 4 3s3-1 4-3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
        </svg>
      </div>

      {/* Section Label */}
      <div className="mb-4">
        <span className="text-xs uppercase tracking-[0.15em] text-primary font-semibold">
          40th Anniversary Celebration
        </span>
      </div>
      <div className="h-[1px] w-20 bg-accent mb-6"></div>

      <h2 className="text-5xl md:text-6xl font-heading text-primary mb-10 leading-tight font-bold">
        Sponsorships
      </h2>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-start">

        {/* Left — Flyer Image */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="flex justify-center"
        >
          <div className="rounded-2xl overflow-hidden shadow-xl border border-neutral-200 w-full max-w-sm">
            <Image
              src="/wonder-woman-awards-2026.png"
              alt="WONder Woman Awards 2026 — 40th Anniversary Award Dinner"
              width={600}
              height={800}
              className="w-full h-auto object-cover"
            />
          </div>
        </motion.div>

        {/* Right — Intro text */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex flex-col justify-center gap-6"
        >
          <p className="text-lg text-neutral-700 leading-relaxed">
            We&apos;re turning back the clock and turning up the excitement as we celebrate the{" "}
            <strong className="text-primary">40th Anniversary of the WONder Woman Awards</strong> —
            and we would LOVE for you to join us again as a sponsor!
          </p>

          <p className="text-lg text-neutral-700 leading-relaxed">
            Because of your incredible support, the Women Officials Network Foundation (WON) continues
            to empower, educate, and uplift women through free leadership training, mentoring, and
            professional development programs throughout the year. Your partnership truly makes a
            difference!
          </p>

          <p className="text-lg text-neutral-700 leading-relaxed">
            Now it&apos;s time to celebrate <strong className="text-primary">FOUR fabulous decades of impact</strong>…
            and we&apos;re doing it BIG — with an unforgettable 80s-themed evening full of fun,
            inspiration, music, and purpose!
          </p>

          {/* Event Details */}
          <div className="bg-primary/5 border border-primary/15 rounded-2xl p-6 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-accent mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </span>
              <p className="text-neutral-800 font-medium">Thursday, October 8, 2026 &nbsp;·&nbsp; 5:30 PM</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </span>
              <p className="text-neutral-800">
                Regency Manor Banquet Center<br />
                25228 W. 12 Mile Road, Southfield, MI 48034
              </p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-accent mt-1">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </span>
              <div className="text-neutral-800">
                <p className="font-medium mb-1">This year&apos;s celebration will recognize:</p>
                <ul className="list-disc list-inside space-y-1 text-neutral-700">
                  <li>40 WONder Woman Alumni</li>
                  <li>40 Women &ldquo;Wired to Be WONder Women&rdquo;</li>
                </ul>
              </div>
            </div>
          </div>

          <p className="text-neutral-600 italic text-base">
            Get ready to rock your best 80s attire, and party with a purpose — all while supporting
            programs that help women rise into leadership roles across our communities. As a nonprofit
            501(c)(3), all proceeds directly support WONF programs that provide mentoring, advocacy,
            training, and access for women and girls striving to lead.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
