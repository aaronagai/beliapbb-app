/**
 * Retrieval-augmented chat on Cloudflare Workers AI, shared by /api/constitution-chat and /api/ftes-chat.
 * Passages come from functions/_data/*.json (npm run chat:chunks). They are embedded on first use,
 * then kept in memory and in the Cache API, so each data version is embedded about once per location.
 */

export interface Env {
  /** Workers AI binding, added on the beliapbb-app Pages project (Settings → Bindings). */
  AI?: { run(model: string, input: Record<string, unknown>): Promise<unknown> };
}

export type Chunk = { id: number; text: string; sourceId?: string };
export type ChunkFile = { version: string; chunks: Chunk[] };
type ChatMessage = { role: "user" | "assistant"; content: string };

const EMBED_MODEL = "@cf/baai/bge-m3";
/** SEA-LION is tuned for Southeast Asian languages, including Malay; Gemma is the fallback. */
const CHAT_MODELS = ["@cf/aisingapore/gemma-sea-lion-v4-27b-it", "@cf/google/gemma-4-26b-a4b-it"];
const EMBED_BATCH = 32;
const MAX_QUESTION = 1000;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  });

export const errorResponse = (error: string, status: number) => json({ error }, status);

function normalize(v: number[]): Float32Array {
  let n = 0;
  for (const x of v) n += x * x;
  const len = Math.sqrt(n) || 1;
  return Float32Array.from(v, (x) => x / len);
}

async function embed(env: Env, texts: string[]): Promise<Float32Array[]> {
  const out = (await env.AI!.run(EMBED_MODEL, { text: texts })) as { data?: number[][] };
  if (!Array.isArray(out?.data) || out.data.length !== texts.length) throw new Error("Embedding failed");
  return out.data.map(normalize);
}

const memory = new Map<string, Promise<Float32Array[]>>();

/** Passage vectors for one data file: memory → Cache API → Workers AI. */
function passageVectors(env: Env, origin: string, name: string, file: ChunkFile): Promise<Float32Array[]> {
  const key = `${name}-${file.version}`;
  let pending = memory.get(key);
  if (!pending) {
    pending = loadOrEmbed(env, origin, key, file).catch((e) => {
      memory.delete(key);
      throw e;
    });
    memory.set(key, pending);
  }
  return pending;
}

async function loadOrEmbed(env: Env, origin: string, key: string, file: ChunkFile): Promise<Float32Array[]> {
  const cacheKey = new Request(`${origin}/__rag-cache/${key}`);
  const cache = (caches as unknown as { default: Cache }).default;
  const hit = await cache.match(cacheKey);
  if (hit) {
    const flat = new Float32Array(await hit.arrayBuffer());
    const dim = flat.length / file.chunks.length;
    if (Number.isInteger(dim) && dim > 0) {
      return file.chunks.map((_, i) => flat.subarray(i * dim, (i + 1) * dim));
    }
  }

  const vectors: Float32Array[] = [];
  for (let i = 0; i < file.chunks.length; i += EMBED_BATCH) {
    vectors.push(...(await embed(env, file.chunks.slice(i, i + EMBED_BATCH).map((c) => c.text))));
  }
  const dim = vectors[0].length;
  const flat = new Float32Array(vectors.length * dim);
  vectors.forEach((v, i) => flat.set(v, i * dim));
  await cache.put(
    cacheKey,
    new Response(flat.buffer, { headers: { "Cache-Control": "public, max-age=2592000" } }),
  );
  return vectors;
}

export type ParsedChat = { question: string; prior: ChatMessage[] };

/** Validates the { messages } body the app sends; returns a Response on bad input. */
export async function parseChat(request: Request): Promise<ParsedChat | Response> {
  let body: { messages?: unknown };
  try {
    body = await request.json();
  } catch {
    return errorResponse("Invalid JSON.", 400);
  }
  const messages = Array.isArray(body?.messages) ? (body.messages as Partial<ChatMessage>[]) : [];
  const last = messages[messages.length - 1];
  if (!last || last.role !== "user" || typeof last.content !== "string") {
    return errorResponse("Last message must be user text.", 400);
  }
  const question = last.content.trim().slice(0, MAX_QUESTION);
  if (!question) return errorResponse("Empty question.", 400);

  const prior = messages
    .slice(0, -1)
    .slice(-4)
    .filter((m): m is ChatMessage => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.slice(0, 2000) }));
  return { question, prior };
}

/** The `count` passages closest to the question. */
export async function retrieve(
  env: Env,
  request: Request,
  name: string,
  file: ChunkFile,
  question: string,
  count: number,
): Promise<Chunk[]> {
  const origin = new URL(request.url).origin;
  const [vectors, [q]] = await Promise.all([passageVectors(env, origin, name, file), embed(env, [question])]);
  return vectors
    .map((v, i) => {
      let dot = 0;
      for (let k = 0; k < v.length; k++) dot += v[k] * q[k];
      return { chunk: file.chunks[i], score: dot };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map((s) => s.chunk);
}

function replyText(out: unknown): string {
  const o = out as { response?: unknown; choices?: { message?: { content?: unknown } }[] };
  if (typeof o?.response === "string") return o.response;
  const content = o?.choices?.[0]?.message?.content;
  return typeof content === "string" ? content : "";
}

export async function answer(
  env: Env,
  system: string,
  chat: ParsedChat,
  temperature: number,
): Promise<string> {
  const messages = [{ role: "system", content: system }, ...chat.prior, { role: "user", content: chat.question }];
  let lastError: unknown;
  for (const model of CHAT_MODELS) {
    try {
      const reply = replyText(await env.AI!.run(model, { messages, max_tokens: 900, temperature })).trim();
      if (reply) return reply;
    } catch (e) {
      lastError = e;
      console.error(model, e);
    }
  }
  throw lastError ?? new Error("Empty reply");
}

export { json };
