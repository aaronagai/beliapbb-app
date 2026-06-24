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
GitHub Pages deploys from `main` automatically via `.github/workflows/deploy-pages.yml`.

| Situation | What to do |
|-----------|------------|
| On `main` with changes | `git commit` → `git push origin main` |
| On a feature branch | commit → push branch → merge to `main` same session (`gh pr merge --squash --delete-branch`) |
| After push | `git log -1 origin/main`; watch the Pages deploy via `gh run watch` |

Always run `npm run build` (which runs `tsc --noEmit` + `vite build`) before shipping to catch type/build errors — the Pages workflow will fail the same way if the build is broken.

## Deploy configuration

- Platform: GitHub Pages (GitHub Actions)
- Live site: https://aaronagai.github.io/beliapbb-app/
- Repo: https://github.com/aaronagai/beliapbb-app
- Deploy workflow: auto-deploy on push to `main` (`.github/workflows/deploy-pages.yml`)
- Build: `npm run build` with `BASE_PATH=/beliapbb-app/`
- Backend env: `VITE_CONSTITUTION_CHAT_API` (GitHub repo Variable) — URL of the deployed constitution RAG API, no trailing slash
- Post-deploy check: `curl -sfL https://aaronagai.github.io/beliapbb-app/` returns 200

## Local development

```bash
npm install
npm run dev          # Vite frontend only
npm run dev:api      # Express + OpenAI backend (server/server.mjs)
npm run dev:full     # both, concurrently
```
