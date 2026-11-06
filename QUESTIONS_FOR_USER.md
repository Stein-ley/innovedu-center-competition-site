# QUESTIONS FOR USER BEFORE PHASE 1

Before commencing Phase 1 deployment and infrastructure setup, please confirm the following details:

1. **GitHub Repository Name & Status**
   - What is the exact GitHub repository name (e.g., innovedu-center-competition-site) and owner account?
   https://github.com/Stein-ley/innovedu-center-competition-site.git
   owner: Stein-ley
   - Has the repository already been created on GitHub, or should it be initialized locally and pushed to a new repo?
   has been created, but empty and please push it here

2. **Cloudflare Worker Name & Account**
   - Confirm the Worker name for wrangler.jsonc (suggested: innovedu-center-competition-site).
   innovedu-center-competition-site
   actualy use pages.dev instead please.
   - Is Cloudflare Workers Builds configured in your Cloudflare dashboard for auto-deploying from GitHub commits?
   not yet

3. **Supabase Project Readiness**
   - Has the Supabase project been created?
   yes
   - *Note*: Do **NOT** share secret keys in chat. You will set them via wrangler secret put for: SUPABASE_URL, SUPABASE_KEY, ADMIN_USERNAME, ADMIN_PASSWORD, SESSION_SECRET.

4. **Supabase Storage Bucket Name**
   - Is the storage bucket named competition-audio or do you prefer a custom name?
   yest that will do for now
   
