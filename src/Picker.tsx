import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useI18n } from "./i18n";

export type PickerOption = { value: string; label: string; sub?: string };

/** A laptop with a mouse gets a floating panel under the field; a phone gets a bottom sheet. No icons in either. */
function useIsDesktop() {
  const query = "(min-width: 900px) and (hover: hover) and (pointer: fine)";
  const [desktop, setDesktop] = useState(() => (typeof window === "undefined" ? false : window.matchMedia(query).matches));
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setDesktop(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return desktop;
}

/**
 * Replaces the plain <select>. Tap the field to open a list you can search. `extra` is an always-last row
 * ("Lain-lain") for people whose answer isn't in the list. Value "" means nothing chosen.
 */
export function Picker({
  id,
  label,
  value,
  options,
  placeholder,
  disabled = false,
  extra,
  onChange,
}: {
  id?: string;
  label: string;
  value: string;
  options: PickerOption[];
  placeholder: string;
  disabled?: boolean;
  extra?: PickerOption;
  onChange: (value: string) => void;
}) {
  const { t } = useI18n();
  const desktop = useIsDesktop();
  const [open, setOpen] = useState(false);
  const [shown, setShown] = useState(false); // drives the enter/exit transition
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const listId = useId();

  const all = useMemo(() => (extra ? [...options, extra] : options), [options, extra]);
  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const hit = needle ? options.filter((o) => `${o.label} ${o.sub ?? ""} ${o.value}`.toLowerCase().includes(needle)) : options;
    return extra ? [...hit, extra] : hit;
  }, [q, options, extra]);

  const chosen = all.find((o) => o.value === value);
  const searchable = options.length > 8;

  const openIt = () => {
    if (disabled) return;
    setQ("");
    setActive(Math.max(0, rows.findIndex((o) => o.value === value)));
    setOpen(true);
    requestAnimationFrame(() => requestAnimationFrame(() => setShown(true)));
  };
  const closeIt = () => {
    setShown(false);
    window.setTimeout(() => setOpen(false), 180);
    trigger.current?.focus({ preventScroll: true });
  };
  const pick = (v: string) => {
    onChange(v);
    closeIt();
  };

  // Phone: stop the page scrolling behind the sheet. Laptop: close on an outside click.
  useEffect(() => {
    if (!open) return;
    if (!desktop) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
    const away = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) closeIt();
    };
    document.addEventListener("pointerdown", away);
    return () => document.removeEventListener("pointerdown", away);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, desktop]);

  useEffect(() => {
    if (open && shown && searchable && desktop) search.current?.focus({ preventScroll: true });
  }, [open, shown, searchable, desktop]);

  // Keep the highlighted row in view when moving with the arrow keys.
  useEffect(() => {
    if (!open) return;
    document.getElementById(`${listId}-${active}`)?.scrollIntoView({ block: "nearest" });
  }, [active, open, listId]);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      closeIt();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(rows.length - 1, i + 1)); // keyboard moves instantly, no glide
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && rows[active]) {
      e.preventDefault();
      pick(rows[active].value);
    }
  };

  const list = (
    <>
      {searchable ? (
        <div className="picker-search">
          <input
            ref={search}
            className="picker-search-input"
            type="search"
            inputMode="search"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="none"
            placeholder={t("joinSearch")}
            aria-label={t("joinSearch")}
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKey}
          />
        </div>
      ) : null}
      <ul className="picker-list" role="listbox" aria-label={label} onKeyDown={onKey}>
        {rows.length === 1 && extra && q ? <li className="picker-empty">{t("joinNoMatch")}</li> : null}
        {rows.map((o, i) => (
          <li
            key={o.value}
            id={`${listId}-${i}`}
            role="option"
            aria-selected={o.value === value}
            data-active={i === active}
            data-extra={extra && o.value === extra.value ? "true" : undefined}
            className="picker-row"
            onPointerEnter={() => desktop && setActive(i)}
            onClick={() => pick(o.value)}
          >
            <span className="picker-row-text">
              <span className="picker-row-label">{o.label}</span>
              {o.sub ? <span className="picker-row-sub">{o.sub}</span> : null}
            </span>
            <span className="picker-mark" aria-hidden />
          </li>
        ))}
      </ul>
    </>
  );

  return (
    <div className="picker" ref={wrap}>
      <button
        ref={trigger}
        id={id}
        type="button"
        className="profile-input join-input picker-trigger"
        data-empty={!chosen}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => (open ? closeIt() : openIt())}
        onKeyDown={(e) => {
          if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
            e.preventDefault();
            openIt();
          }
        }}
      >
        <span className="picker-value">{chosen ? chosen.label : placeholder}</span>
        <span className="picker-caret" aria-hidden />
      </button>

      {open && desktop ? (
        <div className="picker-panel" data-open={shown} onKeyDown={onKey}>
          {list}
        </div>
      ) : null}

      {open && !desktop
        ? createPortal(
            <div className="picker-layer" data-open={shown}>
              <div className="picker-backdrop" onClick={closeIt} />
              <div className="picker-sheet" role="dialog" aria-modal="true" aria-label={label} onKeyDown={onKey}>
                <div className="picker-sheet-head">
                  <span className="picker-sheet-title">{label}</span>
                  <button type="button" className="picker-close" onClick={closeIt}>
                    {t("joinClose")}
                  </button>
                </div>
                {list}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
