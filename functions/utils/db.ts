import { Client } from 'pg';

export interface DbEnv {
    PGHOST: string;
    PGPORT: string;
    PGDATABASE: string;
    PGUSER: string;
    PGPASSWORD: string; // Required — must be set as a Cloudflare Secret
}

export const getDbClient = async (env: DbEnv) => {
    // Validate all required fields including PGPASSWORD
    const missing = (['PGHOST', 'PGPORT', 'PGDATABASE', 'PGUSER', 'PGPASSWORD'] as const)
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
        password: env.PGPASSWORD,
        ssl: { rejectUnauthorized: false }, // Required for Cloudflare Workers environment
        connectionTimeoutMillis: 8000,      // Fail fast if DB is unreachable (8 seconds)
        query_timeout: 15000,               // Per-query timeout (15 seconds)
    });

    await client.connect();
    return client;
};
