/**
 * Tidy an answer set the same way the Apps Script does (scripts/apps-script/permohonan.gs, normalise()),
 * so the review and the PDF show exactly what the sheet will hold. Keep the two in sync.
 */
import type { Draft } from "./joinData";

const digits = (s: string) => s.replace(/\D/g, "");
const squash = (s: string) => s.replace(/[ \t]+/g, " ").trim();
const caps = (s: string) => squash(s).toUpperCase();
const lines = (s: string) =>
  s.split(/\r?\n/).map(squash).filter(Boolean).join("\n").toUpperCase();

/** 0123456789 / +60 12 345 6789 → 012-3456789; Sarawak landlines keep three digits (082-375755). */
export function formatPhone(raw: string): string {
  let d = digits(raw);
  if (!d) return "";
  if (d.startsWith("60") && d.length >= 11) d = `0${d.slice(2)}`;
  if (!d.startsWith("0") && d.length >= 9) d = `0${d}`;
  const cut = /^(01|08)/.test(d) ? 3 : 2;
  return `${d.slice(0, cut)}-${d.slice(cut)}`;
}

/** A Malaysian mobile number: 01x followed by 7 or 8 more digits. */
export function isMobile(raw: string): boolean {
  const d = digits(formatPhone(raw));
  return /^01\d{8,9}$/.test(d);
}

export function normaliseDraft(d: Draft): Draft {
  const ic = digits(d.noKadPengenalan);
  return {
    ...d,
    nama: caps(d.nama),
    noKadPengenalan: ic.length === 12 ? `${ic.slice(0, 6)}-${ic.slice(6, 8)}-${ic.slice(8)}` : d.noKadPengenalan,
    rantingNo: caps(d.rantingNo).replace(/\s*\/\s*/g, "/"),
    tempatLahir: caps(d.tempatLahir),
    alamatRumah: lines(d.alamatRumah),
    alamatPejabat: lines(d.alamatPejabat),
    pekerjaanNyata: caps(d.pekerjaanNyata),
    agamaLain: caps(d.agamaLain),
    bangsaLain: caps(d.bangsaLain),
    telRumah: formatPhone(d.telRumah),
    telPejabat: formatPhone(d.telPejabat),
    telBimbit: formatPhone(d.telBimbit),
    email: squash(d.email).toLowerCase(),
  };
}
