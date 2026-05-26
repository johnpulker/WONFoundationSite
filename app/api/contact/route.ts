import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { checkRateLimitWithIP, getClientIP } from "@/lib/rateLimit";

const resend = new Resend(process.env.RESEND_API_KEY);

async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    console.error("TURNSTILE_SECRET_KEY is not set");
    return false;
  }

  try {
    const response = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          secret: secretKey,
          response: token,
        }),
      }
    );

    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const clientIP = getClientIP(request);
    
    // Rate limiting: 
    // - 2 submissions per IP per 30 minutes (prevents spam from single IP)
    // - 50 submissions globally per 30 minutes (prevents distributed attacks)
    const rateLimit = checkRateLimitWithIP(
      clientIP,
      'contact-form',
      2, // per IP
      30 * 60 * 1000, // 30 minutes
      50 // global limit
    );

    if (!rateLimit.allowed) {
      const retryAfter = Math.ceil((rateLimit.resetTime - Date.now()) / 1000);
      const retryAfterMinutes = Math.ceil(retryAfter / 60);
      return NextResponse.json(
        { 
          error: `Too many submissions. Please try again in ${retryAfterMinutes} minute${retryAfterMinutes !== 1 ? 's' : ''}.`,
          retryAfter: retryAfter,
        },
        { 
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': '2',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
          },
        }
      );
    }

    const body = await request.json();
    const { name, email, phone, reason, subject, message, turnstileToken } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Verify Turnstile token
    if (!turnstileToken) {
      return NextResponse.json(
        { error: "Security verification required" },
        { status: 400 }
      );
    }

    const isValid = await verifyTurnstileToken(turnstileToken);
    if (!isValid) {
      return NextResponse.json(
        { error: "Security verification failed. Please try again." },
        { status: 403 }
      );
    }

    // Format the reason for display
    const reasonLabels: Record<string, string> = {
      general: "General Inquiry",
      membership: "Membership Questions",
      events: "Events & Programs",
      committees: "Committees",
      sponsorship: "Sponsorship Opportunities",
      volunteer: "Volunteer With Us",
      media: "Media & Press",
    };

    const reasonLabel = reasonLabels[reason] || reason || "Not specified";

    // Email to WON Foundation
    const organizerEmail = process.env.ORGANIZER_EMAIL || "info@wonfoundation.net";
    const fromEmail = process.env.FROM_EMAIL || "noreply@wonfoundation.net";

    // Send email to WON Foundation
    const { data, error } = await resend.emails.send({
      from: `WON Foundation Contact Form <${fromEmail}>`,
      to: [organizerEmail],
      reply_to: email,
      subject: `[Contact Form] ${subject}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #871c1c 0%, #a02323 100%); padding: 30px; border-radius: 16px 16px 0 0; text-align: center;">
                <h1 style="color: #E7C418; margin: 0; font-size: 24px; font-weight: bold;">
                  New Contact Form Submission
                </h1>
              </div>
              
              <!-- Content -->
              <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Dear Administrator,
                </p>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  You have received a new contact form submission from <strong>${name}</strong>:
                </p>
                
                <!-- Contact Details -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong style="color: #871c1c;">From:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #374151;">
                      ${name}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong style="color: #871c1c;">Email:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                      <a href="mailto:${email}" style="color: #E7C418; text-decoration: none;">${email}</a>
                    </td>
                  </tr>
                  ${phone ? `
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong style="color: #871c1c;">Phone:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #374151;">
                      ${phone}
                    </td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong style="color: #871c1c;">Category:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #374151;">
                      ${reasonLabel}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                      <strong style="color: #871c1c;">Subject:</strong>
                    </td>
                    <td style="padding: 12px 0; border-bottom: 1px solid #e5e7eb; color: #374151;">
                      ${subject}
                    </td>
                  </tr>
                </table>
                
                <!-- Message -->
                <div style="margin-bottom: 24px;">
                  <strong style="color: #871c1c; display: block; margin-bottom: 8px;">Message:</strong>
                  <div style="background: #f9fafb; padding: 16px; border-radius: 8px; color: #374151; line-height: 1.6; white-space: pre-wrap;">
${message}
                  </div>
                </div>
                
                <!-- Reply Button -->
                <div style="text-align: center;">
                  <a href="mailto:${email}?subject=Re: ${encodeURIComponent(subject)}" 
                     style="display: inline-block; background: linear-gradient(135deg, #E7C418 0%, #C9A814 100%); color: white; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    Reply to ${name.split(' ')[0]}
                  </a>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
                <p style="margin: 0;">
                  This message was sent via the WON Foundation website contact form.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    // Send confirmation email to the sender
    await resend.emails.send({
      from: `WON Foundation <${fromEmail}>`,
      to: [email],
      subject: `Thank you for contacting WON Foundation`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; margin: 0; padding: 0; background-color: #f9fafb;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
              <!-- Header -->
              <div style="background: linear-gradient(135deg, #871c1c 0%, #a02323 100%); padding: 40px 30px; border-radius: 16px 16px 0 0; text-align: center;">
                <div style="width: 60px; height: 60px; background: linear-gradient(135deg, #E7C418 0%, #C9A814 100%); border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                  <span style="color: white; font-size: 28px;">✓</span>
                </div>
                <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">
                  Message Received!
                </h1>
              </div>
              
              <!-- Content -->
              <div style="background: white; padding: 30px; border-radius: 0 0 16px 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Dear ${name || 'Valued Supporter'},
                </p>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Thank you for reaching out to the Women Officials Network Foundation. We've received your message and will respond as soon as possible, typically within 1-2 business days.
                </p>
                
                <div style="background: linear-gradient(135deg, rgba(90, 31, 58, 0.05) 0%, rgba(212, 175, 55, 0.05) 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #E7C418;">
                  <p style="color: #871c1c; font-weight: 600; margin: 0 0 8px 0;">Your Message:</p>
                  <p style="color: #6b7280; margin: 0; font-style: italic;">"${subject}"</p>
                </div>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 24px;">
                  In the meantime, feel free to explore our website to learn more about our programs, upcoming events, and membership opportunities.
                </p>
                
                <!-- CTA Buttons -->
                <div style="text-align: center; margin-bottom: 24px;">
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://wonfoundation.net'}/programs-events" 
                     style="display: inline-block; background: linear-gradient(135deg, #871c1c 0%, #a02323 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 0 8px 8px 0;">
                    View Programs
                  </a>
                  <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://wonfoundation.net'}/membership" 
                     style="display: inline-block; background: linear-gradient(135deg, #E7C418 0%, #C9A814 100%); color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
                    Join WON
                  </a>
                </div>
                
                <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-bottom: 0;">
                  Warmly,<br>
                  <strong style="color: #871c1c;">The WON Foundation Team</strong>
                </p>
              </div>
              
              <!-- Footer -->
              <div style="text-align: center; padding: 24px; color: #9ca3af; font-size: 12px;">
                <p style="margin: 0 0 8px 0;">
                  <span style="color: #E7C418;">✦</span> Empowered women empower women <span style="color: #E7C418;">✦</span>
                </p>
                <p style="margin: 0;">
                  6725 Daly Rd. Ste. 252572, West Bloomfield, MI 48325
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    return NextResponse.json(
      { success: true, messageId: data?.id },
      {
        headers: {
          'X-RateLimit-Limit': '2',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimit.resetTime).toISOString(),
        },
      }
    );
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

