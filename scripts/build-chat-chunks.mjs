/**
 * Split the chat sources into passages for the Cloudflare chat functions (functions/api/*-chat.ts):
 *   public/perlembagaan.pdf            → functions/_data/constitution.json
 *   server/data/ftes-sources/*.txt|pdf → functions/_data/ftes.json
 * No API key needed: the functions embed the passages with Workers AI on first use and cache them.
 * Re-run after changing a source document, then commit the JSON.
 * Usage: npm run chat:chunks
 */
import { createHash } from "crypto";
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "functions", "_data");
const FTES_DIR = path.join(ROOT, "server", "data", "ftes-sources");

function chunkText(text, maxChars = 1200, overlap = 240) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const chunks = [];
  for (let i = 0; i < normalized.length; i += maxChars - overlap) {
    const slice = normalized.slice(i, i + maxChars).trim();
    if (slice.length >= 48) chunks.push(slice);
  }
  return chunks;
}

async function readText(file) {
  if (file.toLowerCase().endsWith(".pdf")) return (await pdfParse(fs.readFileSync(file))).text || "";
  return fs.readFileSync(file, "utf8");
}

/** Short content hash: the functions re-embed when it changes. */
const versionOf = (chunks) =>
  createHash("sha256").update(chunks.map((c) => c.text).join("\n")).digest("hex").slice(0, 12);

function write(name, data) {
  fs.writeFileSync(path.join(OUT_DIR, name), JSON.stringify(data) + "\n", "utf8");
  console.log(`${name}: ${data.chunks.length} passages (version ${data.version})`);
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const constitution = chunkText(await readText(path.join(ROOT, "public", "perlembagaan.pdf"))).map(
    (text, id) => ({ id, text }),
  );
  write("constitution.json", { version: versionOf(constitution), chunks: constitution });

  const sources = JSON.parse(fs.readFileSync(path.join(FTES_DIR, "sources.json"), "utf8"));
  const ftes = [];
  for (const src of sources) {
    for (const text of chunkText(await readText(path.join(FTES_DIR, src.file)))) {
      ftes.push({ id: ftes.length, sourceId: src.id, text });
    }
  }
  write("ftes.json", {
    version: versionOf(ftes),
    sources: sources.map(({ id, title, url }) => ({ id, title, url: url ?? null })),
    chunks: ftes,
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
