"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface MembershipData {
  level: string;
  start_date: string;
  end_date: string;
  status: string;
}

function MembershipSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [membership, setMembership] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchMembership = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          // If not logged in, redirect to login
          router.push("/login?redirect=/membership/success");
          return;
        }

        setUser(user);

        // Get the most recent membership
        const { data, error } = await supabase
          .from("memberships")
          .select("*")
          .eq("user_id", user.id)
          .order("end_date", { ascending: false })
          .limit(1)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching membership:", error);
        } else if (data) {
          setMembership(data);
        }
      } catch (err) {
        console.error("Error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMembership();
  }, [router]);

  const membershipLevels: Record<string, { name: string; price: number; displayName: string; amenities: string[] }> = {
    General: { 
      name: "General Membership", 
      price: 35,
      displayName: "General",
      amenities: [
        "Access to all events & programs",
        "Leadership mentoring sessions",
        "Networking opportunities",
        "Member directory access",
        "Monthly newsletter",
      ]
    },
    Sustaining: { 
      name: "Sustaining Membership", 
      price: 100,
      displayName: "Sustaining",
      amenities: [
        "All General Membership benefits",
        "Priority event registration",
        "Recognition in annual report",
        "Exclusive sustaining member events",
        "VIP networking opportunities",
        "Special appreciation gifts",
      ]
    },
    Youth: { 
      name: "Youth Membership", 
      price: 10,
      displayName: "Youth",
      amenities: [
        "All General Membership benefits",
        "Student-friendly pricing",
        "Personalized mentorship matching",
        "Career development resources",
        "Youth-focused events & workshops",
      ]
    },
  };

  // Helper function to parse date string as local date (not UTC)
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const membershipInfo = membership?.level ? membershipLevels[membership.level] : null;
  const endDate = membership?.end_date 
    ? parseLocalDate(membership.end_date).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 to-neutral-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card-premium p-8 md:p-12 text-center"
        >
          {/* Success Icon */}
          <div className="relative w-32 h-32 mx-auto mb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-green-600 rounded-full animate-pulse opacity-20" />
            <div className="relative w-full h-full bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-lg">
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Success Message */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-heading text-primary mb-4"
          >
            Payment Completed Successfully!
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-lg text-neutral-600 mb-8"
          >
            Your membership has been activated and you now have full access to all WON benefits.
          </motion.p>

          {/* Membership Details Card */}
          {membership && membershipInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-[#871c1c]/5 to-[#E7C418]/5 rounded-xl p-6 mb-8 text-left"
            >
              <h2 className="text-xl font-heading text-primary mb-4">Membership Details</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Membership Level:</span>
                  <span className="font-semibold text-primary">{membershipInfo.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Amount Paid:</span>
                  <span className="font-semibold text-primary">${membershipInfo.price}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-neutral-600">Status:</span>
                  <span className="inline-flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    <span className="font-semibold text-green-600">Active</span>
                  </span>
                </div>
                {endDate && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Valid Until:</span>
                    <span className="font-semibold text-primary">{endDate}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Membership Amenities */}
          {membership && membershipInfo && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl p-6 mb-8 border border-neutral-200"
            >
              <h3 className="text-lg font-heading text-primary mb-4">
                As a {membershipInfo.displayName} member, you have access to:
              </h3>
              <ul className="text-left space-y-3 text-neutral-700">
                {membershipInfo.amenities.map((amenity, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-[#E7C418] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{amenity}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* What's Next */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl p-6 mb-8 border border-neutral-200"
          >
            <h3 className="text-lg font-heading text-primary mb-4">What&apos;s Next?</h3>
            <ul className="text-left space-y-3 text-neutral-700">
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#E7C418] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Access your member portal to update your profile and view your membership details</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#E7C418] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Browse upcoming events and register for exclusive member-only programs</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#E7C418] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Connect with other members through our directory and networking opportunities</span>
              </li>
              <li className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#E7C418] flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>You&apos;ll receive a confirmation email with all the details</span>
              </li>
            </ul>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              href="/portal"
              className="px-8 py-4 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 text-center"
            >
              Go to Member Portal
            </Link>
            <Link
              href="/events"
              className="px-8 py-4 bg-white border-2 border-[#E7C418] text-[#871c1c] font-semibold rounded-xl hover:bg-[#E7C418]/5 transition-all text-center"
            >
              Browse Events
            </Link>
          </motion.div>

          {/* Decorative Elements */}
          <div className="flex justify-center gap-2 mt-8">
            <span className="text-[#E7C418] text-2xl">✦</span>
            <span className="text-[#871c1c] text-2xl">✦</span>
            <span className="text-[#E7C418] text-2xl">✦</span>
          </div>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 text-center"
        >
          <p className="text-sm text-neutral-500">
            Need help?{" "}
            <Link href="/contact" className="text-[#871c1c] hover:underline font-medium">
              Contact our support team
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function MembershipSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <MembershipSuccessContent />
    </Suspense>
  );
}

