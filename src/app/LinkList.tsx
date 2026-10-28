import { ExternalLinkArrowIcon } from "../ExternalLinkArrowIcon";

export type LinkItem = { href: string; title: string; hint?: string };

/** Grouped rows of outbound links (documents, sites) with a ↗ affordance. */
export function LinkList({ title, items }: { title: string; items: LinkItem[] }) {
  return (
    <section className="app-links" aria-label={title}>
      <h2 className="app-section-title">{title}</h2>
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <a href={item.href} target="_blank" rel="noopener noreferrer">
              <span className="app-links-text">
                <span className="app-links-title">{item.title}</span>
                {item.hint ? <span className="app-links-hint">{item.hint}</span> : null}
              </span>
              <ExternalLinkArrowIcon className="app-links-arrow" />
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
