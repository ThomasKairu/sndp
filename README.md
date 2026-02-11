# Provision Land & Properties Ltd

The official website for Provision Land & Properties Ltd, built with React, Vite, and Cloudflare Pages.

## Tech Stack
- **Frontend:** React, TypeScript, TailwindCSS
- **Backend:** Cloudflare Pages Functions (Serverless), n8n (Workflows), PostgreSQL (Database)
- **CMS:** Custom Admin Dashboard
- **Chatbot:** "Steve" (AI Agent integrated with n8n)

## Setup
1. Clone repository
2. `npm install`
3. `npm run dev`

## Deployment
Deployed via Cloudflare Pages. Ensure environment variables are set in the Cloudflare dashboard:
- `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`
- `N8N_INTERNAL_SECRET`
- `VITE_TURNSTILE_SITE_KEY`
