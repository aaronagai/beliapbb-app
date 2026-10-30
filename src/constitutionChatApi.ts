/**
 * Chat endpoints. In production they are Cloudflare Pages Functions on the app's own origin
 * (functions/api/*-chat.ts, Workers AI); in dev, Vite proxies /api to server/server.mjs.
 * VITE_CONSTITUTION_CHAT_API points both at another host instead.
 */
function chatEndpoint(path: string): string {
  const raw = import.meta.env.VITE_CONSTITUTION_CHAT_API;
  const base = typeof raw === "string" ? raw.trim().replace(/\/$/, "") : "";
  return `${base}/api/${path}`;
}

/** POST target for the constitution chat. */
export function constitutionChatEndpoint(): string | null {
  return chatEndpoint("constitution-chat");
}

/** POST target for the FTES chat. */
export function ftesChatEndpoint(): string | null {
  return chatEndpoint("ftes-chat");
}
