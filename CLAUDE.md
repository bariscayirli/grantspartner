# Grants Partner — Project Context & Agent Handoff Protocol

## Project overview

**Grants Partner** is a coming-soon landing page for an EU grant management and
consultancy firm serving NGOs, public bodies, and organisations across Europe.

The page collects interest registrations (name, organisation, email + consent)
and stores them in a Cloudflare D1 database. The site will eventually expand
into a full product; for now the focus is the landing page and subscriber
capture.

Live URL (Cloudflare Pages): https://grantspartner.com  
GitHub repo: https://github.com/bariscayirli/grantspartner  
Owner / primary contact: mail.bariscayirli@gmail.com

---

## Tech stack

| Layer | Technology |
|---|---|
| Hosting | Cloudflare Pages |
| Serverless functions | Cloudflare Pages Functions (`functions/`) |
| Database | Cloudflare D1 (`grantspartner-db`, id: `f5953efe-e92b-4e47-a2c6-2460088c8656`) |
| Frontend | Vanilla HTML / CSS / JS — no build step |
| Deployment | `npx wrangler pages deploy .` |

---

## File structure

```
/
├── index.html                  # Landing page (coming-soon + interest form)
├── privacy.html                # Privacy policy
├── CLAUDE.md                   # This file — project context & agent handoff
├── wrangler.toml               # Cloudflare Pages + D1 config
├── schema.sql                  # Initial D1 schema
├── schema-v2.sql               # Updated D1 schema (subscribers table)
├── grantspartner-hero-landing.mp4  # Hero video (autoplay, muted, loop)
├── .gitignore
│
├── functions/
│   └── api/
│       ├── subscribe.js        # POST /api/subscribe — interest registration
│       └── admin/              # Admin API endpoints (protected)
│
└── admin/                      # Admin dashboard (HTML/CSS/JS)
    ├── index.html
    ├── dashboard.html
    ├── subscribers.html
    ├── posts.html
    ├── admin.css
    └── admin.js
```

---

## Landing page layout (index.html)

The page is a single-screen no-scroll layout:

```
┌─────────────────────────────────────────────────────────┐
│ Grants Partner (transparent header over video) Coming soon│
├─────────────────────────────────────────────────────────┤
│                                                         │
│   [Full-width hero video — blue ribbon animation]       │
│   [Gradient fade at bottom into page background]        │
│                                                         │
├──────────────────────────┬──────────────────────────────┤
│ EU grants, handled       │  [Full name          ]       │
│ properly.                │  [Organisation (opt) ]       │
│                          │  [Email address      ]       │
│ We support NGOs, public  │  [ ] Consent checkbox        │
│ bodies…                  │  [Register interest  ]       │
│                          │  data note                   │
├─────────────────────────────────────────────────────────┤
│ © 2025 Grants Partner    Privacy Policy  hello@...      │
└─────────────────────────────────────────────────────────┘
```

Key CSS decisions:
- `html, body { height: 100%; overflow: hidden }` — no scroll
- Header is `position: absolute` with transparent background, overlays video
- `.video-banner::after` has a gradient (transparent → `#FBFBFD`) to blend video into content
- Content row uses `padding: 36px 8%` with `flex: 1` left col and `flex: 0 0 360px` right col

---

## API: POST /api/subscribe

**Request body** (JSON):
```json
{ "name": "string", "organisation": "string|optional", "email": "string" }
```

**Responses**:
- `200` — registered successfully
- `409` — email already registered
- `400` — validation error
- `500` — server error

CORS is locked to `https://grantspartner.com`.

---

## Database (Cloudflare D1)

Binding: `DB`  
Database: `grantspartner-db`

Run migrations against production:
```bash
npx wrangler d1 execute grantspartner-db --remote --file=schema-v2.sql
```

---

## Development

```bash
# Local dev server (pure static — no wrangler needed for HTML iteration)
python3 -m http.server 8080

# Full local dev with D1 and functions
npx wrangler pages dev . --d1=DB

# Deploy to production
npx wrangler pages deploy .
```

---

## Deployment

Deployed via **Cloudflare Pages** directly from the repo root.

```bash
npx wrangler pages deploy .
```

The `wrangler.toml` sets `pages_build_output_dir = "."` so all static files
in the root are served, with `functions/` automatically handled as Pages
Functions.

---

## Agent handoff protocol (Claude ↔ Codex)

This file is the single source of truth for any AI agent working on this repo.

### When picking up a task

1. Read `CLAUDE.md` first — understand structure and constraints before touching code.
2. Check `git log --oneline -20` for recent changes and their intent.
3. For UI work: run `python3 -m http.server 8080` and verify visually before committing.
4. For function/API work: run `npx wrangler pages dev . --d1=DB` to test locally with D1.

### Commit conventions

```
type: short description

Types: feat | fix | style | refactor | chore | docs
Examples:
  feat: add video hero banner with gradient transition
  fix: align form and headline to same top edge
  style: tighten form spacing for no-scroll layout
```

### What NOT to change without owner sign-off

- CORS origin in `functions/api/subscribe.js` (must stay `https://grantspartner.com`)
- D1 database ID in `wrangler.toml`
- `privacy.html` content (legal document)
- Any schema changes (require explicit migration)

### Handoff checklist (before handing back to human or other agent)

- [ ] `git status` is clean (or staged changes are intentional)
- [ ] Visual check at `localhost:8080` passes (no broken layout, no scroll)
- [ ] No console errors
- [ ] `CLAUDE.md` updated if structure or decisions changed
- [ ] Commit message explains the *why*, not just the what

---

## Key design decisions (rationale for future agents)

| Decision | Why |
|---|---|
| No build step | Keeps iteration fast; no bundler complexity for a landing page |
| Vanilla JS | No framework overhead for a single form with fetch |
| `overflow: hidden` on body | Single-screen design — no scroll is intentional |
| Gradient on video banner | Soft visual transition from hero to content; avoids hard cut |
| Transparent header | Video extends to top edge of viewport for full visual impact |
| Cloudflare D1 | Already on Cloudflare Pages; zero-latency at edge |
