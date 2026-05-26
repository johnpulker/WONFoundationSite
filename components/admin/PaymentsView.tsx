"use client";

import { useState, useEffect } from "react";

interface Payment {
  id: string;
  user_id: string | null;
  amount: number;
  type: "membership" | "donation" | "ticket";
  status: "completed" | "pending" | "failed";
  provider: string;
  provider_tx_id: string | null;
  created_at: string;
  membership_level?: string;
  user_email?: string;
  user_name?: string;
  event_name?: string;
  is_complimentary?: boolean;
  original_amount?: number;
}

export default function PaymentsView() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "donation" | "membership" | "ticket">("all");
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalMemberships: 0,
    totalTickets: 0,
    totalAmount: 0,
  });

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      // Use admin API to bypass RLS and get registration data
      const response = await fetch('/api/admin/payments', {
        credentials: 'include', // Include HttpOnly cookie for session validation
      });

      if (!response.ok) {
        console.error("Error fetching payments:", response.statusText);
        return;
      }

      const data = await response.json();
      const transformedPayments = data.payments || [];

      setPayments(transformedPayments);

      // Calculate stats (excluding complimentary payments)
      const donations = transformedPayments.filter((p: Payment) => 
        p.type === "donation" && p.status === "completed" && !p.is_complimentary
      );
      const memberships = transformedPayments.filter((p: Payment) => 
        p.type === "membership" && p.status === "completed" && !p.is_complimentary
      );
      const tickets = transformedPayments.filter((p: Payment) => 
        p.type === "ticket" && p.status === "completed" && !p.is_complimentary
      );

      setStats({
        totalDonations: donations.reduce((sum: number, p: Payment) => sum + Number(p.amount || 0), 0),
        totalMemberships: memberships.reduce((sum: number, p: Payment) => sum + Number(p.amount || 0), 0),
        totalTickets: tickets.reduce((sum: number, p: Payment) => sum + Number(p.amount || 0), 0),
        totalAmount: transformedPayments
          .filter((p: Payment) => p.status === "completed" && !p.is_complimentary)
          .reduce((sum: number, p: Payment) => sum + Number(p.amount || 0), 0),
      });
    } catch (err) {
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = filter === "all" 
    ? payments 
    : payments.filter(p => p.type === filter);

  const getTypeStyles = (type: string) => {
    switch (type) {
      case "donation":
        return "bg-gradient-to-r from-pink-500 to-rose-500 text-white";
      case "membership":
        return "bg-gradient-to-r from-purple-600 to-indigo-600 text-white";
      case "ticket":
        return "bg-gradient-to-r from-[#E7C418] to-orange-500 text-white";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "donation":
        return "♥";
      case "membership":
        return "★";
      case "ticket":
        return "🎟";
      default:
        return "•";
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700 border border-green-200";
      case "pending":
        return "bg-[#F0D43A]/30 text-[#C9A814] border border-[#E7C418]/50";
      case "failed":
        return "bg-red-100 text-red-700 border border-red-200";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleMarkCheckReceived = async (payment: Payment) => {
    if (!payment.user_id) return;
    if (!confirm("Mark this check payment as received and activate the membership?")) return;

    try {
      const response = await fetch("/api/admin/payments", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          paymentId: payment.id,
          userId: payment.user_id,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        console.error("Failed to mark check as received:", data);
        alert(data.error || "Failed to update payment. Please try again.");
        return;
      }

      await fetchPayments();
    } catch (err) {
      console.error("Error marking check as received:", err);
      alert("Failed to update payment. Please try again.");
    }
  };


  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-[#871c1c] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-heading text-neutral-900">Payments</h2>
        <button
          onClick={fetchPayments}
          className="px-4 py-2 text-sm font-medium text-[#871c1c] hover:bg-[#871c1c]/10 rounded-lg transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-[#871c1c] to-[#a02323] rounded-xl p-6 text-white">
          <p className="text-white/70 text-sm font-medium mb-1">Total Revenue</p>
          <p className="text-3xl font-heading font-bold">${stats.totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-pink-500">♥</span>
            <p className="text-neutral-500 text-sm font-medium">Donations</p>
          </div>
          <p className="text-2xl font-heading font-bold text-neutral-900">${stats.totalDonations.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-purple-500">★</span>
            <p className="text-neutral-500 text-sm font-medium">Memberships</p>
          </div>
          <p className="text-2xl font-heading font-bold text-neutral-900">${stats.totalMemberships.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-xl p-6 border border-neutral-200 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#E7C418]">🎟</span>
            <p className="text-neutral-500 text-sm font-medium">Event Tickets</p>
          </div>
          <p className="text-2xl font-heading font-bold text-neutral-900">${stats.totalTickets.toLocaleString()}</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: "all", label: "All Payments" },
          { id: "donation", label: "Donations", icon: "♥" },
          { id: "membership", label: "Memberships", icon: "★" },
          { id: "ticket", label: "Tickets", icon: "🎟" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilter(tab.id as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              filter === tab.id
                ? "bg-[#871c1c] text-white shadow-md"
                : "bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            {tab.icon && <span className="mr-1">{tab.icon}</span>}
            {tab.label}
            <span className="ml-2 px-1.5 py-0.5 rounded text-xs bg-white/20">
              {tab.id === "all" 
                ? payments.length 
                : payments.filter(p => p.type === tab.id).length}
            </span>
          </button>
        ))}
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-xl border border-neutral-200 shadow-sm overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-heading text-neutral-900 mb-1">No payments found</h3>
            <p className="text-neutral-500 text-sm">
              {filter === "all" 
                ? "Payments will appear here once transactions are made."
                : `No ${filter} payments yet.`}
            </p>
          </div>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
                <tr className="bg-neutral-50 border-b border-neutral-200">
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm uppercase tracking-wider">Type</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm uppercase tracking-wider">From</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm uppercase tracking-wider">Amount</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm uppercase tracking-wider">Transaction ID</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm uppercase tracking-wider">Date</th>
                  <th className="text-left py-4 px-6 font-semibold text-neutral-700 text-sm uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold ${getTypeStyles(payment.type)}`}>
                          <span>{getTypeIcon(payment.type)}</span>
                          <span className="capitalize">{payment.type}</span>
                          {payment.is_complimentary && (
                            <span className="ml-1 px-1.5 py-0.5 rounded text-xs bg-white/30 font-normal">comp</span>
                          )}
                        </span>
                        {payment.event_name && (
                          <p className="text-xs text-neutral-500 mt-1 truncate max-w-[150px]" title={payment.event_name}>
                            {payment.event_name}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <p className="font-medium text-neutral-900">{payment.user_name}</p>
                        <p className="text-sm text-neutral-500">{payment.user_email}</p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        {payment.is_complimentary ? (
                          <>
                            <span className="text-lg font-heading font-bold text-neutral-400 line-through">
                              ${Number(payment.original_amount || payment.amount).toLocaleString()}
                            </span>
                            <span className="text-lg font-heading font-bold text-neutral-900">
                              $0 <span className="text-xs text-neutral-500 font-normal">(comp)</span>
                            </span>
                          </>
                        ) : (
                          <span className="text-lg font-heading font-bold text-neutral-900">
                            ${Number(payment.amount).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyles(payment.status)}`}>
                        {payment.status === "completed" && (
                          <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        <span className="capitalize">{payment.status}</span>
                    </span>
                  </td>
                    <td className="py-4 px-6">
                      <code className="text-xs bg-neutral-100 px-2 py-1 rounded text-neutral-600">
                        {payment.provider_tx_id 
                          ? payment.provider_tx_id.slice(0, 16) + "..." 
                          : "—"}
                      </code>
                    </td>
                    <td className="py-4 px-6 text-neutral-600">
                      <div>
                        <p>{new Date(payment.created_at).toLocaleDateString()}</p>
                        <p className="text-xs text-neutral-400">
                          {new Date(payment.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {payment.type === "membership" &&
                       payment.provider === "admin" &&
                       payment.status === "pending" &&
                       payment.user_id ? (
                        <button
                          onClick={() => handleMarkCheckReceived(payment)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-600 text-white hover:bg-green-700 transition-colors"
                        >
                          Mark Check Received
                        </button>
                      ) : (
                        <span className="text-xs text-neutral-400">—</span>
                      )}
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </div>

      {/* Summary Footer */}
      {filteredPayments.length > 0 && (
        <div className="mt-4 flex items-center justify-between text-sm text-neutral-500">
          <p>
            Showing {filteredPayments.length} payment{filteredPayments.length !== 1 ? "s" : ""}
          </p>
          <p>
            Total: <span className="font-semibold text-neutral-900">
              ${filteredPayments
                .filter(p => p.status === "completed")
                .reduce((sum, p) => sum + Number(p.amount), 0)
                .toLocaleString()}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
