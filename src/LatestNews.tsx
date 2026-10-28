import { useEffect, useState } from "react";
import { useI18n } from "./i18n";
import { fetchNewsFeed, type NewsCardModel } from "./jiwabakti";

const JIWABAKTI_HREF = "https://jiwabakti.com.my/";

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

function NewsRow({
  item,
  dateLocale,
  sourceLabel,
}: {
  item: NewsCardModel;
  dateLocale: string;
  sourceLabel: string;
}) {
  return (
    <li className="news-list-item">
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="news-row"
      >
        <div
          className={`news-row-thumb${item.image ? "" : " news-row-thumb--placeholder"}`}
          aria-hidden={item.image ? undefined : true}
        >
          {item.image ? (
            <img
              src={item.image}
              alt=""
              className="news-row-thumb-image"
              loading="lazy"
              decoding="async"
            />
          ) : null}
        </div>
        <div className="news-row-body">
          <span className="news-row-title">{item.title}</span>
          <span className="news-row-meta">
            {sourceLabel}
            <span className="news-row-meta-sep" aria-hidden>
              {" · "}
            </span>
            <time dateTime={item.date}>{formatDate(item.date, dateLocale)}</time>
          </span>
        </div>
      </a>
    </li>
  );
}

function NewsListSkeleton({ count }: { count: number }) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="news-list-item" aria-hidden>
          <div className="news-row news-row--skeleton">
            <div className="news-row-thumb news-row-thumb--placeholder" />
            <div className="news-row-body">
              <span className="news-row-title news-row-title--skeleton" />
              <span className="news-row-meta news-row-meta--skeleton" />
            </div>
          </div>
        </li>
      ))}
    </>
  );
}

/**
 * Jiwa Bakti news. On home it shows a few rows with an in-app "see all" (onSeeAll);
 * on the Berita tab it shows the full list and links out to the source.
 */
export function LatestNews({
  count = 6,
  onSeeAll,
  showHeading = true,
}: {
  count?: number;
  onSeeAll?: () => void;
  /** Off when the page title already says "Berita terkini" */
  showHeading?: boolean;
}) {
  const { t, language } = useI18n();
  const [items, setItems] = useState<NewsCardModel[] | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const dateLocale = language === "en" ? "en-MY" : "ms-MY";
  const sourceLabel = t("newsSource");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const list = await fetchNewsFeed({ count });
        if (!cancelled) setItems(list);
      } catch {
        if (!cancelled) setLoadFailed(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [count]);

  return (
    <div className="news-recent" role="region" aria-labelledby="news-recent-heading">
      <div className="news-recent-inner">
        <div className="news-recent-header">
          <h3 className={showHeading ? "news-recent-heading" : "visually-hidden"} id="news-recent-heading">
            {t("latestNews")}
          </h3>
          {onSeeAll ? (
            <button type="button" className="news-recent-view-all" onClick={onSeeAll}>
              {t("newsViewAll")}
            </button>
          ) : (
            <a
              className="news-recent-view-all"
              href={JIWABAKTI_HREF}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t("newsMoreOnSource")}
            </a>
          )}
        </div>

        {loadFailed ? (
          <p className="news-recent-error" role="alert">
            {t("newsLoadError")}
          </p>
        ) : (
          <ul className="news-list">
            {!items ? (
              <NewsListSkeleton count={count} />
            ) : (
              items.map((item) => (
                <NewsRow
                  key={item.id}
                  item={item}
                  dateLocale={dateLocale}
                  sourceLabel={sourceLabel}
                />
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
