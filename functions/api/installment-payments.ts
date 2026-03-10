
import { getDbClient, DbEnv, SECURITY_HEADERS } from '../utils/db';

interface Env extends DbEnv {
    N8N_APP_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const planId = url.searchParams.get('plan_id');
    const origin = request.headers.get('Origin');
    const corsHeaders = {
        'Access-Control-Allow-Origin': origin || 'https://provisionlands.co.ke',
        'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        ...SECURITY_HEADERS,
    };

    const secret = request.headers.get('x-internal-secret');
    if (!secret || secret.trim() !== env.N8N_APP_SECRET?.trim()) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    if (!planId) {
        return new Response(JSON.stringify({ error: 'Missing plan_id' }), { status: 400, headers: corsHeaders });
    }

    let client;
    try {
        client = await getDbClient(env);
        const result = await client.query('SELECT * FROM installment_payments WHERE plan_id = $1 ORDER BY payment_date DESC', [planId]);
        await client.end();
        return new Response(JSON.stringify(result.rows), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        if (client) await client.end();
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const origin = request.headers.get('Origin');
    const corsHeaders = {
        'Access-Control-Allow-Origin': origin || 'https://provisionlands.co.ke',
        'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        ...SECURITY_HEADERS,
    };

    const secret = request.headers.get('x-internal-secret');
    if (!secret || secret.trim() !== env.N8N_APP_SECRET?.trim()) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    let client;
    try {
        const body = await request.json() as any;
        const { plan_id, amount, payment_method, notes } = body;

        client = await getDbClient(env);
        
        // Use a transaction
        await client.query('BEGIN');

        // 1. Insert into installment_payments
        const insertPayment = `
            INSERT INTO installment_payments (plan_id, amount, payment_date, payment_method, notes)
            VALUES ($1, $2, NOW(), $3, $4)
            RETURNING *
        `;
        const paymentResult = await client.query(insertPayment, [plan_id, amount, payment_method, notes]);

        // 2. Fetch current plan data
        const currentPlan = await client.query('SELECT amount_paid, installments_paid, next_due_date, installment_count FROM installment_plans WHERE id = $1', [plan_id]);
        if (currentPlan.rowCount === 0) throw new Error('Plan not found');

        const { amount_paid, installments_paid, next_due_date, installment_count } = currentPlan.rows[0];
        
        // 3. Calculate new values
        // After recording a payment, recalculate next_due_date by adding 30 days to current due date and update amount_paid += payment amount.
        const newAmountPaid = parseFloat(amount_paid) + parseFloat(amount);
        const newInstallmentsPaid = installments_paid + 1;
        
        // Add 30 days to next_due_date
        const nextDate = new Date(next_due_date);
        nextDate.setDate(nextDate.getDate() + 30);
        
        // 4. Update the plan
        const updatePlan = `
            UPDATE installment_plans 
            SET amount_paid = $1, 
                installments_paid = $2, 
                next_due_date = $3,
                status = CASE WHEN $2 >= installment_count THEN 'completed' ELSE 'active' END
            WHERE id = $4
        `;
        await client.query(updatePlan, [newAmountPaid, newInstallmentsPaid, nextDate.toISOString(), plan_id]);

        await client.query('COMMIT');
        await client.end();
        
        return new Response(JSON.stringify(paymentResult.rows[0]), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        if (client) {
            await client.query('ROLLBACK');
            await client.end();
        }
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
};

export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        },
    });
};
