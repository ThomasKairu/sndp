
import { getDbClient, DbEnv, SECURITY_HEADERS } from '../../utils/db';

interface Env extends DbEnv {
    N8N_APP_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env, params } = context;
    const phone = params.phone as string;
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

    if (!phone) {
        return new Response(JSON.stringify({ error: 'Missing phone' }), { status: 400, headers: corsHeaders });
    }

    let client;
    try {
        client = await getDbClient(env);
        // API endpoint: GET /api/conversations/:phone
        // SQL: SELECT id, phone, message, response, timestamp FROM lead_logs WHERE phone = $1 ORDER BY timestamp ASC
        const result = await client.query(`
            SELECT id, phone, message, response, timestamp 
            FROM lead_logs 
            WHERE phone = $1 
            ORDER BY timestamp ASC
        `, [phone]);
        
        await client.end();
        return new Response(JSON.stringify(result.rows), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        if (client) await client.end();
        return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
    }
};

export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        },
    });
};
