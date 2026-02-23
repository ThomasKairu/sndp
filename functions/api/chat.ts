
// Basic security headers
const CHAT_SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
};

interface Env {
    N8N_WEBHOOK_CHAT: string;
    N8N_APP_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    let step = "init";

    // Build CORS headers
    const origin = request.headers.get('Origin');
    const allowed = ['https://provisionlands.co.ke', 'https://www.provisionlands.co.ke', 'http://localhost:3000'];
    const corsHeaders = {
        'Access-Control-Allow-Origin': allowed.includes(origin || '') ? origin! : 'https://provisionlands.co.ke',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        ...CHAT_SECURITY_HEADERS,
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        step = "read_request_body";
        // Use text() instead of json() to avoid "Unexpected end of JSON input" crash
        const requestText = await request.text();

        step = "parse_request_json";
        let payload: any;
        if (!requestText || requestText.trim() === '') {
            return new Response(JSON.stringify({ error: 'Empty Request Body' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        try {
            payload = JSON.parse(requestText);
        } catch (e) {
            return new Response(JSON.stringify({ error: 'Invalid JSON in Request', details: requestText.substring(0, 100) }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        if (!payload.message) {
            return new Response(JSON.stringify({ error: 'Missing message field' }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        step = "prep_n8n_payload";
        const safePayload = {
            message: String(payload.message).trim(),
            sessionId: payload.sessionId ? String(payload.sessionId) : `sess_${Math.random().toString(36).substr(2, 9)}`,
            name: payload.name ? String(payload.name) : 'Website Visitor',
            history: Array.isArray(payload.history) ? payload.history : [],
        };

        const n8nUrl = env.N8N_WEBHOOK_CHAT;
        if (!n8nUrl) {
            return new Response(JSON.stringify({ error: 'Cloudflare Configuration Error', message: 'N8N_WEBHOOK_CHAT is missing' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        step = "fetch_n8n";
        const secret = env.N8N_APP_SECRET || '';
        let response: Response;
        try {
            response = await fetch(n8nUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-internal-secret': secret,
                },
                body: JSON.stringify(safePayload),
            });
        } catch (fetchErr: any) {
            return new Response(JSON.stringify({
                error: 'n8n Connection Refused',
                message: fetchErr.message
            }), {
                status: 504,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        step = "read_n8n_response";
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        if (!response.ok || !isJson) {
            const errorText = await response.text();
            return new Response(JSON.stringify({
                error: 'n8n Error Response',
                status: response.status,
                message: errorText.substring(0, 500)
            }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const rawText = await response.text();

        step = "parse_n8n_json";
        if (!rawText || rawText.trim() === '') {
            return new Response(JSON.stringify({
                error: 'n8n Returned Empty Body',
                hint: 'Is your Respond to Webhook node active?'
            }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        let data: any;
        try {
            data = JSON.parse(rawText);
        } catch (parseErr) {
            return new Response(JSON.stringify({
                error: 'n8n Returned Invalid JSON',
                message: rawText.substring(0, 500)
            }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        step = "finalize_response";
        const finalData = Array.isArray(data) ? data[0] : data;

        if (finalData && typeof finalData === 'object' && !finalData.response) {
            const alternateKey = ['output', 'text', 'message', 'reply'].find(k => finalData[k]);
            if (alternateKey) {
                finalData.response = finalData[alternateKey];
            }
        }

        return new Response(JSON.stringify(finalData), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

    } catch (criticalErr: any) {
        return new Response(JSON.stringify({
            error: 'Chat Script Crash',
            step: step,
            message: criticalErr.message || String(criticalErr),
            stack: criticalErr.stack?.substring(0, 150)
        }), {
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
            ...CHAT_SECURITY_HEADERS,
        },
    });
};
