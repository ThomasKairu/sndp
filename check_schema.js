
import pg from 'pg';
const { Client } = pg;

async function checkSchema() {
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
        const res = await client.query(`
            SELECT column_name, data_type, is_nullable, column_default
            FROM information_schema.columns 
            WHERE table_name = 'site_visits';
        `);
        console.log(JSON.stringify(res.rows, null, 2));
    } catch (err) {
        console.error(err);
    } finally {
        await client.end();
    }
}

checkSchema();
