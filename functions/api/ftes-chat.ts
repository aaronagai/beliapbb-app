import data from "../_data/ftes.json";
import { answer, errorResponse, json, parseChat, retrieve, type ChunkFile, type Env } from "../_lib/rag";

type Source = { id: string; title: string; url: string | null };
const file = data as ChunkFile & { sources: Source[] };
const sourcesById = new Map(file.sources.map((s) => [s.id, s]));

export const onRequestPost = async ({ request, env }: { request: Request; env: Env }) => {
  if (!env.AI) return errorResponse("Chat is not connected yet.", 503);
  const chat = await parseChat(request);
  if (chat instanceof Response) return chat;

  try {
    const top = await retrieve(env, request, "ftes", file, chat.question, 7);

    // Number excerpts by source document, so [n] in the reply maps to one link.
    const cited: Source[] = [];
    const context = top
      .map((c) => {
        let n = cited.findIndex((s) => s.id === c.sourceId) + 1;
        if (n === 0) {
          cited.push(sourcesById.get(c.sourceId ?? "") ?? { id: c.sourceId ?? "", title: "FTES document", url: null });
          n = cited.length;
        }
        return `[${n}] (${cited[n - 1].title}) ${c.text}`;
      })
      .join("\n\n---\n\n");

    const system = `You answer questions about Free Tertiary Education Sarawak (FTES) for young Sarawakians on the Belia PBB app.

Rules:
- Answer ONLY using the excerpts below. If they do not contain the answer, say so plainly and suggest checking with the university or the official FTES channels — never guess eligibility, amounts, dates or institutions.
- Lead with the direct answer in one or two sentences, then any steps or conditions as a short bulleted list.
- Cite excerpt numbers like [1], [2] right after the claim they support.
- Never ask for IC numbers or other personal details.
- Informational only; the official FTES documents and institutions have the final say.

--- FTES excerpts ---
${context}`;
    const reply = await answer(env, system, chat, 0.2);
    return json({ reply, sources: cited.map((s, i) => ({ n: i + 1, title: s.title, url: s.url })) });
  } catch (e) {
    console.error(e);
    return errorResponse("The chat is busy right now. Please try again shortly.", 502);
  }
};
