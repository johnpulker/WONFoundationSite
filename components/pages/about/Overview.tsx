"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Button from "@/components/ui/Button";
import IconLeadership from "@/components/icons/IconLeadership";
import IconNetworking from "@/components/icons/IconNetworking";
import IconAward from "@/components/icons/IconAward";

const cards = [
  {
    title: "Leadership Mentoring",
    description: "Interactive sessions designed to help women claim leadership and self-advocate with confidence.",
    href: "/programs-events#mentoring",
    icon: IconLeadership,
  },
  {
    title: "Networking & Events",
    description: "Training sessions and networking opportunities that connect trailblazing women leaders.",
    href: "/programs-events#events",
    icon: IconNetworking,
  },
  {
    title: "WONder Women Awards",
    description: "Celebrating the courage and leadership of women who step forward to make a difference.",
    href: "/wonder-women",
    icon: IconAward,
  },
];

export default function Overview() {
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

      {/* Section Header with Accent */}
      <div className="mb-12">
        <div className="mb-4">
          <span className="text-xs uppercase tracking-[0.15em] text-primary font-semibold">
            How We Create Leaders
          </span>
        </div>
        <div className="h-[1px] w-20 bg-accent mb-6"></div>
        <h2 className="text-5xl md:text-6xl font-heading text-primary mb-10 leading-tight font-bold">
          How We Create Leaders
        </h2>
        <p className="text-lg md:text-xl text-neutral-600 max-w-2xl font-light">
          We empower women through mentorship, connection, and recognition.
        </p>
      </div>

      {/* Cards Grid - Styled for About Page */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {cards.map((card, index) => {
          const Icon = card.icon;
          
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ 
                duration: 0.6, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full rounded-card p-6 md:p-8 shadow-card"
                style={{
                  background: 'rgba(255,255,255,0.95)',
                  border: '1px solid rgba(135, 28, 28, 0.1)',
                }}
              >
                <div className="h-full flex flex-col group transition-all duration-300">
                  {/* Icon with badge circle */}
                  <motion.div
                    className="mb-6 text-primary group-hover:text-accent transition-colors duration-300 relative flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="absolute w-20 h-20 rounded-full bg-primary/5 group-hover:bg-accent/10 transition-colors duration-300" />
                    <div className="relative z-10">
                      <Icon className="w-16 h-16" />
                    </div>
                  </motion.div>

                  {/* Title */}
                  <h3 className="font-heading text-primary mb-4 font-bold text-xl">
                    {card.title}
                  </h3>

                  {/* Description */}
                  <p className="text-neutral-700 mb-6 flex-grow leading-relaxed font-light text-sm">
                    {card.description}
                  </p>

                  {/* CTA Button */}
                  <Link href={card.href} className="mt-auto group">
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        variant="primary"
                        className="w-full"
                      >
                        <span className="flex items-center justify-center gap-2">
                          Explore Programs
                          <svg
                            className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </Button>
                    </motion.div>
                  </Link>
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}







