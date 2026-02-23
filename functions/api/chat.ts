
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

    // Build CORS headers - supporting local development
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
        // Safe JSON parsing
        let payload: any;
        try {
            payload = await request.json();
        } catch (jsonErr) {
            return new Response(JSON.stringify({ error: 'Invalid Request JSON', details: String(jsonErr) }), {
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

        const safePayload = {
            message: String(payload.message).trim(),
            sessionId: payload.sessionId ? String(payload.sessionId) : `sess_${Math.random().toString(36).substr(2, 9)}`,
            name: payload.name ? String(payload.name) : 'Website Visitor',
            history: Array.isArray(payload.history) ? payload.history : [],
        };

        const n8nUrl = env.N8N_WEBHOOK_CHAT;
        if (!n8nUrl) {
            return new Response(JSON.stringify({ error: 'System Configuration Error', message: 'N8N_WEBHOOK_CHAT is not defined' }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const secret = env.N8N_APP_SECRET || '';

        // Perform the fetch to n8n
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
                error: 'Connection to n8n Failed',
                message: fetchErr.message,
                hint: 'Check if n8n service is up and the URL is correct'
            }), {
                status: 504,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // Handle n8n response
        const contentType = response.headers.get("content-type");
        const isJson = contentType && contentType.includes("application/json");

        if (!response.ok || !isJson) {
            const errorText = await response.text();
            return new Response(JSON.stringify({
                error: 'n8n Upstream Error',
                status: response.status,
                message: errorText.substring(0, 500)
            }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        const data: any = await response.json();
        const finalData = Array.isArray(data) ? data[0] : data;

        // Ensure we always have a 'response' key for steveService.ts
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
            error: 'Critical Function Error',
            message: criticalErr.message || String(criticalErr),
            stack: criticalErr.stack?.substring(0, 100)
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
