"use client";

import { useState, useEffect } from "react";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

interface Payment {
  id: string;
  created_at: string;
  amount: number;
  type: string;
  status: string;
  provider_tx_id: string | null;
  membership_level?: string | null;
  is_complimentary?: boolean;
  original_amount?: number;
}

export default function PaymentsTab() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("Not authenticated");
        return;
      }

      // Fetch payments
      const { data, error: fetchError } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      // is_complimentary is now stored directly on the payment record
      const paymentsWithComplimentary = (data || []).map((payment: any) => {
        const isComplimentary = payment.is_complimentary === true;

        return {
          ...payment,
          is_complimentary: isComplimentary,
          original_amount: isComplimentary ? payment.amount : undefined,
          amount: isComplimentary ? 0 : payment.amount,
        };
      });

      setPayments(paymentsWithComplimentary);
    } catch (err: any) {
      console.error("Error fetching payments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentDescription = (payment: Payment) => {
    let description = "";
    switch (payment.type) {
      case "membership":
        description = "Membership Payment";
        break;
      case "donation":
        description = "Donation";
        break;
      case "ticket":
        description = "Event Registration";
        break;
      default:
        description = payment.type;
    }
    
    if (payment.is_complimentary) {
      description += " (comp)";
    }
    
    return description;
  };

  if (loading) {
    return (
      <Card className="p-8">
        <div className="text-center text-neutral-600">Loading payment history...</div>
      </Card>
    );
  }

  return (
    <Card className="p-8">
      <h2 className="text-2xl font-heading text-neutral-900 mb-6">Payment History</h2>
      
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-neutral-600">No payment history yet.</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="border border-neutral-200 rounded-lg p-4 flex justify-between items-center hover:bg-neutral-50 transition-colors"
            >
              <div>
                <p className="font-semibold text-neutral-900">{getPaymentDescription(payment)}</p>
                <p className="text-sm text-neutral-600">
                  {new Date(payment.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
                {payment.provider_tx_id && (
                  <p className="text-xs text-neutral-500 font-mono mt-1">
                    ID: {payment.provider_tx_id}
                  </p>
                )}
              </div>
              <div className="text-right">
                {payment.is_complimentary ? (
                  <>
                    <p className="font-semibold text-neutral-400 text-lg line-through">
                      ${payment.original_amount?.toLocaleString() || payment.amount}
                    </p>
                    <p className="font-semibold text-neutral-900 text-lg">
                      $0 <span className="text-xs text-neutral-500 font-normal">(comp)</span>
                    </p>
                  </>
                ) : (
                  <p className="font-semibold text-neutral-900 text-lg">${payment.amount.toLocaleString()}</p>
                )}
                <p className={`text-sm font-medium ${
                  payment.status === "completed" ? "text-green-600" : 
                  payment.status === "pending" ? "text-[#E7C418]" : "text-red-600"
                }`}>
                  {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
