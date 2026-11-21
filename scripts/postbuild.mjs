// Shapes a build's output for where it is hosted. Usage: node scripts/postbuild.mjs [combined|site|app] [outDir]
//   combined → GitHub Pages / local: /kepimpinan/ and the join + assistant pages get their own copy of the SPA shell, 404 boots it too
//   site     → Cloudflare Pages (beliapbb.com): the same shells, old /app/* links redirect home, no PWA
//   app      → Cloudflare Pages (app.beliapbb.com): retired, every address redirects (301) to beliapbb.com
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const target = process.argv[2] ?? "combined";
const out = process.argv[3] ?? "dist";
const SITE = (process.env.VITE_SITE_URL || "https://beliapbb.com/").replace(/\/?$/, "/");
const PAGES = ["kepimpinan", "sertai", "tanya", "ftes", "perlembagaan"];

const file = (p) => join(out, p);
const shell = () => readFileSync(file("index.html"), "utf8");
const copyShell = (dir) => {
  mkdirSync(file(dir), { recursive: true });
  copyFileSync(file("index.html"), file(`${dir}/index.html`));
};
const remove = (p) => existsSync(file(p)) && rmSync(file(p), { recursive: true });

if (target === "combined") {
  PAGES.forEach(copyShell);
  copyFileSync(file("index.html"), file("404.html"));
} else if (target === "site") {
  writeFileSync(file("index.html"), shell().replace(/\s*<link rel="manifest"[^>]*>/, ""));
  remove("manifest.webmanifest");
  remove("CNAME");
  PAGES.forEach(copyShell);
  copyFileSync(file("index.html"), file("404.html"));
  // Old /app/ links (the #tab part survives redirects; the page maps it to the new address)
  writeFileSync(file("_redirects"), "/app / 301\n/app/* /:splat 301\n");
} else if (target === "app") {
  // Retired: nothing to serve, just send everyone (and their #hash) to the public site.
  writeFileSync(file("_redirects"), `/* ${SITE}:splat 301\n`);
  remove("manifest.webmanifest");
  remove("CNAME");
  remove("landing");
  remove("kepimpinan");
  remove("sw.js");
} else {
  throw new Error(`Unknown target "${target}"`);
}
console.log(`postbuild: ${target} → ${out}`);
