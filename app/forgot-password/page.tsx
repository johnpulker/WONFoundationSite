"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Show the specific error from the API
        const errorMessage = data.error || `Failed to send reset email (${response.status})`;
        console.error("Password reset error:", errorMessage, data);
        throw new Error(errorMessage);
      }

      setSuccess(true);
    } catch (err: any) {
      // Network errors or other errors
      const errorMessage = err.message || "Something went wrong. Please try again.";
      console.error("Password reset request failed:", err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-accent/10 px-4 py-12">
      <Card className="p-8 w-full max-w-md">
        <h1 className="text-3xl font-heading text-neutral-900 mb-2 text-center">
          Reset Password
        </h1>
        <p className="text-neutral-600 text-center mb-6">
          Enter your email address and we&apos;ll send you a link to reset your password.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              <p className="font-semibold mb-1">Email sent!</p>
              <p>
                Check your inbox for a password reset link. If you don&apos;t see it, check your spam folder.
              </p>
            </div>
            <div className="text-center space-y-3">
              <Link href="/login">
                <Button variant="primary" className="w-full">
                  Back to Login
                </Button>
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setEmail("");
                }}
                className="text-sm text-neutral-600 hover:text-primary transition-colors"
              >
                Send another email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
            <Button
              variant="primary"
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-neutral-600 hover:text-primary transition-colors">
            ← Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
}

