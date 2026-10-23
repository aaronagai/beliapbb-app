/** POST target for constitution RAG chat (Express API). */
export function constitutionChatEndpoint(): string | null {
  const raw = import.meta.env.VITE_CONSTITUTION_CHAT_API;
  const base = typeof raw === "string" ? raw.trim().replace(/\/$/, "") : "";
  if (base) return `${base}/api/constitution-chat`;
  if (import.meta.env.DEV) return "/api/constitution-chat";
  return null;
}

/** POST target for FTES RAG chat (same Express API as the constitution chat). */
export function ftesChatEndpoint(): string | null {
  const raw = import.meta.env.VITE_CONSTITUTION_CHAT_API;
  const base = typeof raw === "string" ? raw.trim().replace(/\/$/, "") : "";
  if (base) return `${base}/api/ftes-chat`;
  if (import.meta.env.DEV) return "/api/ftes-chat";
  return null;
}
