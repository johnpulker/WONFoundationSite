"use client";

import { motion } from "framer-motion";

export default function History() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Top Flourish - Elegant Leaf Cluster */}
      <div className="flex justify-center mb-4">
        <svg className="w-10 h-10 text-accent/50" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path d="M12 2c-2 0-4 1-5 3-1-2-3-3-5-3v8c0 5 5 10 10 10s10-5 10-10V2c-2 0-4 1-5 3-1-2-3-3-5-3z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M8 8c1 2 3 3 4 3s3-1 4-3" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
        </svg>
      </div>

      <div className="max-w-4xl">
        {/* Our ROOTS Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-6"
        >
          {/* Section Header - Matching Our Legacy style but bigger */}
          <div className="mb-6">
            <div className="mb-4">
              <span className="text-lg md:text-xl lg:text-2xl uppercase tracking-[0.15em] text-primary font-semibold">
                Our ROOTS
              </span>
            </div>
            <div className="h-[1px] w-32 md:w-40 lg:w-48 bg-accent mb-4"></div>
          </div>
          <p className="text-lg md:text-xl text-neutral-700 leading-relaxed">
            The Women Officials Network (WON), a non-profit, non-partisan organization, was founded in 1997 by then State Representative Patricia &ldquo;Pan&rdquo; Godchaux and her district liaison, Barbara Moorhouse. Created with a bold vision, WON began as a platform to encourage, support, and elevate women seeking elected and appointed leadership roles. In its early years, WON hosted quarterly networking breakfasts that brought together women leaders from across the state. These gatherings featured dynamic speakers and meaningful opportunities to connect, collaborate, and inspire. Speakers included Justices of the Michigan Supreme Court, Secretaries of State, School superintendents, Authors, and other influential leaders who helped shape Michigan&apos;s civic landscape.
          </p>
        </motion.div>

        {/* Our REACH Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6"
        >
          {/* Section Header - Matching Our Legacy style but bigger */}
          <div className="mb-6">
            <div className="mb-4">
              <span className="text-lg md:text-xl lg:text-2xl uppercase tracking-[0.15em] text-primary font-semibold">
                Our REACH
              </span>
            </div>
            <div className="h-[1px] w-32 md:w-40 lg:w-48 bg-accent mb-4"></div>
          </div>
          <p className="text-lg md:text-xl text-neutral-700 leading-relaxed">
            In 2008, the Women Officials Network Foundation (WONF), a 501(c)(3) organization, was established to oversee and expand the mission of the signature WONder Woman Awards Banquet, celebrating women who exemplify leadership and service. Beyond celebration, the Foundation invested in programming and training that strengthened the network and supported women on their leadership journeys. As momentum grew, the two organizations consolidated into the Women Officials Network Foundation in 2018—reimagining a shared mission, vision, and purpose. What began as celebration grew into impact, advancing more women into leadership, with an emphasis on public leadership.
          </p>
        </motion.div>

        {/* Our RISING Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          {/* Section Header - Matching Our Legacy style but bigger */}
          <div className="mb-6">
            <div className="mb-4">
              <span className="text-lg md:text-xl lg:text-2xl uppercase tracking-[0.15em] text-primary font-semibold">
                Our RISING
              </span>
            </div>
            <div className="h-[1px] w-32 md:w-40 lg:w-48 bg-accent mb-4"></div>
          </div>
          <p className="text-lg md:text-xl text-neutral-700 leading-relaxed">
            WONF is focused on the future—advancing more women into leadership. Our growing membership represents a wide range of professions and lived experiences, strengthening the depth and reach of our network. As WONF continues to expand, we are connecting thousands of women to the resources, tools, and support needed to lead with confidence and purpose. Looking ahead, we will continue to focus on those aspiring to serve in public and civic roles, in addition to those who are exploring leadership opportunities. We are aligning our infrastructure and capacity to match our commitment to community impact. The future of WONF is one of empowered women, informed leadership, and lasting change.
          </p>
        </motion.div>

        {/* Our Philosophy Section - Styled Pull Quote */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative my-6 p-8 bg-gradient-to-br from-primary/5 via-primary/10 to-accent/10 rounded-2xl border-l-4 border-accent"
        >
          <div className="absolute top-6 left-6 text-6xl text-primary/10 font-heading leading-none">
            &ldquo;
          </div>
          <p 
            className="text-3xl md:text-4xl text-primary italic leading-relaxed relative z-10"
            style={{
              fontFamily: 'var(--font-cursive)',
            }}
          >
            Our &ldquo;One WONF&rdquo; philosophy reflects our commitment to unity, support, and 
            collective empowerment.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <div className="h-1 w-20 bg-accent"></div>
            <span className="text-sm uppercase tracking-wider text-primary font-semibold">
              Our Philosophy
            </span>
          </div>
        </motion.div>

        {/* Philosophy Follow-up Paragraph */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <p className="text-lg md:text-xl text-neutral-700 leading-relaxed">
            We celebrate the courage of women who step forward to make a difference, whether 
            through running for office, taking on leadership roles, or mentoring others. Our 
            community is built on the foundation of mutual support and the belief that together, 
            we are stronger.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}


