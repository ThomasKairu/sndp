
import { getDbClient, DbEnv, SECURITY_HEADERS } from '../utils/db';

interface Env extends DbEnv {
    N8N_APP_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);

    // CORS + Security - Allow naked and www domains
    const origin = request.headers.get('Origin');
    const allowedOrigins = ['https://provisionlands.co.ke', 'https://www.provisionlands.co.ke'];
    const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin! : 'https://provisionlands.co.ke',
        'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        ...SECURITY_HEADERS,
    };

    // --- Authentication Check ---
    const secret = request.headers.get('x-internal-secret');
    const internalSecret = env.N8N_APP_SECRET?.trim();

    if (!secret || secret.trim() !== internalSecret) {
        return new Response(JSON.stringify({
            error: "Unauthorized",
            hint: !internalSecret ? "System secret not configured in Cloudflare" : "Incorrect key"
        }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    let client;
    try {
        client = await getDbClient(env);

        // --- Stats Logic ---
        if (url.searchParams.get('stats') === 'true') {
            // Hot Leads: unique phones where at least one response contained [ALERT_SALES]
            const hotLeadsQuery = await client.query(`
                SELECT COUNT(DISTINCT phone) FROM lead_logs 
                WHERE response ILIKE '%[ALERT_SALES]%'
                AND phone NOT IN ('254797331355', '254727774279')
            `);
            
            // Warm Leads: unique phones where no response ever contained [ALERT_SALES]
            const warmLeadsQuery = await client.query(`
                SELECT COUNT(DISTINCT phone) FROM lead_logs 
                WHERE phone NOT IN (
                    SELECT DISTINCT phone FROM lead_logs 
                    WHERE response ILIKE '%[ALERT_SALES]%'
                )
                AND phone NOT IN ('254797331355', '254727774279')
            `);

            // Silent 7+ days: unique phones where MAX(timestamp) < NOW() - 7 days
            const silentQuery = await client.query(`
                SELECT COUNT(*) FROM (
                    SELECT phone FROM lead_logs 
                    WHERE phone NOT IN ('254797331355', '254727774279')
                    GROUP BY phone 
                    HAVING MAX(timestamp) < NOW() - INTERVAL '7 days'
                ) as silents
            `);

            // Converted: count of records in installment_plans
            const convertedQuery = await client.query('SELECT COUNT(*) FROM installment_plans');

            const hotCount = parseInt(hotLeadsQuery.rows[0].count);
            const pipelineValue = hotCount * 1500000;

            const stats = {
                totalLeads: hotCount + parseInt(warmLeadsQuery.rows[0].count),
                hotLeads: hotCount,
                warmLeads: warmLeadsQuery.rows[0].count,
                silentSevenDays: silentQuery.rows[0].count,
                pipelineValue: 'KES ' + pipelineValue.toLocaleString(),
                convertedCount: convertedQuery.rows[0].count
            };

            await client.end();
            return new Response(JSON.stringify(stats), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // --- Regular Leads List ---
        const result = await client.query(`
            SELECT 
              phone,
              MAX(timestamp) as last_seen,
              COUNT(*) as message_count,
              (SELECT message FROM lead_logs l2 WHERE l2.phone = l.phone ORDER BY timestamp DESC LIMIT 1) as last_message,
              (SELECT response FROM lead_logs l2 WHERE l2.phone = l.phone ORDER BY timestamp DESC LIMIT 1) as last_response,
              (SELECT message FROM lead_logs l2
               WHERE l2.phone = l.phone
               AND (message ~* $1 OR message ~* $2 OR message ~* $3 OR message ~* $4 OR message ~* $5)
               ORDER BY timestamp ASC LIMIT 1) as name_message,
              (SELECT response FROM lead_logs l2
               WHERE l2.phone = l.phone
               AND (response ~* $6 OR response ~* $7 OR response ~* $8)
               ORDER BY timestamp ASC LIMIT 1) as name_response,
              CASE 
                WHEN EXISTS (SELECT 1 FROM lead_logs l3 WHERE l3.phone = l.phone AND l3.response ILIKE '%[ALERT_SALES]%') THEN 'hot'
                ELSE 'warm'
              END as status
            FROM lead_logs l
            WHERE phone NOT IN ('254797331355', '254727774279')
            GROUP BY phone
            ORDER BY last_seen DESC
        `, [
            "it'?s\\s+[A-Z][a-z]{2,}",
            "I'?m\\s+[A-Z][a-z]{2,}",
            "my name is\\s+[A-Z][a-z]{2,}",
            "this is\\s+[A-Z][a-z]{2,}",
            "called\\s+[A-Z][a-z]{2,}",
            "Hi\\s+[A-Z][a-z]{2,}",
            "Thank you,?\\s+[A-Z][a-z]{2,}",
            "noted,?\\s+[A-Z][a-z]{2,}"
        ]);

        await client.end();
        return new Response(JSON.stringify(result.rows), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error(err);
        try { await client?.end(); } catch { }
        return new Response(JSON.stringify({
            error: "Internal Server Error",
            message: err.message || String(err)
        }), {
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
