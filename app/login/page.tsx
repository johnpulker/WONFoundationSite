"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const router = useRouter();
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Check if already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        window.location.href = "/portal";
      } else {
        setCheckingAuth(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      });

      if (signInError) {
        // Log the full error structure for debugging
        console.error('Supabase login error details:', {
          message: signInError.message,
          status: (signInError as any).status,
          name: signInError.name,
          error: (signInError as any).error,
          fullError: JSON.stringify(signInError, Object.getOwnPropertyNames(signInError))
        });
        
        // Provide more helpful error messages based on specific Supabase error codes/messages
        const errorMsg = signInError.message?.toLowerCase() || '';
        const errorStatus = (signInError as any).status;
        const errorName = signInError.name?.toLowerCase() || '';
        
        // Check for specific Supabase error codes first
        if (errorMsg.includes('email logins are disabled') || errorMsg.includes('email provider is disabled')) {
          throw new Error("Email authentication is currently disabled in the system. The administrator needs to enable email logins in Supabase. Please contact support with your email address and payment confirmation, and they will assist you with accessing your account.");
        } else if (errorStatus === 400 && errorMsg.includes('invalid login credentials')) {
          throw new Error("Invalid email or password. Please check your credentials and try again.");
        } else if (errorMsg.includes('email not confirmed') || errorMsg.includes('email_not_confirmed')) {
          throw new Error("Please verify your email address before logging in. Check your inbox for a confirmation email.");
        } else if (errorMsg.includes('user not found') || errorMsg.includes('user_not_found')) {
          throw new Error("No account found with this email. If you just signed up, please check your email for a confirmation link, or contact support.");
        } else if (errorMsg.includes('too many requests') || errorMsg.includes('rate_limit_exceeded')) {
          throw new Error("Too many login attempts. Please wait a few minutes and try again.");
        } else {
          // Show the actual Supabase error message so we can see what's really happening
          const displayMessage = signInError.message || "Login failed. Please try again or contact support.";
          throw new Error(displayMessage);
        }
      }
      
      // Use window.location for full page reload to ensure cookies are set
      window.location.href = "/portal";
    } catch (err: any) {
      setError(err.message || "Invalid email or password");
      setLoading(false);
    }
  };

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-accent/10">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-accent/10 px-4 py-12">
      <Card className="p-8 w-full max-w-md">
        <h1 className="text-3xl font-heading text-neutral-900 mb-2 text-center">
          Welcome Back
        </h1>
        <p className="text-neutral-600 text-center mb-6">
          Sign in to access your member portal
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={loginData.email}
              onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-neutral-700">
                Password
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-primary hover:text-primary/80 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                className="w-full px-4 py-3 pr-12 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 focus:outline-none transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <Button
            variant="primary"
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        {/* Signup redirect - membership required */}
        <div className="mt-8 pt-6 border-t border-neutral-200">
          <div className="text-center">
            <p className="text-neutral-600 mb-4">Don&apos;t have an account?</p>
            <Link href="/membership#join">
              <Button variant="gold" className="w-full">
                Become a Member
              </Button>
            </Link>
            <p className="text-xs text-neutral-500 mt-3">
              Membership starts at $25/year and includes access to all programs, events, and the member directory.
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-neutral-600 hover:text-primary transition-colors">
            ← Back to home
          </Link>
        </div>
      </Card>
    </div>
  );
}
