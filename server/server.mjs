/**
 * Constitution RAG API — retrieve chunks via embedding similarity, answer with OpenAI chat.
 * Run: OPENAI_API_KEY=sk-... node server/server.mjs
 * Requires server/data/constitution-rag.json from npm run ingest:constitution
 */
import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAG_PATH = path.join(__dirname, "data", "constitution-rag.json");

function cosineSimilarity(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  const den = Math.sqrt(na) * Math.sqrt(nb);
  return den === 0 ? 0 : dot / den;
}

function loadRag() {
  try {
    const raw = fs.readFileSync(RAG_PATH, "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data.chunks) || data.chunks.length === 0) return null;
    return data;
  } catch {
    return null;
  }
}

const app = express();
app.use(express.json({ limit: "120kb" }));
app.use(cors({ origin: true }));

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

let ragCache = loadRag();

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    chunkCount: ragCache?.chunks?.length ?? 0,
    openAiConfigured: !!openai,
  });
});

app.post("/api/constitution-chat", async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: "OPENAI_API_KEY not configured on server." });
    }
    ragCache = loadRag();
    if (!ragCache?.chunks?.length) {
      return res.status(503).json({
        error:
          "RAG index missing. Run OPENAI_API_KEY=sk-... npm run ingest:constitution then restart the API.",
      });
    }

    const { messages } = req.body;
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "messages array required" });
    }

    const last = messages[messages.length - 1];
    if (last.role !== "user" || typeof last.content !== "string") {
      return res.status(400).json({ error: "Last message must be user text." });
    }

    const question = last.content.trim().slice(0, 4000);
    if (!question) {
      return res.status(400).json({ error: "Empty question." });
    }

    const embRes = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: question,
    });
    const qVec = embRes.data[0].embedding;

    const scored = ragCache.chunks.map((c) => ({
      id: c.id,
      text: c.text,
      score: cosineSimilarity(qVec, c.embedding),
    }));
    scored.sort((a, b) => b.score - a.score);
    const top = scored.slice(0, 8);
    const context = top.map((c, i) => `[${i + 1}] ${c.text}`).join("\n\n---\n\n");

    const prior = messages
      .slice(0, -1)
      .slice(-6)
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({
        role: m.role,
        content: String(m.content).slice(0, 8000),
      }));

    const system = `You help Belia PBB members understand the party constitution (Perlembagaan).

Rules:
- Answer ONLY using the excerpts below. If they do not contain the answer, say so clearly — do not guess or invent rules.
- Prefer close paraphrase; cite excerpt numbers like [1], [2] when relevant.
- Match the user's language (Bahasa Melayu or English).
- Be concise unless asked for detail.
- Informational only; not legal advice.

--- Constitution excerpts ---
${context}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: system }, ...prior, { role: "user", content: question }],
      max_tokens: 1200,
      temperature: 0.25,
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    res.json({
      reply,
      citationsUsed: top.map((c) => ({ id: c.id, preview: c.text.slice(0, 180) })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e instanceof Error ? e.message : "Chat failed" });
  }
});

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, () => {
  console.log(`Constitution RAG API → http://localhost:${PORT}`);
});
