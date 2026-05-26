"use client";

import { motion, AnimatePresence } from "framer-motion";
import PayPalButton from "@/components/paypal/PayPalButton";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";

export const dynamic = 'force-dynamic';

const amounts = [25, 50, 100, 250, 500, 1000];

const impactAreas = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Leadership Programs",
    description: "Support mentoring and training programs that help women step into their power and lead with confidence.",
    color: "from-[#871c1c] to-[#a02323]",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    title: "Recognition & Awards",
    description: "Help us celebrate and honor the courage of women who make a difference in their communities.",
    color: "from-[#E7C418] to-[#C9A814]",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Community Building",
    description: "Fund networking events and create opportunities that connect trailblazing women across generations.",
    color: "from-[#a02323] to-[#871c1c]",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
    title: "Future Leaders",
    description: "Invest in the next generation of women leaders through scholarships, mentorship, and support.",
    color: "from-[#C9A814] to-[#E7C418]",
  },
];

function DonatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [isMonthly, setIsMonthly] = useState(false);
  const [dedicationType, setDedicationType] = useState<"none" | "honor" | "memory">("none");
  const [dedicationName, setDedicationName] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "check">("paypal");
  const [submittingCheck, setSubmittingCheck] = useState(false);
  const [isCheckPayment, setIsCheckPayment] = useState(false);

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true);
    }
  }, [searchParams]);

  const handlePaymentSuccess = async (details: any) => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount) return;

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Extract email from PayPal response or use form email
    const payerEmail = details.payer?.email_address || donorEmail || null;
    const payerName = details.payer?.name?.given_name || details.payer?.name?.full_name || donorName || "Generous Donor";

    // Create payment record
    const { error } = await supabase
      .from("payments")
      .insert({
        user_id: user?.id || null,
        amount: amount,
        status: "completed",
        provider: "paypal",
        provider_tx_id: details.id,
        type: "donation",
      });

    if (error) {
      console.error("Payment record error:", error);
      return;
    }

    // Send thank you email if email is available
    let emailSentSuccess = false;
    if (payerEmail) {
      try {
        const response = await fetch('/api/donate/send-thank-you', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: payerEmail,
            name: payerName,
            amount: amount,
            orderId: details.id,
            dedicationType: dedicationType !== "none" ? dedicationType : null,
            dedicationName: dedicationType !== "none" ? dedicationName : null,
          }),
        });

        if (response.ok) {
          emailSentSuccess = true;
        } else {
          console.error('Failed to send thank you email');
        }
      } catch (error) {
        console.error('Error sending thank you email:', error);
        // Don't fail the payment if email fails
      }
    }

    setEmailSent(emailSentSuccess);
    setIsCheckPayment(false);
    setShowSuccess(true);
  };

  const handleCheckDonation = async () => {
    const amount = selectedAmount || parseFloat(customAmount);
    if (!amount || amount <= 0) {
      alert("Please enter a donation amount.");
      return;
    }
    if (!donorName.trim() || !donorEmail.trim()) {
      alert("Please enter your name and email so we can record your check donation.");
      return;
    }

    setSubmittingCheck(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      const checkOrderId = `CHECK-DON-${Date.now()}`;

      const { error: paymentError } = await supabase
        .from("payments")
        .insert({
          user_id: user?.id || null,
          amount,
          status: "pending",
          provider: "admin",
          provider_tx_id: checkOrderId,
          type: "donation",
        });

      if (paymentError) {
        console.error("Check payment record error:", paymentError);
        alert("We were unable to record your check donation. Please try again or contact support.");
        return;
      }

      // Notify admin that a check donation has been pledged
      try {
        await fetch("/api/donate/check-notification", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: donorName,
            email: donorEmail,
            amount,
            orderId: checkOrderId,
          }),
        });
      } catch (err) {
        console.error("Failed to send admin check notification:", err);
      }

      setIsCheckPayment(true);
      setShowSuccess(true);
    } finally {
      setSubmittingCheck(false);
    }
  };

  const finalAmount = selectedAmount || parseFloat(customAmount) || 0;

  if (showSuccess) {
  return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-lg w-full"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl">
            {/* Top gradient band */}
            <div className="h-2 bg-gradient-to-r from-[#871c1c] via-[#E7C418] to-[#871c1c]" />
            
            <div className="p-10 text-center">
              {/* Success animation */}
              <div className="relative w-28 h-28 mx-auto mb-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring" }}
                  className="absolute inset-0 bg-gradient-to-br from-[#E7C418]/20 to-[#871c1c]/20 rounded-full"
                />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute inset-2 bg-gradient-to-br from-[#E7C418] to-[#C9A814] rounded-full flex items-center justify-center shadow-lg"
                >
                  <motion.svg 
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="w-14 h-14 text-white" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </motion.svg>
                </motion.div>
              </div>
              
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-3xl md:text-4xl font-heading text-primary mb-4">
                  Thank You!
                </h2>
                <p className="text-xl text-neutral-600 mb-2">
                  Your generosity makes a difference.
                </p>
                {isCheckPayment ? (
                  <div className="text-neutral-600 mb-8 space-y-2">
                    <p>
                      We&apos;ve recorded your pledge to donate by check. Please mail your check within 7 days to:
                    </p>
                    <p className="font-medium">
                      Women Officials Network Foundation<br />
                      6725 Daly Road, Ste 252572,<br />
                      West Bloomfield, MI 48325
                    </p>
                  </div>
                ) : (
                  emailSent && (
                  <p className="text-neutral-500 mb-8">
                    A thank you email with your donation receipt has been sent to your inbox.
                  </p>
                  )
                )}
                
                {/* Decorative stars */}
                <div className="flex justify-center gap-3 mb-8">
                  <span className="text-[#E7C418] text-xl">✦</span>
                  <span className="text-[#871c1c] text-lg">✦</span>
                  <span className="text-[#E7C418] text-xl">✦</span>
                </div>
                
                <button
                  onClick={() => router.push("/")}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
                >
                  <span>Return Home</span>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, #871c1c 0%, #6b1515 40%, #871c1c 70%, #a02323 100%)`
          }}
        />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Gold radial */}
          <div 
            className="absolute top-0 right-0 w-[600px] h-[600px]"
            style={{
              background: "radial-gradient(circle at center, rgba(212, 175, 55, 0.15) 0%, transparent 60%)"
            }}
          />
          
          {/* Pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, #E7C418 1px, transparent 1px)`,
                backgroundSize: '32px 32px'
              }}
            />
          </div>
          
          {/* Floating hearts */}
          <div className="absolute top-20 left-10 text-[#E7C418]/20 text-6xl animate-pulse">♥</div>
          <div className="absolute bottom-20 right-20 text-[#E7C418]/10 text-8xl">♥</div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#E7C418] to-[#C9A814] mb-8 shadow-2xl"
          >
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </motion.div>
          
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="block uppercase text-sm font-semibold tracking-[0.3em] text-[#E7C418] mb-5"
          >
            Make a Difference
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-6"
          >
            Give the Gift of Empowerment
          </motion.h1>
          
          {/* Gold divider */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div className="h-px w-16 bg-[#E7C418]/40" />
            <div className="h-1 w-24 bg-gradient-to-r from-[#E7C418] to-[#F0D43A]" />
            <div className="h-px w-16 bg-[#E7C418]/40" />
          </motion.div>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-xl md:text-2xl text-white/85 font-light max-w-3xl mx-auto"
          >
            Your donation helps us empower women leaders of today and mentor 
            women leaders of tomorrow.
          </motion.p>
        </div>
        
        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-12 md:h-16">
            <path 
              d="M0,60 C300,120 600,0 900,60 C1050,90 1150,60 1200,60 L1200,120 L0,120 Z" 
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Impact Areas */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <div className="text-center mb-10">
            <span className="inline-block text-sm font-semibold tracking-widest text-[#C9A814] uppercase mb-3">
              Your Impact
            </span>
            <h2 className="text-3xl md:text-4xl font-heading text-primary">
              Where Your Donation Goes
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {impactAreas.map((area, index) => (
              <motion.div
                key={area.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="h-full relative overflow-hidden rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-neutral-100">
                  {/* Top accent */}
                  <div className={`h-1.5 bg-gradient-to-r ${area.color}`} />
                  
                  <div className="p-6">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${area.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-white">{area.icon}</span>
                    </div>
                    
                    <h3 className="text-lg font-heading font-bold text-primary mb-2">
                      {area.title}
                    </h3>
                    <p className="text-sm text-neutral-600 leading-relaxed">
                      {area.description}
              </p>
            </div>
                </div>
              </motion.div>
            ))}
            </div>
        </motion.div>

        {/* Donation Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto"
        >
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-neutral-100">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#871c1c] to-[#a02323] p-8 text-center">
              <h2 className="text-2xl md:text-3xl font-heading text-white mb-2">
                Choose Your Gift
              </h2>
              <p className="text-white/80">
                Every contribution makes a difference
              </p>
            </div>
            
            <div className="p-8">
              {/* Amount Selection */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-neutral-700 mb-4 uppercase tracking-wider">
            Select Amount
                </label>
                <div className="grid grid-cols-3 gap-3">
            {amounts.map((amount) => (
              <button
                key={amount}
                onClick={() => {
                  setSelectedAmount(amount);
                  setCustomAmount("");
                }}
                      className={`relative p-4 rounded-xl font-heading font-bold text-xl transition-all duration-300 ${
                  selectedAmount === amount
                          ? "bg-gradient-to-br from-[#871c1c] to-[#a02323] text-white shadow-lg scale-105"
                          : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border-2 border-transparent hover:border-[#E7C418]/30"
                }`}
              >
                ${amount}
                      {selectedAmount === amount && (
                        <motion.div
                          layoutId="selectedAmount"
                          className="absolute -top-1 -right-1 w-5 h-5 bg-[#E7C418] rounded-full flex items-center justify-center"
                        >
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </motion.div>
                      )}
              </button>
            ))}
          </div>
              </div>
              
              {/* Custom Amount */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wider">
                  Or Enter Custom Amount
            </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-heading text-neutral-400">$</span>
            <input
              type="number"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setSelectedAmount(null);
              }}
                    placeholder="0"
                    className="w-full pl-10 pr-4 py-4 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-4 focus:ring-[#E7C418]/10 transition-all text-2xl font-heading text-center bg-neutral-50 focus:bg-white"
            />
          </div>
              </div>

              {/* Optional Email Field */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Email (Optional for online payments, required for check donations)
                </label>
                <p className="text-xs text-neutral-500 mb-2">
                  Leave blank for anonymous donation. If provided, we will send you a thank you email and receipt.
                </p>
                <input
                  type="email"
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                />
              </div>

              {/* Donor Name (used for check payments and emails) */}
              <div className="mb-8">
                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all"
                />
              </div>

              {/* Dedication Option */}
              <div className="mb-8 p-4 bg-gradient-to-r from-[#871c1c]/5 to-[#E7C418]/5 rounded-xl">
                <label className="block text-sm font-semibold text-neutral-700 mb-3">
                  Make this gift special (optional)
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {[
                    { id: "none", label: "No Dedication" },
                    { id: "honor", label: "In Honor Of" },
                    { id: "memory", label: "In Memory Of" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setDedicationType(option.id as any)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        dedicationType === option.id
                          ? "bg-[#871c1c] text-white"
                          : "bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <AnimatePresence>
                  {dedicationType !== "none" && (
                    <motion.input
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      type="text"
                      value={dedicationName}
                      onChange={(e) => setDedicationName(e.target.value)}
                      placeholder={dedicationType === "honor" ? "Honoree's name" : "Name of loved one"}
                      className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:border-[#E7C418] focus:ring-2 focus:ring-[#E7C418]/20 transition-all mt-2"
                    />
                  )}
                </AnimatePresence>
              </div>

              {/* Payment Section */}
              <AnimatePresence>
                {finalAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="border-t-2 border-dashed border-neutral-200 pt-6"
                  >
                    {/* Total */}
                    <div className="flex justify-between items-center mb-6 p-4 bg-gradient-to-r from-[#E7C418]/10 to-[#871c1c]/10 rounded-xl">
                      <span className="text-lg font-semibold text-neutral-700">Your Gift:</span>
                      <span className="text-4xl font-heading font-bold text-primary">
                        ${finalAmount}
                      </span>
                    </div>
                    
                    {/* Tax info */}
                    <p className="text-center text-sm text-neutral-500 mb-6">
                      <span className="text-[#E7C418]">✦</span> WON Foundation is a 501(c)(3) organization. Your donation is tax-deductible.
                    </p>
                    
                    {/* Payment method selection */}
                    <div className="mb-6">
                      <p className="text-sm font-semibold text-neutral-700 mb-2">
                        Payment Method
                      </p>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("paypal")}
                          className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                            paymentMethod === "paypal"
                              ? "border-[#871c1c] bg-[#871c1c]/5 text-[#871c1c]"
                              : "border-neutral-200 text-neutral-600 hover:border-[#E7C418]/60"
                          }`}
                        >
                          Pay Online (Card / PayPal)
                        </button>
                        <button
                          type="button"
                          onClick={() => setPaymentMethod("check")}
                          className={`flex-1 px-4 py-3 rounded-lg border text-sm font-medium transition-all ${
                            paymentMethod === "check"
                              ? "border-[#871c1c] bg-[#871c1c]/5 text-[#871c1c]"
                              : "border-neutral-200 text-neutral-600 hover:border-[#E7C418]/60"
                          }`}
                        >
                          Mail a Check
                        </button>
                      </div>
                    </div>
                    
                    {/* Payment UI */}
                    {paymentMethod === "paypal" ? (
                    <div className="rounded-xl overflow-hidden">
              <PayPalButton
                        amount={finalAmount}
                        description={
                          dedicationType !== "none" && dedicationName
                            ? `Donation to WON Foundation - ${dedicationType === "honor" ? "In Honor of" : "In Memory of"} ${dedicationName}`
                            : "Donation to WON Foundation"
                        }
                onSuccess={handlePaymentSuccess}
                onError={(error) => {
                  console.error("PayPal error:", error);
                  alert("Payment failed. Please try again.");
                }}
              />
            </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 rounded-xl bg-neutral-50 border border-dashed border-neutral-300 text-sm text-neutral-700 text-left">
                          <p className="font-semibold mb-2">Mail your check within 7 days to:</p>
                          <p>
                            Women Officials Network Foundation<br />
                            6725 Daly Road, Ste 252572,<br />
                            West Bloomfield, MI 48325
                          </p>
                          <p className="mt-3 text-neutral-600">
                            Please include your name and note that this is a donation to WON Foundation so we can match your check
                            to this pledge.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={handleCheckDonation}
                          disabled={submittingCheck}
                          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {submittingCheck ? "Recording Pledge..." : "Submit Check Donation"}
                        </button>
                      </div>
                    )}
                    
                    {/* Security note */}
                    <div className="mt-6 flex items-center justify-center gap-4 text-xs text-neutral-400">
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                        Secure Payment
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        PayPal Protected
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Other Ways to Give */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 text-center"
        >
          <h3 className="text-2xl font-heading text-primary mb-6">Other Ways to Support</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {[
              { 
                icon: "👥", 
                title: "Become a Member", 
                description: "Join our community of empowered women",
                link: "/membership"
              },
              { 
                icon: "📧", 
                title: "Contact Us", 
                description: "Learn about corporate giving & legacy gifts",
                link: "/contact"
              },
            ].map((item, index) => (
              <motion.a
                key={item.title}
                href={item.link}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-neutral-100"
              >
                <span className="text-4xl mb-4 block">{item.icon}</span>
                <h4 className="font-heading font-bold text-primary mb-2 group-hover:text-[#E7C418] transition-colors">
                  {item.title}
                </h4>
                <p className="text-sm text-neutral-600">{item.description}</p>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#871c1c]/5 via-[#E7C418]/10 to-[#871c1c]/5 rounded-3xl" />
          
          <div className="relative p-10 md:p-14 text-center">
            <span className="text-6xl text-[#E7C418] font-heading leading-none">&ldquo;</span>
            <blockquote className="text-xl md:text-2xl text-neutral-700 font-heading italic max-w-3xl mx-auto -mt-4">
              When you invest in a woman, you invest in her family, her community, 
              and the future of us all.
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-3">
              <div className="w-12 h-px bg-[#E7C418]" />
              <span className="text-sm text-[#871c1c] font-semibold uppercase tracking-wider">WON Foundation</span>
              <div className="w-12 h-px bg-[#E7C418]" />
            </div>
          </div>
      </motion.div>
      </div>

      {/* Bottom gradient band */}
      <div className="h-2 bg-gradient-to-r from-[#871c1c] via-[#E7C418] to-[#871c1c]" />
    </div>
  );
}

export default function DonatePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#871c1c] mx-auto mb-4"></div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    }>
      <DonatePageContent />
    </Suspense>
  );
}
