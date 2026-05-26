"use client";

import { useState, useEffect } from "react";
import { useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
}

const levels = [
  { id: "General", name: "General Membership", price: 35, description: "Full access to all programs and events" },
  { id: "Sustaining", name: "Sustaining Membership", price: 100, description: "Enhanced benefits + priority access" },
  { id: "Youth", name: "Youth Membership", price: 10, description: "For students & young professionals under 25" },
];

/**
 * Calculate membership end date based on registration date
 * - If registered in first 6 months (Jan-Jun), expire on June 30th of the following year
 * - Otherwise, expire exactly one year from registration date
 */
function calculateMembershipEndDate(startDate: Date): Date {
  const month = startDate.getMonth(); // 0-11 (Jan = 0, Jun = 5)
  const endDate = new Date(startDate);
  
  // Set time to midnight to avoid timezone issues
  endDate.setHours(0, 0, 0, 0);
  
  if (month <= 5) {
    // Registered in Jan-Jun: expire on June 30th of the following year
    // Set date to 1 first to avoid month rollover issues (e.g., Jan 31 -> June 30)
    endDate.setDate(1);
    endDate.setFullYear(startDate.getFullYear() + 1);
    endDate.setMonth(5); // June (0-indexed)
    endDate.setDate(30);
  } else {
    // Registered in Jul-Dec: expire exactly one year from registration
    endDate.setFullYear(startDate.getFullYear() + 1);
  }
  
  return endDate;
}

