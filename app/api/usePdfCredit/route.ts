import { NextRequest, NextResponse } from "next/server";
import { getUserByEmail, incrementPdfUsage } from "@/lib/database";
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userEmail } = await request.json();
    
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!userEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    let user = await getUserByEmail(userEmail);
    
    if (!user) {
      console.log("Auto-creating new user with Clerk ID:", clerkUserId);
      
      const { neon } = await import('@neondatabase/serverless');
      const sql = neon(process.env.DATABASE_URL!);
      
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await sql`
        INSERT INTO users (
          id,n
          email, 
          subscription_plan, 
          subscription_status, 
          pdf_credits_used, 
          pdf_credits_limit, 
          credits_reset_date, 
          subscription_start_date
        ) VALUES (
          ${clerkUserId},
          ${userEmail}, 
          'basic', 
          'active', 
          0, 
          1, 
          ${nextMonth.toISOString().split('T')[0]}, 
          ${new Date().toISOString().split('T')[0]}
        )
      `;
      
      user = await getUserByEmail(userEmail);
    }

    if (!user) {
      return NextResponse.json({ error: "User creation failed" }, { status: 500 });
    }

    if (user.subscription_status !== 'active') {
      return NextResponse.json({ 
        error: "No active subscription", 
        canUpgrade: true 
      }, { status: 403 });
    }

    if (user.pdf_credits_limit === -1) {
      return NextResponse.json({ 
        success: true, 
        message: "Unlimited access",
        isUnlimited: true
      });
    }

    const today = new Date();
    const resetDate = new Date(user.credits_reset_date);
    
    if (today >= resetDate) {
      await resetUserCredits(userEmail);
      await incrementPdfUsage(userEmail);
      
      const remainingCredits = user.pdf_credits_limit - 1;
      
      return NextResponse.json({ 
        success: true, 
        remainingCredits,
        message: `PDF processed. ${remainingCredits} credits remaining this month.`
      });
    }

    if (user.pdf_credits_used >= user.pdf_credits_limit) {
      return NextResponse.json({ 
        error: "Monthly PDF limit reached", 
        canUpgrade: true,
        creditsResetDate: user.credits_reset_date,
        currentPlan: user.subscription_plan
      }, { status: 403 });
    }

    await incrementPdfUsage(userEmail);
    
    const remainingCredits = user.pdf_credits_limit - (user.pdf_credits_used + 1);
    
    return NextResponse.json({ 
      success: true, 
      remainingCredits,
      message: `PDF processed. ${remainingCredits} credits remaining this month.`
    });
    
  } catch (error) {
    console.error('PDF credit error:', error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

async function resetUserCredits(email: string) {
  const { neon } = await import('@neondatabase/serverless');
  const sql = neon(process.env.DATABASE_URL!);
  
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  
  await sql`
    UPDATE users SET 
      pdf_credits_used = 0,
      credits_reset_date = ${nextMonth.toISOString().split('T')[0]}
    WHERE email = ${email}
  `;
}


