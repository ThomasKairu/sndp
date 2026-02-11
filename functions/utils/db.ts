import { Client } from 'pg';

export interface DbEnv {
    PGHOST: string;
    PGPORT: string;
    PGDATABASE: string;
    PGUSER: string;
    PGPASSWORD?: string;
}

export const getDbClient = async (env: DbEnv) => {
    if (!env.PGHOST || !env.PGPORT || !env.PGDATABASE || !env.PGUSER) {
        throw new Error("Database configuration missing. Please check Cloudflare environment variables.");
    }

    const client = new Client({
        host: env.PGHOST,
        port: Number(env.PGPORT),
        database: env.PGDATABASE,
        user: env.PGUSER,
        password: env.PGPASSWORD,
        ssl: { rejectUnauthorized: false } // Required for some cloud function environments
    });

    await client.connect();
    return client;
};
