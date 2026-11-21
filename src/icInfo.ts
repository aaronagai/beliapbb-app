/**
 * What a Malaysian IC number (12 digits, YYMMDD-PB-###G) already tells us, so the form never asks for it:
 * date of birth, age, gender (last digit: odd = male, even = female) and the birthplace state code.
 */
export type Kategori = "belia" | "pemuda" | "wanita" | "induk";

export type IcInfo =
  | { ok: false; reason: "short" | "date" }
  | {
      ok: true;
      dob: string; // YYYY-MM-DD
      age: number;
      jantina: "lelaki" | "perempuan";
      /** Birthplace code (digits 7-8), e.g. "13" = Sarawak. */
      place: string;
      /** The state's name for codes 01-16, otherwise null (born abroad / unknown code). */
      state: string | null;
      kategori: Kategori | null; // null = under 18
    };

/** Birthplace codes on the IC for places in Malaysia. */
const STATE_BY_CODE: Record<string, string> = {
  "01": "Johor", "02": "Kedah", "03": "Kelantan", "04": "Melaka", "05": "Negeri Sembilan", "06": "Pahang",
  "07": "Pulau Pinang", "08": "Perak", "09": "Perlis", "10": "Selangor", "11": "Terengganu", "12": "Sabah",
  "13": "Sarawak", "14": "Kuala Lumpur", "15": "Labuan", "16": "Putrajaya",
};

/** Today in Kuching, so the age is right whatever the visitor's clock says. */
function todayKuching(): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kuching", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

/**
 * Member category by age and gender:
 *  - Belia: 18 to 28 (up to the day before turning 29), men and women
 *  - Pemuda: men 29 to 45
 *  - Wanita: women 29 and over, no upper limit
 *  - Induk: men 46 and over
 */
export function kategoriFor(jantina: "lelaki" | "perempuan", age: number): Kategori | null {
  if (age < 18) return null;
  if (age <= 28) return "belia";
  if (jantina === "perempuan") return "wanita";
  return age <= 45 ? "pemuda" : "induk";
}

export function parseIc(raw: string, now = todayKuching()): IcInfo {
  const x = raw.replace(/\D/g, "");
  if (x.length !== 12) return { ok: false, reason: "short" };
  const yy = Number(x.slice(0, 2));
  const mm = Number(x.slice(2, 4));
  const dd = Number(x.slice(4, 6));
  // Two-digit year: anything later than this year's YY is last century.
  const year = yy > now.y % 100 ? 1900 + yy : 2000 + yy;
  const date = new Date(Date.UTC(year, mm - 1, dd));
  if (mm < 1 || mm > 12 || date.getUTCFullYear() !== year || date.getUTCMonth() !== mm - 1 || date.getUTCDate() !== dd) {
    return { ok: false, reason: "date" };
  }
  let age = now.y - year;
  if (now.m < mm || (now.m === mm && now.d < dd)) age -= 1;
  const jantina = Number(x[11]) % 2 === 1 ? "lelaki" : "perempuan";
  const place = x.slice(6, 8);
  return {
    ok: true,
    dob: `${year}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`,
    age,
    jantina,
    place,
    state: STATE_BY_CODE[place] ?? null,
    kategori: kategoriFor(jantina, age),
  };
}

export const SARAWAK_CODE = "13";

/** State names the IC can autofill as tempat lahir (so they can be cleared if the IC is edited). */
export const STATE_NAMES: string[] = Object.values(STATE_BY_CODE);
