
import { getDbClient, DbEnv, SECURITY_HEADERS } from '../utils/db';

interface Env extends DbEnv {
    N8N_APP_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
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
        client = await getDbClient(env);
        const result = await client.query('SELECT * FROM installment_plans ORDER BY id DESC');
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

    try {
        const body = await request.json() as any;
        const client = await getDbClient(env);
        
        // Modal needs: Client Name, Phone, Property (dropdown), Total Amount (KES), Installment Count, First Due Date, Notes.
        // Calculate installment_amount = total_amount / installment_count
        const { client_name, phone, property_name, total_amount, installment_count, first_due_date, notes } = body;
        const installment_amount = total_amount / installment_count;
        
        const query = `
            INSERT INTO installment_plans (
                client_name, phone, property_name, total_amount, 
                installment_count, installment_amount, amount_paid, 
                installments_paid, next_due_date, notes, status, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, 0, 0, $7, $8, 'active', NOW())
            RETURNING *
        `;
        
        const result = await client.query(query, [
            client_name, phone, property_name, total_amount, 
            installment_count, installment_amount, first_due_date, notes
        ]);
        
        await client.end();
        return new Response(JSON.stringify(result.rows[0]), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
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

    try {
        const body = await request.json() as any;
        const client = await getDbClient(env);
        
        // Build dynamic UPDATE query
        const keys = Object.keys(body).filter(k => k !== 'id');
        const values = keys.map(k => body[k]);
        const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        
        const query = `UPDATE installment_plans SET ${setString} WHERE id = $${keys.length + 1} RETURNING *`;
        const result = await client.query(query, [...values, id]);
        
        await client.end();
        return new Response(JSON.stringify(result.rows[0]), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
};

export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        },
    });
};
