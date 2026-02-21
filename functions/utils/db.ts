import { Client } from 'pg';

export interface DbEnv {
    PGHOST: string;
    PGPORT: string;
    PGDATABASE: string;
    PGUSER: string;
    DB_PASSWORD: string; // Required — must be set as a Cloudflare Secret or in wrangler.toml
}

export const getDbClient = async (env: DbEnv) => {
    // Validate all required fields including PGPASSWORD
    const missing = (['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'DB_PASSWORD'] as const)
        .filter(key => !env[key]);

    if (missing.length > 0) {
        throw new Error(
            `Database configuration incomplete. Missing Cloudflare secrets/vars: ${missing.join(', ')}. ` +
            `Please set these in Cloudflare Dashboard → Workers & Pages → sndp → Settings → Variables and Secrets.`
        );
    }

    const client = new Client({
        host: env.PGHOST,
        port: Number(env.PGPORT),
        database: env.PGDATABASE,
        user: env.PGUSER,
        password: env.DB_PASSWORD,
        ssl: { rejectUnauthorized: false }, // Encrypts traffic; self-signed cert accepted (Hetzner/Coolify setup)
        connectionTimeoutMillis: 8000,      // Fail fast if DB is unreachable (8 seconds)
        query_timeout: 15000,               // Per-query timeout (15 seconds)
    });

    await client.connect();
    return client;
};

/**
 * Standard security headers to attach to ALL API responses.
 * Add these to every Response to harden against clickjacking,
 * MIME-sniffing, and information disclosure.
 */
export const SECURITY_HEADERS: Record<string, string> = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
};
