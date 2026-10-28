import { useEffect, useState } from "react";
import { getAhliRows } from "../ahliData";
import { MAJLIS_TERTINGGI, whatsappHref, type CouncilMember, type CouncilSocials } from "./leadershipData";

/**
 * The leadership page reads two Google Sheets live, so the committee can edit names,
 * photos and links without a deploy. Both sheets must be shared "Anyone with the link:
 * Viewer". If a sheet can't be read, the page keeps the data bundled with the site.
 */
const COUNCIL_SHEET_ID = "1eTQY5Ox2PLBNrPS4pQlz3K2xyeXaRV2tOXmN-kP5SiI";
const BRANCH_SHEET_ID = "1k0mZtno99UqbxNSMY3YJIsT0s-p-503qB07jARhngvE";
const CACHE_KEY = "belia-leadership-v1";

export type Branch = { cawangan: string; name: string };
export type LeadershipData = { council: CouncilMember[]; branches: Branch[] };

const BUNDLED: LeadershipData = {
  council: MAJLIS_TERTINGGI,
  branches: getAhliRows()
    .filter((r) => /^N\.\d+\s/.test(r.cawangan))
    .map((r) => ({ cawangan: r.cawangan, name: r.name })),
};

function sheetCsvUrl(id: string) {
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv`;
}

/** RFC 4180 CSV → rows of cells (handles quotes, escaped quotes and newlines in cells). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }
  if (cell || row.length) {
    row.push(cell);
    rows.push(row);
  }
  return rows.map((r) => r.map((c) => c.trim()));
}

/** Rows as objects keyed by a lower-cased header prefix, so columns can be reordered. */
function columnReader(rows: string[][]) {
  const header = (rows[0] ?? []).map((h) => h.toLowerCase());
  return (row: string[], startsWith: string) => {
    const i = header.findIndex((h) => h.startsWith(startsWith));
    return i >= 0 ? (row[i] ?? "") : "";
  };
}

/** Anyone with edit access can type into the sheet, so only plain web links get through. */
function safeUrl(value: string): string | undefined {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.href : undefined;
  } catch {
    return undefined;
  }
}

/** Drive share links → a direct image URL; other links are used as they are. */
function photoUrl(value: string): string | undefined {
  if (!value) return undefined;
  const driveId = value.match(/drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?(?:export=\w+&)?id=)([\w-]+)/)?.[1];
  if (driveId) return `https://lh3.googleusercontent.com/d/${driveId}=s288`;
  return safeUrl(value);
}

const PROFILE_BASE: Record<Exclude<keyof CouncilSocials, "whatsapp">, (handle: string) => string> = {
  instagram: (h) => `https://www.instagram.com/${h}`,
  facebook: (h) => `https://www.facebook.com/${h}`,
  tiktok: (h) => `https://www.tiktok.com/@${h}`,
  x: (h) => `https://x.com/${h}`,
  linkedin: (h) => `https://www.linkedin.com/in/${h}`,
};

/** A full link, or a bare "@handle" turned into the platform's profile URL. */
function profileUrl(platform: keyof typeof PROFILE_BASE, value: string): string | undefined {
  if (!value) return undefined;
  if (/^https?:\/\//i.test(value)) return safeUrl(value);
  const handle = value.replace(/^@/, "").trim();
  return /^[\w.-]+$/.test(handle) ? PROFILE_BASE[platform](handle) : undefined;
}

function toCouncil(rows: string[][]): CouncilMember[] {
  const col = columnReader(rows);
  return rows
    .slice(1)
    .map((r) => {
      const phone = col(r, "whatsapp").replace(/\D/g, "");
      const socials: CouncilSocials = {
        whatsapp: phone.length >= 9 ? whatsappHref(phone) : undefined,
        instagram: profileUrl("instagram", col(r, "instagram")),
        facebook: profileUrl("facebook", col(r, "facebook")),
        tiktok: profileUrl("tiktok", col(r, "tiktok")),
        x: profileUrl("x", col(r, "x")),
        linkedin: profileUrl("linkedin", col(r, "linkedin")),
      };
      return {
        position: col(r, "jawatan"),
        name: col(r, "nama"),
        cawangan: col(r, "cawangan"),
        photo: photoUrl(col(r, "foto")),
        socials,
      };
    })
    .filter((m) => m.name && m.position);
}

function toBranches(rows: string[][]): Branch[] {
  const col = columnReader(rows);
  return rows
    .slice(1)
    .map((r) => ({ cawangan: col(r, "cawangan"), name: col(r, "nama") }))
    .filter((b) => /^N\.\s?\d+/i.test(b.cawangan));
}

async function fetchRows(id: string) {
  const res = await fetch(sheetCsvUrl(id), { cache: "no-store" });
  if (!res.ok) throw new Error(`Sheet ${id}: ${res.status}`);
  return parseCsv(await res.text());
}

function readCache(): LeadershipData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    return raw ? (JSON.parse(raw) as LeadershipData) : null;
  } catch {
    return null;
  }
}

function writeCache(data: LeadershipData) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    /* private mode or storage full: the page still works from the network */
  }
}

/** Last good copy first (instant), then the live sheets; each list falls back on its own. */
export function useLeadershipData(): LeadershipData {
  const [data, setData] = useState<LeadershipData>(() => readCache() ?? BUNDLED);

  useEffect(() => {
    let cancelled = false;
    Promise.allSettled([fetchRows(COUNCIL_SHEET_ID), fetchRows(BRANCH_SHEET_ID)]).then(([council, branches]) => {
      if (cancelled) return;
      const liveCouncil = council.status === "fulfilled" ? toCouncil(council.value) : [];
      const liveBranches = branches.status === "fulfilled" ? toBranches(branches.value) : [];
      setData((current) => {
        const next: LeadershipData = {
          council: liveCouncil.length ? liveCouncil : current.council,
          branches: liveBranches.length ? liveBranches : current.branches,
        };
        writeCache(next);
        return next;
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return data;
}
