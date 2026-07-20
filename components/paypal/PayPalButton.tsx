"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import { useState, useEffect } from "react";

interface PayPalButtonProps {
  amount: number;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  description?: string;
}

export default function PayPalButton({
  amount,
  onSuccess,
  onError,
  description = "Payment",
}: PayPalButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

  // Debug: Log the Client ID being used (first 20 chars only for security)
  useEffect(() => {
    if (paypalClientId) {
      console.log("🔍 PayPal Client ID in use:", paypalClientId.substring(0, 20) + "...");
      console.log("🔍 Full Client ID length:", paypalClientId.length);
      // Check if it looks like sandbox (sandbox IDs are typically shorter, but this is just a hint)
      if (paypalClientId.length < 80) {
        console.warn("⚠️ Client ID appears short - verify you're using LIVE credentials from PayPal Dashboard");
      }
    }
  }, [paypalClientId]);

  if (!paypalClientId) {
    return (
      <div className="p-4 bg-[#F0D43A]/30 border border-[#E7C418]/50 rounded-card">
        <p className="text-[#C9A814] text-sm">
          PayPal is not configured. Please set NEXT_PUBLIC_PAYPAL_CLIENT_ID in your environment variables.
        </p>
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: paypalClientId,
        currency: "USD",
        intent: "capture",
        enableFunding: "card,paylater",
        disableFunding: "venmo",
      }}
      key={paypalClientId} // Force re-render if Client ID changes - helps with cache issues
    >
      <PayPalButtons
        createOrder={(data, actions) => {
          setIsProcessing(true);
          const invoiceId = `DON-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                reference_id: invoiceId,
                invoice_id: invoiceId,
                custom_id: 'donation',
                description: description,
                soft_descriptor: 'WON Foundation',
                amount: {
                  currency_code: "USD",
                  value: amount.toString(),
                  breakdown: {
                    item_total: {
                      currency_code: "USD",
                      value: amount.toString(),
                    },
                  },
                },
                items: [
                  {
                    name: 'Donation to WON Foundation',
                    description: description || 'Supporting women leaders through mentoring, training, and networking programs.',
                    unit_amount: {
                      currency_code: "USD",
                      value: amount.toString(),
                    },
                    quantity: "1",
                    category: "DIGITAL_GOODS",
                  },
                ],
              },
            ],
          });
        }}
        onApprove={async (data, actions) => {
          try {
            const details = await actions.order?.capture();
            if (details) {
              setIsProcessing(false);
              onSuccess(details);
            }
          } catch (error) {
            setIsProcessing(false);
            onError(error);
          }
        }}
        onError={(error) => {
          setIsProcessing(false);
          onError(error);
        }}
        onCancel={() => {
          setIsProcessing(false);
        }}
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "paypal",
        }}
      />
    </PayPalScriptProvider>
  );
}


