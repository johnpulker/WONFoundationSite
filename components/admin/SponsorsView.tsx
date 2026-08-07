"use client";

import { useState, useEffect, useCallback } from "react";

interface Sponsor {
  id: string;
  created_at: string;
  amount: number;
  status: string;
  provider: string;
  provider_tx_id: string | null;
  membership_level: string | null;
  payer_name: string | null;
  payer_email: string | null;
  user_id: string | null;
  users: {
    email: string;
    full_name: string | null;
    first_name: string | null;
    last_name: string | null;
  } | null;
}

const TIER_COLORS: Record<string, string> = {
  SHERO: "bg-gradient-to-r from-[#871c1c] to-[#a02323] text-white",
  HERSTORY: "bg-gradient-to-r from-[#5a1a6e] to-[#7a2490] text-white",
  "LEADING LADY": "bg-gradient-to-r from-[#C9A814] to-[#E7C418] text-white",
  "GIRL POWER": "bg-gradient-to-r from-[#1a5c8a] to-[#2478b0] text-white",
};

const TIER_ORDER = ["SHERO", "HERSTORY", "LEADING LADY", "GIRL POWER"];

function getSponsorName(s: Sponsor): string {
  // Prefer logged-in user's name, fall back to PayPal payer info
  if (s.users?.full_name) return s.users.full_name;
  const first = s.users?.first_name || "";
  const last = s.users?.last_name || "";
  if (first || last) return `${first} ${last}`.trim();
  if (s.payer_name) return s.payer_name;
  return "—";
}

function getSponsorEmail(s: Sponsor): string {
  // Prefer logged-in user's email, fall back to PayPal payer email
  return s.users?.email || s.payer_email || "—";
}

function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function SponsorsView() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterTier, setFilterTier] = useState<string>("all");

  const fetchSponsors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/sponsors");
      if (!res.ok) throw new Error("Failed to load sponsors");
      const json = await res.json();
      setSponsors(json.sponsors || []);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSponsors();
  }, [fetchSponsors]);

  const filtered =
    filterTier === "all"
      ? sponsors
      : sponsors.filter(
          (s) =>
            (s.membership_level || "").toUpperCase() ===
            filterTier.toUpperCase()
        );

  // Stats
  const totalRaised = sponsors
    .filter((s) => s.status === "completed")
    .reduce((sum, s) => sum + (s.amount || 0), 0);
  const countByTier = TIER_ORDER.reduce<Record<string, number>>((acc, t) => {
    acc[t] = sponsors.filter(
      (s) => (s.membership_level || "").toUpperCase() === t && s.status === "completed"
    ).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-neutral-900">
            Sponsors
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            People who have purchased a sponsorship package
          </p>
        </div>
        <button
          onClick={fetchSponsors}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-600 bg-white border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="col-span-2 md:col-span-1 bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
          <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium">Total Raised</p>
          <p className="text-2xl font-bold text-primary mt-1">{formatAmount(totalRaised)}</p>
          <p className="text-xs text-neutral-400 mt-0.5">{sponsors.filter(s => s.status === "completed").length} sponsor{sponsors.filter(s => s.status === "completed").length !== 1 ? "s" : ""}</p>
        </div>
        {TIER_ORDER.map((tier) => (
          <div key={tier} className="bg-white rounded-xl border border-neutral-200 p-4 shadow-sm">
            <p className="text-xs text-neutral-500 uppercase tracking-wide font-medium truncate">{tier}</p>
            <p className="text-2xl font-bold text-neutral-800 mt-1">{countByTier[tier]}</p>
            <p className="text-xs text-neutral-400 mt-0.5">sponsor{countByTier[tier] !== 1 ? "s" : ""}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...TIER_ORDER].map((tier) => (
          <button
            key={tier}
            onClick={() => setFilterTier(tier)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filterTier === tier
                ? "bg-primary text-white"
                : "bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50"
            }`}
          >
            {tier === "all" ? "All Tiers" : tier}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-600">
            <p className="font-medium">Error loading sponsors</p>
            <p className="text-sm mt-1">{error}</p>
            <button onClick={fetchSponsors} className="mt-3 text-sm underline">Try again</button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-neutral-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="font-medium">No sponsors found</p>
            {filterTier !== "all" && (
              <p className="text-sm mt-1">No {filterTier} sponsors yet</p>
            )}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Name</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Tier</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Amount</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-neutral-500 uppercase tracking-wide">Transaction ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((sponsor) => {
                const tier = (sponsor.membership_level || "").toUpperCase();
                const tierColor = TIER_COLORS[tier] || "bg-neutral-100 text-neutral-700";
                return (
                  <tr key={sponsor.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-neutral-900 whitespace-nowrap">
                      {getSponsorName(sponsor)}
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {getSponsorEmail(sponsor)}
                    </td>
                    <td className="px-6 py-4">
                      {tier ? (
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${tierColor}`}>
                          {tier}
                        </span>
                      ) : (
                        <span className="text-neutral-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-semibold text-neutral-900">
                      {sponsor.amount ? formatAmount(sponsor.amount) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                        sponsor.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {sponsor.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-600 whitespace-nowrap">
                      {formatDate(sponsor.created_at)}
                    </td>
                    <td className="px-6 py-4 text-neutral-400 font-mono text-xs truncate max-w-[160px]">
                      {sponsor.provider_tx_id || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
