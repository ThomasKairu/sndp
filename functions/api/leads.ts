
import { getDbClient, DbEnv } from '../utils/db';

interface Env extends DbEnv {
    N8N_INTERNAL_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);

    // CORS - Strict Origin
    const corsHeaders = {
        'Access-Control-Allow-Origin': 'https://provisionlands.co.ke',
        'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
    };

    // --- Authentication Check ---
    const secret = request.headers.get('x-internal-secret');
    if (!secret || secret.trim() !== env.N8N_INTERNAL_SECRET?.trim()) {
        return new Response(JSON.stringify({
            error: "Unauthorized",
            message: !secret ? "Missing header" : "Key mismatch"
        }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    let client;
    try {
        client = await getDbClient(env);

        // Check if stats are requested
        if (url.searchParams.get('stats') === 'true') {
            const totalLeadsQuery = await client.query('SELECT COUNT(*) FROM leads');

            // Format today's date for comparison (YYYY-MM-DD)
            const today = new Date().toISOString().split('T')[0];
            const newTodayQuery = await client.query('SELECT COUNT(*) FROM leads WHERE DATE(created_at) = $1', [today]);

            // Action required: Status 'new'
            const actionRequiredQuery = await client.query("SELECT COUNT(*) FROM leads WHERE status = 'new'");

            // Conversion: Status 'closed' / Total
            const closedQuery = await client.query("SELECT COUNT(*) FROM leads WHERE status = 'closed'");

            const total = parseInt(totalLeadsQuery.rows[0].count);
            const closed = parseInt(closedQuery.rows[0].count);
            const conversionRate = total > 0 ? Math.round((closed / total) * 100) : 0;

            const stats = {
                totalLeads: totalLeadsQuery.rows[0].count,
                newToday: newTodayQuery.rows[0].count,
                actionRequired: actionRequiredQuery.rows[0].count,
                conversionRate: conversionRate + '%'
            };

            await client.end();
            return new Response(JSON.stringify(stats), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // Schema: id, name, phone, interest, ai_summary, source, status
        const result = await client.query('SELECT * FROM leads ORDER BY id DESC');

        await client.end();
        return new Response(JSON.stringify(result.rows), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err) {
        console.error(err);
        try { await client?.end(); } catch { }
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
};

export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': 'https://provisionlands.co.ke',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        },
    });
};
