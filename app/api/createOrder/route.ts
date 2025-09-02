import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID as string,
  key_secret: process.env.RAZORPAY_KEY_SECRET as string,
});

export async function POST(request: NextRequest) {
  try {
    const { amount, currency, planType } = await request.json();
    
    if (!amount) {
      return NextResponse.json({ message: "Amount is required" }, { status: 400 });
    }

    const options = {
      amount: amount * 100, // Convert to paise
      currency: currency || "INR",
      receipt: `sommaire_${planType}_${Date.now()}`,
      notes: {
        plan_type: planType || 'basic',
        app: 'sommaire-ai'
      }
    };

    const order = await razorpay.orders.create(options);
    console.log("Order Created Successfully");

    return NextResponse.json({ orderId: order.id }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ message: "Server Error", error }, { status: 500 });
  }
}

