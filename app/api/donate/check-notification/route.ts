import { NextRequest, NextResponse } from "next/server";
import { sendAdminDonationNotificationEmail } from "@/lib/emails";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, amount, orderId } = body;

    if (!name || !email || !amount || !orderId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await sendAdminDonationNotificationEmail({
      name,
      email,
      amount,
      orderId,
      paymentMethod: "Check (mail-in)",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in donate/check-notification route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


