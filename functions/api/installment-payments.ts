
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

        client = await getDbClient(env);
        
        // Use a transaction
        await client.query('BEGIN');

        const { 
            plan_id, 
            client_name, 
            phone, 
            amount_paid, 
            payment_date, 
            payment_number, 
            recorded_by, 
            notes 
        } = body;

        // 1. Insert into installment_payments
        const insertPayment = `
            INSERT INTO installment_payments 
              (plan_id, client_name, phone, amount_paid, payment_date, payment_number, recorded_by, notes)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *;
        `;
        await client.query(insertPayment, [
            plan_id, client_name, phone, amount_paid, payment_date, payment_number, recorded_by, notes
        ]);

        // 2. Update the parent installment_plans record
        const updatePlan = `
            UPDATE installment_plans
            SET
              amount_paid = COALESCE(amount_paid, 0) + $1,
              installments_paid = COALESCE(installments_paid, 0) + 1,
              next_due_date = next_due_date::date + INTERVAL '30 days',
              status = CASE 
                WHEN (COALESCE(installments_paid, 0) + 1) >= installment_count THEN 'completed'
                ELSE 'active'
              END,
              updated_at = NOW()
            WHERE id = $2;
        `;
        await client.query(updatePlan, [amount_paid, plan_id]);

        // 3. Fetch current plan data to return
        const updatedPlanResult = await client.query('SELECT * FROM installment_plans WHERE id = $1', [plan_id]);
        
        await client.query('COMMIT');
        await client.end();
        
        return new Response(JSON.stringify(updatedPlanResult.rows[0]), {
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
