/**
 * What the app remembers about a submitted application, on this device only: the reference number,
 * whether the signed form has been received, and when it was sent. Never the IC number or answers.
 */
const KEY = "beliapbb_application";

export type ApplicationRecord = { ref: string; signed: boolean; at: string };

export function readApplication(): ApplicationRecord | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<ApplicationRecord>;
    return typeof p.ref === "string" && p.ref ? { ref: p.ref, signed: p.signed === true, at: typeof p.at === "string" ? p.at : "" } : null;
  } catch {
    return null;
  }
}

export function saveApplication(record: ApplicationRecord): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(record));
  } catch {
    /* private mode */
  }
}

export function markApplicationSigned(): void {
  const r = readApplication();
  if (r) saveApplication({ ...r, signed: true });
}

export function clearApplication(): void {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* private mode */
  }
}
