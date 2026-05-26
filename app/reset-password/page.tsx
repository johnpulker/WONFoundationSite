"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [validatingToken, setValidatingToken] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const token = searchParams.get("token");
  const tokenHash = searchParams.get("token_hash");
  const code = searchParams.get("code");
  const type = searchParams.get("type");
  const email = searchParams.get("email");

  useEffect(() => {
    // Check for error parameter from verify endpoint
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "invalid_or_expired_token") {
        setError("The reset link is invalid or has expired. Please request a new password reset link.");
      } else if (errorParam === "verification_failed") {
        setError("Token verification failed. Please request a new password reset link.");
      } else {
        setError("An error occurred. Please request a new password reset link.");
      }
      setValidatingToken(false);
      return;
    }

    // Check if we have a valid session or token/code in URL
    const checkSession = async () => {
      const supabase = createClient();
      
      // First check for token/code in URL (direct access)
      if (code || token) {
        // We have a token/code in URL, proceed with validation
        if (type && type !== "recovery") {
          setError("Invalid reset link type. Please request a new password reset link.");
          setValidatingToken(false);
          return;
        }
        // Token/code is present, user can proceed to reset password
        // The token will be verified when they submit the form
        setValidatingToken(false);
        return;
      }

      // No token/code in URL - check if we have a session (from Supabase verify redirect)
      // Also check if there's a pending password reset from sessionStorage
      const pendingPassword = sessionStorage.getItem("pending_password_reset");
      const pendingPasswordConfirm = sessionStorage.getItem("pending_password_confirm");
      
      // If there's a pending password, we came back from Supabase's verify redirect
      // Try to find the session, but don't wait too long
      const maxRetries = 3; // Reduced to 3 retries (1.5 seconds max)
      const retryDelay = 500; // Fixed delay
      
      // Set a timeout to ensure we always exit
      const timeoutId = setTimeout(() => {
        if (pendingPassword) {
          setPassword(pendingPassword);
          setConfirmPassword(pendingPasswordConfirm || "");
          setError("Session verification is taking longer than expected. Your password is still filled in - please try submitting again.");
        } else {
          setError("Session not found. Please try clicking the reset link from your email again, or request a new password reset link.");
        }
        setValidatingToken(false);
      }, 5000); // 5 second absolute timeout
      
      let sessionFound = false;
      for (let i = 0; i < maxRetries; i++) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        
        // Try to get the session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          clearTimeout(timeoutId); // Clear timeout if we found the session
          // User is already verified via Supabase's verify endpoint redirect
          console.log("Session found after", i + 1, "attempts");
          sessionFound = true;
          
          // If there's a pending password reset, automatically complete it
          if (pendingPassword && pendingPasswordConfirm) {
            setPassword(pendingPassword);
            setConfirmPassword(pendingPasswordConfirm);
            // Clear the pending password from sessionStorage
            sessionStorage.removeItem("pending_password_reset");
            sessionStorage.removeItem("pending_password_confirm");
            // Auto-submit the form after a short delay
            // Auto-submit by setting loading and calling the submit logic
            setLoading(true);
            setTimeout(async () => {
              try {
                const { error: passwordError } = await supabase.auth.updateUser({
                  password: pendingPassword,
                });
                if (passwordError) throw passwordError;
                setSuccess(true);
                setTimeout(() => router.push("/login"), 2000);
              } catch (err: any) {
                setError(err.message || "Failed to reset password");
                setLoading(false);
              }
            }, 300);
          }
          
          setValidatingToken(false);
          return;
        }

        // Try refreshing the session
        const { data: refreshData } = await supabase.auth.refreshSession();
        if (refreshData?.session?.user) {
          clearTimeout(timeoutId); // Clear timeout if we found the session
          console.log("Session found after refresh, attempt", i + 1);
          sessionFound = true;
          
          // If there's a pending password reset, automatically complete it
          if (pendingPassword && pendingPasswordConfirm) {
            setPassword(pendingPassword);
            setConfirmPassword(pendingPasswordConfirm);
            sessionStorage.removeItem("pending_password_reset");
            sessionStorage.removeItem("pending_password_confirm");
            // Auto-submit by setting loading and calling the submit logic
            setLoading(true);
            setTimeout(async () => {
              try {
                const { error: passwordError } = await supabase.auth.updateUser({
                  password: pendingPassword,
                });
                if (passwordError) throw passwordError;
                setSuccess(true);
                setTimeout(() => router.push("/login"), 2000);
              } catch (err: any) {
                setError(err.message || "Failed to reset password");
                setLoading(false);
              }
            }, 300);
          }
          
          setValidatingToken(false);
          return;
        }
      }

      // Still no session - this means the verify redirect didn't set the session
      clearTimeout(timeoutId); // Clear timeout since we're handling it here
      if (pendingPassword) {
        console.log("No session found after verify redirect, but pending password exists");
        // Restore the password fields so user can try again
        setPassword(pendingPassword);
        setConfirmPassword(pendingPasswordConfirm || "");
        setError("Session verification failed. Your password is still filled in - please try submitting again, or request a new password reset link.");
      } else {
        setError("Session not found. Please try clicking the reset link from your email again, or request a new password reset link.");
      }
      setValidatingToken(false);
    };

    checkSession();
  }, [token, tokenHash, code, type, searchParams, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Trim passwords to remove any accidental whitespace
    const trimmedPassword = password.trim();
    const trimmedConfirmPassword = confirmPassword.trim();

    // Validation
    if (!trimmedPassword || !trimmedConfirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (trimmedPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (trimmedPassword !== trimmedConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // First, check if we already have a valid session (from Supabase's verify endpoint redirect)
      // If we have a pending password from sessionStorage, retry getting the session a few times
      const pendingPassword = sessionStorage.getItem("pending_password_reset");
      let currentUser = null;
      
      if (pendingPassword) {
        // We came back from Supabase's verify redirect, retry getting session
        for (let i = 0; i < 5; i++) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            currentUser = user;
            // Clear pending password
            sessionStorage.removeItem("pending_password_reset");
            sessionStorage.removeItem("pending_password_confirm");
            break;
          }
          // Try refreshing
          const { data: refreshData } = await supabase.auth.refreshSession();
          if (refreshData?.session?.user) {
            currentUser = refreshData.session.user;
            sessionStorage.removeItem("pending_password_reset");
            sessionStorage.removeItem("pending_password_confirm");
            break;
          }
        }
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        currentUser = user;
      }
      
      if (currentUser) {
        // User is already verified via Supabase's verify endpoint
        // Check if reset request is still valid (within 1 hour)
        try {
          const expirationCheck = await fetch('/api/auth/check-reset-expiration', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: currentUser.email }),
          });

          const expirationData = await expirationCheck.json();
          if (!expirationData.valid) {
            // Sign out and show error
            await supabase.auth.signOut();
            throw new Error('This reset link has expired. Please request a new password reset link.');
          }
        } catch (expirationError: any) {
          if (expirationError.message?.includes('expired')) {
            throw expirationError;
          }
          // If check fails, log but continue (don't block legitimate resets)
          console.warn('Failed to check reset expiration:', expirationError);
        }

        // Update password
        const { error: passwordError } = await supabase.auth.updateUser({
          password: trimmedPassword,
        });

        if (passwordError) {
          // Filter out "weak password" messages from Supabase
          const errorMessage = passwordError.message || "";
          if (errorMessage.toLowerCase().includes("weak") || 
              errorMessage.toLowerCase().includes("password is too weak")) {
            // If Supabase says password is weak but it meets our 8 char requirement, 
            // just use a generic error
            throw new Error("Password must be at least 8 characters");
          }
          throw passwordError;
        }

        // Mark reset request as used (if we have user email)
        if (currentUser?.email) {
          try {
            await fetch('/api/auth/mark-reset-used', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: currentUser.email }),
            });
          } catch (markError) {
            // Log but don't fail - password was already updated
            console.warn('Failed to mark reset as used:', markError);
          }
        }

        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      // No session, need to verify token/code
      if (!code && !token) {
        setError("Invalid reset token. Please request a new password reset link.");
        setLoading(false);
        return;
      }

      // Handle code-based recovery (newer Supabase format) - this is the preferred method
      if (code) {
        // Exchange the code for a session
        const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          throw exchangeError;
        }

        // If exchange succeeded, we now have a session
        // Check if reset request is still valid (within 1 hour)
        const userEmail = exchangeData.user?.email;
        if (userEmail) {
          try {
            const expirationCheck = await fetch('/api/auth/check-reset-expiration', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail }),
            });

            const expirationData = await expirationCheck.json();
            if (!expirationData.valid) {
              // Sign out and show error
              await supabase.auth.signOut();
              throw new Error('This reset link has expired. Please request a new password reset link.');
            }
          } catch (expirationError: any) {
            if (expirationError.message?.includes('expired')) {
              throw expirationError;
            }
            // If check fails, log but continue (don't block legitimate resets)
            console.warn('Failed to check reset expiration:', expirationError);
          }
        }

        // Update the password
        const { error: passwordError } = await supabase.auth.updateUser({
          password: trimmedPassword,
        });

        if (passwordError) {
          // Filter out "weak password" messages from Supabase
          const errorMessage = passwordError.message || "";
          if (errorMessage.toLowerCase().includes("weak") || 
              errorMessage.toLowerCase().includes("password is too weak")) {
            // If Supabase says password is weak but it meets our 8 char requirement, 
            // just use a generic error
            throw new Error("Password must be at least 8 characters");
          }
          throw passwordError;
        }

        // Mark reset request as used
        if (userEmail) {
          try {
            await fetch('/api/auth/mark-reset-used', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: userEmail }),
            });
          } catch (markError) {
            // Log but don't fail - password was already updated
            console.warn('Failed to mark reset as used:', markError);
          }
        }

        setSuccess(true);
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return; // Exit early for code-based recovery
      } 
      // Handle token-based recovery
      else if (token) {
        // For token-based recovery, use our server-side API route
        // which will verify the token and update the password directly
        const response = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token: token,
            token_hash: tokenHash || null,
            password: trimmedPassword,
            email: email || null,
          }),
        });

        // Check if response is JSON before parsing
        const contentType = response.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
          data = await response.json();
        } else {
          // If not JSON, it's likely an HTML error page
          const text = await response.text();
          console.error("API returned non-JSON response:", text.substring(0, 200));
          throw new Error("Server error. Please try again or request a new password reset link.");
        }

        if (!response.ok) {
          throw new Error(data.error || "Failed to reset password");
        }

        setSuccess(true);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err: any) {
      // Filter out "weak password" messages - only show our simple requirement
      let errorMessage = err.message || "Failed to reset password. The link may have expired. Please request a new password reset link.";
      if (errorMessage.toLowerCase().includes("weak") || 
          errorMessage.toLowerCase().includes("password is too weak") ||
          errorMessage.toLowerCase().includes("password strength")) {
        errorMessage = "Password must be at least 8 characters";
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-accent/10 px-4 py-12">
        <Card className="p-8 w-full max-w-md">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-neutral-600">Validating reset token...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-accent/10 px-4 py-12">
      <Card className="p-8 w-full max-w-md">
        <h1 className="text-3xl font-heading text-neutral-900 mb-2 text-center">
          Set New Password
        </h1>
        <p className="text-neutral-600 text-center mb-6">
          Enter your new password below.
        </p>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {error}
          </div>
        )}

        {success ? (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
              <p className="font-semibold mb-1">Password reset successful!</p>
              <p>Redirecting you to the login page...</p>
            </div>
            <Link href="/login">
              <Button variant="primary" className="w-full">
                Go to Login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              <p className="text-xs text-neutral-500 mt-1">
                Must be at least 8 characters
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 pr-12 rounded-lg border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700 focus:outline-none transition-colors"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
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
              {loading ? "Resetting Password..." : "Reset Password"}
            </Button>
          </form>
        )}

        <div className="mt-6 text-center space-y-2">
          <Link href="/login" className="text-sm text-neutral-600 hover:text-primary transition-colors block">
            ← Back to login
          </Link>
          <Link href="/forgot-password" className="text-sm text-neutral-600 hover:text-primary transition-colors block">
            Need a new reset link?
          </Link>
        </div>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-white to-accent/10 px-4 py-12">
          <Card className="p-8 w-full max-w-md">
            <div className="text-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-neutral-600">Loading...</p>
            </div>
          </Card>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

