import { useCallback, useEffect, useId, useRef, useState, type FormEvent } from "react";
import { Logo } from "./Logo";
import { useI18n } from "./i18n";

const WELCOME_SESSION_KEY = "beliapbb_welcome_dismissed";
const WELCOME_EMAIL_KEY = "beliapbb_welcome_email";

export function welcomeDismissedThisSession(): boolean {
  if (typeof sessionStorage === "undefined") return true;
  return sessionStorage.getItem(WELCOME_SESSION_KEY) === "1";
}

function markWelcomeDismissed() {
  try {
    sessionStorage.setItem(WELCOME_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

function persistWelcomeEmail(email: string) {
  try {
    localStorage.setItem(WELCOME_EMAIL_KEY, email);
  } catch {
    /* ignore */
  }
}

type WelcomeModalProps = {
  open: boolean;
  onClose: () => void;
};

export function WelcomeModal({ open, onClose }: WelcomeModalProps) {
  const { t } = useI18n();
  const titleId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState("");

  const handleClose = useCallback(() => {
    markWelcomeDismissed();
    onClose();
  }, [onClose]);

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const trimmed = email.trim();
      if (trimmed) persistWelcomeEmail(trimmed);
      handleClose();
    },
    [email, handleClose]
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    emailRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, handleClose]);

  if (!open) return null;

  return (
    <div
      className="welcome-modal-overlay"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        className="welcome-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button
          type="button"
          className="welcome-modal-close"
          onClick={handleClose}
          aria-label={t("welcomeCloseAria")}
        >
          <span aria-hidden>×</span>
        </button>

        <div className="welcome-modal-logo-wrap">
          <Logo className="welcome-modal-logo" decorative />
        </div>

        <p className="welcome-modal-eyebrow">{t("welcomeEyebrow")}</p>
        <h2 id={titleId} className="welcome-modal-title" translate="no">
          {t("welcomeTitle")}
        </h2>
        <p className="welcome-modal-deck">{t("welcomeDeck")}</p>

        <form className="welcome-modal-form" onSubmit={handleSubmit}>
          <label className="welcome-modal-email-label">
            <span className="visually-hidden">{t("welcomeEmailPlaceholder")}</span>
            <input
              ref={emailRef}
              type="email"
              className="welcome-modal-email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder={t("welcomeEmailPlaceholder")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button type="submit" className="welcome-modal-btn welcome-modal-btn--primary">
            {t("welcomeContinue")}
          </button>
        </form>
      </div>
    </div>
  );
}
