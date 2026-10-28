import { useEffect, useRef, useState, type FormEvent } from "react";
import { constitutionChatEndpoint } from "../constitutionChatApi";
import { useI18n } from "../i18n";

type ChatMsg = { role: "user" | "assistant"; content: string };

/** Constitution Q&A (RAG over perlembagaan.pdf). Shows an honest "not connected" state until the API is live. */
export function PerlembagaanPage({ onBack }: { onBack: () => void }) {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const endpoint = constitutionChatEndpoint();

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, loading]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = input.trim();
    if (!q || loading || !endpoint) return;

    setInput("");
    setError(null);
    const nextMsgs: ChatMsg[] = [...messages, { role: "user", content: q }];
    setMessages(nextMsgs);
    setLoading(true);

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMsgs }),
      });
      let data: { reply?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        /* non-JSON error page */
      }
      if (!res.ok) throw new Error(data.error || res.statusText || "Request failed");
      const reply = typeof data.reply === "string" ? data.reply : "";
      setMessages([...nextMsgs, { role: "assistant", content: reply || `(${t("constitutionChatNoReply")})` }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("constitutionChatErrorGeneric"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="app-chat" aria-labelledby="perlembagaan-title">
      <header className="app-chat-head">
        <button type="button" className="app-back" onClick={onBack}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m14.5 6-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {t("appBack")}
        </button>
        <h1 className="app-page-title" id="perlembagaan-title">{t("perlembagaanNav")}</h1>
        <p className="app-page-sub">{t("constitutionChatDisclaimer")}</p>
      </header>

      <div ref={listRef} className="app-chat-messages" aria-live="polite">
        {!endpoint ? (
          <p className="app-chat-note">{t("constitutionChatUnavailable")}</p>
        ) : messages.length === 0 ? (
          <p className="app-chat-note">{t("constitutionChatEmpty")}</p>
        ) : null}
        {messages.map((m, i) => (
          <p key={i} className={`app-chat-bubble app-chat-bubble--${m.role}`}>
            {m.content}
          </p>
        ))}
        {loading ? <p className="app-chat-note">{t("constitutionChatLoading")}</p> : null}
        {error ? (
          <p className="app-chat-error" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <form className="app-chat-form" onSubmit={handleSubmit}>
        <label className="visually-hidden" htmlFor="perlembagaan-input">
          {t("constitutionChatPlaceholder")}
        </label>
        <input
          id="perlembagaan-input"
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={t("constitutionChatPlaceholder")}
          disabled={!endpoint || loading}
          autoComplete="off"
          enterKeyHint="send"
          maxLength={4000}
        />
        <button type="submit" disabled={!endpoint || loading || !input.trim()} aria-label={t("constitutionChatSend")}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 19V5m0 0-6 6m6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </section>
  );
}
