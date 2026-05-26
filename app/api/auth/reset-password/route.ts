import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabaseAdmin";
import { checkRateLimit, getClientIP } from "@/lib/rateLimit";

/**
 * This route handles password reset by verifying the token and updating the password
 * It uses the admin client to verify the token and update the password directly
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, token_hash, code, password, email } = body;
    
    // Rate limiting: max 5 password reset attempts per email per hour
    // This prevents abuse while allowing legitimate users to retry if needed
    // We use email instead of IP to avoid blocking multiple users behind the same IP
    const rateLimitKey = email ? `reset-password:${email.toLowerCase()}` : `reset-password:${getClientIP(request)}`;
    const rateLimit = checkRateLimit(rateLimitKey, 5, 60 * 60 * 1000); // 5 attempts per hour
    
    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      const retryAfterMinutes = Math.ceil(retryAfter / 60);
      return NextResponse.json(
        { 
          error: `Too many password reset attempts. Please try again in ${retryAfterMinutes} minute${retryAfterMinutes !== 1 ? 's' : ''}.`,
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

    if (!password) {
      return NextResponse.json(
        { error: "Password is required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!token && !code) {
      return NextResponse.json(
        { error: "Token or code is required" },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminClient();

    let userId: string | null = null;

    // If we have a code, exchange it for a session first
    if (code) {
      // For code-based recovery, we need to exchange it for a session
      // But we can't do that with admin client directly
      // So we'll need to use a different approach
      return NextResponse.json(
        { error: "Code-based recovery should be handled client-side" },
        { status: 400 }
      );
    }

    // For token-based recovery, we need to verify the token and get the user
    // The best approach is to use Supabase's verifyOtp method with the recovery token
    // or verify the token hash if available
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
    
    if (!serviceRoleKey) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    // First, we need to find the user - email is required for this approach
    if (!email) {
      return NextResponse.json(
        { error: "Email is required for password reset. Please request a new password reset link." },
        { status: 400 }
      );
    }

    console.log("Finding user by email:", email);
    
    // Check if reset request is within expiration window (1 hour)
    const EXPIRATION_MS = 60 * 60 * 1000; // 1 hour in milliseconds
    const emailLower = email.toLowerCase();
    
    console.log("Looking for reset request for email:", emailLower);
    
    // Get the MOST RECENT reset request (used or unused) to check if this is a new request
    const { data: allRequests } = await supabaseAdmin
      .from('password_reset_requests')
      .select('*')
      .eq('email', emailLower)
      .order('requested_at', { ascending: false })
      .limit(5);
    
    if (!allRequests || allRequests.length === 0) {
      console.error("No reset request found in database for email:", emailLower);
      return NextResponse.json(
        { error: "No password reset request found. Please request a new password reset link." },
        { status: 400 }
      );
    }
    
    // Find the most recent UNUSED request
    const resetRequest = allRequests.find(req => req.used_at === null);
    
    if (!resetRequest) {
      console.error("All reset requests for this email have been used. Most recent:", allRequests[0]);
      return NextResponse.json(
        { error: "This reset link has already been used. Please request a new password reset link." },
        { status: 400 }
      );
    }
    
    console.log("Found unused reset request:", {
      id: resetRequest.id,
      requestedAt: resetRequest.requested_at,
      isMostRecent: resetRequest.id === allRequests[0].id,
      totalRequests: allRequests.length
    });
    
    console.log("Found reset request:", {
      id: resetRequest.id,
      requestedAt: resetRequest.requested_at,
      usedAt: resetRequest.used_at
    });

    // Parse timestamps - ensure we're working with UTC
    // Parse timestamps carefully
    const requestedDate = new Date(resetRequest.requested_at);
    const nowDate = new Date();
    
    // Double-check the timestamp is valid
    if (isNaN(requestedDate.getTime()) || requestedDate.getTime() <= 0) {
      console.error("Invalid requested_at timestamp:", resetRequest.requested_at);
      return NextResponse.json(
        { error: "Invalid reset request timestamp. Please request a new password reset link." },
        { status: 400 }
      );
    }
    
    const ageMs = nowDate.getTime() - requestedDate.getTime();
    const ageSeconds = Math.floor(ageMs / 1000);
    const ageMinutes = Math.floor(ageMs / 1000 / 60);
    const expirationSeconds = EXPIRATION_MS / 1000;

    console.log("Checking reset request expiration:", {
      requestedAtRaw: resetRequest.requested_at,
      requestedAtParsed: requestedDate.toISOString(),
      requestedAtTimestamp: requestedDate.getTime(),
      nowTimestamp: nowDate.getTime(),
      nowISO: nowDate.toISOString(),
      ageMs: ageMs,
      ageSeconds: ageSeconds,
      ageMinutes: ageMinutes,
      expirationMs: EXPIRATION_MS,
      expirationSeconds: expirationSeconds,
      expirationMinutes: EXPIRATION_MS / 1000 / 60,
      isExpired: ageMs > EXPIRATION_MS
    });

    if (ageMs > EXPIRATION_MS) {
      console.error("Reset request expired:", {
        ageMs: ageMs,
        ageSeconds: ageSeconds,
        ageMinutes: ageMinutes,
        expirationSeconds: expirationSeconds,
        expirationMinutes: EXPIRATION_MS / 1000 / 60,
        requestedAt: resetRequest.requested_at,
        now: nowDate.toISOString()
      });
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new password reset link." },
        { status: 400 }
      );
    }

    console.log("Reset request is valid, age:", ageSeconds, "seconds (", ageMinutes, "minutes)");
    
    // Find user by email using admin client
    let user = null;
    try {
      // Search through users (with pagination if needed)
      let found = false;
      let page = 1;
      const perPage = 100; // Supabase default
      
      while (!found && page <= 10) { // Limit to 10 pages (1000 users max search)
        const { data: pageData, error: pageError } = await supabaseAdmin.auth.admin.listUsers({
          page: page,
          perPage: perPage,
        });
        
        if (pageError) {
          console.error("Error listing users:", pageError);
          break;
        }
        
        if (!pageData?.users) break;
        
        user = pageData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());
        if (user) {
          found = true;
          break;
        }
        
        // If we got fewer users than perPage, we've reached the end
        if (pageData.users.length < perPage) break;
        
        page++;
      }
      
      if (!user) {
        return NextResponse.json(
          { error: "User not found with this email address." },
          { status: 404 }
        );
      }
      
      userId = user.id;
      console.log("Found user by email, ID:", userId);
    } catch (emailError: any) {
      console.error("Error getting user by email:", emailError);
      return NextResponse.json(
        { error: "Failed to find user. Please request a new password reset link." },
        { status: 500 }
      );
    }

    // Verify the token is valid by calling Supabase's verify endpoint
    // This ensures the token hasn't expired and is valid for password recovery
    let tokenVerified = false;
    
    try {
      const verifyParams = new URLSearchParams();
      verifyParams.set("token", token);
      verifyParams.set("type", "recovery");
      if (token_hash) {
        verifyParams.set("token_hash", token_hash);
      }

      console.log("Verifying token with Supabase verify endpoint...", {
        hasToken: !!token,
        hasTokenHash: !!token_hash,
        tokenLength: token?.length
      });
      
      // Call Supabase's verify endpoint to check if token is valid
      const verifyResponse = await fetch(`${supabaseUrl}/auth/v1/verify?${verifyParams.toString()}`, {
        method: "GET",
        headers: {
          "apikey": serviceRoleKey,
          "Authorization": `Bearer ${serviceRoleKey}`,
        },
        redirect: "manual", // Don't follow redirects automatically
      });

      const responseStatus = verifyResponse.status;
      const responseText = await verifyResponse.text();
      const locationHeader = verifyResponse.headers.get("location");
      
      console.log("Token verification response:", {
        status: responseStatus,
        hasLocation: !!locationHeader,
        location: locationHeader?.substring(0, 50),
        responsePreview: responseText.substring(0, 150)
      });

      // Supabase's verify endpoint returns:
      // - 302/303/307 redirect if token is valid (verification succeeded)
      // - 200 with error message if token is invalid/expired
      // - Other statuses for other errors
      
      if (responseStatus === 302 || responseStatus === 303 || responseStatus === 307) {
        // Redirect means token is valid - verification succeeded
        console.log("Token verified successfully (redirect status:", responseStatus, ")");
        tokenVerified = true;
      } else if (responseStatus === 200) {
        // 200 status - check if it contains an error or success indicator
        const lowerText = responseText.toLowerCase();
        if (lowerText.includes('error') || 
            lowerText.includes('invalid') || 
            lowerText.includes('expired') ||
            (lowerText.includes('token') && (lowerText.includes('not') || lowerText.includes('no')))) {
          console.error("Token verification failed - error in response:", responseText.substring(0, 200));
          // Token is invalid or expired - do not proceed
          tokenVerified = false;
        } else if (locationHeader) {
          // If we have a location header even with 200, token might be valid
          console.log("Token verification returned 200 with location header, assuming valid");
          tokenVerified = true;
        } else {
          // If 200 without error keywords and no location, be cautious - don't assume valid
          console.warn("Token verification returned 200 without clear success indicator - rejecting for security");
          tokenVerified = false;
        }
      } else {
        // Other status codes likely indicate an error
        console.error("Token verification failed - unexpected status:", responseStatus, responseText.substring(0, 200));
        tokenVerified = false;
      }
    } catch (verifyError: any) {
      console.error("Error verifying token via verify endpoint:", verifyError);
      // Continue to try alternative method or fail
    }

    // If verify endpoint didn't confirm token, reject it for security
    // We must strictly enforce token expiration - no fallbacks that bypass verification
    if (!tokenVerified) {
      console.error("Token verification failed - token may be expired or invalid");
      return NextResponse.json(
        { error: "Invalid or expired reset token. Please request a new password reset link." },
        { status: 400 }
      );
    }
    
    console.log("Token verified successfully for user:", userId);

    // Token is verified - now update the password using the admin client
    console.log("Updating password for user:", userId);
    const { data: updateData, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: password }
    );

    if (updateError) {
      console.error("Error updating password:", updateError);
      
      // Filter out "weak password" errors from Supabase
      const errorCode = (updateError as any).code;
      const errorMessage = updateError.message || "";
      const errorStatus = (updateError as any).status;
      
      if (errorCode === 'weak_password' || 
          errorStatus === 422 ||
          errorMessage.toLowerCase().includes("weak") || 
          errorMessage.toLowerCase().includes("easy to guess") ||
          errorMessage.toLowerCase().includes("known to be weak")) {
        // Supabase is rejecting the password as weak, but it meets our 8 char requirement
        // Return a user-friendly message without mentioning "weak password"
        return NextResponse.json(
          { error: "Please choose a different password. The password must be at least 8 characters and not be commonly used." },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: updateError.message || "Failed to update password" },
        { status: 500 }
      );
    }

    console.log("Password updated successfully for user:", userId);

    // Mark THIS SPECIFIC reset request as used (by ID, not by email)
    try {
      const { error: markError } = await supabaseAdmin
        .from('password_reset_requests')
        .update({ used_at: new Date().toISOString() })
        .eq('id', resetRequest.id);
      
      if (markError) {
        console.error("Failed to mark reset request as used:", markError);
      } else {
        console.log("Reset request marked as used:", resetRequest.id);
      }
    } catch (markUsedError: any) {
      // Log but don't fail - password was already updated
      console.error("Exception marking reset request as used:", markUsedError);
    }

    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    });
  } catch (error: any) {
    console.error("Error in reset-password route:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred while resetting your password" },
      { status: 500 }
    );
  }
}

