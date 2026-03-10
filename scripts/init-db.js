
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
    image: '/v2/Prime half Acre in Kiharu.webp',
    images: ['/v2/Prime half Acre in Kiharu.webp'],
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
    image: "/v2/1 Acre at Mang'u.webp",
    images: ["/v2/1 Acre at Mang'u.webp"],
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
    image: '/v2/Sagana Makutano Plots.webp',
    images: ['/v2/Sagana Makutano Plots.webp'],
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
    description: 'Affordable plots in Ithanga-Maragua, only 30 minutes from Thika. Ideal for home and farming. Ready title deeds.',
    image: "/v2/Ithanga Murang'a Plots.webp",
    images: ["/v2/Ithanga Murang'a Plots.webp"],
    features: ['30 mins from Thika', 'Ready Titles', 'Agribusiness Ready'],
    status: 'For Sale'
  },
  {
    id: 'p5',
    title: 'Kilimambogo / Oldonyo Sabuk',
    price: 600000,
    location: 'Kilimambogo',
    type: 'Land',
    size: '50x100 ft',
    description: 'Scenic plots near Oldonyo Sabuk national park area. Perfect for speculation or settlement.',
    image: '/v2/Kilimambogo Oldonyo Sabuk.webp',
    images: ['/v2/Kilimambogo Oldonyo Sabuk.webp'],
    features: ['Scenic View', 'Developing Area', 'Ready Titles'],
    status: 'For Sale'
  },
  {
    id: 'p6',
    title: 'Tola Ngoingwa',
    price: 2300000,
    location: 'Tola, Thika',
    type: 'Residential',
    size: '40x80 ft',
    description: 'Premium residential plots in Tola Ngoingwa estate. High-end neighborhood.',
    image: '/v2/Tola Ngoingwa.webp',
    images: ['/v2/Tola Ngoingwa.webp'],
    features: ['Gated Community', 'Electricity', 'Water', 'Security'],
    status: 'For Sale'
  },
  {
    id: 'p7',
    title: 'Muguga / Gatuanyaga',
    price: 1800000,
    location: 'Gatuanyaga, Thika',
    type: 'Land',
    size: '50x100 ft',
    description: 'Strategic plots in Gatuanyaga area near Thika. High appreciation potential.',
    image: '/v2/Muguga  Gatuanyaga.webp',
    images: ['/v2/Muguga  Gatuanyaga.webp'],
    features: ['Near Tarmac', 'Electricity', 'Ready for Settlement'],
    status: 'For Sale'
  },
  {
    id: 'p8',
    title: 'Makuyu Mananja Acre',
    price: 2500000,
    location: 'Makuyu Mananja',
    type: 'Land',
    size: '1 Acre',
    description: 'Large 1-acre block in Makuyu. Perfect for large scale farming or subdivision.',
    image: '/v2/Makuyu Mananja Acre.webp',
    images: ['/v2/Makuyu Mananja Acre.webp'],
    features: ['Red Soil', 'Access Roads', 'Water'],
    status: 'For Sale'
  },
  {
    id: 'p9',
    title: 'Matuu Plots',
    price: 280000,
    location: 'Matuu',
    type: 'Land',
    size: '50x100 ft',
    description: 'Very affordable investment plots in Matuu. Get started with land banking today.',
    image: '/v2/Matuu Plots.webp',
    images: ['/v2/Matuu Plots.webp'],
    features: ['Affordable', 'Growing Town', 'Ready Titles'],
    status: 'For Sale'
  },
  {
    id: 'p10',
    title: 'Landless Thika',
    price: 2500000,
    location: 'Landless, Thika',
    type: 'Residential',
    size: '85x100 ft',
    description: 'Prime residential plot in Landless Thika. Larger size (85x100).',
    image: '/v2/Landless Thika.webp',
    images: ['/v2/Landless Thika.webp'],
    features: ['Large Size', 'developed Area', 'Water & Power'],
    status: 'For Sale'
  },
  {
    id: 'p11',
    title: 'Thika Town Commercial',
    price: 7500000,
    location: 'Thika Town',
    type: 'Commercial',
    size: 'Plot',
    description: 'Prime commercial plot next to TIBS College. Ideal for hostels or commercial building.',
    image: '/v2/Thika Town Commercial.webp',
    images: ['/v2/Thika Town Commercial.webp'],
    features: ['CBD Location', 'Commercial Use', 'High Footfall'],
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
    image: '/v2/Mwingi Acre.webp',
    images: ['/v2/Mwingi Acre.webp'],
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
    content: `Ardhisasa is the National Land Information Management System (NLIMS). It is an online platform that allows citizens, lawyers, and other stakeholders to interact with land information held by the government. ...`,
    image: '/v2/our core value.webp'
  },
  {
    id: 'how-to-conduct-land-search-kenya',
    title: 'How to Conduct a Land Search in Kenya: 5 Easy Steps to Follow',
    date: 'Jan 24, 2026',
    category: 'Legal & Tech',
    excerpt: 'Conducting a land search is the most critical step in buying property. Learn how to navigate Ardhisasa, conduct manual searches, and spot red flags before you pay.',
    content: `Ardhisasa is an online platform that allows citizens and other stakeholders to interact with land information held by the government. ...`,
    image: '/v2/phase 1.webp'
  },
  {
    id: 'what-is-a-caveat-in-property',
    title: 'What is a Caveat in a Property',
    date: 'Jan 22, 2026',
    category: 'Education',
    excerpt: 'The word "Caveat" can stop a real estate transaction dead in its tracks. Learn what it is, who places it, and how to remove it.',
    content: `The essence of having a Caveat on property is that it protects you from adverse claims by third parties...`,
    image: '/v2/James Mwangi.webp'
  },
  {
    id: 'can-foreigners-buy-property-kenya',
    title: 'Owning Land as a Foreigner in Kenya: Everything You Need to Know',
    date: 'Jan 20, 2026',
    category: 'Guides',
    excerpt: 'Are you an expat or diaspora investor looking to buy land? Discover the legal rights, restrictions, and freehold vs leasehold rules for foreigners.',
    content: `Kenya is a prime investment destination for foreigners. ...`,
    image: '/v2/Sales Team.webp'
  },
  {
    id: '10-legal-steps-buying-land-kenya',
    title: '10 Legal Steps of Buying Land in Kenya: A Step-by-Step Guide',
    date: 'Jan 15, 2026',
    category: 'Guides',
    excerpt: 'Do not risk your savings. Follow this detailed legal roadmap to safely purchase land, covering everything from the Offer Letter to the Land Control Board.',
    content: `Buying land in Kenya involves a strict legal process. ...`,
    image: '/v2/Sales Team.webp'
  },
  {
    id: 'surveying-mutation-kenya',
    title: 'Everything You Need to Know About Land Survey',
    date: 'Dec 28, 2025',
    category: 'Technical',
    excerpt: 'The surveyor is the most important technical person in your land journey. Understand fixed boundaries, mutations, and how to read a map.',
    content: `Land surveying is the art and science of establishing and re-establishing real property boundaries. ...`,
    image: '/v2/Tola Ngoingwa.webp'
  },
  {
    id: 'building-home-kenya-guide',
    title: 'A Step-by-Step Guide to Building Your Dream Home in Kenya',
    date: 'Dec 15, 2025',
    category: 'Construction',
    excerpt: 'Your comprehensive roadmap to navigating the journey of building a home. From Pre-construction paperwork to the final coat of paint.',
    content: `Building your own home in Kenya is a fulfilling legacy project. ...`,
    image: '/v2/Prime half Acre in Kiharu.webp'
  },
  {
    id: 'land-infrastructure-wealth',
    title: 'The Road to Wealth: How Infrastructure Transforms Land Value',
    date: 'Dec 05, 2025',
    category: 'Infrastructure',
    excerpt: 'The Kenol-Sagana-Marua dual carriageway has changed the game. Learn why buying land near infrastructure projects is the secret to wealth.',
    content: `In real estate investment, the adage is "Infrastructure, Infrastructure, Infrastructure". ...`,
    image: '/v2/Thika Town Commercial.webp'
  },
  {
    id: 'thika-machakos-growth',
    title: 'Why Thika and Machakos are the "New Nairobi" for Investors',
    date: 'Nov 20, 2025',
    category: 'Market Trends',
    excerpt: 'Nairobi is saturated. The smart money is moving to the Nairobi Metropolis. Discover why Thika and Matuu (Machakos) are the future.',
    content: `Nairobi is full. The congestion, pollution, and astronomical land prices ...`,
    image: '/v2/Tola Ngoingwa.webp'
  },
  {
    id: 'land-business-investment',
    title: '4 Reasons Why Land is a Profitable Business Investment',
    date: 'Nov 10, 2025',
    category: 'Investment',
    excerpt: 'Is land just dirt? No. It\'s a business asset. Here is how to use land to generate cash flow, not just capital gains.',
    content: `Many Kenyans view land emotionally...`,
    image: '/v2/Mwingi Acre.webp'
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
      `, [p.id, p.title, p.location, p.price, p.size, p.type, p.status, p.description, p.image, JSON.stringify(p.images), JSON.stringify(p.features)]);
    }

    // Step 2: Seed Blog Posts
    console.log('Seeding blog posts...');
    for (const b of BLOG_POSTS) {
      await client.query(`
        INSERT INTO blog_posts (id, title, excerpt, content, category, image, date)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO NOTHING
      `, [b.id, b.title, b.excerpt, b.content, b.category, b.image, b.date]);
    }

    console.log('Migration and seeding completed successfully!');
  } catch (err) {
    console.error('Migration failed:', err);
  } finally {
    await client.end();
  }
}

run();
