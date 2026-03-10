
import pg from 'pg';
const { Client } = pg;
import dotenv from 'dotenv';
dotenv.config();

// Existing data from constants.ts
const PROPERTIES = [
  {
    id: 'p1',
    title: 'Prime ½ Acre in Kiharu',
    price: 1800000,
    location: 'Kigetuini Village, Murang’a',
    type: 'Land',
    size: '0.5 Acre',
    description: 'A prime and spacious parcel ideal for residential development, farming, or future investment. Located near the shopping center with beautiful neighborhood and easy access.',
    image: '/Prime half Acre in Kiharu.webp',
    images: ['/Prime half Acre in Kiharu.webp'],
    features: ['Near Shopping Center', 'Water Available', 'Electricity', 'Fertile Soil'],
    status: 'For Sale'
  },
  {
    id: 'p2',
    title: '1 Acre at Mang’u',
    price: 5000000,
    location: 'Mang’u, Thika',
    type: 'Land',
    size: '1 Acre',
    description: 'Ideal for building, farming, or residential development. Only 10 minutes drive from Thika town (50 bob fare). A rare lifetime opportunity in a developed area.',
    image: "/1 Acre at Mang'u.webp",
    images: ["/1 Acre at Mang'u.webp"],
    features: ['10 Mins from Thika', 'All Documents Available', 'Residential/Farming'],
    status: 'For Sale'
  },
  {
    id: 'p3',
    title: 'Sagana Makutano Plots',
    price: 650000,
    location: 'Sagana Makutano',
    type: 'Land',
    size: '50x100 ft',
    description: 'Genuine plots just 10 minutes from Makutano Junction. Near Kamweli Shopping Centre and schools. Beaconed with 9-meter wide access roads.',
    image: '/Sagana Makutano Plots.webp',
    images: ['/Sagana Makutano Plots.webp'],
    features: ['Ready Title Deeds', 'Water & Electricity', 'Fully Fenced', 'Gated'],
    status: 'For Sale'
  },
  {
    id: 'p4',
    title: 'Ithanga Murang’a Plots',
    price: 700000,
    location: 'Ithanga, Murang’a',
    type: 'Land',
    size: '50x100 ft',
    description: 'Premium plots in Ithanga. Ideal for retirement homes or agribusiness. Developed neighborhood with all amenities.',
    image: '/Ithanga Murang’a Plots.webp',
    images: ['/Ithanga Murang’a Plots.webp'],
    features: ['Agribusiness', 'Retirement', 'Quiet Area'],
    status: 'For Sale'
  },
  {
    id: 'p5',
    title: 'Kilimambogo / Oldonyo Sabuk',
    price: 550000,
    location: 'Oldonyo Sabuk',
    type: 'Land',
    size: '50x100 ft',
    description: 'Scenic plots at the foot of Kilimambogo. Great views and fresh air.',
    image: '/Kilimambogo.webp',
    images: ['/Kilimambogo.webp'],
    features: ['Mountain View', 'Clean Air', 'Fast Growth'],
    status: 'For Sale'
  },
  {
    id: 'p6',
    title: 'Tola Ngoingwa',
    price: 2800000,
    location: 'Ngoingwa, Thika',
    type: 'Land',
    size: '50x100 ft',
    description: 'Highly sought after residential plots in the leafy Ngoingwa suburb.',
    image: '/Tola Ngoingwa.webp',
    images: ['/Tola Ngoingwa.webp'],
    features: ['Leafy Suburb', 'High Security', 'Ready to Build'],
    status: 'For Sale'
  },
  {
    id: 'p7',
    title: 'Muguga / Gatuanyaga',
    price: 850000,
    location: 'Gatuanyaga',
    type: 'Land',
    size: '50x100 ft',
    description: 'Prime plots along the Thika-Garissa highway. High appreciation potential.',
    image: '/Muguga.webp',
    images: ['/Muguga.webp'],
    features: ['Near Highway', 'Fast Growing', 'Electricity'],
    status: 'For Sale'
  },
  {
    id: 'p8',
    title: 'Makuyu Mananja Acre',
    price: 1500000,
    location: 'Makuyu',
    type: 'Land',
    size: '1 Acre',
    description: 'Large acreage for farming or subdivision in Makuyu.',
    image: '/Makuyu.webp',
    images: ['/Makuyu.webp'],
    features: ['Farming', 'Subdivision', 'Rich Soil'],
    status: 'For Sale'
  },
  {
    id: 'p9',
    title: 'Matuu Plots',
    price: 350000,
    location: 'Matuu',
    type: 'Land',
    size: '50x100 ft',
    description: 'Affordable plots in the heart of Matuu town. Great for budget investors.',
    image: '/Matuu Plots.webp',
    images: ['/Matuu Plots.webp'],
    features: ['Affordable', 'Town Center', 'Investment'],
    status: 'For Sale'
  },
  {
    id: 'p10',
    title: 'Landless Thika',
    price: 1200000,
    location: 'Landless, Thika',
    type: 'Land',
    size: '50x100 ft',
    description: 'Prime residential plots in the popular Landless area of Thika.',
    image: '/Landless.webp',
    images: ['/Landless.webp'],
    features: ['Residential', 'Water', 'Perimeter Wall'],
    status: 'For Sale'
  },
  {
    id: 'p11',
    title: 'Thika Town Commercial',
    price: 15000000,
    location: 'Thika CBD',
    type: 'Commercial',
    size: '50x100 ft',
    description: 'High value commercial plot in Thika CBD. Ideal for high-rise buildings.',
    image: '/Thika Town.webp',
    images: ['/Thika Town.webp'],
    features: ['CBD Location', 'High Rise', 'Commercial'],
    status: 'For Sale'
  },
  {
    id: 'p12',
    title: 'Mwingi Acre',
    price: 200000,
    location: 'Mwingi',
    type: 'Land',
    size: '1 Acre',
    description: 'Incredibly affordable 1 acre land in Mwingi. Best for long term banking.',
    image: '/Mwingi Acre.webp',
    images: ['/Mwingi Acre.webp'],
    features: ['Low Cost', 'Large Size', 'Investment'],
    status: 'For Sale'
  }
];

