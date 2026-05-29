# Frontend - GNIOT X AWS Builders Hub

Next.js App Router frontend with dark modern UI, auth pages, events board, projects registry, and core team dashboard.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Deploy to Vercel

1. Import the GitHub repository into Vercel.
2. Set the **Root Directory** to `frontend`.
3. Keep the default build settings, or use:
	- **Build Command:** `npm run build`
	- **Install Command:** `npm install`
4. Add the environment variable:
	- `BACKEND_API_URL=https://<your-backend-domain>`
5. Deploy.

If your backend is still local, point `BACKEND_API_URL` to your App Runner, Render, Railway, or local tunnel URL.

The frontend proxies `/api/v1/*` through `frontend/src/app/api/v1/[...path]/route.ts`, so the browser always talks to the same origin.

## Key Pages

- `/` landing page with hero and event countdown
- `/login`, `/register` auth pages with Zod + react-hook-form validation
- `/events` RSVP-enabled event board
- `/projects` approved project registry + submission form
- `/dashboard` role-aware user dashboard
- `/dashboard/admin` admin approval and CSV export tools
