
import { getDbClient, DbEnv, SECURITY_HEADERS } from '../utils/db';

interface Env extends DbEnv {
    N8N_APP_SECRET: string;
}

// ─── Shared helpers ────────────────────────────────────────────────────────────

function getCorsHeaders(request: Request) {
    const origin = request.headers.get('Origin');
    const allowedOrigins = ['https://provisionlands.co.ke', 'https://www.provisionlands.co.ke'];
    return {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin! : 'https://provisionlands.co.ke',
        'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        ...SECURITY_HEADERS,
    };
}

function checkAuth(request: Request, env: Env): boolean {
    const secret = request.headers.get('x-internal-secret');
    const internalSecret = env.N8N_APP_SECRET?.trim();
    return !!(secret && internalSecret && secret.trim() === internalSecret);
}

function unauthorizedResponse(corsHeaders: Record<string, string>, env: Env) {
    const internalSecret = env.N8N_APP_SECRET?.trim();
    return new Response(JSON.stringify({
        error: 'Unauthorized',
        hint: !internalSecret ? 'System secret not configured in Cloudflare' : 'Incorrect key'
    }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
}

// Ensure the lead_status_overrides table exists (idempotent)
async function ensureOverridesTable(client: any) {
    await client.query(`
        CREATE TABLE IF NOT EXISTS lead_status_overrides (
            phone       VARCHAR(20) PRIMARY KEY,
            status      VARCHAR(20) NOT NULL DEFAULT 'warm',
            converted   BOOLEAN     NOT NULL DEFAULT false,
            notes       TEXT,
            updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
    `);
    
    // Add customer_name to lead_logs if it doesn't exist
    await client.query(`
        ALTER TABLE lead_logs ADD COLUMN IF NOT EXISTS customer_name VARCHAR(100);
    `);
}

// ─── GET /api/leads ────────────────────────────────────────────────────────────

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request);

    if (!checkAuth(request, env)) return unauthorizedResponse(corsHeaders, env);

    let client;
    try {
        client = await getDbClient(env);
        await ensureOverridesTable(client);

        // ── Stats ──────────────────────────────────────────────────────────────
        if (url.searchParams.get('stats') === 'true') {
            const hotLeadsQuery = await client.query(`
                SELECT COUNT(DISTINCT l.phone) FROM lead_logs l
                LEFT JOIN lead_status_overrides lso ON lso.phone = l.phone
                WHERE l.phone NOT IN ('254797331355', '254119715900')
                AND (
                    COALESCE(lso.status, '') = 'hot'
                    OR EXISTS (
                        SELECT 1 FROM lead_logs l3
                        WHERE l3.phone = l.phone AND l3.response ILIKE '%[ALERT_SALES]%'
                    )
                )
            `);

            const warmLeadsQuery = await client.query(`
                SELECT COUNT(DISTINCT l.phone) FROM lead_logs l
                LEFT JOIN lead_status_overrides lso ON lso.phone = l.phone
                WHERE l.phone NOT IN ('254797331355', '254119715900')
                AND COALESCE(lso.status, '') NOT IN ('hot', 'converted', 'CLOSED')
                AND NOT EXISTS (
                    SELECT 1 FROM lead_logs l3
                    WHERE l3.phone = l.phone AND l3.response ILIKE '%[ALERT_SALES]%'
                )
            `);

            const silentQuery = await client.query(`
                SELECT COUNT(*) FROM (
                    SELECT phone FROM lead_logs
                    WHERE phone NOT IN ('254797331355', '254119715900')
                    GROUP BY phone
                    HAVING MAX(timestamp) < NOW() - INTERVAL '7 days'
                ) as silents
            `);

            const convertedQuery = await client.query('SELECT COUNT(*) FROM installment_plans');

            const hotCount = parseInt(hotLeadsQuery.rows[0].count);
            const pipelineValue = hotCount * 1500000;

            await client.end();
            return new Response(JSON.stringify({
                totalLeads: hotCount + parseInt(warmLeadsQuery.rows[0].count),
                hotLeads: hotCount,
                warmLeads: warmLeadsQuery.rows[0].count,
                silentSevenDays: silentQuery.rows[0].count,
                pipelineValue: 'KES ' + pipelineValue.toLocaleString(),
                convertedCount: convertedQuery.rows[0].count
            }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
        }

        // ── Regular Leads List (with override JOIN + name history scan) ─────────
        const result = await client.query(`
            SELECT
              l.phone,
              MAX(l.timestamp)                                                        AS last_seen,
              COUNT(*)                                                                AS message_count,
              (SELECT message  FROM lead_logs l2 WHERE l2.phone = l.phone ORDER BY timestamp DESC LIMIT 1) AS last_message,
              (SELECT response FROM lead_logs l2 WHERE l2.phone = l.phone ORDER BY timestamp DESC LIMIT 1) AS last_response,
              (SELECT customer_name FROM lead_logs l2 WHERE l2.phone = l.phone AND customer_name IS NOT NULL ORDER BY timestamp DESC LIMIT 1) AS customer_name,
              (SELECT message  FROM lead_logs l2
               WHERE l2.phone = l.phone
               AND (message ~* $1 OR message ~* $2 OR message ~* $3 OR message ~* $4 OR message ~* $5)
               ORDER BY timestamp ASC LIMIT 1)                                       AS name_message,
              (SELECT response FROM lead_logs l2
               WHERE l2.phone = l.phone
               AND (response ~* $6 OR response ~* $7 OR response ~* $8 OR response ~* $9 OR response ~* $10 OR response ~* $11 OR response ~* $12 OR response ~* $13 OR response ~* $14 OR response ~* $15 OR response ~* $16 OR response ~* $17 OR response ~* $18)
               ORDER BY timestamp ASC LIMIT 1)                                       AS name_response,
              COALESCE(
                lso.status,
                CASE WHEN bool_or(l.response ILIKE '%[ALERT_SALES]%') THEN 'hot' ELSE 'warm' END
              )                                                                       AS status,
              COALESCE(lso.converted, false)                                         AS converted
            FROM lead_logs l
            LEFT JOIN lead_status_overrides lso ON lso.phone = l.phone
            WHERE l.phone NOT IN ('254797331355', '254119715900')
            GROUP BY l.phone, lso.status, lso.converted
            ORDER BY last_seen DESC
        `, [
            "it'?s\\s+[A-Z][a-z]{1,}",
            "I'?m\\s+[A-Z][a-z]{1,}",
            "my name is\\s+[A-Z][a-z]{1,}",
            "this is\\s+[A-Z][a-z]{1,}",
            "called\\s+[A-Z][a-z]{1,}",
            "Hi\\s+[A-Z][a-z]{1,}",
            "Thank you,?\\s+[A-Z][a-z]{1,}",
            "noted,?\\s+[A-Z][a-z]{1,}",
            "Hello\\s+[A-Z][a-z]{1,}",
            "Hey\\s+[A-Z][a-z]{1,}",
            "Great\\s+[A-Z][a-z]{1,}",
            "Perfect\\s+[A-Z][a-z]{1,}",
            "Excellent\\s+[A-Z][a-z]{1,}",
            "Wonderful\\s+[A-Z][a-z]{1,}",
            "Sawa\\s+[A-Z][a-z]{1,}",
            "Noted\\s+[A-Z][a-z]{1,}",
            "Nice to meet you,?\\s+[A-Z][a-z]{1,}",
            "Great to meet you,?\\s+[A-Z][a-z]{1,}"
        ]);

        await client.end();
        return new Response(JSON.stringify(result.rows), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error('[GET /api/leads]', err);
        try { await client?.end(); } catch { }
        return new Response(JSON.stringify({
            error: 'Internal Server Error',
            message: err.message || String(err)
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
};

// ─── PUT /api/leads?phone=254xxxxxxxxx ─────────────────────────────────────────

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request);

    if (!checkAuth(request, env)) return unauthorizedResponse(corsHeaders, env);

    const phone = url.searchParams.get('phone')?.trim();
    if (!phone) {
        return new Response(JSON.stringify({ error: 'Missing phone query param' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    let body: Record<string, any>;
    try {
        body = await request.json() as Record<string, any>;
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    const { status, converted, notes } = body;

    if (!status && converted === undefined && notes === undefined) {
        return new Response(JSON.stringify({ error: 'Nothing to update — provide status, converted, or notes' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    let client;
    try {
        client = await getDbClient(env);
        await ensureOverridesTable(client);

        // Build UPSERT dynamically so we only update provided fields
        const setClauses: string[] = ['updated_at = NOW()'];
        const params: any[] = [phone];

        if (status !== undefined) {
            params.push(status);
            setClauses.push(`status = $${params.length}`);
        }
        if (converted !== undefined) {
            params.push(converted);
            setClauses.push(`converted = $${params.length}`);
        }
        if (notes !== undefined) {
            params.push(notes);
            setClauses.push(`notes = $${params.length}`);
        }

        // INSERT on missing phone, UPDATE on conflict
        const insertFields = ['phone', ...(status !== undefined ? ['status'] : []), ...(converted !== undefined ? ['converted'] : []), ...(notes !== undefined ? ['notes'] : [])];
        const insertValues = params.map((_, i) => `$${i + 1}`);

        await client.query(`
            INSERT INTO lead_status_overrides (${insertFields.join(', ')})
            VALUES (${insertValues.join(', ')})
            ON CONFLICT (phone)
            DO UPDATE SET ${setClauses.join(', ')}
        `, params);

        // Return the updated override row
        const updated = await client.query(
            'SELECT * FROM lead_status_overrides WHERE phone = $1',
            [phone]
        );

        await client.end();
        return new Response(JSON.stringify(updated.rows[0] || { phone, status, converted }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error('[PUT /api/leads]', err);
        try { await client?.end(); } catch { }
        return new Response(JSON.stringify({
            error: 'Internal Server Error',
            message: err.message || String(err)
        }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
};

// ─── OPTIONS (preflight) ────────────────────────────────────────────────────────

export const onRequestOptions: PagesFunction = async (context) => {
    const corsHeaders = getCorsHeaders(context.request);
    return new Response(null, {
        headers: {
            ...corsHeaders,
            'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        },
    });
};
