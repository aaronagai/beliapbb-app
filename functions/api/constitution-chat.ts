import data from "../_data/constitution.json";
import { answer, errorResponse, json, parseChat, retrieve, type ChunkFile, type Env } from "../_lib/rag";

const file = data as ChunkFile;

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.AI) return errorResponse("Chat is not connected yet.", 503);
  const chat = await parseChat(request);
  if (chat instanceof Response) return chat;

  try {
    const top = await retrieve(env, request, "constitution", file, chat.question, 6);
    const context = top.map((c, i) => `[${i + 1}] ${c.text}`).join("\n\n---\n\n");
    const system = `You help Belia PBB members understand the party constitution (Perlembagaan PBB).

Rules:
- Answer ONLY using the excerpts below. If they do not contain the answer, say so clearly — do not guess or invent rules.
- Prefer close paraphrase; cite excerpt numbers like [1], [2] when relevant.
- Reply in the language of the user's question (Bahasa Melayu or English).
- Be concise unless asked for detail.
- Informational only; not legal advice.

--- Constitution excerpts ---
${context}`;
    const reply = await answer(env, system, chat, 0.25);
    return json({ reply, citationsUsed: top.map((c) => ({ id: c.id, preview: c.text.slice(0, 180) })) });
  } catch (e) {
    console.error(e);
    return errorResponse("The chat is busy right now. Please try again shortly.", 502);
  }
};
