/**
 * Cloudflare Pages Function: Contact Lead Handler
 * 
 * SECURITY FEATURES:
 * 1. Turnstile verification - rejects bots
 * 2. Internal secret header - n8n rejects requests without it
 * 3. Input validation
 * 
 * Endpoint: POST /api/contact-lead
 */

import { SECURITY_HEADERS } from '../utils/db';

interface Env {
    N8N_CONTACT_WEBHOOK: string;
    N8N_INTERNAL_SECRET: string;
    TURNSTILE_SECRET_KEY: string;
}

interface ContactLeadPayload {
    name: string;
    email: string;
    phone: string;
    subject: string;
    message: string;
    source: string;
    submittedAt: string;
    turnstileToken?: string;
}

interface TurnstileResponse {
    success: boolean;
    'error-codes'?: string[];
}

// Verify Turnstile token with Cloudflare
async function verifyTurnstile(token: string, secretKey: string, ip: string): Promise<boolean> {
    try {
        const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                secret: secretKey,
                response: token,
                remoteip: ip,
            }),
        });

        const result: TurnstileResponse = await response.json();
        return result.success;
    } catch (error) {
        console.error('Turnstile verification error:', error);
        return false;
    }
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;

    // CORS + Security headers
    const corsHeaders = {
        'Access-Control-Allow-Origin': 'https://provisionlands.co.ke',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        ...SECURITY_HEADERS,
    };

    try {
        // Validate required environment variables
        if (!env.N8N_CONTACT_WEBHOOK || !env.N8N_INTERNAL_SECRET) {
            console.error('Missing required environment variables');
            return new Response(
                JSON.stringify({ success: false, message: 'Service not configured' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Parse request body
        const payload: ContactLeadPayload = await request.json();

        // Validate required fields
        if (!payload.name || !payload.email || !payload.phone || !payload.message) {
            return new Response(
                JSON.stringify({ success: false, message: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Verify Turnstile token (bot protection)
        if (env.TURNSTILE_SECRET_KEY) {
            if (!payload.turnstileToken) {
                return new Response(
                    JSON.stringify({ success: false, message: 'Bot verification required' }),
                    { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }

            const clientIP = request.headers.get('CF-Connecting-IP') || '';
            const isHuman = await verifyTurnstile(payload.turnstileToken, env.TURNSTILE_SECRET_KEY, clientIP);

            if (!isHuman) {
                return new Response(
                    JSON.stringify({ success: false, message: 'Bot verification failed' }),
                    { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
        }

        // Remove turnstile token before forwarding to n8n
        const { turnstileToken, ...cleanPayload } = payload;

        // Forward to n8n webhook WITH internal secret header
        const n8nResponse = await fetch(env.N8N_CONTACT_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-internal-secret': env.N8N_INTERNAL_SECRET,
            },
            body: JSON.stringify(cleanPayload),
        });

        if (!n8nResponse.ok) {
            console.error(`n8n webhook error: ${n8nResponse.status}`);
            return new Response(
                JSON.stringify({ success: false, message: 'Failed to process lead' }),
                { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // Success response
        return new Response(
            JSON.stringify({
                success: true,
                message: 'Thank you! We will contact you shortly.'
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('Contact lead handler error:', error);
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
