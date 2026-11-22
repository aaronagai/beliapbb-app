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
// Link previews (WhatsApp, Facebook …) read the shell's own meta tags, so /sertai/ gets its own title, text and image.
const META = {
  sertai: {
    title: "Sertai Belia PBB",
    description: "Isi borang keahlian PBB di telefon anda, tandatangan di skrin. Kira-kira 5 minit.",
    image: "og-sertai.png",
    alt: "Sertai Belia PBB: borang keahlian di beliapbb.com/sertai",
  },
};
const withMeta = (html, dir) => {
  const m = META[dir];
  if (!m) return html;
  const url = `${SITE}${dir}/`;
  return html
    .replace(/<title>[^<]*<\/title>/, `<title>${m.title}</title>`)
    .replace(/(name="description" content=")[^"]*/, `$1${m.description}`)
    .replace(/(property="og:title" content=")[^"]*/, `$1${m.title}`)
    .replace(/(property="og:description" content=")[^"]*/, `$1${m.description}`)
    .replace(/(property="og:url" content=")[^"]*/, `$1${url}`)
    .replace(/(property="og:image" content=")[^"]*/, `$1${SITE}${m.image}`)
    .replace(/(property="og:image:alt" content=")[^"]*/, `$1${m.alt}`)
    .replace(/(name="twitter:title" content=")[^"]*/, `$1${m.title}`)
    .replace(/(name="twitter:description" content=")[^"]*/, `$1${m.description}`)
    .replace(/(name="twitter:image" content=")[^"]*/, `$1${SITE}${m.image}`)
    .replace(/(name="twitter:image:alt" content=")[^"]*/, `$1${m.alt}`);
};
const copyShell = (dir) => {
  mkdirSync(file(dir), { recursive: true });
  writeFileSync(file(`${dir}/index.html`), withMeta(shell(), dir));
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
