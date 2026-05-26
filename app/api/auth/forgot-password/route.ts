import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";
import { sendPasswordResetEmail } from "@/lib/emails";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

export async function POST(request: NextRequest) {
  try {
    // Check environment variables first
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error("SUPABASE_SERVICE_ROLE_KEY is not set");
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY is not set");
      return NextResponse.json(
        { error: "Email service is not configured. Please contact support." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { email } = body;
    
    // Rate limiting: max 5 password reset requests per email per hour
    const clientIP = getClientIP(request);
    const rateLimitKey = `forgot-password:${email?.toLowerCase() || clientIP}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 60 * 60 * 1000); // 5 requests per hour
    
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      const retryAfterMinutes = Math.ceil(retryAfter / 60);
      return NextResponse.json(
        { 
          error: `Too many password reset requests. Please try again in ${retryAfterMinutes} minute${retryAfterMinutes !== 1 ? 's' : ''}.`,
          retryAfter: retryAfter,
          retryAfterMinutes: retryAfterMinutes,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    let supabaseAdmin;
    try {
      supabaseAdmin = createAdminClient();
    } catch (adminError: any) {
      console.error("Failed to create admin client:", adminError);
      return NextResponse.json(
        { error: "Server configuration error. Please contact support." },
        { status: 500 }
      );
    }

    // Generate password reset token using generateLink
    // This gives us the token which we'll use to build our own reset link
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    let resetData;
    let resetError;
    
    try {
      const result = await supabaseAdmin.auth.admin.generateLink({
        type: "recovery",
        email: email,
        options: {
          redirectTo: `${siteUrl}/reset-password`,
        },
      });
      resetData = result.data;
      resetError = result.error;
    } catch (err: any) {
      console.error("Exception generating reset link:", err);
      resetError = err;
    }

    if (resetError || !resetData) {
      console.error("Error generating reset link:", resetError);
      // Still return success to not reveal if email exists
      return NextResponse.json({
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Extract parameters from the reset link
    // Supabase generateLink returns an action_link that points to their auth endpoint
    // Format: http://localhost:3000/auth/v1/verify?token=...&type=recovery&redirect_to=...
    let resetLink: string;
    
    try {
      const actionLink = resetData.properties?.action_link;
      if (!actionLink) {
        console.error("No action_link in reset data:", JSON.stringify(resetData, null, 2));
        return NextResponse.json({
          message: "If an account exists with this email, a password reset link has been sent.",
        });
      }

      console.log("Action link from Supabase:", actionLink);
      console.log("Full reset data:", JSON.stringify(resetData, null, 2));

      // Check if we have hashed_token in the properties (some Supabase versions provide this)
      const hashedToken = resetData.properties?.hashed_token;

      // Parse the action_link URL
      let resetUrl: URL;
      try {
        resetUrl = new URL(actionLink);
      } catch (e) {
        // If actionLink is not a full URL, it might be a relative path
        // Try to construct a full URL
        if (actionLink.startsWith('/')) {
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
          resetUrl = new URL(actionLink, supabaseUrl);
        } else {
          throw new Error("Invalid action_link format");
        }
      }
      
      // Extract the token from Supabase's action_link
      // Pass it directly to the reset page - we'll verify on form submission
      const actionUrl = new URL(actionLink);
      const token = actionUrl.searchParams.get("token");
      const code = actionUrl.searchParams.get("code");
      const type = actionUrl.searchParams.get("type") || "recovery";
      
      // Always prefer code-based recovery if available (more reliable)
      if (code) {
        // Use code-based recovery (newer Supabase format) - this is the preferred method
        resetLink = `${siteUrl}/reset-password?code=${encodeURIComponent(code)}&type=${type}`;
        console.log("Using code-based recovery link:", resetLink);
      } else if (token) {
        // For token-based recovery, pass token directly to reset page
        // Also include email as a fallback in case token verification fails
        const queryParams = new URLSearchParams();
        queryParams.set("token", token);
        queryParams.set("type", type);
        if (hashedToken) {
          queryParams.set("token_hash", hashedToken);
        }
        // Include email as fallback for password update
        queryParams.set("email", email);
        resetLink = `${siteUrl}/reset-password?${queryParams.toString()}`;
        console.log("Using direct reset link with token:", resetLink);
      } else {
        console.error("Failed to extract token or code from action_link");
        return NextResponse.json({
          message: "If an account exists with this email, a password reset link has been sent.",
        });
      }
    } catch (urlError: any) {
      console.error("Error parsing reset URL:", urlError);
      console.error("Reset data:", JSON.stringify(resetData, null, 2));
      return NextResponse.json({
        message: "If an account exists with this email, a password reset link has been sent.",
      });
    }

    // Store reset request timestamp to enforce expiration
    try {
      // Use database's now() function for accurate timestamp
      const { data: insertData, error: insertError } = await supabaseAdmin
        .from('password_reset_requests')
        .insert({
          email: email.toLowerCase(),
          // Don't set requested_at - let database use DEFAULT now()
        })
        .select();
      
      if (insertError) {
        console.error("Failed to store reset request timestamp:", insertError);
        // Don't fail the request, but log the error
      } else {
        console.log("Password reset request timestamp stored successfully:", {
          email: email.toLowerCase(),
          id: insertData?.[0]?.id,
          requestedAt: insertData?.[0]?.requested_at
        });
      }
    } catch (dbError: any) {
      // Log but don't fail - this is for expiration tracking, not critical
      console.error("Exception storing reset request timestamp:", dbError);
    }

    // Send email via Resend
    try {
      await sendPasswordResetEmail(email, resetLink);
      console.log("Password reset email sent successfully to:", email);
    } catch (emailError: any) {
      console.error("Failed to send password reset email:", {
        error: emailError?.message || emailError,
        stack: emailError?.stack,
        email: email,
        hasResendKey: !!process.env.RESEND_API_KEY,
        fromEmail: process.env.FROM_EMAIL,
        resendKeyLength: process.env.RESEND_API_KEY?.length || 0
      });
      
      // If it's a configuration error, we should still return success to prevent email enumeration
      // But log it clearly for admin debugging
      if (emailError?.message?.includes('not configured') || emailError?.message?.includes('missing')) {
        console.error("CRITICAL: Email service is not properly configured. Check RESEND_API_KEY and FROM_EMAIL environment variables.");
      }
      // Still return success to not reveal email issues to prevent email enumeration
      // But log the error for debugging - this is critical for troubleshooting
    }

    return NextResponse.json({
      message: "If an account exists with this email, a password reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Error in forgot-password route:", error);
    console.error("Error details:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
    });
    return NextResponse.json(
      { error: error?.message || "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

