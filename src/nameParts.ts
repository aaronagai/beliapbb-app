/**
 * Work out what to call someone ("Hello Aniq!") from the full name on their IC.
 * Malay and Sarawak natives have no surname: the name is "own name + bin/binti/anak + father's name".
 * So we take the part before that marker, skip titles and the very common first words
 * (Mohd, Muhammad, Nur, Siti ...) when another word follows, and use the next word.
 * It is a good guess, not a promise: the form lets the person correct it.
 */
const TITLES = new Set(["DATO", "DATUK", "DATIN", "SRI", "SERI", "DR", "HAJI", "HAJAH", "HJ", "HJH", "ENCIK", "EN", "CIK", "PUAN", "TUAN", "TN", "PN", "TOH", "TUN", "YB", "ABANG", "AWANG", "DAYANG", "DANG", "DATU"]);
const SKIP_FIRST = new Set(["MOHD", "MOHAMAD", "MOHAMED", "MOHAMMAD", "MUHAMMAD", "MUHAMAD", "MUHD", "MHD", "MD", "MOHAMMED", "NUR", "NURUL", "NOR", "NORUL", "NOOR", "SITI", "SYED", "SHARIFAH", "WAN", "NIK", "ENGKU", "TENGKU", "TUNKU", "RAJA"]);
/** Words that belong with the next one ("Abdul Rauf", "Abu Bakar"). */
const JOINS = new Set(["ABDUL", "ABD", "ABU"]);
const PATRONYMIC = new Set(["BIN", "BINTI", "BTE", "BINTE", "BT", "B", "BT.", "B.", "ANAK", "AK", "A/L", "A/P", "AL", "AP", "S/O", "D/O"]);

const clean = (w: string) => w.replace(/[.,'’]+$/g, "").replace(/^['’]+/, "");
const nice = (w: string) => w.toLowerCase().replace(/(^|[-'’/ ])([a-z])/g, (_, a: string, b: string) => a + b.toUpperCase());

export function callName(full: string): string {
  const words = full.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  // Own name = everything before bin/binti/anak (or the whole thing when there's no marker).
  const cut = words.findIndex((w, i) => i > 0 && PATRONYMIC.has(clean(w).toUpperCase()));
  let own = (cut === -1 ? words : words.slice(0, cut)).map(clean).filter(Boolean);
  while (own.length > 1 && TITLES.has(own[0].toUpperCase())) own = own.slice(1);
  if (own.length > 1 && SKIP_FIRST.has(own[0].toUpperCase())) own = own.slice(1); // only one, so "Siti Nor" keeps a name
  if (own.length > 1 && JOINS.has(own[0].toUpperCase())) return nice(`${own[0]} ${own[1]}`);
  return nice(own[0] ?? "");
}
