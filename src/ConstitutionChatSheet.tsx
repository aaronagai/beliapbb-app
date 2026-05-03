import { useEffect, useRef, useState, type FormEvent } from "react";
import { constitutionChatEndpoint } from "./constitutionChatApi";
import { useI18n } from "./i18n";

type ChatMsg = { role: "user" | "assistant"; content: string };

export function ConstitutionChatSheet({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const endpoint = constitutionChatEndpoint();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [open, messages, loading]);

  if (!open) return null;

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
        body: JSON.stringify({
          messages: nextMsgs.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      let data: { reply?: string; error?: string } = {};
      try {
        data = await res.json();
      } catch {
        /* ignore */
      }
      if (!res.ok) {
        throw new Error(data.error || res.statusText || "Request failed");
      }
      const reply = typeof data.reply === "string" ? data.reply : "";
      setMessages([...nextMsgs, { role: "assistant", content: reply || `(${t("constitutionChatNoReply")})` }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("constitutionChatErrorGeneric"));
      setMessages(nextMsgs);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="constitution-chat-overlay" role="presentation" onMouseDown={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div
        className="constitution-chat-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="constitution-chat-title"
      >
        <header className="constitution-chat-header">
          <h2 id="constitution-chat-title" className="constitution-chat-title">
            {t("constitutionChatTitle")}
          </h2>
          <button
            type="button"
            className="constitution-chat-close"
            onClick={onClose}
            aria-label={t("constitutionChatCloseAria")}
          >
            ×
          </button>
        </header>

        <p className="constitution-chat-disclaimer">{t("constitutionChatDisclaimer")}</p>

        {!endpoint ? (
          <p className="constitution-chat-unavailable">{t("constitutionChatUnavailable")}</p>
        ) : null}

        <div ref={listRef} className="constitution-chat-messages" aria-live="polite">
          {messages.length === 0 && endpoint ? (
            <p className="constitution-chat-empty">{t("constitutionChatEmpty")}</p>
          ) : null}
          {messages.map((m, i) => (
            <div
              key={`${m.role}-${i}-${m.content.slice(0, 24)}`}
              className={`constitution-chat-bubble constitution-chat-bubble--${m.role}`}
            >
              {m.content}
            </div>
          ))}
          {loading ? (
            <p className="constitution-chat-loading">{t("constitutionChatLoading")}</p>
          ) : null}
        </div>

        {error ? (
          <p className="constitution-chat-error" role="alert">
            {error}
          </p>
        ) : null}

        <form className="constitution-chat-form" onSubmit={handleSubmit}>
          <label className="visually-hidden" htmlFor="constitution-chat-input">
            {t("constitutionChatPlaceholder")}
          </label>
          <input
            id="constitution-chat-input"
            type="text"
            className="constitution-chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("constitutionChatPlaceholder")}
            disabled={!endpoint || loading}
            autoComplete="off"
            enterKeyHint="send"
            maxLength={4000}
          />
          <button
            type="submit"
            className="constitution-chat-send"
            disabled={!endpoint || loading || !input.trim()}
          >
            {t("constitutionChatSend")}
          </button>
        </form>
      </div>
    </div>
  );
}
