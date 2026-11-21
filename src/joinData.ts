import type { MessageKey } from "./i18n";

export const PARLIMEN_SARAWAK_OPTIONS = [
  "P.192 MAS GADING",
  "P.193 SANTUBONG",
  "P.194 PETRA JAYA",
  "P.195 BANDAR KUCHING",
  "P.196 STAMPIN",
  "P.197 KOTA SAMARAHAN",
  "P.198 PUNCAK BORNEO",
  "P.199 SERIAN",
  "P.200 BATANG SADONG",
  "P.201 BATANG LUPAR",
  "P.202 SRI AMAN",
  "P.203 LUBOK ANTU",
  "P.204 BETONG",
  "P.205 SARATOK",
  "P.206 TANJONG MANIS",
  "P.207 IGAN",
  "P.208 SARIKEI",
  "P.209 JULAU",
  "P.210 KANOWIT",
  "P.211 LANANG",
  "P.212 SIBU",
  "P.213 MUKAH",
  "P.214 SELANGAU",
  "P.215 KAPIT",
  "P.216 HULU RAJANG",
  "P.217 BINTULU",
  "P.218 SIBUTI",
  "P.219 MIRI",
  "P.220 BARAM",
  "P.221 LIMBANG",
  "P.222 LAWAS",
] as const;

export const BANGSA_VALUES = [
  "melayu_melanau",
  "iban",
  "kedayan",
  "bidayuh",
  "kayan",
  "kelabit",
  "kenyah",
  "lun_bawang",
  "lain",
] as const;

export type BangsaVal = (typeof BANGSA_VALUES)[number];

export const BANGSA_MSG: Record<BangsaVal, MessageKey> = {
  melayu_melanau: "applicationBangsa_melayu_melanau",
  iban: "applicationBangsa_iban",
  kedayan: "applicationBangsa_kedayan",
  bidayuh: "applicationBangsa_bidayuh",
  kayan: "applicationBangsa_kayan",
  kelabit: "applicationBangsa_kelabit",
  kenyah: "applicationBangsa_kenyah",
  lun_bawang: "applicationBangsa_lun_bawang",
  lain: "applicationBangsa_lain",
};

export type Draft = {
  cawangan: string;
  rantingNo: string;
  nama: string;
  tarikhLahir: string;
  agama: "" | "islam" | "kristian" | "lain";
  agamaLain: string;
  bangsa: BangsaVal | "";
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
  pengakuan: boolean;
  pencadangNama: string;
  pencadangIc: string;
  pencadangJawatan: string;
  penyokongNama: string;
  penyokongIc: string;
  penyokongJawatan: string;
};

