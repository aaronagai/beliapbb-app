# Belia PBB

Mobile-first web shell for Parti Pesaka Bumiputera Bersatu Sarawak (PBB) members—news, Sayap Parti shortcuts, and bottom navigation. Installable as a progressive web app (`manifest.webmanifest`).

**Live:** [beliapbb.com](https://beliapbb.com/) (landing and leadership) and [app.beliapbb.com](https://app.beliapbb.com/) (the app), both on Cloudflare Pages.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build:site   # beliapbb.com → dist-site
npm run build:app    # app.beliapbb.com → dist-app
npm run build        # combined build (site at /, app at /app/) for local preview
```
