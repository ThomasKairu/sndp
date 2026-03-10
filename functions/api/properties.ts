import { getDbClient, DbEnv, SECURITY_HEADERS } from '../utils/db';

interface Env extends DbEnv {
    N8N_APP_SECRET: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env, next } = context;
    const url = new URL(request.url);
    const method = request.method;

    // CORS + Security
    const origin = request.headers.get('Origin');
    const allowedOrigins = ['https://provisionlands.co.ke', 'https://www.provisionlands.co.ke'];
    const corsHeaders = {
        'Access-Control-Allow-Origin': allowedOrigins.includes(origin || '') ? origin! : 'https://provisionlands.co.ke',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        ...SECURITY_HEADERS,
    };

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    // Auth Check for mutations
    if (['POST', 'PUT', 'DELETE'].includes(method)) {
        const secret = request.headers.get('x-internal-secret');
        const internalSecret = env.N8N_APP_SECRET?.trim();
        if (!secret || secret.trim() !== internalSecret) {
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }
    }

    let client;
    try {
        client = await getDbClient(env);

        if (method === 'GET') {
            const result = await client.query('SELECT * FROM properties ORDER BY created_at DESC');
            await client.end();
            return new Response(JSON.stringify(result.rows), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'POST') {
            const body = await request.json() as any;
            const { id, title, location, price, size, type, status, description, image } = body;
            
            let features = body.features || [];
            if (typeof features === 'string') {
                features = features.split(',').map((f: string) => f.trim()).filter(Boolean);
            }
            
            const images = body.images && body.images.length > 0 ? body.images : [image];

            const query = `
                INSERT INTO properties (id, title, location, price, size, type, status, description, image, images, features)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `;
            const params = [id, title, location, price, size, type, status, description, image, JSON.stringify(images), JSON.stringify(features)];
            
            const result = await client.query(query, params);
            await client.end();
            return new Response(JSON.stringify(result.rows[0]), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'PUT') {
            const idParam = url.searchParams.get('id');
            if (!idParam) throw new Error("Missing ID parameter");

            const body = await request.json() as any;
            const { title, location, price, size, type, status, description, image } = body;
            
            let features = body.features;
            if (features && typeof features === 'string') {
                features = features.split(',').map((f: string) => f.trim()).filter(Boolean);
            }
            
            const images = body.images && body.images.length > 0 ? body.images : (image ? [image] : undefined);

            // Construct dynamic UPDATE query
            const updates: string[] = [];
            const params: any[] = [];
            let i = 1;

            const fields = { title, location, price, size, type, status, description, image, images: images ? JSON.stringify(images) : undefined, features: features ? JSON.stringify(features) : undefined };
            
            for (const [key, value] of Object.entries(fields)) {
                if (value !== undefined) {
                    updates.push(`${key} = $${i++}`);
                    params.push(value);
                }
            }
            
            updates.push(`updated_at = NOW()`);
            params.push(idParam);

            const query = `UPDATE properties SET ${updates.join(', ')} WHERE id = $${i} RETURNING *`;
            const result = await client.query(query, params);
            
            await client.end();
            return new Response(JSON.stringify(result.rows[0]), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'DELETE') {
            const idParam = url.searchParams.get('id');
            if (!idParam) throw new Error("Missing ID parameter");

            await client.query('DELETE FROM properties WHERE id = $1', [idParam]);
            await client.end();
            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });

    } catch (err: any) {
        console.error(err);
        if (client) await client.end();
        return new Response(JSON.stringify({ error: err.message || "Internal Server Error" }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
};
