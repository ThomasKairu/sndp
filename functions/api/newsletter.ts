/**
 * Cloudflare Pages Function: Newsletter Handler
 * 
 * SECURITY FEATURES:
 * 1. Internal secret header - n8n rejects requests without it
 * 2. Rate limiting via CF-RAY tracking (WAF rule recommended)
 * 3. Email validation
 * 
 * Endpoint: POST /api/newsletter
 */

interface Env {
    N8N_NEWSLETTER_WEBHOOK: string;
    N8N_INTERNAL_SECRET: string;
}

interface NewsletterPayload {
    email: string;
    source: string;
    subscribedAt: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // CORS headers + rate limit hint for WAF
    const corsHeaders = {
        'Access-Control-Allow-Origin': 'https://provisionlands.co.ke',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'X-Rate-Limit-Group': 'newsletter', // Used by Cloudflare WAF rules
    };

    try {
        // Validate required environment variables
        if (!env.N8N_NEWSLETTER_WEBHOOK || !env.N8N_INTERNAL_SECRET) {
            console.error('Missing required environment variables');
            return new Response(
                JSON.stringify({ success: false, message: 'Service not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Parse request body
        const payload: NewsletterPayload = await request.json();

        // Validate email
        if (!payload.email) {
            return new Response(
                JSON.stringify({ success: false, message: 'Email is required' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
            return new Response(
                JSON.stringify({ success: false, message: 'Invalid email format' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Disposable email check (basic)
        const disposableDomains = ['tempmail.com', 'throwaway.email', '10minutemail.com', 'guerrillamail.com'];
        const emailDomain = payload.email.split('@')[1]?.toLowerCase();
        if (disposableDomains.includes(emailDomain)) {
            return new Response(
                JSON.stringify({ success: false, message: 'Please use a valid email address' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Forward to n8n webhook WITH internal secret header
        const n8nResponse = await fetch(env.N8N_NEWSLETTER_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-secret': env.N8N_INTERNAL_SECRET,
            },
            body: JSON.stringify(payload),
        });

        if (!n8nResponse.ok) {
            console.error(`n8n webhook error: ${n8nResponse.status}`);
            return new Response(
                JSON.stringify({ success: false, message: 'Failed to subscribe' }),
                { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Success response
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Thank you for subscribing!'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Newsletter handler error:', error);
        return new Response(
            JSON.stringify({ success: false, message: 'Internal server error' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
};

// Handle OPTIONS preflight requests
export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': 'https://provisionlands.co.ke',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
};
