import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { updateUserSubscription, saveRazorpayPayment, getUserByEmail } from "@/lib/database";

export async function POST(request: NextRequest) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      planType,
      userEmail 
    } = await request.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: "Missing required parameters", success: false }, { status: 400 });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET as string;
    if (!secret) { 
      return NextResponse.json({ error: "Razorpay secret not found" }, { status: 400 });
    }

    // Verify signature
    const HMAC = crypto.createHmac("sha256", secret);
    HMAC.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = HMAC.digest("hex");

    if (generatedSignature === razorpay_signature) {
      // Get user details
      const user = await getUserByEmail(userEmail);
      if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      // Determine credit limit based on plan
      const creditLimit = planType === 'basic' ? 1 : -1; // -1 = unlimited
      const resetDate = new Date();
      resetDate.setMonth(resetDate.getMonth() + 1); // Next month
      
      // Update user subscription in database
      await updateUserSubscription({
        email: userEmail,
        subscriptionPlan: planType,
        subscriptionStatus: 'active',
        pdfCreditsUsed: 0, // Reset credits on new subscription
        pdfCreditsLimit: creditLimit,
        creditsResetDate: resetDate,
        subscriptionStartDate: new Date(),
        razorpayPaymentId: razorpay_payment_id
      });

      // Save payment record
      await saveRazorpayPayment({
        userId: user.id,
        userEmail: userEmail,
        amount: planType === 'basic' ? 49900 : 99900, // Amount in paise
        currency: 'INR',
        status: 'completed',
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        planType: planType,
        paymentMethod: 'unknown' // Will be updated by webhook if available
      });
      
      return NextResponse.json({ 
        message: "Payment verified successfully", 
        success: true,
        planType,
        paymentId: razorpay_payment_id
      });
    } else {
      return NextResponse.json({ error: "Invalid signature", success: false }, { status: 400 });
    }
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: "An error occurred", success: false }, { status: 500 });
  }
}
