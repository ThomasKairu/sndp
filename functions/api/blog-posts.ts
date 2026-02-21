
import { getDbClient, DbEnv, SECURITY_HEADERS } from '../utils/db';

interface Env extends DbEnv {
    N8N_APP_SECRET: string;
}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const method = request.method;

    // CORS + Security - Allow naked and www domains
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

    let client;
    try {
        client = await getDbClient(env);
    } catch (err) {
        console.error("DB Connection Error:", err);
        return new Response(JSON.stringify({ error: "Database Service Unavailable" }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }

    try {
        // --- 1. GET requests (Public) ---
        if (method === 'GET') {
            const result = await client.query('SELECT * FROM blog_posts ORDER BY date DESC');
            await client.end();
            return new Response(JSON.stringify(result.rows), {
                status: 200,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // --- 2. Write requests (Protected) ---
        const secret = request.headers.get('x-internal-secret');
        const internalSecret = env.N8N_APP_SECRET?.trim();
        if (!secret || secret.trim() !== internalSecret) {
            await client.end();
            return new Response(JSON.stringify({ error: "Unauthorized" }), {
                status: 401,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        const body = await request.json() as any;

        // Whitelist allowed columns to prevent SQL Injection
        const ALLOWED_COLUMNS = ['title', 'excerpt', 'content', 'date', 'category', 'image'];


        if (method === 'POST') {
            const query = `
                INSERT INTO blog_posts (id, title, excerpt, content, date, category, image)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *
            `;
            const values = [
                body.id || crypto.randomUUID(),
                body.title, body.excerpt, body.content,
                body.date, body.category, body.image
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
                    values.push(body[key]);
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

            const query = `UPDATE blog_posts SET ${updates.join(', ')} WHERE id = $1 RETURNING *`;

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

            await client.query('DELETE FROM blog_posts WHERE id = $1', [id]);
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
