import { getDbClient, DbEnv } from '../utils/db';

interface Env extends DbEnv {
    N8N_INTERNAL_SECRET: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const method = request.method;

    // CORS headers - strict origin
    const corsHeaders = {
        'Access-Control-Allow-Origin': 'https://provisionlands.co.ke',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
    };

    if (method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    let client;
    try {
        client = await getDbClient(env);
    } catch (err: any) {
        console.error("DB Connection Error:", err);
        return new Response(JSON.stringify({
            error: "Database Service Unavailable",
            details: err.message || String(err)
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    try {
        // --- 1. GET requests (Public) ---
        if (method === 'GET') {
            const result = await client.query('SELECT * FROM properties ORDER BY id DESC');
            await client.end();
            return new Response(JSON.stringify(result.rows), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // --- 2. Write requests (Protected) ---
        const secret = request.headers.get('x-internal-secret');
        if (!secret || secret.trim() !== env.N8N_INTERNAL_SECRET?.trim()) {
            await client.end();
            return new Response(JSON.stringify({
                error: "Unauthorized",
                message: !secret ? "Missing header" : "Key mismatch"
            }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const body = await request.json() as any;

        // Whitelist allowed columns to prevent SQL Injection
        const ALLOWED_COLUMNS = [
            'title', 'price', 'location', 'type', 'size',
            'description', 'image',
            'images', 'features', 'status'
        ];

        if (method === 'POST') {
            const query = `
                INSERT INTO properties (id, title, price, location, type, size, description, image, images, features, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `;
            const values = [
                body.id || crypto.randomUUID(),
                body.title, body.price, body.location, body.type, body.size,
                body.description, body.image,
                JSON.stringify(body.images || []), JSON.stringify(body.features || []), body.status
            ];

            const result = await client.query(query, values);
            await client.end();

            return new Response(JSON.stringify(result.rows[0]), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'PUT') {
            const id = url.searchParams.get('id');
            if (!id) throw new Error("Missing ID");

            // Secure dynamic update using whitelist
            const updates: string[] = [];
            const values: any[] = [id];
            let paramCounter = 2; // Start from $2 (id is $1)

            Object.keys(body).forEach(key => {
                if (ALLOWED_COLUMNS.includes(key)) {
                    updates.push(`${key} = $${paramCounter}`);
                    // Handle array/json fields
                    if (key === 'images' || key === 'features') {
                        values.push(JSON.stringify(body[key]));
                    } else {
                        values.push(body[key]);
                    }
                    paramCounter++;
                }
            });

            if (updates.length === 0) {
                await client.end();
                return new Response(JSON.stringify({ error: "No valid fields to update" }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            const query = `UPDATE properties SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;
            const result = await client.query(query, values);
            await client.end();

            return new Response(JSON.stringify(result.rows[0]), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        if (method === 'DELETE') {
            const id = url.searchParams.get('id');
            if (!id) {
                await client.end();
                return new Response(JSON.stringify({ error: "Missing ID" }), {
                    status: 400,
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                });
            }

            await client.query('DELETE FROM properties WHERE id = $1', [id]);
            await client.end();
            return new Response(JSON.stringify({ success: true }), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

    } catch (err) {
        console.error("API Error:", err);
        try { await client?.end(); } catch { }
        return new Response(JSON.stringify({ error: "Internal Server Error" }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    return new Response(null, { status: 405 });
};
