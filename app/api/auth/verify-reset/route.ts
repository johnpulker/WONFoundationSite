import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabaseAdmin";

/**
 * This route handles password reset token verification
 * It uses Supabase's verify endpoint which will set the session and redirect
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");
    const tokenHash = searchParams.get("token_hash");
    const type = searchParams.get("type");
    const redirectTo = searchParams.get("redirect_to") || "/reset-password";

    if (!token || type !== "recovery") {
      return NextResponse.redirect(new URL("/reset-password?error=invalid_token", request.url));
    }

    // Redirect to Supabase's verify endpoint
    // It will verify the token, set the session via cookies, and redirect to our reset page
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    
    const verifyParams = new URLSearchParams();
    verifyParams.set("token", token);
    verifyParams.set("type", type);
    verifyParams.set("redirect_to", `${siteUrl}${redirectTo}`);
    if (tokenHash) {
      verifyParams.set("token_hash", tokenHash);
    }
    
    const verifyUrl = `${supabaseUrl}/auth/v1/verify?${verifyParams.toString()}`;
    
    // Redirect to Supabase's verify endpoint
    // It will verify the token, set the session, and redirect to our reset page
    return NextResponse.redirect(verifyUrl);
  } catch (error: any) {
    console.error("Error in verify-reset route:", error);
    const resetUrl = new URL("/reset-password", request.url);
    resetUrl.searchParams.set("error", "verification_failed");
    return NextResponse.redirect(resetUrl);
  }
}

