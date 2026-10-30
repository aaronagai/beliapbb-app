# Belia PBB — agent notes

Mobile-first PWA for Parti Pesaka Bumiputera Bersatu Sarawak (PBB) members.
Stack: React 19 + Vite + TypeScript (PWA) with an Express + OpenAI backend
(`server/`) powering the constitution RAG chat.

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

Key routing rules:

- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- **Ship live to GitHub** → follow **Ship policy** below (must land on `origin/main`)
- Extra production checks after ship → invoke /canary
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Performance baselines / regressions → invoke /benchmark
- Code quality scorecard → invoke /health
- Shipping retro → invoke /retro

## Ship policy

**`/ship` = ship live to the GitHub repo.** Finish with changes on **`origin/main`**.
Cloudflare Pages builds and deploys both sites from `main` automatically (see Deploy configuration).

| Situation | What to do |
|-----------|------------|
| On `main` with changes | `git commit` → `git push origin main` |
| On a feature branch | commit → push branch → merge to `main` same session (`gh pr merge --squash --delete-branch`) |
| After push | `git log -1 origin/main`; check the deploys in Cloudflare (Workers & Pages → beliapbb-site / beliapbb-app → Deployments), then run the post-deploy check |

Always run `npm run build:site` and `npm run build:app` (each runs `tsc --noEmit` + `vite build`) before shipping to catch type/build errors — Cloudflare's builds will fail the same way if the build is broken.

## Deploy configuration

- Platform: Cloudflare Pages, two projects built from this repo on every push to `main`:
  - `beliapbb-site` → https://beliapbb.com/ (+ www): `npm run build:site` → `dist-site` (landing, /kepimpinan; `/app/*` redirects to the app)
  - `beliapbb-app` → https://app.beliapbb.com/: `npm run build:app` → `dist-app` (the app at the root)
  - Both use env `NODE_VERSION=22`; `scripts/postbuild.mjs` shapes each output (redirects, manifest, canonical URLs)
- DNS: Cloudflare (nameservers moved from Namecheap; the domain is still registered at Namecheap). Email to hello@beliapbb.com uses Cloudflare Email Routing.
- Repo: https://github.com/aaronagai/beliapbb-app
- `npm run build` (no target) is the combined build used by `npm run dev`: site at `/`, app at `/app/`
- AI chats (Tanya FTES, Perlembagaan AI): Cloudflare Pages Functions in `functions/api/*-chat.ts` on beliapbb-app, using the Workers AI binding `AI` (Settings → Bindings). Answers: SEA-LION v4 27B (Gemma 4 fallback); search: bge-m3 embeddings, computed on first use and cached. Passages live in `functions/_data/*.json`: after changing `public/perlembagaan.pdf` or `server/data/ftes-sources/`, run `npm run chat:chunks` and commit. Free allowance is 10,000 neurons/day (roughly 100 questions).
- `VITE_CONSTITUTION_CHAT_API` (optional) points the chats at another host instead of the app's own `/api/`
- Membership applications: Apps Script web app → private sheet "Permohonan Ahli Belia PBB (SULIT)" (`scripts/apps-script/permohonan.gs`)
- Post-deploy check: `curl -sf https://beliapbb.com/ https://app.beliapbb.com/` returns 200; `https://beliapbb.com/app/` returns 301 to the app

## Local development

```bash
npm install
npm run dev          # Vite frontend only
npm run dev:api      # Express + OpenAI backend (server/server.mjs)
npm run dev:full     # both, concurrently
```
