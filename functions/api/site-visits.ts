
import { getDbClient, DbEnv, SECURITY_HEADERS } from '../utils/db';

interface Env extends DbEnv {
    N8N_APP_SECRET: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const origin = request.headers.get('Origin');
    const allowed = ['https://provisionlands.co.ke', 'https://www.provisionlands.co.ke'];
    const corsHeaders = {
        'Access-Control-Allow-Origin': allowed.includes(origin || '') ? origin! : 'https://provisionlands.co.ke',
        'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        ...SECURITY_HEADERS,
    };

    const secret = request.headers.get('x-internal-secret');
    if (!secret || secret.trim() !== env.N8N_APP_SECRET?.trim()) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    let client;
    try {
        client = await getDbClient(env);
        const result = await client.query('SELECT * FROM site_visits ORDER BY visit_date ASC');
        return new Response(JSON.stringify(result.rows), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('Site visits GET error:', err);
        return new Response(JSON.stringify({ error: err.message }), { 
            status: 500, 
            headers: corsHeaders 
        });
    } finally {
        if (client) await client.end();
    }
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const origin = request.headers.get('Origin');
    const corsHeaders = {
        'Access-Control-Allow-Origin': origin || 'https://provisionlands.co.ke',
        'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        ...SECURITY_HEADERS,
    };

    const secret = request.headers.get('x-internal-secret');
    if (!secret || secret.trim() !== env.N8N_APP_SECRET?.trim()) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    let client;
    try {
        const body = await request.json() as any;
        // Frontend sends: { customer_name, sender_id: phone, property_name, visit_date: ISO, visit_day, notes, status }
        const { 
            customer_name, 
            sender_id, // Phone number
            property_name, 
            visit_date, // ISO timestamp
            visit_day, 
            notes, 
            status 
        } = body;

        client = await getDbClient(env);
        const query = `
            INSERT INTO site_visits (
                customer_name, 
                sender_id, 
                property_name, 
                visit_date, 
                visit_day, 
                notes,
                status, 
                created_at
            )
            VALUES ($1, $2, $3, $4::timestamptz, $5, $6, $7, NOW())
            RETURNING *
        `;
        
        const result = await client.query(query, [
            customer_name || 'Anonymous', 
            sender_id || '', // sender_id is NOT NULL
            property_name, 
            visit_date, 
            visit_day || (visit_date ? visit_date.split('T')[0] : null),
            notes || null,
            status || 'scheduled'
        ]);
        
        return new Response(JSON.stringify(result.rows[0]), {
            status: 201,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('Site visits POST error:', err);
        return new Response(JSON.stringify({ 
            error: err.message,
            detail: err.detail,
            hint: err.hint
        }), { 
            status: 500, 
            headers: corsHeaders 
        });
    } finally {
        if (client) await client.end();
    }
};

export const onRequestPut: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const origin = request.headers.get('Origin');
    const corsHeaders = {
        'Access-Control-Allow-Origin': origin || 'https://provisionlands.co.ke',
        'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        ...SECURITY_HEADERS,
    };

    const secret = request.headers.get('x-internal-secret');
    if (!secret || secret.trim() !== env.N8N_APP_SECRET?.trim()) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    let client;
    try {
        const body = await request.json() as any;
        client = await getDbClient(env);

        // ── Reschedule path ─────────────────────────────────────────────────
        // When the outcome modal sends reschedule_new_date, we:
        //   1. Mark the existing visit as 'rescheduled' (with optional outcome_notes)
        //   2. Insert a new 'scheduled' visit row with the new date (same customer/property)
        // Both run in the same DB transaction.
        if (body.reschedule_new_date) {
            const { reschedule_new_date, outcome_notes } = body;

            // Fetch original visit so we can copy customer/property info
            const orig = await client.query(
                'SELECT * FROM site_visits WHERE id = $1',
                [id]
            );
            if (orig.rows.length === 0) {
                return new Response(JSON.stringify({ error: 'Visit not found' }), {
                    status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
            const v = orig.rows[0];

            await client.query('BEGIN');

            // Step 1: Mark original as rescheduled
            await client.query(
                `UPDATE site_visits
                 SET status = 'rescheduled', outcome_notes = $1
                 WHERE id = $2`,
                [outcome_notes || null, id]
            );

            // Step 2: Create new upcoming visit
            const newVisit = await client.query(
                `INSERT INTO site_visits
                    (customer_name, sender_id, property_name, visit_date, visit_day,
                     notes, status, created_at)
                 VALUES ($1, $2, $3, $4::timestamptz, $5, $6, 'scheduled', NOW())
                 RETURNING *`,
                [
                    v.customer_name,
                    v.sender_id,
                    v.property_name,
                    reschedule_new_date,
                    reschedule_new_date.split('T')[0],
                    v.notes || null,
                ]
            );

            await client.query('COMMIT');

            return new Response(JSON.stringify({
                updated: { ...v, status: 'rescheduled', outcome_notes: outcome_notes || null },
                created: newVisit.rows[0],
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // ── Standard dynamic update path ────────────────────────────────────
        // Handles status=attended/no_show/cancelled/completed + outcome_notes
        // (same dynamic query as before — no changes to existing behaviour)
        let query = 'UPDATE site_visits SET ';
        const params: any[] = [];
        let i = 1;

        // Strip any unknown/internal fields before building query
        const ALLOWED_COLUMNS = new Set([
            'status', 'outcome_notes', 'notes', 'visit_date', 'visit_day',
            'reminder_24hr_sent', 'reminder_morning_sent', 'customer_name',
            'sender_id', 'property_name',
        ]);

        for (const [key, value] of Object.entries(body)) {
            if (!ALLOWED_COLUMNS.has(key)) continue; // skip unknown keys
            query += `${key} = $${i}, `;
            params.push(value);
            i++;
        }

        if (params.length === 0) {
            return new Response(JSON.stringify({ error: 'No valid fields to update' }), {
                status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        query = query.slice(0, -2) + ` WHERE id = $${i} RETURNING *`;
        params.push(id);

        const result = await client.query(query, params);
        return new Response(JSON.stringify(result.rows[0]), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        if (client) {
            try { await client.query('ROLLBACK'); } catch { /* ignore */ }
        }
        console.error('Site visits PUT error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: corsHeaders
        });
    } finally {
        if (client) await client.end();
    }
};


export const onRequestDelete: PagesFunction<Env> = async (context) => {
    const { request, env } = context;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const origin = request.headers.get('Origin');
    const corsHeaders = {
        'Access-Control-Allow-Origin': origin || 'https://provisionlands.co.ke',
        'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        ...SECURITY_HEADERS,
    };

    const secret = request.headers.get('x-internal-secret');
    if (!secret || secret.trim() !== env.N8N_APP_SECRET?.trim()) {
        return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });
    }

    if (!id) {
        return new Response(JSON.stringify({ error: 'Missing id parameter' }), { status: 400, headers: corsHeaders });
    }

    let client;
    try {
        client = await getDbClient(env);
        const result = await client.query('DELETE FROM site_visits WHERE id = $1 RETURNING id', [id]);
        if (result.rows.length === 0) {
            return new Response(JSON.stringify({ error: 'Visit not found' }), { status: 404, headers: corsHeaders });
        }
        return new Response(JSON.stringify({ deleted: true, id: result.rows[0].id }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    } catch (err: any) {
        console.error('Site visits DELETE error:', err);
        return new Response(JSON.stringify({ error: err.message }), {
            status: 500,
            headers: corsHeaders
        });
    } finally {
        if (client) await client.end();
    }
};

export const onRequestOptions: PagesFunction = async () => {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-internal-secret',
        },
    });
};
