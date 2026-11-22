import { CAWANGAN_OPTIONS } from "./cawanganOptions";

export type AhliRow = {
  id: string;
  /** Matches `CAWANGAN_OPTIONS` entry */
  cawangan: string;
  name: string;
  phone?: string;
};

/** Ketua Belia Cawangan mengikut DUN — Senarai_KB_Cawangan_Belia_PBB_Sarawak.xlsx (2025/27). */
const ROSTER: Partial<Record<string, { name: string; phone?: string }>> = {
  "N.1 OPAR": { name: "Farlee Feoline Anak Henry" },
  "N.2 TASIK BIRU": { name: "Devick Fridson Anak Akiat", phone: "0109629556" },
  "N.3 TANJUNG DATU": { name: "Abdul Rauf Bin Jaidi", phone: "01114084340" },
  "N.4 PANTAI DAMAI": { name: "Nurashniza Ashwin Binti Usin", phone: "0138023257" },
  "N.5 DEMAK LAUT": { name: "Luckman Bin Abdullah" },
  "N.6 TUPONG": { name: "Mohamad Harith Ieman Bin Sulhie", phone: "01114081534" },
  "N.7 SAMARIANG": { name: "Muhammad Izzul Zikri Bin Khasri" },
  "N.8 SATOK": { name: "Muhammad Zhariff Bin Azahari", phone: "0198659521" },
  "N.9 PADUNGAN": { name: "Azrina Binti Hassan", phone: "0146963534" },
  "N.10 PENDING": { name: "Afza Iffahnasuha Binti Ibrahim", phone: "0104303560" },
  "N.11 BATU LINTANG": { name: "Mohd Nazirin Bin Abdul Rahman", phone: "0106810923" },
  "N.12 KOTA SENTOSA": { name: "Zaim Danish Beqir Bin Mahmud", phone: "0194387997" },
  "N.13 BATU KITANG": { name: "Saefudeen Omar Al-fatah Bin Mahmud", phone: "0138117997" },
  "N.14 BATU KAWAH": { name: "Muhammad Tauriq Chayanne Bin Ahmad", phone: "0193253133" },
  "N.15 ASAJAYA": { name: "Ruhaizam Bin Adnan Mataim" },
  "N.16 MUARA TUANG": { name: "Mohd Nazri Bin Raiee" },
  "N.17 STAKAN": { name: "Syaza Noreen Belinda", phone: "01123086773" },
  "N.18 SEREMBU": { name: "Gerald Luna Anak Willie", phone: "01131506190" },
  "N.19 MAMBONG": { name: "Borhan Moses Anak Bowi", phone: "01125113074" },
  "N.20 TARAT": { name: "Adrian Anak Albert", phone: "01133681732" },
  "N.21 TEBEDU": { name: "Karlmann Satok Anak Kemin", phone: "0109338036" },
  "N.22 KEDUP": { name: "Stanislaus Anak Thadeus", phone: "0138262621" },
  "N.23 BUKIT SEMUJA": { name: "Christoper Anak Romes", phone: "01114086508" },
  "N.24 SADONG JAYA": { name: "Muhammad Yazid Bin Abang", phone: "01133645407" },
  "N.25 SIMUNJAN": { name: "Shafiq Bin Yusuf" },
  "N.26 GEDONG": { name: "Amirul Mukminin Bin Ramlee", phone: "0146877805" },
  "N.27 SEBUYAU": { name: "Wan Nur Hafiz Bin Wan Ahmad Zaini" },
  "N.28 LINGGA": { name: "Shahrul Najid Bin Loupall", phone: "0178594842" },
  "N.29 BETING MARO": { name: "Faradilla Binti Sabang", phone: "0105957108" },
  "N.30 BALAI RINGIN": { name: "Willy Anak Winigy" },
  "N.31 BUKIT BEGUNAN": { name: "Adelly July Anak Jimun", phone: "0142065854" },
  "N.32 SIMANGGANG": { name: "Azhri Bin Ramzie", phone: "0136599012" },
  "N.33 ENGKILILI": { name: "Nicholas Nyambong Anak Alam", phone: "0135728869" },
  "N.34 BATANG AI": { name: "Willy Anak Kunsil", phone: "01125021947" },
  "N.35 SARIBAS": { name: "Abang Ikqmal Hafiq Bin Abang Jolhardi", phone: "0137684162" },
  "N.36 LAYAR": { name: "Clement Lasu Anak Jhon Jingan" },
  "N.37 BUKIT SABAN": { name: "Henry Melaka Anak Unong", phone: "0163192257" },
  "N.38 KALAKA": { name: "Azizan Bin Jamat @ Jamain", phone: "0198597083" },
  "N.39 KRIAN": { name: "Gilbert Dunggat Anak Aji @ Thomas Sigat" },
  "N.40 KABONG": { name: "Mohamad Firdaus Bin Shamsudin", phone: "01131830142" },
  "N.41 KUALA RAJANG": { name: "Muhammad Mas Adra Bin Masaad", phone: "0135776237" },
  "N.42 SEMOP": { name: "Khaira Amirah Binti Rezemi", phone: "0145944336" },
  "N.43 DARO": { name: "Mohd Haiqal Aiman Bin Saadi" },
  "N.44 JEMORENG": { name: "Muhamad Azhan Fikry Bin Yusop" },
  "N.45 REPOK": { name: "Dayang Nur Atiqah Zainirra Binti Awang Zaini" },
  "N.46 MERADONG": { name: "Muhamad Shafiq Bin Abu Bakar" },
  "N.47 PAKAN": { name: "Hendy Martin Unddy Anak Alfred Ullok", phone: "0192477649" },
  "N.48 MELUAN": { name: "Herdtzson Welbvertz Anak Awi", phone: "01123892940" },
  "N.49 NGEMAH": { name: "Rowan Roseles Anak Medan", phone: "0192298194" },
  "N.50 MACHAN": { name: "Irvine Fernandus Anak Nelly" },
  "N.51 BUKIT ASSEK": { name: "Fathi Munawwir Batuk Hj Mohamad Yusnar" },
  "N.52 DUDONG": { name: "Mohd Hafiszul Firdaus Bin Ahmad Nasfu", phone: "0132759676" },
  "N.53 BAWANG ASSAN": { name: "Wilson Kasulai Anak William", phone: "0169429495" },
  "N.54 PELAWAN": { name: "Syed Mohd Asyraf Wan Hashim" },
  "N.55 NANGKA": { name: "Syed Mohd Ammar Bin Wan Hashim", phone: "0126990423" },
  "N.56 DALAT": { name: "Muhammad Nur Syafiq Wong Bin Muhammad Nur Amirul Iskandar" },
  "N.57 TELLIAN": { name: "Mohamad Safiq Bin Mohd Nuruddin" },
  "N.58 BALINGIAN": { name: "Mohamad Nurfitri Bin Jaidil" },
  "N.59 TAMIN": { name: "Lawrence Alen Anak Gregory" },
  "N.60 KAKUS": { name: "Fildannis Anak Anggot", phone: "01116856301" },
  "N.61 PELAGUS": { name: "Mclarence Jugah Anak James", phone: "0148801915" },
  "N.62 KATIBAS": { name: "Gilbert Ubam Law", phone: "0138067159" },
  "N.63 BUKIT GORAM": { name: "Diego Priestly Anak Pasang", phone: "0148899954" },
  "N.64 BALEH": { name: "Reily Repai Anak Meringai", phone: "0198376078" },
  "N.65 BELAGA": { name: "Ambrose Asa James" },
  "N.66 MURUM": { name: "Timothy Sebuang Dian" },
  "N.67 JEPAK": { name: "Umi Nazatul Syuhadah Binti Narudin", phone: "01136626282" },
  "N.68 TANJONG BATU": { name: "Syazrul Sya'arani Bin Sophie" },
  "N.69 KEMENA": { name: "Allan Lebong Anak Jimun", phone: "0197487701" },
  "N.70 SAMALAJU": { name: "Franky Erly Roma Anak Stephen", phone: "01136769316" },
  "N.71 BEKENU": { name: "Mohd Shahrul Izzan Bin Rabaha", phone: "01110362856" },
  "N.72 LAMBIR": { name: "Muhammad Nabil Najwan Bin Yasin" },
  "N.73 PIASAU": { name: "Mohammad Aniq Ashwin Bin Abuzar", phone: "0168871060" },
  "N.74 PUJUT": { name: "Mohamad Rafi Kamarudin" },
  "N.75 SENADIN": { name: "Mohd Syazwan Bin Yusuf" },
  "N.76 MARUDI": { name: "Mohamad Aris Fadilah Bin Mohamad Khamis" },
  "N.77 TELANG USAN": { name: "Spanski Steven", phone: "0132336929" },
  "N.78 MULU": { name: "Debbie Robin", phone: "0133611216" },
  "N.79 BUKIT KOTA": { name: "Mohamad Adzri Adrus" },
  "N.80 BATU DANAU": { name: "Patricia Bunga Bangau", phone: "0198742067" },
  "N.81 BA'KELALAN": { name: "Roger Sum Anak Sulau", phone: "0136395968" },
  "N.82 BUKIT SARI": { name: "Mohammad Sahrell Mehran Bin Morshidi", phone: "0136526043" },
};

export function getAhliRows(): AhliRow[] {
  return CAWANGAN_OPTIONS.map((cawangan, i) => {
    const r = ROSTER[cawangan];
    return {
      id: `dun-${i + 1}`,
      cawangan,
      name: r?.name ?? "",
      phone: r?.phone,
    };
  });
}
