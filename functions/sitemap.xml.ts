import { getDbClient, DbEnv } from './utils/db';

interface Env extends DbEnv {}

export const onRequest: PagesFunction<Env> = async (context) => {
    const { env } = context;

    let client;
    try {
        client = await getDbClient(env);

        // Fetch properties
        // Need to be careful with column names, properties might not have updated_at according to properties.ts, but standard.
        // Actually, properties.ts updates `updated_at`. If created_at is missing, we fallback.
        const propertiesResult = await client.query('SELECT id, created_at, updated_at FROM properties');
        
        // Fetch blog posts
        const blogPostsResult = await client.query('SELECT id, created_at, updated_at FROM blog_posts');
        
        await client.end();

        const properties = propertiesResult.rows;
        const blogPosts = blogPostsResult.rows;

        const baseUrl = 'https://provisionlands.co.ke';
        const staticPages = [
            { url: '/', priority: '1.0', changefreq: 'weekly' },
            { url: '/properties', priority: '0.95', changefreq: 'daily' },
            { url: '/services', priority: '0.85', changefreq: 'monthly' },
            { url: '/about', priority: '0.80', changefreq: 'monthly' },
            { url: '/news', priority: '0.75', changefreq: 'weekly' },
            { url: '/portfolio', priority: '0.70', changefreq: 'monthly' },
            { url: '/contact', priority: '0.65', changefreq: 'yearly' },
            { url: '/privacy', priority: '0.30', changefreq: 'yearly' },
            { url: '/terms', priority: '0.30', changefreq: 'yearly' },
            { url: '/llms.txt', priority: '0.50', changefreq: 'weekly' }
        ];

        let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

        const getSafeDate = (d1: any, d2: any) => {
            const date = new Date(d1 || d2 || Date.now());
            if (isNaN(date.getTime())) return new Date().toISOString().split('T')[0];
            return date.toISOString().split('T')[0];
        };

        // Add static pages
        for (const page of staticPages) {
            sitemap += `
  <url>
    <loc>\${baseUrl}\${page.url}</loc>
    <lastmod>\${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>\${page.changefreq}</changefreq>
    <priority>\${page.priority}</priority>
  </url>`;
        }

        // Add property pages
        for (const property of properties) {
            const lastMod = getSafeDate(property.updated_at, property.created_at);
            sitemap += `
  <url>
    <loc>\${baseUrl}/properties/\${property.id}</loc>
    <lastmod>\${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>`;
        }

        // Add blog post pages
        for (const post of blogPosts) {
            const lastMod = getSafeDate(post.updated_at, post.created_at);
            sitemap += `
  <url>
    <loc>\${baseUrl}/news/\${post.id}</loc>
    <lastmod>\${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>`;
        }

        sitemap += `\n</urlset>`;

        return new Response(sitemap, {
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=3600'
            }
        });
    } catch (err) {
        console.error(err);
        if (client) await client.end();
        return new Response('Error generating sitemap: ' + (err as Error).message, { status: 500 });
    }
};
