
import pg from 'pg';
const { Client } = pg;

async function updateSchema() {
    const client = new Client({
        host: '46.224.223.247',
        port: 5432,
        database: 'provision_leads',
        user: 'provision_user',
        password: 'V2wiSP846gYoTr',
        ssl: false
    });

    try {
        await client.connect();
        
        console.log("Adding 'notes' column if it doesn't exist...");
        await client.query(`
            ALTER TABLE site_visits 
            ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT NULL;
        `);

        console.log("Setting defaults for optional columns...");
        await client.query(`
            ALTER TABLE site_visits 
            ALTER COLUMN notes SET DEFAULT NULL,
            ALTER COLUMN reminder_24hr_sent SET DEFAULT false,
            ALTER COLUMN reminder_morning_sent SET DEFAULT false,
            ALTER COLUMN status SET DEFAULT 'scheduled';
        `);

        console.log("Schema update completed.");
    } catch (err) {
        console.error("Schema update error:", err);
    } finally {
        await client.end();
    }
}

updateSchema();
