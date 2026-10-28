// Shapes a build's output for where it is hosted. Usage: node scripts/postbuild.mjs [combined|site|app] [outDir]
//   combined → GitHub Pages: /app/ and /kepimpinan/ get their own copy of the SPA shell, 404 boots it too
//   site     → Cloudflare Pages (beliapbb.com): /kepimpinan/ shell, /app/* redirects to the app domain, no PWA
//   app      → Cloudflare Pages (app.beliapbb.com): the app at the root, its own manifest
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const target = process.argv[2] ?? "combined";
const out = process.argv[3] ?? "dist";
const SITE = (process.env.VITE_SITE_URL || "https://beliapbb.com/").replace(/\/?$/, "/");
const APP = (process.env.VITE_APP_URL || "https://app.beliapbb.com/").replace(/\/?$/, "/");

const file = (p) => join(out, p);
const shell = () => readFileSync(file("index.html"), "utf8");
const copyShell = (dir) => {
  mkdirSync(file(dir), { recursive: true });
  copyFileSync(file("index.html"), file(`${dir}/index.html`));
};
const remove = (p) => existsSync(file(p)) && rmSync(file(p), { recursive: true });

if (target === "combined") {
  copyShell("app");
  copyShell("kepimpinan");
  copyFileSync(file("index.html"), file("404.html"));
} else if (target === "site") {
  writeFileSync(file("index.html"), shell().replace(/\s*<link rel="manifest"[^>]*>/, ""));
  remove("manifest.webmanifest");
  remove("CNAME");
  copyShell("kepimpinan");
  copyFileSync(file("index.html"), file("404.html"));
  // Old /app/ links (incl. the #tab part, which browsers keep across redirects)
  writeFileSync(file("_redirects"), `/app ${APP} 301\n/app/* ${APP}:splat 301\n`);
} else if (target === "app") {
  const html = shell()
    .replaceAll(`href="${SITE}"`, `href="${APP}"`)
    .replaceAll(`content="${SITE}"`, `content="${APP}"`);
  writeFileSync(file("index.html"), html);
  const manifest = JSON.parse(readFileSync(file("manifest.webmanifest"), "utf8"));
  writeFileSync(file("manifest.webmanifest"), JSON.stringify({ ...manifest, start_url: "./", scope: "./" }, null, 2) + "\n");
  remove("CNAME");
  remove("landing");
  remove("kepimpinan");
  // No 404.html: Cloudflare Pages then serves index.html for every path (SPA mode)
} else {
  throw new Error(`Unknown target "${target}"`);
}
console.log(`postbuild: ${target} → ${out}`);