export default function JoinRenewFlow() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"paypal" | "check">("paypal");
  const [submittingCheck, setSubmittingCheck] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [isCheckPayment, setIsCheckPayment] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const processedOrderIdsRef = useRef<Set<string>>(new Set());
  const [isPayPalSubmitting, setIsPayPalSubmitting] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoggedIn(!!user);
      
      // Fetch user profile if logged in
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('address_line1, address_line2, city, state, postal_code')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
          // Pre-fill form data with profile address for existing members
          setFormData(prev => ({
            ...prev,
            addressLine1: profile.address_line1 || "",
            addressLine2: profile.address_line2 || "",
            city: profile.city || "",
            state: profile.state || "",
            postalCode: profile.postal_code || "",
          }));
        }
      }
      
      setCheckingAuth(false);
      if (user) {
        setStep(1);
      }
    };
    checkUser();
  }, []);

  // Auto-select membership level from URL parameter
  useEffect(() => {
    const levelParam = searchParams.get('level');
    if (levelParam && ['General', 'Sustaining', 'Youth'].includes(levelParam)) {
      setSelectedLevel(levelParam);
    }
  }, [searchParams]);

  // Auto-dismiss error after 8 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const validateStep2 = () => {
    if (!formData.firstName || !formData.lastName) {
      setError("Please enter your full name");
      return false;
    }
    if (!formData.email || !formData.email.includes("@")) {
      setError("Please enter a valid email");
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    if (!formData.phone) {
      setError("Please enter your phone number");
      return false;
    }
    if (!formData.addressLine1) {
      setError("Please enter your street address");
      return false;
    }
    if (!formData.city) {
      setError("Please enter your city");
      return false;
    }
    if (!formData.state) {
      setError("Please enter your state");
      return false;
    }
    if (!formData.postalCode) {
      setError("Please enter your ZIP code");
      return false;
    }
    setError(null);
    return true;
  };

  const finalizePayPalMembership = async (orderId: string, payerId?: string) => {
    if (!selectedLevel || !orderId) return;
    if (processedOrderIdsRef.current.has(orderId)) return;
    processedOrderIdsRef.current.add(orderId);

    setIsCheckPayment(false);
    setProcessing(true);
    setError(null);

    try {
      if (isLoggedIn) {
        const response = await fetch("/api/membership/complete-paypal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId,
            membershipLevel: selectedLevel,
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.success) {
          throw new Error(
            data.error ||
              "Payment was received but membership activation failed. Please contact support with your PayPal confirmation."
          );
        }
      } else {
        await handleNewMemberPayment(orderId, payerId || "");
        return;
      }

      setPaymentComplete(true);
      setTimeout(() => {
        router.push("/membership/success");
      }, 2000);
    } catch (err: unknown) {
      console.error("PayPal fulfillment error:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to process membership. Please contact support.";
      const withNoRetryHint =
        message.includes("Do not pay again") || message.includes("do not pay again")
          ? message
          : `${message} If you were charged in PayPal, please do not pay again — contact support.`;
      setError(withNoRetryHint);
      setProcessing(false);
      // Keep orderId in processed set so the same approval is not retried in-session.
    }
  };

  const handleNewMemberPayment = async (orderId: string, payerId: string) => {
    if (!selectedLevel) return;

    const level = levels.find((l) => l.id === selectedLevel);
    if (!level) return;

    setProcessing(true);
    try {
      const response = await fetch("/api/membership/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          addressLine1: formData.addressLine1,
          addressLine2: formData.addressLine2,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          membershipLevel: level.id,
          membershipPrice: level.price,
          paypalOrderId: orderId,
          paypalPayerId: payerId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Signup API error:", data);
        // Provide more specific error messages
        if (data.error?.includes('already exists') || data.error?.includes('already registered')) {
          throw new Error("An account with this email already exists. Please try logging in instead, or use the 'Forgot Password' link if you don't remember your password.");
        } else if (data.error?.includes('password')) {
          throw new Error("There was an issue with the password. Please contact support.");
        } else {
          throw new Error(
            data.error ||
              data.details ||
              "Account creation failed. If PayPal charged you, do not pay again — contact support with your PayPal confirmation."
          );
        }
      }

      // Verify membership was created
      if (!data.success || !data.membershipId) {
        console.error("Membership creation verification failed:", data);
        throw new Error("Payment was successful, but there was an issue creating your account. Please contact support with your PayPal transaction ID.");
      }

      // Try to sign in the user
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (signInError) {
        console.error("Auto-login failed after signup:", signInError);
        // Account was created but auto-login failed - redirect to login page with message
        setError("Account created successfully! Please log in with your email and password.");
        setStep(1); // Go back to step 1 so they can see the message
        setTimeout(() => {
          router.push("/login");
        }, 3000);
        return;
      }

      setPaymentComplete(true);
      setTimeout(() => {
        window.location.href = "/membership/success";
      }, 2000);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please contact support.");
    } finally {
      setProcessing(false);
    }
  };

  if (checkingAuth) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-600">Loading...</p>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto"
      >
        <div className="card-premium p-12 text-center">
          {/* Success animation */}
          <div className="relative w-24 h-24 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full animate-pulse opacity-20" />
            <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-heading text-primary mb-4">
            {isCheckPayment ? "Thank You for Your Membership Pledge!" : "Welcome to WON!"}
          </h2>
          {isCheckPayment ? (
            <>
              <p className="text-lg text-neutral-700 mb-2">
                We&apos;ve recorded your membership to be paid by check.
              </p>
              <p className="text-neutral-600 mb-2">
                Please mail your check within 7 days to:
              </p>
              <p className="text-neutral-700 font-medium">
                Women Officials Network Foundation<br />
                6725 Daly Road, Ste 252572,<br />
                West Bloomfield, MI 48325
              </p>
              <p className="text-neutral-500 mt-4">
                Your membership will be fully activated once your check is received and processed.
              </p>
            </>
          ) : (
            <>
              <p className="text-lg text-neutral-700 mb-2">
                Your membership is now <span className="font-semibold text-green-600">active</span>.
              </p>
              <p className="text-neutral-500">Redirecting to your portal...</p>
            </>
          )}
          
          {/* Decorative elements */}
          <div className="flex justify-center gap-2 mt-8">
            <span className="text-[#E7C418] text-2xl">✦</span>
            <span className="text-[#871c1c] text-2xl">✦</span>
            <span className="text-[#E7C418] text-2xl">✦</span>
          </div>
        </div>
      </motion.div>
    );
  }

  const selectedLevelData = levels.find((l) => l.id === selectedLevel);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className="relative"
    >
      {/* Section Header */}
      <div className="text-center mb-12">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 text-sm font-semibold tracking-widest text-[#C9A814] uppercase mb-4"
        >
          <span className="w-8 h-px bg-[#E7C418]" />
          {isLoggedIn ? "Renew or Upgrade" : "Start Your Journey"}
          <span className="w-8 h-px bg-[#E7C418]" />
        </motion.span>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-3xl md:text-4xl lg:text-5xl font-heading text-primary mb-4"
        >
          {isLoggedIn ? "Continue Your Membership" : "Become a WON Member"}
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-lg text-neutral-600 max-w-2xl mx-auto"
        >
          {isLoggedIn 
            ? "Select a membership level to renew or upgrade."
            : "Join our network of extraordinary women leaders today."}
        </motion.p>
      </div>

      {/* Progress Steps - Only for new members */}
      {!isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="max-w-md mx-auto mb-12"
        >
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: "Select Plan" },
              { num: 2, label: "Your Info" },
              { num: 3, label: "Payment" },
            ].map((s, idx) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-heading font-bold text-lg transition-all duration-300 ${
                      step >= s.num
                        ? "bg-gradient-to-br from-[#871c1c] to-[#6b1515] text-white shadow-lg"
                        : "bg-neutral-100 text-neutral-400"
                    }`}
                  >
                    {step > s.num ? (
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      s.num
                    )}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    step === s.num ? "text-[#871c1c]" : "text-neutral-400"
                  }`}>
                    {s.label}
                  </span>
                </div>
                {idx < 2 && (
                  <div className={`w-16 h-0.5 mx-2 mt-[-20px] transition-colors ${
                    step > s.num 
                      ? "bg-gradient-to-r from-[#871c1c] to-[#E7C418]" 
                      : "bg-neutral-200"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Error Toast Notification */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          className="fixed top-4 right-4 z-50 max-w-md"
        >
          <div className="p-4 bg-red-50 border-2 border-red-500 rounded-lg shadow-lg flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="flex-1">
              <span className="text-red-800 font-medium block">{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-700 focus:outline-none flex-shrink-0"
              aria-label="Close error message"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 1: Select Membership Level */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {levels.map((level) => (
              <div
                key={level.id}
                onClick={() => setSelectedLevel(level.id)}
                className={`relative cursor-pointer transition-all duration-300 rounded-xl overflow-hidden ${
                  selectedLevel === level.id
                    ? "ring-4 ring-[#E7C418] shadow-xl scale-[1.02]"
                    : "hover:shadow-lg hover:scale-[1.01]"
                } bg-white border border-neutral-100`}
              >
                <div className="p-6">
                  <h3 className="text-xl font-heading mb-2 text-primary">
                    {level.name}
                  </h3>
                  <div className="mb-3">
                    <span className="text-4xl font-heading font-bold text-primary">
                      ${level.price}
                    </span>
                    <span className="text-sm ml-1 text-neutral-500">
                      /year
                    </span>
                  </div>
                  <p className="text-sm mb-4 text-neutral-600">
                    {level.description}
                  </p>
                  
                  {/* Selection indicator */}
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                    selectedLevel === level.id
                      ? "border-[#E7C418] bg-[#E7C418]"
                      : "border-neutral-300"
                  }`}>
                    {selectedLevel === level.id && (
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                      </svg>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button
              disabled={!selectedLevel}
              onClick={() => setStep(isLoggedIn ? 3 : 2)}
              className={`px-12 py-4 rounded-lg font-semibold text-lg transition-all duration-300 ${
                selectedLevel
                  ? "bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                  : "bg-neutral-200 text-neutral-400 cursor-not-allowed"
              }`}
            >
              Continue
            </button>
          </div>
        </motion.div>
      )}

      {/* Step 2: Account Information */}
      {step === 2 && !isLoggedIn && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl mx-auto"
        >
          <div className="card-premium p-8 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#871c1c] to-[#6b1515] flex items-center justify-center">
                <svg className="w-6 h-6 text-[#E7C418]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-heading text-primary">Create Your Account</h3>
                <p className="text-neutral-500 text-sm">Your information is secure and private</p>
              </div>
            </div>
            
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-[#871c1c] focus:border-transparent transition-all bg-neutral-50 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-[#871c1c] focus:border-transparent transition-all bg-neutral-50 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-[#871c1c] focus:border-transparent transition-all bg-neutral-50 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      placeholder="At least 8 characters"
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-[#871c1c] focus:border-transparent transition-all bg-neutral-50 focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 focus:outline-none"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 015.12 5.12m0 0L8.88 8.88M5.12 5.12L3 3m5.88 5.88L12 12m-6.88-6.88L12 12m0 0l3.29-3.29m0 0a9.97 9.97 0 011.563-3.029M12 12l3.29 3.29M12 12l-3.29 3.29m3.29-3.29L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Confirm Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className="w-full px-4 py-3 pr-12 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-[#871c1c] focus:border-transparent transition-all bg-neutral-50 focus:bg-white"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 focus:outline-none"
                      aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                    >
                      {showConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.29 3.29m0 0A9.97 9.97 0 015.12 5.12m0 0L8.88 8.88M5.12 5.12L3 3m5.88 5.88L12 12m-6.88-6.88L12 12m0 0l3.29-3.29m0 0a9.97 9.97 0 011.563-3.029M12 12l3.29 3.29M12 12l-3.29 3.29m3.29-3.29L21 21" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="relative py-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-4 text-sm text-neutral-400">Contact Information</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-[#871c1c] focus:border-transparent transition-all bg-neutral-50 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Street Address *</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-[#871c1c] focus:border-transparent transition-all bg-neutral-50 focus:bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-[#871c1c] focus:border-transparent transition-all bg-neutral-50 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="MI"
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-[#871c1c] focus:border-transparent transition-all bg-neutral-50 focus:bg-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">ZIP *</label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-neutral-200 focus:ring-2 focus:ring-[#871c1c] focus:border-transparent transition-all bg-neutral-50 focus:bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-4 rounded-lg font-semibold border-2 border-neutral-200 text-neutral-700 hover:bg-neutral-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => validateStep2() && setStep(3)}
                className="flex-1 py-4 rounded-lg font-semibold bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
              >
                Continue to Payment
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: Payment */}
      {step === 3 && selectedLevelData && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-xl mx-auto"
        >
          <div className="card-premium p-8 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#E7C418] to-[#C9A814] flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h3 className="text-2xl font-heading text-primary">Secure Payment</h3>
                <p className="text-neutral-500 text-sm">Complete your membership purchase</p>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="bg-gradient-to-br from-[#871c1c]/5 to-[#E7C418]/5 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <span className="font-heading font-semibold text-lg text-primary">{selectedLevelData.name}</span>
                  <p className="text-sm text-neutral-500">Annual membership · 1 year</p>
                </div>
                <span className="text-2xl font-heading font-bold text-primary">${selectedLevelData.price}</span>
              </div>
            </div>

            {!isLoggedIn && (
              <div className="bg-[#871c1c]/5 rounded-xl p-4 mb-6">
                <p className="text-sm font-medium text-[#871c1c] mb-1">Account Details</p>
                <p className="text-neutral-700">{formData.firstName} {formData.lastName}</p>
                <p className="text-neutral-600 text-sm">{formData.email}</p>
              </div>
            )}

            <div className="border-t border-neutral-100 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-neutral-700">Total</span>
                <span className="text-3xl font-heading font-bold text-primary">${selectedLevelData.price}</span>
              </div>
            </div>

            {/* Payment method selection */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-neutral-700 mb-2">
                Payment Method
              </p>
              <div className="mb-6">
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
            </div>

            {processing ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-neutral-600 font-medium">Confirming your payment...</p>
                <p className="text-neutral-400 text-sm mt-1">Please don&apos;t close this page or pay again</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* When PayPal is selected, show PayPal buttons */}
                {paymentMethod === "paypal" ? (
                  <PayPalScriptProvider
                  options={{
                    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
                    currency: "USD",
                    enableFunding: "card,venmo,paylater",
                  }}
                  key={process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID} // Force re-render if Client ID changes
                >
                  <PayPalButtons
                    style={{ layout: "vertical", shape: "rect", label: "pay" }}
                    fundingSource={undefined}
                    onClick={() => {
                      if (isPayPalSubmitting || processing) {
                        return Promise.reject(new Error("Payment is already processing"));
                      }
                      setIsPayPalSubmitting(true);
                      return Promise.resolve();
                    }}
                    createOrder={async () => {
                      const response = await fetch("/api/membership/paypal/create-order", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          membershipLevel: selectedLevelData.id,
                          email: isLoggedIn ? undefined : formData.email,
                        }),
                      });
                      const data = await response.json();
                      if (!response.ok || !data.orderID) {
                        throw new Error(data.error || "Failed to start PayPal checkout");
                      }
                      return data.orderID;
                    }}
                    onApprove={async (data) => {
                      try {
                        const orderId = data.orderID;
                        if (!orderId) {
                          throw new Error("Missing PayPal order ID");
                        }
                        await finalizePayPalMembership(orderId, data.payerID ?? undefined);
                      } finally {
                        setIsPayPalSubmitting(false);
                      }
                    }}
                    onError={(err) => {
                      console.error("PayPal error:", err);
                      setError("Payment failed. Please try again.");
                      setIsPayPalSubmitting(false);
                    }}
                    onCancel={() => {
                      setIsPayPalSubmitting(false);
                    }}
                    disabled={isPayPalSubmitting || processing}
                  />
                </PayPalScriptProvider>
                ) : (
                  // Check / mail-in payment instructions
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-neutral-50 border border-dashed border-neutral-300 text-sm text-neutral-700 text-left">
                      <p className="font-semibold mb-2">Mail your check within 7 days to:</p>
                      <p>
                        Women Officials Network Foundation<br />
                        6725 Daly Road, Ste 252572,<br />
                        West Bloomfield, MI 48325
                      </p>
                      <p className="mt-3 text-neutral-600">
                        Please include your name and note that this is for your WON membership so we can match your check
                        to this purchase.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={async () => {
                        setSubmittingCheck(true);
                        setError(null);
                        try {
                          if (isLoggedIn) {
                            // Logged-in existing member: record payment & pending membership directly
                            if (!user) {
                              throw new Error("You must be logged in to use the check payment option.");
                            }
                            const supabase = createClient();
                            
                            // Check for existing membership to determine renewal start date
                            const { data: existingMemberships } = await supabase
                              .from("memberships")
                              .select("id, end_date, status")
                              .eq("user_id", user.id)
                              .order("end_date", { ascending: false })
                              .limit(1)
                              .maybeSingle();

                            // Determine start date: if existing membership hasn't expired, extend from end_date
                            // Otherwise, start from today
                            let startDate: Date;
                            let endDate: Date;
                            
                            if (existingMemberships?.end_date) {
                              const existingEndDate = new Date(existingMemberships.end_date);
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              existingEndDate.setHours(0, 0, 0, 0);
                              
                              // If existing membership hasn't expired, extend from its end date
                              if (existingEndDate >= today) {
                                startDate = existingEndDate;
                              } else {
                                // Expired membership, start from today
                                startDate = today;
                              }
                            } else {
                              // No existing membership, start from today
                              startDate = new Date();
                            }
                            
                            // Calculate new end date from the determined start date
                            endDate = calculateMembershipEndDate(startDate);
                            const checkOrderId = `CHECK-MEM-${Date.now()}`;

                            const { error: paymentError } = await supabase
                              .from("payments")
                              .insert({
                                user_id: user.id,
                                amount: selectedLevelData.price,
                                status: "pending",
                                provider: "admin",
                                provider_tx_id: checkOrderId,
                                type: "membership",
                                membership_level: selectedLevelData.id,
                                is_complimentary: false, // Paid memberships are never complimentary
                              });

                            if (paymentError) {
                              console.error("Check payment record error:", paymentError);
                              // Log detailed error for debugging
                              console.error("Payment error details:", {
                                message: paymentError.message,
                                details: paymentError.details,
                                hint: paymentError.hint,
                                code: paymentError.code
                              });
                              throw new Error("We were unable to record your check payment. Please try again or contact support.");
                            }

                            // Always create a new membership record for renewals to preserve history
                            // This ensures old complimentary memberships aren't incorrectly marked as paid
                            const { error: membershipError } = await supabase
                              .from("memberships")
                              .insert({
                                user_id: user.id,
                                level: selectedLevelData.id,
                                start_date: startDate.toISOString().split("T")[0],
                                end_date: endDate.toISOString().split("T")[0],
                                status: "pending",
                                auto_renew: false,
                                is_complimentary: false, // Paid memberships are never complimentary
                              });

                            if (membershipError) {
                              console.error("Membership creation error (check):", membershipError);
                              throw new Error("We recorded your payment, but could not create the membership. Please contact support.");
                            }

                          // Send confirmation & admin emails for check membership
                          try {
                            const { data: userProfile } = await supabase
                              .from("users")
                              .select("first_name, last_name, email")
                              .eq("id", user.id)
                              .single();

                            const firstName = userProfile?.first_name || user?.user_metadata?.first_name || "";
                            const lastName = userProfile?.last_name || user?.user_metadata?.last_name || "";
                            const email = userProfile?.email || user?.email || "";

                            if (firstName && lastName && email) {
                              await fetch("/api/membership/send-confirmation-email", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({
                                  firstName,
                                  lastName,
                                  email,
                                  membershipLevel: selectedLevelData.id as "General" | "Sustaining" | "Youth",
                                  membershipPrice: selectedLevelData.price,
                                  orderId: checkOrderId,
                                  transactionDate: startDate.toISOString(),
                                  endDate: endDate.toISOString().split("T")[0],
                                  paymentMethod: "Check (mail-in)",
                                }),
                              });
                            }
                          } catch (emailErr) {
                            console.error("Failed to send check membership emails:", emailErr);
                            // Don't fail the flow if emails fail
                          }
                          } else {
                            // New member: call signup-check API to create user + pending membership + payment
                            const response = await fetch("/api/membership/signup-check", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({
                                email: formData.email,
                                password: formData.password,
                                firstName: formData.firstName,
                                lastName: formData.lastName,
                                phone: formData.phone,
                                addressLine1: formData.addressLine1,
                                addressLine2: formData.addressLine2,
                                city: formData.city,
                                state: formData.state,
                                postalCode: formData.postalCode,
                                membershipLevel: selectedLevelData.id,
                                membershipPrice: selectedLevelData.price,
                              }),
                            });

                            const data = await response.json();
                            if (!response.ok || !data.success) {
                              console.error("Signup-check API error:", data);
                              throw new Error(data.error || data.details || "Failed to create account. Please contact support.");
                            }
                          }

                          setIsCheckPayment(true);
                          setPaymentComplete(true);
                        } catch (err: any) {
                          console.error("Error handling check membership payment:", err);
                          setError(err.message || "Failed to record check payment. Please contact support.");
                        } finally {
                          setSubmittingCheck(false);
                        }
                      }}
                      disabled={submittingCheck}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submittingCheck ? "Recording Check Membership..." : "Record Membership to be Paid by Check"}
                    </button>
                    <p className="text-xs text-neutral-500 text-center">
                      We allow 7 days for receipt of checks. Your membership will be fully activated after your check is received.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-8 text-center">
              <button
                onClick={() => setStep(isLoggedIn ? 1 : 2)}
                className="text-sm text-neutral-500 hover:text-[#871c1c] transition-colors inline-flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Go back
              </button>
            </div>
            
            {/* Trust indicators */}
            <div className="mt-8 pt-6 border-t border-neutral-100 flex justify-center gap-6 text-xs text-neutral-400">
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                SSL Encrypted
              </span>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                PayPal Protected
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
