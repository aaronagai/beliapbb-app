/**
 * Prints a membership application onto the official "Borang Permohonan Keahlian PBB" PDF
 * (public/borang-permohonan-pbb.pdf). Runs in the browser; nothing is uploaded from here.
 *
 * All positions are in PDF points measured from the TOP-left of the 540 × 780 page, read from the
 * form's own boxes. Signature, date, proposer, supporter and office boxes are left blank on purpose.
 */
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

export type BorangData = {
  cawangan: string;
  rantingNo: string;
  nama: string;
  tarikhLahir: string;
  agama: "" | "islam" | "kristian" | "lain";
  agamaLain: string;
  bangsa: string;
  bangsaLain: string;
  tempatLahir: string;
  jantina: "" | "lelaki" | "perempuan";
  icBaru: boolean;
  icLama: boolean;
  noKadPengenalan: string;
  alamatRumah: string;
  alamatPejabat: string;
  pekerjaan: "" | "kerajaan" | "swasta" | "sendiri" | "lain";
  pekerjaanNyata: string;
  telRumah: string;
  telPejabat: string;
  telBimbit: string;
  email: string;
  kawasanParlimen: string;
  kawasanNegeri: string;
  kategoriAhli: "" | "induk" | "belia" | "wanita" | "pemuda";
};

const PAGE_H = 780;
const INK = rgb(0.05, 0.1, 0.45);

/** Tick boxes: [x0, y0, x1, y1] from the top-left. */
type Box = readonly [number, number, number, number];
const TICK = {
  agama: { islam: [344.8, 255.3, 359.3, 266.7], kristian: [425.2, 255.3, 439.7, 266.7], lain: [344.8, 275.8, 359.3, 287.2] },
  jantina: { lelaki: [105.4, 318.9, 119.9, 330.3], perempuan: [185.1, 318.9, 199.6, 330.3] },
  bangsa: {
    melayu_melanau: [344.8, 315.8, 359.3, 325.3],
    iban: [445.2, 315.8, 459.7, 325.2],
    kedayan: [344.8, 332.6, 359.3, 342.1],
    bidayuh: [445.2, 333.2, 459.7, 342.7],
    kayan: [344.8, 349.8, 359.3, 359.3],
    kelabit: [445.2, 349.4, 459.7, 358.9],
    kenyah: [344.8, 368.1, 359.3, 377.6],
    lun_bawang: [445.2, 368.1, 459.7, 377.6],
    lain: [344.8, 385.8, 359.3, 395.3],
  },
  pekerjaan: {
    kerajaan: [355.8, 426.3, 370.3, 435.8],
    swasta: [355.8, 461.2, 370.3, 470.7],
    sendiri: [355.8, 505.6, 370.3, 515.1],
    lain: [355.8, 550.6, 370.3, 560.1],
  },
  kategori: {
    induk: [324.6, 34.1, 339.1, 45.5],
    wanita: [324.6, 55.1, 339.1, 66.4],
    pemuda: [324.6, 77.7, 339.1, 89.0],
    belia: [420.9, 32.8, 435.4, 44.1],
  },
} as const satisfies Record<string, Record<string, Box>>;

/** Baseline (from top) of the "(Nyatakan)" write-in line for each occupation. */
const PEKERJAAN_LINE: Record<string, number> = { kerajaan: 444.5, swasta: 487, sendiri: 531.5, lain: 572.5 };

/** Vertical cell boundaries of the digit boxes (x positions), with the row's top/bottom. */
const DOB_X = [101.3, 117.7, 134.1, 150.5, 166.9, 183.3, 199.7, 216.1, 232.5, 248.9, 265.3];
const IC_BARU_X = [101.3, 114.9, 128.4, 142.0, 155.6, 169.1, 182.7, 196.3, 209.8, 223.4, 237.0, 250.5, 264.1, 277.7, 291.2];
const IC_LAMA_X = [103.2, 116.8, 130.3, 143.9, 157.5, 171.0, 184.6, 198.2, 211.7];
const TEL_X = [355.8, 371.8, 387.8, 403.8, 419.8, 435.8, 451.8, 467.9, 483.9, 499.9, 515.9];
const BIMBIT_X = [355.2, 368.6, 382.0, 395.4, 408.8, 422.2, 435.6, 449.0, 462.4, 475.8, 489.1, 502.5, 515.9];
const PARLIMEN_X = [105.0, 124.7, 144.3, 164.0, 183.6];
const NEGERI_X = [105.0, 127.4, 149.9, 172.3];

