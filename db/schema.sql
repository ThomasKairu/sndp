-- Database Schema for Provision Land & Properties Ltd CRM
-- Based on docs/n8n-workflows-setup.md and CRM Enhancement Plan

-- Table: leads
CREATE TABLE IF NOT EXISTS leads (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    interest VARCHAR(100),
    message TEXT,
    source VARCHAR(50),
    priority VARCHAR(20) DEFAULT 'normal',
    status VARCHAR(50) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Unique constraints for upsert
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_email ON leads(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone) WHERE phone IS NOT NULL;

-- Table: newsletter_subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    subscribed_at TIMESTAMP DEFAULT NOW(),
    source VARCHAR(50),
    active BOOLEAN DEFAULT true
);

-- Table: properties
CREATE TABLE IF NOT EXISTS properties (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    price INTEGER NOT NULL,
    location VARCHAR(255),
    type VARCHAR(50) CHECK (type IN ('Land', 'Residential', 'Commercial')),
    size VARCHAR(50),
    description TEXT,
    image VARCHAR(255),
    images TEXT[], -- Array of image URLs
    features TEXT[],
    status VARCHAR(50) DEFAULT 'For Sale',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table: blog_posts
CREATE TABLE IF NOT EXISTS blog_posts (
    id VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT,
    date VARCHAR(50),
    category VARCHAR(100),
    image VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