const BLOG_POSTS = [
  {
    id: 'ardhisasa-registration-guide',
    title: 'Ardhisasa Registration: The Complete Step-by-Step Guide (2026)',
    date: 'Jan 25, 2026',
    category: 'Legal & Tech',
    excerpt: 'Struggling to register on Ardhisasa? Here is the definitive guide to creating an account, upgrading your details, and navigating the Ministry of Lands digital platform.',
    content: `Ardhisasa is the National Land Information Management System (NLIMS). It is an online platform that allows citizens, lawyers, and other stakeholders to interact with land information held by the government.`,
    image: '/ardhisasa-digital.webp'
  },
  {
    id: 'what-is-a-caveat-in-property',
    title: 'What is a Caveat in a Property',
    date: 'Jan 22, 2026',
    category: 'Education',
    excerpt: 'The word "Caveat" can stop a real estate transaction dead in its tracks. Learn what it is, who places it, and how to remove it.',
    content: `The essence of having a Caveat on property is that it protects you from adverse claims by third parties...`,
    image: '/ardhisasa-digital.webp'
  }
];

async function run() {
  const client = new Client({
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    database: process.env.PGDATABASE,
    user: process.env.PGUSER,
    password: process.env.DB_PASSWORD,
    ssl: false
  });

  try {
    await client.connect();
    console.log('Connected to database.');

    // Step 1: Drop and Create Tables
    console.log('Dropping existing tables to start fresh with requested schema...');
    await client.query(`DROP TABLE IF EXISTS blog_posts;`);
    await client.query(`DROP TABLE IF EXISTS properties;`);

    console.log('Creating tables according to requested schema...');
    await client.query(`
      CREATE TABLE properties (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        location VARCHAR(255) NOT NULL,
        price NUMERIC NOT NULL,
        size VARCHAR(100),
        type VARCHAR(50) DEFAULT 'Land',
        status VARCHAR(50) DEFAULT 'For Sale',
        description TEXT,
        image TEXT,
        images JSONB DEFAULT '[]',
        features JSONB DEFAULT '[]',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE blog_posts (
        id VARCHAR(100) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        excerpt TEXT,
        content TEXT,
        category VARCHAR(100) DEFAULT 'News',
        image TEXT,
        date VARCHAR(50),
        author VARCHAR(100) DEFAULT 'Provision Team',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Step 2: Seed Properties
    console.log('Seeding properties...');
    for (const p of PROPERTIES) {
      await client.query(`
        INSERT INTO properties (id, title, location, price, size, type, status, description, image, images, features)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (id) DO NOTHING
      `, [p.id, p.title, p.location, p.price, p.size, p.type, p.status, p.description, `/v2${p.image}`, JSON.stringify(p.images.map(img => img.startsWith('/') ? `/v2${img}` : img)), JSON.stringify(p.features)]);
    }

    // Step 2: Seed Blog Posts
    console.log('Seeding blog posts...');
    for (const b of BLOG_POSTS) {
      await client.query(`
        INSERT INTO blog_posts (id, title, excerpt, content, category, image, date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [b.id, b.title, b.excerpt, b.content, b.category, `/v2${b.image}`, b.date]);
    }

    console.log('Migration and seeding completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
