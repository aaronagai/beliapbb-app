/**
 * Build server/data/constitution-rag.json from public/perlembagaan.pdf
 * Usage: OPENAI_API_KEY=sk-... npm run ingest:constitution
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
const PDF_PATH = path.join(ROOT, "public", "perlembagaan.pdf");
const OUT_PATH = path.join(ROOT, "server", "data", "constitution-rag.json");

function chunkText(text, maxChars = 1400, overlap = 280) {
  const normalized = text.replace(/\s+/g, " ").trim();
  const chunks = [];
  let i = 0;
  while (i < normalized.length) {
    const slice = normalized.slice(i, i + maxChars).trim();
    if (slice.length >= 48) chunks.push(slice);
    i += maxChars - overlap;
  }
  return chunks.map((text, id) => ({ id, text }));
}

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error("Missing OPENAI_API_KEY");
    process.exit(1);
  }
  if (!fs.existsSync(PDF_PATH)) {
    console.error("PDF not found:", PDF_PATH);
    process.exit(1);
  }

  const buf = fs.readFileSync(PDF_PATH);
  const parsed = await pdfParse(buf);
  const chunks = chunkText(parsed.text || "");
  console.log(`Extracted ${chunks.length} chunks from PDF`);

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const outChunks = [];
  const batchSize = 48;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const emb = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: batch.map((c) => c.text),
    });
    for (let j = 0; j < batch.length; j++) {
      outChunks.push({
        id: batch[j].id,
        text: batch[j].text,
        embedding: emb.data[j].embedding,
      });
    }
    console.log(`Embedded ${Math.min(i + batchSize, chunks.length)} / ${chunks.length}`);
  }

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(
    OUT_PATH,
    JSON.stringify({ model: "text-embedding-3-small", chunks: outChunks }),
    "utf8"
  );
  console.log("Wrote", OUT_PATH);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
