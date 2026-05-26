"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  paymentsThisMonth: number;
  upcomingEvents: number;
  totalHonorees: number;
  totalRevenue: number;
  revenueThisMonth: number;
}

export default function DashboardView() {
  const [stats, setStats] = useState<DashboardStats>({
    totalMembers: 0,
    activeMembers: 0,
    paymentsThisMonth: 0,
    upcomingEvents: 0,
    totalHonorees: 0,
    totalRevenue: 0,
    revenueThisMonth: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-stats', {
        credentials: 'include', // Include HttpOnly cookie for session validation
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Session expired or invalid - redirect to login
          window.location.href = '/admin';
          return;
        }
        console.error("Error fetching stats:", response.statusText);
        return;
      }

      const data = await response.json();
      setStats(data.stats || {});
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div>
        <h2 className="text-3xl font-heading text-neutral-900 mb-8">Dashboard</h2>
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-3xl font-heading text-neutral-900 mb-8">Dashboard</h2>
      
      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-white to-[#871c1c]/5 border-2 border-[#871c1c]/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">Total Members</h3>
            <svg className="w-5 h-5 text-[#871c1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-primary">{stats.totalMembers}</p>
          <p className="text-xs text-neutral-500 mt-1">{stats.activeMembers} active memberships</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-white to-[#E7C418]/5 border-2 border-[#E7C418]/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">Payments This Month</h3>
            <svg className="w-5 h-5 text-[#E7C418]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-[#E7C418]">{stats.paymentsThisMonth}</p>
          <p className="text-xs text-neutral-500 mt-1">{formatCurrency(stats.revenueThisMonth)} revenue</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-white to-[#a02323]/5 border-2 border-[#a02323]/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">Upcoming Events</h3>
            <svg className="w-5 h-5 text-[#a02323]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-[#a02323]">{stats.upcomingEvents}</p>
          <p className="text-xs text-neutral-500 mt-1">Active events</p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-white to-[#871c1c]/5 border-2 border-[#871c1c]/10">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-neutral-600">Total Honorees</h3>
            <svg className="w-5 h-5 text-[#871c1c]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <p className="text-3xl font-bold text-primary">{stats.totalHonorees}</p>
          <p className="text-xs text-neutral-500 mt-1">All time</p>
        </Card>
      </div>

      {/* Revenue Card */}
      <Card className="p-6 bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-white/80 mb-2">Total Revenue</h3>
            <p className="text-4xl font-bold">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-sm text-white/70 mt-2">
              {formatCurrency(stats.revenueThisMonth)} this month
            </p>
          </div>
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </Card>
    </div>
  );
}
