import "./fonts/caveat.css";
import { useI18n } from "./i18n";

type JoinFabProps = {
  visible: boolean;
  onJoin: () => void;
};

/** Sketchy curved arrow pointing down toward the join button. */
function JoinFabArrow() {
  return (
    <svg
      className="join-fab-annotation-arrow"
      viewBox="0 0 56 40"
      width="56"
      height="40"
      aria-hidden="true"
    >
      <path
        d="M6 4 C18 2, 34 8, 42 18 S48 32, 38 36 M38 36 L44 34 M38 36 L40 42"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function JoinFab({ visible, onJoin }: JoinFabProps) {
  const { t } = useI18n();

  if (!visible) return null;

  return (
    <div className="join-fab-wrap">
      <p className="join-fab-annotation" aria-hidden="true">
        <span className="join-fab-annotation-text">{t("joinFabHint")}</span>
        <JoinFabArrow />
      </p>
      <button
        type="button"
        className="join-fab"
        onClick={onJoin}
        aria-label={t("joinFabAria")}
      >
        {t("joinFabLabel")}
      </button>
    </div>
  );
}
