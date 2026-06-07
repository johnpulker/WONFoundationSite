"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import PayPalButton from "@/components/paypal/PayPalButton";

interface Tier {
  id: string;
  name: string;
  amount: number;
  amountLabel: string;
  color: string;
  accentColor: string;
  benefits: string[];
  buttonLabel: string;
}

const tiers: Tier[] = [
  {
    id: "shero",
    name: "SHERO",
    amount: 25000,
    amountLabel: "$25,000",
    color: "from-[#871c1c] to-[#a02323]",
    accentColor: "#871c1c",
    benefits: [
      "Company name on event signage",
      "Logo on all video screens",
      "Company name on all video screens",
      "Prominent event seating at 3 tables, tickets for 30 guests",
      "Company name on 3 tables",
      "Featured on WON Foundation website",
      "Logo on photo booth backdrop",
      "4 WON Foundation annual memberships",
    ],
    buttonLabel: "Purchase SHERO Level Sponsorship",
  },
  {
    id: "herstory",
    name: "HERSTORY",
    amount: 10000,
    amountLabel: "$10,000",
    color: "from-[#5a1a6e] to-[#7a2490]",
    accentColor: "#5a1a6e",
    benefits: [
      "Company name on event signage",
      "Logo on all video screens",
      "Company name on all video screens",
      "Prominent event seating at 2 tables, tickets for 20 guests",
      "Company name on 2 tables",
      "3 WON Foundation memberships",
    ],
    buttonLabel: "Purchase HERSTORY Level Sponsorship",
  },
  {
    id: "leading-lady",
    name: "LEADING LADY",
    amount: 5000,
    amountLabel: "$5,000",
    color: "from-[#C9A814] to-[#E7C418]",
    accentColor: "#C9A814",
    benefits: [
      "Company name on event signage",
      "Logo on all video screens",
      "Company name on all video screens",
      "Prominent event seating at 1 table, tickets for 10 guests",
      "Company name at 1 table",
      "2 WON Foundation annual memberships",
    ],
    buttonLabel: "Purchase LEADING LADY Level Sponsorship",
  },
  {
    id: "girl-power",
    name: "GIRL POWER",
    amount: 2500,
    amountLabel: "$2,500",
    color: "from-[#1a5c8a] to-[#2478b0]",
    accentColor: "#1a5c8a",
    benefits: [
      "Company name on event signage",
      "Tickets for 5 guests",
      "Company name on half table",
      "1 WON Foundation annual membership",
    ],
    buttonLabel: "Purchase GIRL POWER Level Sponsorship",
  },
];

function TierCard({ tier, index }: { tier: Tier; index: number }) {
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (details: any) => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error: dbError } = await supabase.from("payments").insert({
      user_id: user?.id || null,
      amount: tier.amount,
      status: "completed",
      provider: "paypal",
      provider_tx_id: details.id,
      type: "sponsorship",
      membership_level: tier.name,
    });

    if (dbError) {
      console.error("Sponsorship payment record error:", dbError);
    }

    setSuccess(true);
  };

  const handleError = (err: any) => {
    console.error("PayPal error:", err);
    setError("Payment could not be completed. Please try again or contact us.");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className="flex flex-col bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-neutral-200 overflow-hidden"
    >
      {/* Tier Header */}
      <div className={`bg-gradient-to-br ${tier.color} p-6 text-white`}>
        <p className="text-xs uppercase tracking-[0.15em] font-semibold text-white/70 mb-1">
          Sponsorship Level
        </p>
        <h3 className="text-3xl font-heading font-bold mb-1">{tier.name}</h3>
        <p className="text-2xl font-bold text-white/90">{tier.amountLabel}</p>
      </div>

      {/* Benefits */}
      <div className="flex-1 p-6">
        <p className="text-xs uppercase tracking-[0.12em] font-semibold text-neutral-400 mb-4">
          What&apos;s Included
        </p>
        <ul className="space-y-3 mb-6">
          {tier.benefits.map((benefit, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-neutral-700">
              <svg
                className="w-4 h-4 mt-0.5 flex-shrink-0"
                style={{ color: tier.accentColor }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {benefit}
            </li>
          ))}
        </ul>
      </div>

      {/* PayPal Button Area */}
      <div className="px-6 pb-6">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-green-50 border border-green-200 rounded-xl text-center"
            >
              <p className="text-green-800 font-semibold text-sm">
                🎉 Thank you for your sponsorship!
              </p>
              <p className="text-green-700 text-xs mt-1">
                We&apos;ll be in touch with next steps shortly.
              </p>
            </motion.div>
          ) : (
            <motion.div key="paypal">
              {error && (
                <p className="text-red-600 text-xs mb-3 text-center">{error}</p>
              )}
              <p className="text-xs text-neutral-500 text-center mb-3 font-medium">
                {tier.buttonLabel}
              </p>
              <PayPalButton
                amount={tier.amount}
                description={`${tier.name} Sponsorship — WONder Woman Awards 2026`}
                onSuccess={handleSuccess}
                onError={handleError}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default function SponsorshipTiers() {
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

      {/* Section Header */}
      <div className="mb-4">
        <span className="text-xs uppercase tracking-[0.15em] text-primary font-semibold">
          Sponsorship Impact
        </span>
      </div>
      <div className="h-[1px] w-20 bg-accent mb-6"></div>
      <h2 className="text-5xl md:text-6xl font-heading text-primary mb-6 leading-tight font-bold">
        Sponsorship Impact
      </h2>
      <p className="text-lg md:text-xl text-neutral-600 max-w-3xl mb-12 font-light leading-relaxed">
        We invite you to help us celebrate 40 years of remarkable service and honoring women who
        serve in leadership. Your sponsorship will further enable WON Foundation to do the work we
        love. Proceeds from this event will support two primary initiatives:{" "}
        <strong className="text-primary font-semibold">Leadership Development &amp; Training Programs</strong>.
      </p>

      {/* Four-column tier grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {tiers.map((tier, index) => (
          <TierCard key={tier.id} tier={tier} index={index} />
        ))}
      </div>
    </motion.div>
  );
}
