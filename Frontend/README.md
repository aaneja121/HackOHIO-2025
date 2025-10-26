# Healios - AI Post-Surgical Recovery Assistant

This repository contains the Healios Next.js application — an AI-assisted interface for monitoring post-surgical wound recovery.

Quick start (local):

```powershell
# install dependencies
npm install

# start the dev server
npm run dev
```

Notes:
- This repository has been cleaned of external Lovable and Supabase integrations so it can run locally without those services.
- The project includes a small local stub for the wound analysis function and a lightweight mock Supabase client used for minimal auth flows.

If you'd like to add real backend/auth or AI services later, provide the relevant environment variables and replace the local stubs with real integrations.

Technologies used:
- Next.js
- React
- TypeScript
- Tailwind CSS
- shadcn-ui

License: MIT
