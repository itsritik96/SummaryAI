"use client";

import axios from "axios";
import React from "react";
import Script from "next/script";
import { createOrderId } from "@/utils/createOrderId";
import { useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";

interface RazorpayCheckoutProps {
  planType: 'basic' | 'pro';
  amount: number;
  planName: string;
}

export default function RazorpayCheckout({ planType, amount, planName }: RazorpayCheckoutProps) {
  const [isLoading, setIsLoading] = React.useState(false);
  const { user } = useUser();

  const handlePayment = async () => {
    if (!user) {
      alert("Please sign in to continue with payment");
      return;
    }

    setIsLoading(true);
    try {
      const orderId: string = await createOrderId(amount, "INR", planType);
      
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount * 100,
        currency: "INR",
        name: "Summary AI",
        description: `${planName} Plan Subscription`,
        order_id: orderId,
        handler: async function (response: any) {
          try {
            const paymentResponse = await axios.post("/api/verifyOrder", {
              razorpay_order_id: orderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planType,
              userEmail: user.emailAddresses[0]?.emailAddress
            });

            if (paymentResponse.data.success) {
              // Redirect to success page or dashboard
              window.location.href = "/dashboard?payment=success";
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (error) {
            alert("Payment verification failed. Please contact support.");
            console.error(error);
          }
        },
        prefill: {
          name: user.fullName || user.firstName || "User",
          email: user.emailAddresses[0]?.emailAddress || "",
        },
        theme: {
          color: "#3399cc",
        },
        modal: {
          ondismiss: () => {
            setIsLoading(false);
          }
        }
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.on("payment.failed", function (response: any) {
      console.error("Payment failed:", response.error);
      alert(response.error.description || "Payment failed. Please try again.");
      setIsLoading(false);

      });
      razorpay.open();
    } catch (error) {
      alert("Payment failed. Please try again.");
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        className={cn(
          "w-full rounded-full flex items-center justify-center gap-2 bg-gradient-to-r text-white border-2 py-3 px-6 font-semibold transition-all duration-300 disabled:opacity-50",
          planType === 'pro' 
            ? 'border-rose-900 from-rose-800 to-rose-500 hover:from-rose-500 hover:to-rose-800' 
            : 'border-rose-100 from-rose-400 to-rose-500 hover:from-rose-500 hover:to-rose-400'
        )}
        onClick={handlePayment}
        disabled={isLoading}
      >
        {isLoading ? "Processing..." : (
          <>
            Subscribe to {planName}
            <ArrowRight size={18} />
          </>
        )}
      </button>
      <Script
        id="razorpay-checkout-js"
        src="https://checkout.razorpay.com/v1/checkout.js"
      />
    </>
);
}
