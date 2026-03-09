import { SECURITY_HEADERS } from '../utils/db';

interface Env {
    INSTALLMENTS_PIN: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    
    // CORS + Security
    const origin = request.headers.get('Origin');
    const allowedOrigins = ['https://provisionlands.co.ke', 'https://www.provisionlands.co.ke'];
    const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin! : 'https://provisionlands.co.ke',
        'Access-Control-Allow-Headers': 'Content-Type',
        ...SECURITY_HEADERS,
    };

    try {
        const { pin } = await request.json() as { pin: string };
        const correctPin = env.INSTALLMENTS_PIN?.trim();

        if (!correctPin) {
            return new Response(JSON.stringify({ 
                success: false, 
                message: "Server configuration error: PIN not set" 
            }), {
                status: 500,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (pin === correctPin) {
            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        } else {
            return new Response(JSON.stringify({ success: false }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    } catch (err: any) {
        return new Response(JSON.stringify({ 
            success: false, 
            message: "Malformed request" 
        }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
};

export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
};
