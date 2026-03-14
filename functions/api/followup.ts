
import { getDbClient, DbEnv, SECURITY_HEADERS } from '../utils/db';

interface Env extends DbEnv {
    N8N_APP_SECRET: string;
    WA_PHONE_NUMBER_ID: string;
    WA_TOKEN: string;
}

// ── Shared helpers ────────────────────────────────────────────────────────────

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

// ── POST /api/followup ────────────────────────────────────────────────────────
//
// Body: { senderId: string, message: string }
//
// 1. Sends a clean (no prefix) WhatsApp message to the customer via the
//    Meta Cloud API using the permanent token.
// 2. Logs the message to lead_logs with [AGENT] prefix so Steve can identify
//    it in conversation history and continue naturally.
//
// WhatsApp Phone Number ID: 991500877383490
// The senderId already arrives in 254xxxxxxxxx format — used as-is.
// ─────────────────────────────────────────────────────────────────────────────

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const corsHeaders = getCorsHeaders(request);

    // ── Auth check ──────────────────────────────────────────────────────────
    if (!checkAuth(request, env)) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // ── Parse body ──────────────────────────────────────────────────────────
    let body: { senderId?: string; message?: string };
    try {
        body = await request.json() as { senderId?: string; message?: string };
    } catch {
        return new Response(JSON.stringify({ error: 'Invalid JSON body' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    const { senderId, message } = body;

    if (!senderId || !message || !message.trim()) {
        return new Response(JSON.stringify({ error: 'Missing senderId or message' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // ── WhatsApp Phone Number ID & Token ────────────────────────────────────
    // Phone Number ID is hardcoded per spec; token comes from Cloudflare Secret
    const PHONE_NUMBER_ID = '991500877383490';
    const waToken = env.WA_TOKEN;

    if (!waToken) {
        console.error('[POST /api/followup] WA_TOKEN secret is not set in Cloudflare.');
        return new Response(JSON.stringify({ error: 'WhatsApp token not configured' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // ── Step 1: Send clean message to WhatsApp (NO [AGENT] prefix) ──────────
    const waUrl = `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`;

    let waResponse: Response;
    try {
        waResponse = await fetch(waUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${waToken}`,
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to: senderId,             // already in 254xxxxxxxxx format
                type: 'text',
                text: { body: message }, // clean message — no [AGENT] prefix
            }),
        });
    } catch (fetchErr: any) {
        console.error('[POST /api/followup] Failed to reach WhatsApp API:', fetchErr);
        return new Response(JSON.stringify({ error: 'Failed to reach WhatsApp API', details: fetchErr.message }), {
            status: 502,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    if (!waResponse.ok) {
        const errorBody = await waResponse.text();
        console.error('[POST /api/followup] WhatsApp API returned error:', waResponse.status, errorBody);
        return new Response(JSON.stringify({ error: 'WhatsApp API error', details: errorBody }), {
            status: waResponse.status,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // ── Step 2: Log to lead_logs with [AGENT] prefix ─────────────────────────
    // This lets Steve see what the sales agent said when reading conversation
    // history. The prefix is stripped in the CRM UI before display.
    let client;
    try {
        client = await getDbClient(env);
        await client.query(
            'INSERT INTO lead_logs (phone, message, response, timestamp) VALUES ($1, $2, $3, NOW())',
            [senderId, `[AGENT] ${message.trim()}`, '']
        );
        await client.end();
    } catch (dbErr: any) {
        if (client) {
            try { await client.end(); } catch { /* ignore */ }
        }
        // WhatsApp delivery succeeded — log the DB error but don't fail the response
        console.error('[POST /api/followup] DB log failed (message was delivered to WhatsApp):', dbErr.message);
        return new Response(JSON.stringify({
            success: true,
            warning: 'Message sent to WhatsApp but DB log failed',
            db_error: dbErr.message,
        }), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
};

// ── OPTIONS (preflight) ───────────────────────────────────────────────────────

export const onRequestOptions: PagesFunction = async (context) => {
    const corsHeaders = getCorsHeaders(context.request);
    return new Response(null, {
        headers: {
            ...corsHeaders,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
    });
};
