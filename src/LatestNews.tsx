import { useEffect, useState } from "react";
import { useI18n } from "./i18n";
import { fetchNewsFeed, type NewsCardModel } from "./jiwabakti";

const PINNED_SLUG = "gps-beri-peluang-pada-generasi-muda-demi-kesinambungan-parti";
const CARD_COUNT = 5;

function formatDate(iso: string, locale: string): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

function shorten(text: string, max: number): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trimEnd()}…`;
}

export function LatestNews() {
  const { t, language } = useI18n();
  const [items, setItems] = useState<NewsCardModel[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const dateLocale = language === "en" ? "en-MY" : "ms-MY";

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchNewsFeed({
          count: CARD_COUNT,
          pinnedSlug: PINNED_SLUG,
        });
        if (!cancelled) setItems(list);
      } catch {
        if (!cancelled) setLoadFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadFailed) {
    return (
      <p className="news-error" role="alert">
        {t("newsLoadError")}
      </p>
    );
  }

  if (!items) {
    return (
      <ul className="news-list">
        {Array.from({ length: CARD_COUNT }, (_, i) => (
          <li key={i} className="news-card news-card--skeleton" aria-hidden />
        ))}
      </ul>
    );
  }

  return (
    <ul className="news-list">
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="news-card"
          >
            {item.image ? (
              <img
                src={item.image}
                alt=""
                className="news-card-thumb"
                loading="lazy"
                width={112}
                height={72}
              />
            ) : (
              <div className="news-card-thumb news-card-thumb--placeholder" aria-hidden />
            )}
            <span className="news-card-text">
              <span className="news-card-title">{item.title}</span>
              <span className="news-card-excerpt">
                {shorten(item.excerpt, 110)}
              </span>
              <span className="news-card-meta">
                {formatDate(item.date, dateLocale)} · {t("newsSource")}
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
