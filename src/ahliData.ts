import { CAWANGAN_OPTIONS } from "./cawanganOptions";

export type AhliRow = {
  id: string;
  /** Matches `CAWANGAN_OPTIONS` entry */
  cawangan: string;
  name: string;
  phone?: string;
};

/** Perwakilan Belia mengikut DUN — nama daripada senarai rasmi yang dibekalkan. */
const ROSTER: Partial<Record<string, { name: string; phone?: string }>> = {
  "N.1 OPAR": { name: "Farlee Feoline Anak Henry" },
  "N.2 TASIK BIRU": { name: "Devick Fridson Anak Akiat" },
  "N.3 TANJUNG DATU": { name: "Abdul Rauf Bin Jaidi" },
  "N.4 PANTAI DAMAI": { name: "Nurashniza Ashwin Binti Usin" },
  "N.5 DEMAK LAUT": { name: "Luckman Bin Abdullah" },
  "N.6 TUPONG": { name: "Mohamad Harith Leman Bin Sulhie" },
  "N.7 SAMARIANG": { name: "Muhammad Izzul Zikri Bin Khasri" },
  "N.8 SATOK": { name: "Muhammad Zhariff Bin Azahari" },
  "N.9 PADUNGAN": { name: "Azrina Binti Hassan" },
  "N.10 PENDING": { name: "Afza Iffahnasuha Binti Ibrahim" },
  "N.11 BATU LINTANG": { name: "Mohd Nazirin Bin Abdul Rahman" },
  "N.12 KOTA SENTOSA": { name: "Zaim Danish Beqir Bin Mahmud" },
  "N.13 BATU KITANG": { name: "Saefudeen Omar Al-fatah Bin Mahmud" },
  "N.14 BATU KAWAH": { name: "Muhammad Tauriq Chayanne Bin Ahmad" },
  "N.15 ASAJAYA": { name: "Ruhaizam Bin Adnan Mataim" },
  "N.16 MUARA TUANG": { name: "Mohd Nazri Bin Raiee" },
  "N.17 STAKAN": { name: "Syaza Noreen Belinda" },
  "N.18 SEREMBU": { name: "Gerald Luna Anak Willie" },
  "N.19 MAMBONG": { name: "Borhan Moses Anak Bowi" },
  "N.20 TARAT": { name: "Adrian Anak Albert" },
  "N.21 TEBEDU": { name: "Karlmann Satok Anak Kemin" },
  "N.22 KEDUP": { name: "Stanislaus Anak Thadeus" },
  "N.23 BUKIT SEMUJA": { name: "Christoper Anak Romes" },
  "N.24 SADONG JAYA": { name: "Muhammad Yazid Bin Abang" },
  "N.25 SIMUNJAN": { name: "Shafiq Bin Yusuf" },
  "N.26 GEDONG": { name: "Amirul Mukminin Bin Ramlee" },
  "N.27 SEBUYAU": { name: "Wan Nur Hafiz Bin Wan Ahmad Zaini" },
  "N.28 LINGGA": { name: "Shahrul Najid Bin Loupall" },
  "N.29 BETING MARO": { name: "Faradilla Binti Sabang" },
  "N.30 BALAI RINGIN": { name: "Willy Anak Winigy" },
  "N.31 BUKIT BEGUNAN": { name: "Adelly July Anak Jimun" },
  "N.32 SIMANGGANG": { name: "Azhri Bin Ramzie" },
  "N.33 ENGKILILI": { name: "Nicholas Nyambong Anak Alam" },

  /* N.34–N.68: tambah nama / telefon daripada spreadsheet anda di sini. */
  "N.69 KEMENA": { name: "Syazrul Sya'arani Bin Sophie" },
  "N.70 SAMALAJU": { name: "Franky Erly Roma Anak Stephen" },
  "N.71 BEKENU": { name: "Mohd Shahrul Izzan Bin Rabaha" },
  "N.72 LAMBIR": { name: "Muhammad Nabil Najwan Bin Yasin" },
  "N.73 PIASAU": { name: "Mohammad Aniq Ashwin Bin Abuzar" },
  "N.74 PUJUT": { name: "Mohamad Rafi Kamarudin" },
  "N.75 SENADIN": { name: "Mohd Syazwan Bin Yusuf" },
  "N.76 MARUDI": { name: "Mohamad Aris Fadilah Bin Mohamad Khamis" },
  "N.77 TELANG USAN": { name: "Spanski Steven" },
  "N.78 MULU": { name: "Debbie Robin" },
  "N.79 BUKIT KOTA": { name: "Awangku Muhammad Dzulbazli Bin Awangku Abdul Razak" },
  "N.80 BATU DANAU": { name: "Patricia Bunga Bangau" },
  "N.81 BA'KELALAN": { name: "Roger Sum Anak Sulau" },
  "N.82 BUKIT SARI": { name: "Mohammad Sahrell Mehran Bin Morshidi" },
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
