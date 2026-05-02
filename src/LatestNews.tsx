import { useEffect, useState } from "react";
import { fetchNewsFeed, type NewsCardModel } from "./jiwabakti";

const PINNED_SLUG = "gps-beri-peluang-pada-generasi-muda-demi-kesinambungan-parti";
const CARD_COUNT = 3;

function formatDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("ms-MY", {
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
  const [items, setItems] = useState<NewsCardModel[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchNewsFeed({
          count: CARD_COUNT,
          pinnedSlug: PINNED_SLUG,
        });
        if (!cancelled) setItems(list);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Gagal memuat berita");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="news-error" role="alert">
        {error}
      </p>
    );
  }

  if (!items) {
    return (
      <ul className="news-list">
        {[0, 1, 2].map((i) => (
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
                {formatDate(item.date)} · Jiwa Bakti
              </span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
