"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
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
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "check">("paypal");
  const [submittingCheck, setSubmittingCheck] = useState(false);
  const [isCheckPayment, setIsCheckPayment] = useState(false);
  const [checkName, setCheckName] = useState("");
  const [checkEmail, setCheckEmail] = useState("");

  const handleSuccess = async (details: any) => {
    // Extract payer info from PayPal details (available even for guest checkouts)
    const payerFirstName = details?.payer?.name?.given_name || "";
    const payerLastName = details?.payer?.name?.surname || "";
    const payerName = [payerFirstName, payerLastName].filter(Boolean).join(" ") || null;
    const payerEmail = details?.payer?.email_address || null;

    // Record payment via server-side API (bypasses RLS)
    try {
      const res = await fetch("/api/sponsorships/record-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: details.id,
          tierName: tier.name,
          amount: tier.amount,
          payerName,
          payerEmail,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Sponsorship payment record error:", errBody);
      }
    } catch (err) {
      console.error("Sponsorship payment record error:", err);
    }

    // Send confirmation email to sponsor + admin notification (fire and forget)
    if (payerEmail) {
      fetch("/api/sponsorships/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payerName,
          payerEmail,
          tierName: tier.name,
          amount: tier.amount,
          transactionId: details.id,
          transactionDate: new Date().toISOString(),
        }),
      }).catch((err) =>
        console.error("Failed to send sponsorship confirmation email:", err)
      );
    }

    setSuccess(true);
  };

  const handleError = (err: any) => {
    console.error("PayPal error:", err);
    setError("Payment could not be completed. Please try again or contact us.");
  };

  const handleCheckSubmit = async () => {
    if (!checkName.trim() || !checkEmail.trim()) {
      setError("Please enter your name and email address.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(checkEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setSubmittingCheck(true);
    setError(null);

    try {
      const checkOrderId = `CHECK-SPON-${Date.now()}`;

      // Record pending sponsorship payment via server-side API
      const res = await fetch("/api/sponsorships/record-payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId: checkOrderId,
          tierName: tier.name,
          amount: tier.amount,
          payerName: checkName.trim(),
          payerEmail: checkEmail.trim(),
          status: "pending",
          provider: "admin",
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Sponsorship check payment record error:", errBody);
        throw new Error("We were unable to record your sponsorship pledge. Please try again or contact support.");
      }

      // Send confirmation email with check payment instructions
      fetch("/api/sponsorships/send-confirmation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payerName: checkName.trim(),
          payerEmail: checkEmail.trim(),
          tierName: tier.name,
          amount: tier.amount,
          transactionId: checkOrderId,
          transactionDate: new Date().toISOString(),
          paymentMethod: "check",
        }),
      }).catch((err) =>
        console.error("Failed to send sponsorship check confirmation email:", err)
      );

      setIsCheckPayment(true);
      setSuccess(true);
    } catch (err: any) {
      console.error("Error handling check sponsorship payment:", err);
      setError(err.message || "Failed to record check payment. Please contact support.");
    } finally {
      setSubmittingCheck(false);
    }
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

      {/* Payment Area */}
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
                {isCheckPayment
                  ? "Thank you for your sponsorship pledge!"
                  : "🎉 Thank you for your sponsorship!"}
              </p>
              <p className="text-green-700 text-xs mt-1">
                {isCheckPayment
                  ? "Please mail your check within 7 days. We'll be in touch with next steps shortly."
                  : "We'll be in touch with next steps shortly."}
              </p>
            </motion.div>
          ) : (
            <motion.div key="payment">
              {error && (
                <p className="text-red-600 text-xs mb-3 text-center">{error}</p>
              )}
              <p className="text-xs text-neutral-500 text-center mb-3 font-medium">
                {tier.buttonLabel}
              </p>

              {/* Payment Method Toggle */}
              <div className="flex gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => { setPaymentMethod("paypal"); setError(null); }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    paymentMethod === "paypal"
                      ? "bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white shadow-md"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  Pay Online
                </button>
                <button
                  type="button"
                  onClick={() => { setPaymentMethod("check"); setError(null); }}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                    paymentMethod === "check"
                      ? "bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white shadow-md"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  Mail a Check
                </button>
              </div>

              {paymentMethod === "paypal" ? (
                <PayPalButton
                  amount={tier.amount}
                  description={`${tier.name} Sponsorship — WONder Woman Awards 2026`}
                  onSuccess={handleSuccess}
                  onError={handleError}
                />
              ) : (
                <div className="space-y-3">
                  {/* Name & Email fields */}
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Your Name</label>
                    <input
                      type="text"
                      value={checkName}
                      onChange={(e) => setCheckName(e.target.value)}
                      placeholder="Full name"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#871c1c]/30 focus:border-[#871c1c]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-neutral-600 mb-1">Your Email</label>
                    <input
                      type="email"
                      value={checkEmail}
                      onChange={(e) => setCheckEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#871c1c]/30 focus:border-[#871c1c]"
                    />
                  </div>

                  {/* Mailing instructions */}
                  <div className="p-3 rounded-xl bg-neutral-50 border border-dashed border-neutral-300 text-sm text-neutral-700 text-left">
                    <p className="font-semibold mb-1">Mail your check within 7 days to:</p>
                    <p className="text-xs">
                      Women Officials Network Foundation<br />
                      6725 Daly Road, Ste 252572,<br />
                      West Bloomfield, MI 48325
                    </p>
                    <p className="mt-2 text-xs text-neutral-600">
                      Make payable to <strong>Women Officials Network Foundation</strong>. Please include your name and
                      note that this is for your <strong>{tier.name}</strong> sponsorship so we can match your check.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleCheckSubmit}
                    disabled={submittingCheck}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
                  >
                    {submittingCheck ? "Recording Sponsorship Pledge..." : "Record Sponsorship to be Paid by Check"}
                  </button>
                  <p className="text-xs text-neutral-500 text-center">
                    We allow 7 days for receipt of checks. Your sponsorship will be fully confirmed after your check is received.
                  </p>
                </div>
              )}
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
