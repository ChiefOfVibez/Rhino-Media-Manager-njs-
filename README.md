# Rhino Media Manager — Next.js UI (shadcn-style)

Minimal, cohesive Next.js 14 (App Router) UI for the Bosch Products DB, styled with Tailwind and shadcn-inspired primitives.

## Stack
- Next.js 14 (app/), React 18, TypeScript
- Tailwind CSS (design tokens mapped to CSS vars)
- shadcn-style UI primitives (Button, Input, Label, Textarea, Dialog via Radix)
- lucide-react icons

## Dev
1. Ensure the FastAPI backend is running and reachable (e.g. http://127.0.0.1:8000)
2. In this folder:
   ```bash
   npm i
   # Option A: point directly to backend origin (recommended)
   set NEXT_PUBLIC_API_BASE=http://127.0.0.1:8000 && npm run dev
   # Option B (no env): run Next on a reverse proxy port and add a rewrite in next.config.mjs
   ```
3. Open http://localhost:3030

Notes:
- UI reads `/api/products` and preview endpoints from the FastAPI server.
- CORS is enabled in the backend, so cross-origin fetches work when `NEXT_PUBLIC_API_BASE` is set.

## Build
```bash
npm run build && npm start
```

## New repository (separate)
If you want this Next UI in a separate repo:
```bash
git init
git add .
git commit -m "chore: init nextjs ui"
git branch -M main
# Using GitHub CLI (one-liner)
# gh repo create <your-org>/<repo-name> --source=. --public --push
# Or manually:
# git remote add origin https://github.com/<your-org>/<repo-name>.git
# git push -u origin main
```

## Next steps
- Product edit modal parity (notes, tags, packaging variants, holders)
- Local vendor EasyMDE + Font Awesome if still required
- Skeletons/empty states and filters
