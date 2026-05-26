"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, Suspense, useRef } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";

// TypeScript declaration for Cloudflare Turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: {
        sitekey: string;
        callback?: (token: string) => void;
        'expired-callback'?: () => void;
        'error-callback'?: () => void;
      }) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

const contactReasons = [
  { id: "general", label: "General Inquiry" },
  { id: "membership", label: "Membership Questions" },
  { id: "events", label: "Events & Programs" },
  { id: "committees", label: "Committees" },
  { id: "sponsorship", label: "Sponsorship Opportunities" },
  { id: "volunteer", label: "Volunteer With Us" },
  { id: "media", label: "Media & Press" },
];

function ContactPageContent() {
  const searchParams = useSearchParams();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    reason: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetId = useRef<string | null>(null);

  // Handle URL parameters for pre-filling form
  useEffect(() => {
    const subjectParam = searchParams.get("subject");
    if (subjectParam) {
      setFormData(prev => ({
        ...prev,
        subject: subjectParam,
        reason: subjectParam.toLowerCase() === "committees" ? "committees" : prev.reason,
      }));
    }
  }, [searchParams]);

  // Re-render Turnstile widget when form becomes visible again
  useEffect(() => {
    if (submitStatus === "idle" && window.turnstile && turnstileRef.current && !turnstileWidgetId.current) {
      const widgetId = window.turnstile.render(turnstileRef.current, {
        sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
        callback: (token: string) => {
          setTurnstileToken(token);
        },
        'expired-callback': () => {
          setTurnstileToken(null);
        },
        'error-callback': () => {
          setTurnstileToken(null);
        },
      });
      turnstileWidgetId.current = widgetId;
    }
  }, [submitStatus]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if Turnstile token exists
    if (!turnstileToken) {
      setSubmitStatus("error");
      alert("Please complete the security verification.");
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      // Send email via API route
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || null,
          reason: formData.reason,
          subject: formData.subject,
          message: formData.message,
          turnstileToken: turnstileToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check if it's a rate limit error (429 status)
        if (response.status === 429 || data.error?.includes("Too many submissions")) {
          setRateLimitMessage(data.error || "Too many submissions. Please try again later.");
          setSubmitStatus("idle");
          // Reset Turnstile token so user can try again later
          setTurnstileToken(null);
          if (window.turnstile && turnstileWidgetId.current) {
            window.turnstile.reset(turnstileWidgetId.current);
          }
          return;
        }
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitStatus("success");
      setRateLimitMessage(null); // Clear any rate limit messages
      setFormData({
        name: "",
        email: "",
        phone: "",
        reason: "",
        subject: "",
        message: "",
      });
      setTurnstileToken(null);
      // Reset Turnstile widget
      if (window.turnstile && turnstileWidgetId.current) {
        window.turnstile.reset(turnstileWidgetId.current);
      }
    } catch (error: any) {
      console.error("Form submission error:", error);
      // Only set error status if it's not a rate limit error (already handled above)
      if (!error.message?.includes("Too many submissions")) {
      setSubmitStatus("error");
      }
      // Reset Turnstile token on error so user can try again
      setTurnstileToken(null);
      // Reset Turnstile widget so user can complete it again
      if (window.turnstile && turnstileWidgetId.current) {
        window.turnstile.reset(turnstileWidgetId.current);
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <>
      {/* Cloudflare Turnstile Script */}
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
        onLoad={() => {
          if (window.turnstile && turnstileRef.current && !turnstileWidgetId.current) {
            const widgetId = window.turnstile.render(turnstileRef.current, {
              sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '',
              callback: (token: string) => {
                setTurnstileToken(token);
              },
              'expired-callback': () => {
                setTurnstileToken(null);
              },
              'error-callback': () => {
                setTurnstileToken(null);
              },
            });
            turnstileWidgetId.current = widgetId;
          }
        }}
      />
    <div className="w-full bg-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, #871c1c 0%, #6b1515 50%, #871c1c 100%)`
          }}
        />
        
        {/* Decorative elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px]"
            style={{
              background: "radial-gradient(ellipse at center, rgba(212, 175, 55, 0.1) 0%, transparent 70%)"
            }}
          />
          
          {/* Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, #E7C418 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />
          </div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 text-center">
          {/* Icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-[#E7C418] to-[#C9A814] mb-8 shadow-xl"
          >
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </motion.div>
          
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="block uppercase text-sm font-semibold tracking-[0.3em] text-[#E7C418] mb-5"
          >
            Get In Touch
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-4xl md:text-5xl lg:text-6xl font-heading text-white mb-6"
          >
            We&apos;d Love to Hear From You
          </motion.h1>
          
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
            className="text-xl text-white/80 font-light max-w-2xl mx-auto"
          >
            Whether you have a question, want to get involved, or just want to say hello — 
            we&apos;re here for you.
          </motion.p>
        </div>
        
        {/* Wave bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-10 md:h-14">
            <path 
              d="M0,60 C300,100 600,20 900,60 C1050,80 1150,60 1200,60 L1200,120 L0,120 Z" 
              fill="white"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Info Column */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <div className="sticky top-32">
              <h2 className="text-2xl font-heading text-primary mb-8">
                Contact Information
            </h2>
              
              {/* Address */}
              <div className="mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#871c1c] to-[#a02323] flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-[#E7C418]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
              <div>
                    <h3 className="font-semibold text-primary mb-1">Our Address</h3>
                    <address className="not-italic text-neutral-600 leading-relaxed">
                      6725 Daly Rd. Ste. 252572<br />
                      West Bloomfield, MI 48325
                    </address>
                  </div>
                </div>
              </div>
              
              {/* Email */}
              <div className="mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#E7C418] to-[#C9A814] flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
              </div>
              <div>
                    <h3 className="font-semibold text-primary mb-1">Contact</h3>
                    <a 
                      href="mailto:administrator@wonfoundation.net" 
                      className="text-[#871c1c] hover:text-[#E7C418] transition-colors font-medium"
                    >
                  administrator@wonfoundation.net
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Google Maps */}
              <div className="mb-8">
                <h3 className="font-semibold text-primary mb-4 flex items-center gap-2">
                  <span className="text-[#E7C418]">✦</span>
                  Find Us
                </h3>
                <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-white ring-1 ring-neutral-200">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2936.2894730876847!2d-83.39099492346025!3d42.54607627117245!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8824b3a42ce9f1b7%3A0x6c72c8a9e3e9c9c0!2s6725%20Daly%20Rd%2C%20West%20Bloomfield%20Township%2C%20MI%2048322!5e0!3m2!1sen!2sus!4v1701900000000!5m2!1sen!2sus"
                    width="100%"
                    height="250"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="WON Foundation Location"
                    className="w-full"
                  />
                  {/* Overlay gradient at top */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/50 to-transparent pointer-events-none" />
                </div>
                <a
                  href="https://www.google.com/maps/search/?api=1&query=6725+Daly+Rd+West+Bloomfield+MI+48325"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 mt-3 text-sm text-[#871c1c] hover:text-[#E7C418] transition-colors font-medium"
                >
                  <span>Get Directions</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              
              {/* Social Links */}
              <div>
                <h3 className="font-semibold text-primary mb-4">Connect With Us</h3>
                <div className="flex gap-3">
                  {[
                    { name: "Facebook", href: "https://www.facebook.com/womenofficialsmi", icon: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    )},
                    { name: "Instagram", href: "https://www.instagram.com/thewonfoundation/#", icon: (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"/>
                      </svg>
                    )},
                  ].map((social) => (
                    <a
                      key={social.name}
                      href={social.href}
                      className="w-10 h-10 rounded-full bg-neutral-100 hover:bg-gradient-to-br hover:from-[#871c1c] hover:to-[#a02323] flex items-center justify-center text-neutral-500 hover:text-white transition-all duration-300"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Form Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <div className="relative overflow-hidden rounded-3xl bg-white shadow-2xl border border-neutral-100">
              {/* Header */}
              <div className="bg-gradient-to-r from-[#871c1c] to-[#a02323] p-8">
                <h2 className="text-2xl font-heading text-white mb-2">
                  Send Us a Message
                </h2>
                <p className="text-white/80">
                  Fill out the form below and we&apos;ll get back to you shortly.
                </p>
              </div>
              
              <AnimatePresence mode="wait">
                {submitStatus === "success" ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-10 text-center"
                  >
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                      <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-heading text-primary mb-3">Message Sent!</h3>
                    <p className="text-neutral-600 mb-6">
                      Thank you for reaching out. We&apos;ll be in touch soon.
                    </p>
                    <button
                      onClick={() => {
                        setSubmitStatus("idle");
                        setRateLimitMessage(null);
                        setTurnstileToken(null);
                        // Reset widget ID so it can be re-rendered
                        if (turnstileWidgetId.current && window.turnstile) {
                          window.turnstile.remove(turnstileWidgetId.current);
                        }
                        turnstileWidgetId.current = null;
                      }}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      Send Another Message
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="p-8 space-y-6"
                  >
                    {/* Name & Email Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wider">
                          Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Jane Doe"
                          className="w-full px-4 py-3.5 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-4 focus:ring-[#E7C418]/10 transition-all bg-neutral-50 focus:bg-white"
                />
              </div>
              <div>
                        <label className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wider">
                          Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="jane@example.com"
                          className="w-full px-4 py-3.5 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-4 focus:ring-[#E7C418]/10 transition-all bg-neutral-50 focus:bg-white"
                        />
                      </div>
                    </div>
                    
                    {/* Phone */}
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wider">
                        Phone Number <span className="text-neutral-400 font-normal normal-case">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-4 focus:ring-[#E7C418]/10 transition-all bg-neutral-50 focus:bg-white"
                />
              </div>
                    
                    {/* Reason for Contact */}
                    <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-3 uppercase tracking-wider">
                        What can we help you with? *
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {contactReasons.map((reason) => (
                          <button
                            key={reason.id}
                            type="button"
                            onClick={() => setFormData({ ...formData, reason: reason.id })}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                              formData.reason === reason.id
                                ? "bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white shadow-md"
                                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                            }`}
                          >
                            {reason.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Subject */}
              <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wider">
                        Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        placeholder="What is your message about?"
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-4 focus:ring-[#E7C418]/10 transition-all bg-neutral-50 focus:bg-white"
                />
              </div>
                    
                    {/* Message */}
              <div>
                      <label className="block text-sm font-semibold text-neutral-700 mb-2 uppercase tracking-wider">
                        Your Message *
                </label>
                <textarea
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        placeholder="Tell us how we can help..."
                        className="w-full px-4 py-3.5 rounded-xl border-2 border-neutral-200 focus:border-[#E7C418] focus:ring-4 focus:ring-[#E7C418]/10 transition-all bg-neutral-50 focus:bg-white resize-none"
                />
              </div>
                    
                    {/* Rate Limit Message */}
                    {rateLimitMessage && (
                      <div className="p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg">
                        <div className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          <div>
                            <p className="text-amber-800 font-medium">{rateLimitMessage}</p>
                            <p className="text-amber-700 text-sm mt-1">You can still view the form, but please wait before submitting again.</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Error Message */}
                    {submitStatus === "error" && (
                      <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-800">
                        Something went wrong. Please try again or email us directly.
                      </div>
                    )}
                    
                    {/* Cloudflare Turnstile */}
                    <div className="flex justify-center">
                      <div ref={turnstileRef} />
                    </div>
                    
                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-4 bg-gradient-to-r from-[#E7C418] to-[#C9A814] text-white font-semibold text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </>
                      )}
                    </button>
                    
                    {/* Privacy note */}
                    <p className="text-center text-xs text-neutral-400">
                      By submitting this form, you agree to our privacy policy. 
                      We&apos;ll never share your information.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20"
        >
          <div className="text-center mb-12">
            <span className="inline-block text-sm font-semibold tracking-widest text-[#C9A814] uppercase mb-3">
              Common Questions
            </span>
            <h2 className="text-3xl font-heading text-primary">
              Frequently Asked
            </h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                q: "How do I become a member?",
                a: "Visit our Membership page to learn about our different membership levels and sign up online. It takes less than 5 minutes!"
              },
              {
                q: "Are donations tax-deductible?",
                a: "Yes! WON Foundation is a 501(c)(3) nonprofit organization. All donations are tax-deductible to the extent allowed by law."
              },
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-6 bg-gradient-to-br from-neutral-50 to-white rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <h3 className="font-heading font-bold text-primary mb-2 flex items-start gap-2">
                  <span className="text-[#E7C418] text-lg">Q:</span>
                  {faq.q}
                </h3>
                <p className="text-neutral-600 text-sm leading-relaxed pl-6">
                  {faq.a}
                </p>
              </motion.div>
            ))}
        </div>
      </motion.div>
      </div>

      {/* Bottom gradient band */}
      <div className="h-2 bg-gradient-to-r from-[#871c1c] via-[#E7C418] to-[#871c1c]" />
    </div>
    </>
  );
}

export default function ContactPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <ContactPageContent />
    </Suspense>
  );
}