/** Keep only characters the built-in PDF font can draw, in capitals (the form asks for HURUF BESAR). */
export function formText(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/[^\n\x20-\x7e]/g, "")
    .toUpperCase();
}

const digitsOf = (s: string) => s.replace(/\D/g, "");

function fitSize(font: PDFFont, text: string, maxW: number, max: number, min: number): number {
  let size = max;
  while (size > min && font.widthOfTextAtSize(text, size) > maxW) size -= 0.5;
  return size;
}

function truncateToWidth(font: PDFFont, text: string, size: number, maxW: number): string {
  if (font.widthOfTextAtSize(text, size) <= maxW) return text;
  let out = text;
  while (out.length > 1 && font.widthOfTextAtSize(out, size) > maxW) out = out.slice(0, -1);
  return out;
}

function wrap(font: PDFFont, text: string, size: number, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(/\s+/).filter(Boolean)) {
      let w = word;
      // Break a single over-long word.
      while (font.widthOfTextAtSize(w, size) > maxW && w.length > 1) {
        let cut = w.length - 1;
        while (cut > 1 && font.widthOfTextAtSize(w.slice(0, cut), size) > maxW) cut--;
        if (line) {
          lines.push(line);
          line = "";
        }
        lines.push(w.slice(0, cut));
        w = w.slice(cut);
      }
      const next = line ? `${line} ${w}` : w;
      if (font.widthOfTextAtSize(next, size) <= maxW) line = next;
      else {
        if (line) lines.push(line);
        line = w;
      }
    }
    lines.push(line);
  }
  return lines;
}

