import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();
    
    if (!userEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await getUserByEmail(userEmail);
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({
      subscriptionPlan: user.subscription_plan,
      subscriptionStatus: user.subscription_status,
      pdfCreditsUsed: user.pdf_credits_used,
      pdfCreditsLimit: user.pdf_credits_limit,
      creditsResetDate: user.credits_reset_date,
      isUnlimited: user.pdf_credits_limit === -1
    });
    
  } catch (error) {
    console.error('Get user status error:', error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
