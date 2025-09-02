import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export interface User {
  id: string;
  email: string;
  full_name?: string;
  subscription_plan: 'basic' | 'pro';
  subscription_status: 'active' | 'inactive';
  pdf_credits_used: number;
  pdf_credits_limit: number;
  credits_reset_date: Date;
  subscription_start_date: Date;
  razorpay_payment_id?: string;
}

export async function getUserByEmail(email: string): Promise<User | null> {
  try {
    const result = await sql`
      SELECT * FROM users WHERE email = ${email} LIMIT 1
    `;
    return result[0] as User || null;
  } catch (error) {
    console.error('Database error:', error);
    return null;
  }
}

export async function updateUserSubscription(data: {
  email: string;
  subscriptionPlan: 'basic' | 'pro';
  subscriptionStatus: 'active' | 'inactive';
  pdfCreditsUsed: number;
  pdfCreditsLimit: number;
  creditsResetDate: Date;
  subscriptionStartDate: Date;
  razorpayPaymentId: string;
}) {
  try {
    await sql`
      UPDATE users SET 
        subscription_plan = ${data.subscriptionPlan},
        subscription_status = ${data.subscriptionStatus},
        pdf_credits_used = ${data.pdfCreditsUsed},
        pdf_credits_limit = ${data.pdfCreditsLimit},
        credits_reset_date = ${data.creditsResetDate.toISOString().split('T')[0]},
        subscription_start_date = ${data.subscriptionStartDate.toISOString().split('T')[0]},
        razorpay_payment_id = ${data.razorpayPaymentId}
      WHERE email = ${data.email}
    `;
  } catch (error) {
    console.error('Database update error:', error);
    throw error;
  }
}

export async function incrementPdfUsage(email: string) {
  try {
    await sql`
      UPDATE users SET 
        pdf_credits_used = pdf_credits_used + 1
      WHERE email = ${email}
    `;
  } catch (error) {
    console.error('PDF usage increment error:', error);
    throw error;
  }
}

export async function saveRazorpayPayment(data: {
  userId: string;
  userEmail: string;
  amount: number;
  currency: string;
  status: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  planType: 'basic' | 'pro';
  paymentMethod?: string;
}) {
  try {
    await sql`
      INSERT INTO payments_razorpay (
        user_id, user_email, amount, currency, status,
        razorpay_order_id, razorpay_payment_id, razorpay_signature,
        plan_type, payment_method
      ) VALUES (
        ${data.userId}, ${data.userEmail}, ${data.amount}, ${data.currency}, ${data.status},
        ${data.razorpayOrderId}, ${data.razorpayPaymentId}, ${data.razorpaySignature},
        ${data.planType}, ${data.paymentMethod}
      )
    `;
  } catch (error) {
    console.error('Error saving Razorpay payment:', error);
    throw error;
  }
}
