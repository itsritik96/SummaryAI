import { getDbConnection } from "@/lib/db";
import { Webhook } from "svix";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    const headerPayload = Object.fromEntries(req.headers.entries());
    const payload = await req.text();

    const heads = {
        'svix-id': headerPayload['svix-id'],
        'svix-timestamp': headerPayload['svix-timestamp'],
        'svix-signature': headerPayload['svix-signature'],
    };

    const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET!);

    let evt: any;
    try {
        evt = wh.verify(payload, heads);
    } catch (err) {
        console.error('Error verifying webhook:', err);
        return Response.json({ error: 'Error occurred' }, { status: 400 });
    }

    const { id } = evt.data;
    const eventType = evt.type;

    if (eventType === 'user.created') {
        try {
            const { neon } = await import('@neondatabase/serverless');
            const sql = neon(process.env.DATABASE_URL!);
            
            const nextMonth = new Date();
            nextMonth.setMonth(nextMonth.getMonth() + 1);

            await sql`
                INSERT INTO users (
                    id,
                    email, 
                    subscription_plan, 
                    subscription_status, 
                    pdf_credits_used, 
                    pdf_credits_limit, 
                    credits_reset_date, 
                    subscription_start_date
                ) VALUES (
                    ${id},
                    ${evt.data.email_addresses[0]?.email_address || ''},
                    'basic', 
                    'active', 
                    0, 
                    1, 
                    ${nextMonth.toISOString().split('T')[0]}, 
                    ${new Date().toISOString().split('T')[0]}
                )
                ON CONFLICT (id) DO NOTHING
            `;

            console.log(`✅ User ${id} created with basic plan`);
            
        } catch (error) {
            console.error('❌ Error creating user:', error);
            return Response.json({ error: 'Failed to create user' }, { status: 500 });
        }
    }

    return Response.json({ message: 'Success' });
}
