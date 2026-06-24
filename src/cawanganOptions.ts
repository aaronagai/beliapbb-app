import type { MessageKey } from "./i18n";

/** Organizational cawangan plus Sarawak DUN (N.01–N.82) — single-select options for cawangan. */
export const CAWANGAN_OPTIONS: readonly string[] = [
  "SETIAUSAHA EKSEKUTIF",
  "N.1 OPAR",
  "N.2 TASIK BIRU",
  "N.3 TANJUNG DATU",
  "N.4 PANTAI DAMAI",
  "N.5 DEMAK LAUT",
  "N.6 TUPONG",
  "N.7 SAMARIANG",
  "N.8 SATOK",
  "N.9 PADUNGAN",
  "N.10 PENDING",
  "N.11 BATU LINTANG",
  "N.12 KOTA SENTOSA",
  "N.13 BATU KITANG",
  "N.14 BATU KAWAH",
  "N.15 ASAJAYA",
  "N.16 MUARA TUANG",
  "N.17 STAKAN",
  "N.18 SEREMBU",
  "N.19 MAMBONG",
  "N.20 TARAT",
  "N.21 TEBEDU",
  "N.22 KEDUP",
  "N.23 BUKIT SEMUJA",
  "N.24 SADONG JAYA",
  "N.25 SIMUNJAN",
  "N.26 GEDONG",
  "N.27 SEBUYAU",
  "N.28 LINGGA",
  "N.29 BETING MARO",
  "N.30 BALAI RINGIN",
  "N.31 BUKIT BEGUNAN",
  "N.32 SIMANGGANG",
  "N.33 ENGKILILI",
  "N.34 BATANG AI",
  "N.35 SARIBAS",
  "N.36 LAYAR",
  "N.37 BUKIT SABAN",
  "N.38 KALAKA",
  "N.39 KRIAN",
  "N.40 KABONG",
  "N.41 KUALA RAJANG",
  "N.42 SEMOP",
  "N.43 DARO",
  "N.44 JEMORENG",
  "N.45 REPOK",
  "N.46 MERADONG",
  "N.47 PAKAN",
  "N.48 MELUAN",
  "N.49 NGEMAH",
  "N.50 MACHAN",
  "N.51 BUKIT ASSEK",
  "N.52 DUDONG",
  "N.53 BAWANG ASSAN",
  "N.54 PELAWAN",
  "N.55 NANGKA",
  "N.56 DALAT",
  "N.57 TELLIAN",
  "N.58 BALINGIAN",
  "N.59 TAMIN",
  "N.60 KAKUS",
  "N.61 PELAGUS",
  "N.62 KATIBAS",
  "N.63 BUKIT GORAM",
  "N.64 BALEH",
  "N.65 BELAGA",
  "N.66 MURUM",
  "N.67 JEPAK",
  "N.68 TANJONG BATU",
  "N.69 KEMENA",
  "N.70 SAMALAJU",
  "N.71 BEKENU",
  "N.72 LAMBIR",
  "N.73 PIASAU",
  "N.74 PUJUT",
  "N.75 SENADIN",
  "N.76 MARUDI",
  "N.77 TELANG USAN",
  "N.78 MULU",
  "N.79 BUKIT KOTA",
  "N.80 BATU DANAU",
  "N.81 BA'KELALAN",
  "N.82 BUKIT SARI",
];

/** DUN-only subset — for kawasan negeri fields that must not list organizational cawangan. */
export const DUN_CAWANGAN_OPTIONS = CAWANGAN_OPTIONS.filter((opt) => /^N\.\d+\s/.test(opt));

const CAWANGAN_SET = new Set(CAWANGAN_OPTIONS);

export const CAWANGAN_I18N: Partial<Record<string, MessageKey>> = {
  "SETIAUSAHA EKSEKUTIF": "cawanganSetiausahaEksekutif",
};

/**
 * Shown in the UI: `N.xxx` unchanged; each following word is first letter uppercase,
 * remaining letters lowercase (canonical stored values stay ALL CAPS).
 */
function titleCaseWords(text: string): string {
  return text
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
}

export function formatCawanganLabel(canonical: string): string {
  const m = canonical.match(/^(N\.\d+)\s+(.+)$/);
  if (!m) return titleCaseWords(canonical);
  const [, code, rest] = m;
  return `${code} ${titleCaseWords(rest)}`;
}

export function getCawanganDisplayLabel(
  canonical: string,
  t?: (key: MessageKey) => string
): string {
  const key = CAWANGAN_I18N[canonical];
  if (key && t) return t(key);
  return formatCawanganLabel(canonical);
}

export function isValidCawangan(value: string): boolean {
  return CAWANGAN_SET.has(value);
}
