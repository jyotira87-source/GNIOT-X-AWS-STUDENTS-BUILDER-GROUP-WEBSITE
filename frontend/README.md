# Frontend - GNIOT X AWS Builders Hub

Next.js App Router frontend with dark modern UI, auth pages, events board, projects registry, and core team dashboard.

## Run

```bash
npm install
cp .env.example .env.local
npm run dev
```

## Key Pages

- `/` landing page with hero and event countdown
- `/login`, `/register` auth pages with Zod + react-hook-form validation
- `/events` RSVP-enabled event board
- `/projects` approved project registry + submission form
- `/dashboard` role-aware user dashboard
- `/dashboard/admin` admin approval and CSV export tools
