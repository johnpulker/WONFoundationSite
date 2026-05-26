"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

interface Membership {
  id: string;
  level: string;
  status: string;
  start_date: string;
  end_date: string;
  auto_renew: boolean;
}

export default function MembershipTab() {
  const router = useRouter();
  const [membership, setMembership] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMembership();
  }, []);

  const fetchMembership = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Not authenticated");
        return;
      }

      // Get the most recent active or expired membership
      const { data, error: fetchError } = await supabase
        .from("memberships")
        .select("*")
        .eq("user_id", user.id)
        .order("end_date", { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      setMembership(data);
    } catch (err: any) {
      console.error("Error fetching membership:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to parse date string as local date (not UTC)
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleRenew = () => {
    // Redirect to membership page to renew/upgrade
    router.push("/membership#join");
  };

  const isExpired = membership && parseLocalDate(membership.end_date) < new Date();
  const isExpiringSoon = membership && !isExpired && 
    parseLocalDate(membership.end_date) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const daysUntilExpiry = membership 
    ? Math.ceil((parseLocalDate(membership.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-neutral-600">Loading membership status...</div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-heading text-neutral-900 mb-6">Membership Status</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      {!membership ? (
        // No membership found
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No Active Membership</h3>
          <p className="text-neutral-600 mb-6">
            You don&apos;t have an active membership yet. Join WON to access all member benefits!
          </p>
          <Button variant="primary" onClick={handleRenew}>
            Become a Member
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Expiry Warning */}
          {isExpired && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-red-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-red-800">Your membership has expired</p>
                  <p className="text-sm text-red-700">Renew now to continue accessing member benefits.</p>
                </div>
              </div>
            </div>
          )}

          {isExpiringSoon && !isExpired && (
            <div className="p-4 bg-[#F0D43A]/30 border border-[#E7C418]/50 rounded-lg">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-[#C9A814] mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold text-[#C9A814]">Membership expiring soon</p>
                  <p className="text-sm text-[#C9A814]">Your membership expires in {daysUntilExpiry} days. Renew now to avoid interruption.</p>
                </div>
              </div>
            </div>
          )}

          {/* Current Membership */}
          <div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Current Membership</h3>
            <div className="bg-neutral-50 p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-xl font-semibold text-neutral-900">{membership.level}</p>
                  <p className={`text-sm font-medium mt-1 ${
                    isExpired 
                      ? "text-red-600" 
                      : membership.status === "active" 
                        ? "text-green-600" 
                        : "text-[#E7C418]"
                  }`}>
                    {isExpired ? "EXPIRED" : membership.status.toUpperCase()}
                  </p>
                </div>
                {!isExpired && (
                  <div className="text-right">
                    <p className="text-sm text-neutral-500">Days remaining</p>
                    <p className="text-2xl font-bold text-primary">{daysUntilExpiry}</p>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-neutral-600">Start Date</p>
                  <p className="font-medium text-neutral-900">
                    {parseLocalDate(membership.start_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-neutral-600">Expiration Date</p>
                  <p className={`font-medium ${isExpired ? "text-red-600" : "text-neutral-900"}`}>
                    {parseLocalDate(membership.end_date).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            <Button 
              variant={isExpired ? "primary" : "secondary"} 
              onClick={handleRenew}
              className="flex-1 sm:flex-none"
            >
              {isExpired ? "Renew Membership" : "Renew Early / Upgrade"}
            </Button>
            
            {!isExpired && (
              <Button 
                variant="ghost" 
                onClick={() => router.push("/membership#levels")}
                className="flex-1 sm:flex-none"
              >
                View All Plans
              </Button>
            )}
          </div>

          {/* Membership Benefits */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Your Benefits</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Access to all events",
                "Member directory access",
                "Leadership mentoring programs",
                "Networking opportunities",
                "Newsletter subscription",
                membership.level.includes("Sustaining") && "Priority event registration",
                membership.level.includes("Sustaining") && "Exclusive member events",
              ].filter(Boolean).map((benefit, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-neutral-700">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  {benefit}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
