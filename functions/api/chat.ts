
interface Env {
    N8N_WEBHOOK_CHAT: string;
    N8N_INTERNAL_SECRET: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const corsHeaders = {
        'Access-Control-Allow-Origin': 'https://provisionlands.co.ke',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    };

    if (request.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const payload = await request.json();

        // n8n Endpoint from env
        const n8nUrl = env.N8N_WEBHOOK_CHAT;
        if (!n8nUrl) throw new Error("Chat Webhook Configuration Missing");

        // Secret from instructions
        const secret = env.N8N_INTERNAL_SECRET;

        const response = await fetch(n8nUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-secret': secret
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            console.error(`n8n error: ${response.status}`);
            return new Response(JSON.stringify({ error: "Upstream Error" }), {
                status: 502,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const data = await response.json();

        return new Response(JSON.stringify(data), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (e) {
        console.error("Chat API Error:", e);
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
}