export async function fillBorangPdf(templateBytes: ArrayBuffer | Uint8Array, d: BorangData, ref: string): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(templateBytes);
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const [p1, p2] = pdf.getPages();

  const text = (page: PDFPage, s: string, x: number, baseline: number, size: number) => {
    if (!s) return;
    page.drawText(s, { x, y: PAGE_H - baseline, size, font, color: INK });
  };

  /** One line of text inside a box, shrunk (then trimmed) to fit. */
  const field = (page: PDFPage, raw: string, x: number, baseline: number, maxW: number, maxSize: number, minSize = 7) => {
    const s = formText(raw).replace(/\s+/g, " ").trim();
    if (!s) return;
    const size = fitSize(font, s, maxW, maxSize, minSize);
    text(page, truncateToWidth(font, s, size, maxW), x, baseline, size);
  };

  /** Wrapped paragraph inside an address box. */
  const block = (page: PDFPage, raw: string, x: number, firstBaseline: number, maxW: number, bottom: number) => {
    const s = formText(raw).trim();
    if (!s) return;
    for (const [size, lead] of [[10.5, 13], [9.5, 11.5], [8.5, 10.2], [7.5, 9]] as const) {
      const lines = wrap(font, s, size, maxW);
      const fits = firstBaseline + (lines.length - 1) * lead <= bottom;
      if (fits || size === 7.5) {
        lines.forEach((ln, i) => {
          const y = firstBaseline + i * lead;
          if (y <= bottom) text(page, ln, x, y, size);
        });
        return;
      }
    }
  };

  /** Digits centred one per cell. `cells` are the 0-based cell indexes to use, in order. */
  const cells = (page: PDFPage, xs: readonly number[], chars: string, cellIdx: readonly number[], baseline: number, size = 12) => {
    for (let i = 0; i < chars.length && i < cellIdx.length; i++) {
      const c = cellIdx[i];
      const w = font.widthOfTextAtSize(chars[i], size);
      text(page, chars[i], (xs[c] + xs[c + 1]) / 2 - w / 2, baseline, size);
    }
  };

  const tick = (page: PDFPage, box: Box) => {
    const [x0, y0, x1, y1] = box;
    const w = x1 - x0;
    const h = y1 - y0;
    const pt = (px: number, py: number) => ({ x: x0 + px * w, y: PAGE_H - (y0 + py * h) });
    page.drawLine({ start: pt(0.2, 0.55), end: pt(0.42, 0.85), thickness: 1.8, color: INK });
    page.drawLine({ start: pt(0.42, 0.85), end: pt(0.88, 0.12), thickness: 1.8, color: INK });
  };

  // ---------- Page 1 ----------
  const refText = formText(ref);
  const refSize = 9;
  text(p1, refText, 517 - font.widthOfTextAtSize(refText, refSize), 92, refSize);

  const caw = formText(d.cawangan).replace(/^N\./, "").trim(); // the form already prints "N."
  field(p1, caw, 127, 166.5, 275, 11);
  field(p1, d.rantingNo, 106, 191, 295, 11);
  const nama = formText(d.nama).replace(/\s+/g, " ").trim();
  if (font.widthOfTextAtSize(nama, 8.5) <= 295) field(p1, nama, 106, 220, 295, 12, 8.5);
  else {
    // Very long name: two lines in the Nama box instead of cutting it off.
    const lines = wrap(font, nama, 9, 295);
    lines.slice(0, 2).forEach((ln, i) => text(p1, ln, 106, 213 + i * 11, 9));
  }

  const dob = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d.tarikhLahir.trim());
  const dobDigits = dob ? dob[3] + dob[2] + dob[1] : digitsOf(d.tarikhLahir).slice(0, 8);
  cells(p1, DOB_X, dobDigits, [0, 1, 3, 4, 6, 7, 8, 9], 268);

  field(p1, d.tempatLahir, 104, 304, 186, 10.5);
  if (d.jantina) tick(p1, TICK.jantina[d.jantina]);

  const ic = digitsOf(d.noKadPengenalan);
  if (d.icLama && !d.icBaru) cells(p1, IC_LAMA_X, ic.slice(0, 7), [1, 2, 3, 4, 5, 6, 7], 406);
  else cells(p1, IC_BARU_X, ic.slice(0, 12), [0, 1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13], 371);

  if (d.agama) {
    tick(p1, TICK.agama[d.agama]);
    if (d.agama === "lain") field(p1, d.agamaLain, 366, 293.5, 138, 9.5);
  }
  const bangsaBox = (TICK.bangsa as Record<string, Box>)[d.bangsa];
  if (bangsaBox) {
    tick(p1, bangsaBox);
    if (d.bangsa === "lain") field(p1, d.bangsaLain, 366, 405.5, 140, 9.5);
  }

  block(p1, d.alamatRumah, 42, 466, 247, 574);
  block(p1, d.alamatPejabat, 42, 624, 247, 710);

  if (d.pekerjaan) {
    tick(p1, TICK.pekerjaan[d.pekerjaan]);
    field(p1, d.pekerjaanNyata, 378, PEKERJAAN_LINE[d.pekerjaan], 128, 9);
  }

  const rumah = digitsOf(d.telRumah);
  cells(p1, TEL_X, rumah.slice(0, 9), [0, 1, 2, 4, 5, 6, 7, 8, 9], 616, 11);
  const pejabat = digitsOf(d.telPejabat);
  cells(p1, TEL_X, pejabat.slice(0, 9), [0, 1, 2, 4, 5, 6, 7, 8, 9], 647, 11);
  const bimbit = digitsOf(d.telBimbit);
  cells(p1, BIMBIT_X, bimbit.slice(0, 12), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], 682, 11);
  field(p1, d.email.toLowerCase(), 340, 709, 174, 10, 5.5);

  // ---------- Page 2 ----------
  const parlimen = /(\d{1,3})/.exec(d.kawasanParlimen)?.[1] ?? "";
  if (parlimen) cells(p2, PARLIMEN_X, parlimen.padStart(3, "0"), [1, 2, 3], 58);
  const negeri = /(\d{1,2})/.exec(d.kawasanNegeri)?.[1] ?? "";
  if (negeri) cells(p2, NEGERI_X, negeri.padStart(2, "0"), [1, 2], 89);
  if (d.kategoriAhli) tick(p2, TICK.kategori[d.kategoriAhli]);

  pdf.setTitle(`Borang Permohonan Keahlian PBB - ${ref}`);
  return pdf.save();
}
