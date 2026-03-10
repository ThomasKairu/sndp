
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
        return new Response(JSON.stringify(result.rows), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('Installment plans GET error:', err);
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500, 
            headers: corsHeaders 
        });
    } finally {
        if (client) await client.end();
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
        
        // Modal sends: client_name, phone, property_name, total_amount, installment_count, start_date, next_due_date, notes
        const { 
            client_name, 
            phone, 
            property_name, 
            total_amount, 
            installment_count, 
            start_date,
            next_due_date,
            notes 
        } = body;
        
        // Fix: Round installment_amount to 2 decimal places to match NUMERIC(12, 2)
        const installment_amount = Math.round((total_amount / installment_count) * 100) / 100;

        // Safety defaults for dates
        const finalStartDate = start_date || new Date().toISOString().split('T')[0];
        const finalNextDueDate = next_due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        const query = `
            INSERT INTO installment_plans (
                client_name, phone, property_name, total_amount, 
                installment_count, installment_amount, amount_paid, 
                installments_paid, start_date, next_due_date, notes, status, created_at
            )
            VALUES ($1, $2, $3, $4, $5, $6, 0, 0, $7, $8, $9, 'active', NOW())
            RETURNING *
        `;
        
        const result = await client.query(query, [
            client_name, 
            phone, 
            property_name, 
            total_amount, 
            installment_count, 
            installment_amount, 
            finalStartDate,
            finalNextDueDate,
            notes || null
        ]);
        
        return new Response(JSON.stringify(result.rows[0]), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('Installment plans POST error:', err);
        return new Response(JSON.stringify({ 
            error: err.message,
            detail: err.detail,
            hint: err.hint
        }), { 
            status: 500, 
            headers: corsHeaders 
        });
    } finally {
        if (client) await client.end();
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

    let client;
    try {
        const body = await request.json() as any;
        client = await getDbClient(env);
        
        // Build dynamic UPDATE query
        const keys = Object.keys(body).filter(k => k !== 'id');
        const values = keys.map(k => body[k]);
        const setString = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
        
        const query = `UPDATE installment_plans SET ${setString} WHERE id = $${keys.length + 1} RETURNING *`;
        const result = await client.query(query, [...values, id]);
        
        return new Response(JSON.stringify(result.rows[0]), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('Installment plans PUT error:', err);
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500, 
            headers: corsHeaders 
        });
    } finally {
        if (client) await client.end();
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
