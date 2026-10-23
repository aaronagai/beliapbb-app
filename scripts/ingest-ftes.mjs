/**
 * Build server/data/ftes-rag.json from the official FTES documents listed in
 * server/data/ftes-sources/sources.json:
 *   [{ "id": "guidelines-2026", "file": "guidelines-2026.pdf", "title": "FTES Guidelines 2026", "url": "https://…" }]
 * Files (.pdf, .txt or .md) live next to sources.json.
 * Usage: OPENAI_API_KEY=sk-... npm run ingest:ftes
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const SOURCES_DIR = path.join(ROOT, "server", "data", "ftes-sources");
const MANIFEST_PATH = path.join(SOURCES_DIR, "sources.json");
const OUT_PATH = path.join(ROOT, "server", "data", "ftes-rag.json");

function chunkText(text, maxChars = 1400, overlap = 280) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const chunks = [];
  let i = 0;
  while (i < normalized.length) {
    const slice = normalized.slice(i, i + maxChars).trim();
    if (slice.length >= 48) chunks.push(slice);
    i += maxChars - overlap;
  }
  return chunks;
}

async function readSource(file) {
  const full = path.join(SOURCES_DIR, file);
  if (file.toLowerCase().endsWith(".pdf")) {
    const parsed = await pdfParse(fs.readFileSync(full));
    return parsed.text || "";
  }
  return fs.readFileSync(full, "utf8");
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY");
    process.exit(1);
  }
  const sources = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
  if (!Array.isArray(sources) || sources.length === 0) {
    console.error("No sources listed in", MANIFEST_PATH);
    process.exit(1);
  }

  const chunks = [];
  for (const src of sources) {
    const texts = chunkText(await readSource(src.file));
    console.log(`${src.file}: ${texts.length} chunks`);
    for (const text of texts) chunks.push({ id: chunks.length, sourceId: src.id, text });
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const batchSize = 48;
  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const emb = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch.map((c) => c.text),
    });
    batch.forEach((c, j) => {
      c.embedding = emb.data[j].embedding;
    });
    console.log(`Embedded ${Math.min(i + batchSize, chunks.length)} / ${chunks.length}`);
  }

  fs.writeFileSync(
    OUT_PATH,
    JSON.stringify({
      model: "text-embedding-3-small",
      sources: sources.map(({ id, title, url }) => ({ id, title, url: url ?? null })),
      chunks,
    }),
    "utf8"
  );
  console.log("Wrote", OUT_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
