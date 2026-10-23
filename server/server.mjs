/**
 * RAG chat API — retrieve chunks via embedding similarity, answer with OpenAI chat.
 * Run: OPENAI_API_KEY=sk-... node server/server.mjs
 * - /api/constitution-chat needs server/data/constitution-rag.json (npm run ingest:constitution)
 * - /api/ftes-chat needs server/data/ftes-rag.json (npm run ingest:ftes)
 */
import cors from "cors";
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const RAG_PATH = path.join(__dirname, "data", "constitution-rag.json");
const FTES_RAG_PATH = path.join(__dirname, "data", "ftes-rag.json");

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

function loadRag(file = RAG_PATH) {
  try {
    const raw = fs.readFileSync(file, "utf8");
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
let ftesRagCache = loadRag(FTES_RAG_PATH);

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    chunkCount: ragCache?.chunks?.length ?? 0,
    ftesChunkCount: ftesRagCache?.chunks?.length ?? 0,
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

app.post("/api/ftes-chat", async (req, res) => {
  try {
    if (!openai) {
      return res.status(503).json({ error: "OPENAI_API_KEY not configured on server." });
    }
    ftesRagCache = loadRag(FTES_RAG_PATH);
    if (!ftesRagCache?.chunks?.length) {
      return res.status(503).json({
        error: "FTES index missing. Run OPENAI_API_KEY=sk-... npm run ingest:ftes then restart the API.",
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

    const top = ftesRagCache.chunks
      .map((c) => ({ ...c, score: cosineSimilarity(qVec, c.embedding) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);

    // Number excerpts by source document, so [n] in the reply maps to one link.
    const sourcesById = new Map((ftesRagCache.sources ?? []).map((s) => [s.id, s]));
    const cited = [];
    const context = top
      .map((c) => {
        let n = cited.findIndex((s) => s.id === c.sourceId) + 1;
        if (n === 0) {
          const src = sourcesById.get(c.sourceId) ?? { id: c.sourceId, title: "FTES document" };
          cited.push(src);
          n = cited.length;
        }
        return `[${n}] (${cited[n - 1].title}) ${c.text}`;
      })
      .join("\n\n---\n\n");

    const prior = messages
      .slice(0, -1)
      .slice(-6)
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .map((m) => ({
        role: m.role,
        content: String(m.content).slice(0, 8000),
      }));

    const system = `You answer questions about Free Tertiary Education Sarawak (FTES) for young Sarawakians on the Belia PBB app.

Rules:
- Answer ONLY using the excerpts below. If they do not contain the answer, say so plainly and suggest checking with the university or the official FTES channels — never guess eligibility, amounts, dates or institutions.
- Lead with the direct answer in one or two sentences, then any steps or conditions as a short bulleted list.
- Cite excerpt numbers like [1], [2] right after the claim they support.
- Match the user's language (Bahasa Melayu or English).
- Never ask for IC numbers or other personal details.
- Informational only; the official FTES documents and institutions have the final say.

--- FTES excerpts ---
${context}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: system }, ...prior, { role: "user", content: question }],
      max_tokens: 1200,
      temperature: 0.2,
    });

    const reply = completion.choices[0]?.message?.content ?? "";
    res.json({
      reply,
      sources: cited.map((s, i) => ({ n: i + 1, title: s.title, url: s.url ?? null })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e instanceof Error ? e.message : "Chat failed" });
  }
});

const PORT = Number(process.env.PORT) || 8787;
app.listen(PORT, () => {
  console.log(`RAG chat API → http://localhost:${PORT}`);
});
