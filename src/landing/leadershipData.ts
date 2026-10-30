import type { SocialPlatform } from "../FooterSocialIcons";

export type CouncilSocials = Partial<Record<Exclude<SocialPlatform, "discord">, string>>;

export type CouncilMember = {
  /** Position as it should appear, e.g. "Ketua" */
  position: string;
  name: string;
  /** Matches a `CAWANGAN_OPTIONS` entry */
  cawangan: string;
  /** Image URL, or a file in public/kepimpinan/ (e.g. "ketua.jpg"); a grey placeholder is shown when missing */
  photo?: string;
  /** Profile URLs, shown as small icons under the position. WhatsApp only with the
      person's consent to share their number publicly — use `whatsappHref`. */
  socials?: CouncilSocials;
};

/**
 * Jawatankuasa Protem Belia PBB Sarawak 2025/27, in order of seniority. The live copy is
 * the Google Sheet read by `sheetSync.ts`; this bundled copy is the fallback.
 */
export const MAJLIS_TERTINGGI: CouncilMember[] = [
  { position: "Ketua", name: "Muhammad Nur Syafiq Wong Bin Muhammad Nur Amirul Iskandar", cawangan: "N.56 DALAT" },
  { position: "Timbalan Ketua", name: "Aaron Nagai", cawangan: "N.23 BUKIT SEMUJA", photo: "aaron-nagai.jpg" },
  { position: "Timbalan Ketua", name: "Nurashniza Ashwin Binti Usin", cawangan: "N.4 PANTAI DAMAI" },
  { position: "Naib Ketua", name: "Henry Melaka Anak Unong", cawangan: "N.37 BUKIT SABAN" },
  { position: "Naib Ketua", name: "Debbie Robin", cawangan: "N.78 MULU" },
  { position: "Naib Ketua", name: "Syed Mohd Ammar Bin Wan Hashim", cawangan: "N.55 NANGKA" },
  { position: "Setiausaha", name: "Mohammad Aniq Ashwin Bin Abuzar", cawangan: "N.73 PIASAU" },
  { position: "Pen Setiausaha", name: "Muhammad Zhariff Bin Azahari", cawangan: "N.8 SATOK" },
  { position: "Pen Setiausaha", name: "Diego Priestly Anak Pasang", cawangan: "N.63 BUKIT GORAM" },
  { position: "Bendahari", name: "Patricia Bunga Bangau", cawangan: "N.80 BATU DANAU" },
  { position: "Pen Bendahari", name: "Muhammad Mas Adra Bin Masaad", cawangan: "N.41 KUALA RAJANG" },
  { position: "Ketua Penerangan", name: "Mohamad Harith Ieman Bin Sulhie", cawangan: "N.6 TUPONG" },
  { position: "Pen Ketua Penerangan", name: "Allan Lebong Anak Jimun", cawangan: "N.69 KEMENA" },
  { position: "Ahli Exco", name: "Adelly July Anak Jimun", cawangan: "N.31 BUKIT BEGUNAN" },
  { position: "Ahli Exco", name: "Azhri Bin Ramzie", cawangan: "N.32 SIMANGGANG" },
  { position: "Ahli Exco", name: "Nicholas Nyambong Anak Alam", cawangan: "N.33 ENGKILILI" },
  { position: "Ahli Exco", name: "Willy Anak Kunsil", cawangan: "N.34 BATANG AI" },
  { position: "Ahli Exco", name: "Abang Ikqmal Hafiq Bin Abang Jolhardi", cawangan: "N.35 SARIBAS" },
  { position: "Ahli Exco", name: "Azizan Bin Jamat @ Jamain", cawangan: "N.38 KALAKA" },
  { position: "Ahli Exco", name: "Mohamad Firdaus Bin Shamsudin", cawangan: "N.40 KABONG" },
  { position: "Ahli Exco", name: "Khaira Amirah Binti Rezemi", cawangan: "N.42 SEMOP" },
  { position: "Ahli Exco", name: "Hendy Martin Unddy Anak Alfred Ullok", cawangan: "N.47 PAKAN", photo: "hendy-martin.jpg" },
  { position: "Ahli Exco", name: "Herdtzson Welbvertz Anak Awi", cawangan: "N.48 MELUAN", photo: "herdtzson-welbvertz.jpg" },
  { position: "Ahli Exco", name: "Rowan Roseles Anak Medan", cawangan: "N.49 NGEMAH" },
  { position: "Ahli Exco", name: "Mohd Hafiszul Firdaus Bin Ahmad Nasfu", cawangan: "N.52 DUDONG" },
  { position: "Ahli Exco", name: "Wilson Kasulai Anak William", cawangan: "N.53 BAWANG ASSAN" },
  { position: "Ahli Exco", name: "Lawrence Alen Anak Gregory", cawangan: "N.59 TAMIN" },
  { position: "Ahli Exco", name: "Mclarence Jugah Anak James", cawangan: "N.61 PELAGUS" },
  { position: "Ahli Exco", name: "Gilbert Ubam Law", cawangan: "N.62 KATIBAS" },
  { position: "Ahli Exco", name: "Reily Repai Anak Meringai", cawangan: "N.64 BALEH" },
  { position: "Ahli Exco", name: "Abdul Rauf Bin Jaidi", cawangan: "N.3 TANJUNG DATU" },
  { position: "Ahli Exco", name: "Azrina Binti Hassan", cawangan: "N.9 PADUNGAN" },
  { position: "Ahli Exco", name: "Afza Iffahnasuha Binti Ibrahim", cawangan: "N.10 PENDING" },
  { position: "Ahli Exco", name: "Muhammad Tauriq Chayanne Bin Ahmad", cawangan: "N.14 BATU KAWAH" },
  { position: "Ahli Exco", name: "Syaza Noreen Belinda", cawangan: "N.17 STAKAN" },
  { position: "Ahli Exco", name: "Gerald Luna Anak Willie", cawangan: "N.18 SEREMBU" },
  { position: "Ahli Exco", name: "Borhan Moses Anak Bowi", cawangan: "N.19 MAMBONG" },
  { position: "Ahli Exco", name: "Adrian Anak Albert", cawangan: "N.20 TARAT" },
  { position: "Ahli Exco", name: "Stanislaus Anak Thadeus", cawangan: "N.22 KEDUP" },
  { position: "Ahli Exco", name: "Christoper Anak Romes", cawangan: "N.23 BUKIT SEMUJA" },
  { position: "Ahli Exco", name: "Muhammad Yazid Bin Abang", cawangan: "N.24 SADONG JAYA" },
  { position: "Ahli Exco", name: "Amirul Mukminin Bin Ramlee", cawangan: "N.26 GEDONG" },
  { position: "Ahli Exco", name: "Fildannis Anak Anggot", cawangan: "N.60 KAKUS" },
  { position: "Ahli Exco", name: "Umi Nazatul Syuhadah Binti Narudin", cawangan: "N.67 JEPAK" },
  { position: "Ahli Exco", name: "Mohammad Shahrul Izzan Bin Rabaha", cawangan: "N.71 BEKENU" },
  { position: "Ahli Exco", name: "Spanski Steven", cawangan: "N.77 TELANG USAN" },
  { position: "Ahli Exco", name: "Roger Sum Anak Sulau", cawangan: "N.81 BA'KELALAN" },
  { position: "Ahli Exco", name: "Mohammad Sahrell Mehran Bin Morshidi", cawangan: "N.82 BUKIT SARI" },
];

/** "013-827 1227" → "https://wa.me/60138271227" (Malaysian mobile, leading 0 dropped). */
export function whatsappHref(phone: string) {
  const digits = phone.replace(/\D/g, "").replace(/^(60|0)/, "");
  return `https://wa.me/60${digits}`;
}
