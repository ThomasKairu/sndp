
import { getDbClient, DbEnv, SECURITY_HEADERS } from '../utils/db';

interface Env extends DbEnv {
    N8N_APP_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const origin = request.headers.get('Origin');
    const allowed = ['https://provisionlands.co.ke', 'https://www.provisionlands.co.ke'];
    const corsHeaders = {
        'Access-Control-Allow-Origin': allowed.includes(origin || '') ? origin! : 'https://provisionlands.co.ke',
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
        const result = await client.query('SELECT * FROM site_visits ORDER BY visit_date ASC');
        return new Response(JSON.stringify(result.rows), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('Site visits GET error:', err);
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
        // Frontend sends: { customer_name, sender_id: phone, property_name, visit_date: ISO, visit_day, notes, status }
        const { 
            customer_name, 
            sender_id, // Phone number
            property_name, 
            visit_date, // ISO timestamp
            visit_day, 
            notes, 
            status 
        } = body;

        client = await getDbClient(env);
        const query = `
            INSERT INTO site_visits (
                customer_name, 
                sender_id, 
                property_name, 
                visit_date, 
                visit_day, 
                notes,
                status, 
                created_at
            )
            VALUES ($1, $2, $3, $4::timestamptz, $5, $6, $7, NOW())
            RETURNING *
        `;
        
        const result = await client.query(query, [
            customer_name || 'Anonymous', 
            sender_id || '', // sender_id is NOT NULL
            property_name, 
            visit_date, 
            visit_day || (visit_date ? visit_date.split('T')[0] : null),
            notes || null,
            status || 'scheduled'
        ]);
        
        return new Response(JSON.stringify(result.rows[0]), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('Site visits POST error:', err);
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
        
        let query = 'UPDATE site_visits SET ';
        const params: any[] = [];
        let i = 1;
        
        for (const [key, value] of Object.entries(body)) {
            query += `${key} = $${i}, `;
            params.push(value);
            i++;
        }
        query = query.slice(0, -2) + ` WHERE id = $${i} RETURNING *`;
        params.push(id);
        
        const result = await client.query(query, params);
        return new Response(JSON.stringify(result.rows[0]), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('Site visits PUT error:', err);
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
