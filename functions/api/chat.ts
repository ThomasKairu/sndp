
import { SECURITY_HEADERS } from '../utils/db';

interface Env {
    N8N_WEBHOOK_CHAT: string;
    N8N_INTERNAL_SECRET: string;
}

// Maximum allowed payload size (50KB) to prevent DoS while allowing history
const MAX_PAYLOAD_BYTES = 50_000;
// Maximum message length in characters
const MAX_MESSAGE_LENGTH = 4_000;

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    // CORS + Security - Allow naked and www domains
    const origin = request.headers.get('Origin');
    const allowedOrigins = ['https://provisionlands.co.ke', 'https://www.provisionlands.co.ke'];
    const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin! : 'https://provisionlands.co.ke',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        ...SECURITY_HEADERS,
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // --- Input size guard: reject oversized payloads before parsing ---
        const contentLength = Number(request.headers.get('content-length') || '0');
        if (contentLength > MAX_PAYLOAD_BYTES) {
            return new Response(JSON.stringify({ error: 'Payload too large' }), {
                status: 413,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const payload = await request.json() as {
            message?: unknown;
            sessionId?: unknown;
            history?: unknown;
            name?: unknown;
        };

        // --- Required field validation ---
        if (!payload.message || typeof payload.message !== 'string') {
            return new Response(JSON.stringify({ error: 'Missing or invalid message field' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // --- Message length guard ---
        if (payload.message.length > MAX_MESSAGE_LENGTH) {
            return new Response(JSON.stringify({ error: 'Message too long' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // --- Build a sanitized payload (only forward known safe fields) ---
        const safePayload = {
            message: payload.message.trim(),
            sessionId: typeof payload.sessionId === 'string' ? payload.sessionId.substring(0, 128) : undefined,
            name: typeof payload.name === 'string' ? payload.name.substring(0, 100) : 'Website Visitor',
            history: Array.isArray(payload.history) ? payload.history.slice(-20) : [], // last 20 messages max
        };

        // n8n Endpoint from env
        const n8nUrl = env.N8N_WEBHOOK_CHAT;
        if (!n8nUrl) {
            console.error('Chat Webhook Configuration Missing');
            return new Response(JSON.stringify({ error: 'Chat service not configured' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const secret = env.N8N_INTERNAL_SECRET;

        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-secret': secret,
            },
            body: JSON.stringify(safePayload),
        });

        if (!response.ok) {
            console.error(`n8n error: ${response.status}`);
            return new Response(JSON.stringify({ error: 'Upstream Error' }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const data: any = await response.json();

        // n8n often returns an array [ { ... } ] or a direct object { ... }
        // We want to ensure it has a 'response' field for steveService.ts
        let finalData: any = data;
        if (Array.isArray(data) && data.length > 0) {
            finalData = data[0];
        }

        // If n8n uses 'output' or 'text' instead of 'response', map it
        if (finalData && typeof finalData === 'object' && !finalData.response && (finalData.output || finalData.text)) {
            finalData.response = finalData.output || finalData.text;
        }

        return new Response(JSON.stringify(finalData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    } catch (e) {
        console.error('Chat API Error:', e);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
};

export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': 'https://provisionlands.co.ke',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            ...SECURITY_HEADERS,
        },
    });
};
