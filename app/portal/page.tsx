"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import ProfileTab from "@/components/portal/ProfileTab";
import MembershipTab from "@/components/portal/MembershipTab";
import PaymentsTab from "@/components/portal/PaymentsTab";
import SettingsTab from "@/components/portal/SettingsTab";
import { createClient } from "@/lib/supabase/client";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "membership", label: "Membership" },
  { id: "payments", label: "Payments" },
  { id: "settings", label: "Settings" },
];

export default function PortalPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [membership, setMembership] = useState<any>(null);
  const [imageError, setImageError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setUser(user);

      if (user) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (userData) {
          setProfile(userData);
          setImageError(false); // Reset error state when profile data changes
        }

        const { data: membershipData } = await supabase
          .from("memberships")
          .select("*")
          .eq("user_id", user.id)
          .order("end_date", { ascending: false })
          .limit(1)
          .single();
        
        if (membershipData) setMembership(membershipData);
      }

      setLoading(false);
    };
    fetchUserData();
  }, [router]);

  // Helper function to parse date string as local date (not UTC)
  const parseLocalDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const firstName = profile?.first_name || user?.user_metadata?.first_name || '';
  const lastName = profile?.last_name || user?.user_metadata?.last_name || '';
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : user?.email?.split('@')[0] || 'Member';
  const memberSince = user?.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear();
  const isActive = membership?.status === 'active' && parseLocalDate(membership?.end_date) > new Date();
  const hasMembership = !!membership;
  const isPending = membership?.status === 'pending';
  const membershipLevel = membership?.level || null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-neutral-100 to-neutral-50 flex items-center justify-center">
        <div className="text-neutral-500 text-lg">Loading your portal…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-100 to-neutral-50">
      {/* Hero Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-6 py-10">
          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-2">
            Member Portal
          </h1>
          <p className="text-neutral-500 text-lg">
            Welcome, <span className="text-neutral-900 font-medium">{firstName || 'Member'}</span>
          </p>

          {/* Profile Hero Card */}
          <div className="mt-8 bg-gradient-to-r from-primary to-primary/90 rounded-2xl p-6 text-white shadow-lg shadow-primary/20">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold backdrop-blur-sm border-2 border-white/30 overflow-hidden flex-shrink-0">
                {profile?.profile_photo_url && !imageError ? (
                  <img 
                    src={profile.profile_photo_url} 
                    alt="" 
                    className="w-full h-full object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  firstName?.[0]?.toUpperCase() || '?'
                )}
              </div>
              
              {/* Info */}
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold truncate">{fullName}</h2>
                <div className="flex items-center gap-3 mt-1 text-white/80 text-sm flex-wrap">
                  {/* Status Badge */}
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    isActive 
                      ? 'bg-green-400/20 text-green-100' 
                      : 'bg-[#E7C418]/20 text-[#F0D43A]'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-green-300' : 'bg-[#E7C418]'}`} />
                    {isActive 
                      ? 'Active Member' 
                      : isPending 
                        ? 'Pending (Check Payment)' 
                        : hasMembership 
                          ? 'Expired' 
                          : 'No Membership'}
                  </span>
                  <span>•</span>
                  <span>Joined {memberSince}</span>
                  {membershipLevel && (
                    <>
                      <span>•</span>
                      <span>{membershipLevel}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Quick Stats - Desktop */}
              <div className="hidden md:flex items-center gap-6">
                {membership && isActive && (
                  <div className="text-right">
                    <p className="text-white/60 text-xs uppercase tracking-wide">Expires</p>
                    <p className="font-semibold">
                      {parseLocalDate(membership.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-8 flex gap-1 border-b border-neutral-200 -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-5 py-3 text-sm font-medium transition-colors rounded-t-lg ${
                  activeTab === tab.id
                    ? "text-primary bg-neutral-50 border border-neutral-200 border-b-white -mb-px"
                    : "text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content - Boxed & Centered */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.15 }}
        >
          {activeTab === "profile" && <ProfileTab />}
          {activeTab === "membership" && <MembershipTab />}
          {activeTab === "payments" && <PaymentsTab />}
          {activeTab === "settings" && <SettingsTab />}
        </motion.div>
      </div>
    </div>
  );
}
