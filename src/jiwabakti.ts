const API = "https://jiwabakti.com.my/wp-json/wp/v2";

/** Jiwa Bakti exposes image URLs in custom `featured_image_urls` (first entry of each size is the URL). */
type FeaturedImageUrls = Record<string, [string, ...unknown[]]>;

export type JiwaBaktiPost = {
  id: number;
  link: string;
  date: string;
  title: { rendered: string };
  excerpt: { rendered: string };
  featured_image_urls?: FeaturedImageUrls;
};

function decodeEntities(html: string): string {
  if (typeof document === "undefined") return html;
  const t = document.createElement("textarea");
  t.innerHTML = html;
  return t.value;
}

export function stripExcerpt(html: string): string {
  const decoded = decodeEntities(html.replace(/<[^>]+>/g, " "));
  return decoded.replace(/\s+/g, " ").replace(/\s*\[…\]\s*$/u, "…").trim();
}

function firstImageUrl(urls: FeaturedImageUrls | undefined): string | undefined {
  if (!urls) return undefined;
  const order = [
    "post-thumbnail",
    "medium_large",
    "medium",
    "large",
    "thumbnail",
    "full",
  ] as const;
  for (const key of order) {
    const v = urls[key]?.[0];
    if (typeof v === "string" && v.length > 0) return v;
  }
  return undefined;
}

export async function fetchPostBySlug(slug: string): Promise<JiwaBaktiPost | null> {
  const url = `${API}/posts?slug=${encodeURIComponent(slug)}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Jiwa Bakti: ${res.status}`);
  const data = (await res.json()) as JiwaBaktiPost[];
  return data[0] ?? null;
}

export async function fetchLatestPosts(perPage: number): Promise<JiwaBaktiPost[]> {
  const url = `${API}/posts?per_page=${perPage}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Jiwa Bakti: ${res.status}`);
  return (await res.json()) as JiwaBaktiPost[];
}

export type NewsCardModel = {
  id: number;
  url: string;
  title: string;
  excerpt: string;
  image?: string;
  date: string;
};

function toCard(p: JiwaBaktiPost): NewsCardModel {
  return {
    id: p.id,
    url: p.link,
    title: stripExcerpt(p.title.rendered),
    excerpt: stripExcerpt(p.excerpt.rendered),
    image: firstImageUrl(p.featured_image_urls),
    date: p.date,
  };
}

/** Pinned story first (e.g. featured URL), then newest posts until `count`. */
export async function fetchNewsFeed(options: {
  count: number;
  pinnedSlug?: string;
}): Promise<NewsCardModel[]> {
  const { count, pinnedSlug } = options;
  const latest = await fetchLatestPosts(count + 4);
  const out: NewsCardModel[] = [];
  const seen = new Set<number>();

  if (pinnedSlug) {
    try {
      const pinned = await fetchPostBySlug(pinnedSlug);
      if (pinned) {
        out.push(toCard(pinned));
        seen.add(pinned.id);
      }
    } catch {
      /* ignore pinned failure; still show latest */
    }
  }

  for (const p of latest) {
    if (seen.has(p.id)) continue;
    out.push(toCard(p));
    seen.add(p.id);
    if (out.length >= count) break;
  }

  return out.slice(0, count);
}
