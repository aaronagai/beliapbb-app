import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Language = "ms" | "en";

const PROFILE_STORAGE_KEY = "beliapbb_profile";

export const messages = {
  ms: {
    navHome: "Utama",
    navMembers: "Ahli",
    navResources: "Sumber",
    navProfile: "Profil",
    navMain: "Navigasi utama",
    back: "Kembali",
    membersTitle: "Ahli",
    profileTitle: "Profil",
    greetingHey: "Hai, {{name}}! 👋",
    latestNews: "Berita terkini",
    jiwaBaktiLink: "Jiwa Bakti",
    newsSeeMore: "Lihat lagi",
    newsLoadError: "Tidak dapat memuat berita. Cuba lagi.",
    newsSource: "Jiwa Bakti",
    membersListAria: "Senarai ahli",
    membersSearchPlaceholder: "Cari nama atau kawasan…",
    memberPending: "Maklumat akan dikemas kini",
    membersNoResults: "Tiada padanan",
    resourcesSectionAria: "Sumber",
    resourcesConstitutionHint: "Dokumen PDF · ketik untuk buka",
    profileSectionAria: "Profil",
    profilePhotoAria: "Tambah atau tukar foto profil",
    profilePhotoHint: "Ketik bulatan untuk tambah foto",
    profileName: "Nama",
    profileNamePlaceholder: "Nama anda",
    profileCawangan: "Cawangan",
    profileCawanganSelect: "Pilih cawangan",
    languageLabel: "Bahasa",
    sheetDragAria: "Seret untuk naik atau turun: Sayap Parti",
    kenaliParti: "Kenali Parti",
    sayapParti: "Sayap Parti",
    kenaliAbout: "Tentang",
    kenaliApply: "Mohon",
    kenaliConstitution: "Perlembagaan",
    kenaliStructure: "Struktur",
    fabAria: "Bantuan AI Perlembagaan",
    constitutionChatTitle: "Perlembagaan · AI",
    constitutionChatCloseAria: "Tutup",
    constitutionChatPlaceholder: "Tanya tentang perlembagaan…",
    constitutionChatSend: "Hantar",
    constitutionChatDisclaimer:
      "Jawapan berdasarkan teks Perlembagaan yang disimpan; ia bukan nasihat undang-undang. Semak dokumen rasmi jika perlu.",
    constitutionChatEmpty: "Contoh: Apakah syarat menjadi ahli?",
    constitutionChatUnavailable:
      "Sembang AI tidak tersedia pada URL ini. Tetapkan API sembang atau gunakan npm run dev:full secara tempatan.",
    constitutionChatLoading: "Sedang menjawab…",
    constitutionChatErrorGeneric: "Ralat rangkaian atau pelayan.",
    constitutionChatNoReply: "Tiada jawapan",
    logoAlt: "Logo PBB",
    profileSave: "Simpan profil",
    profileSaved: "Profil disimpan",
    profileCreditLead: "Aplikasi web ini dibangunkan oleh",
    profileCreditHandleAria: "@aaronagai di LinkedIn",
    applicationTitle: "Permohonan keahlian PBB",
    applicationSubtitle:
      "Isi borang ini mengikut keterangan dalam BORANG PERMOHONAN KEAHLIAN PBB (huruf besar jika diperlukan). Data disimpan pada peranti anda sehingga dihantar ke cawangan.",
    applicationDownloadBlank: "Muat turun borang PDF rasmi",
    applicationSectionIdentity: "Butiran peribadi",
    applicationSectionAddress: "Alamat & pekerjaan",
    applicationSectionContact: "Hubungan",
    applicationSectionElectoral: "Kawasan pilihan raya",
    applicationSectionCategory: "Kategori ahli",
    applicationSectionProposer: "Pencadang & penyokong",
    applicationSectionDeclaration: "Pengakuan",
    applicationLblCawangan: "Cawangan",
    applicationLblRantingNo: "No. ranting",
    applicationLblNamaIc: "Nama (seperti dalam kad pengenalan)",
    applicationLblTarikhLahir: "Tarikh lahir",
    applicationLblAgama: "Agama",
    applicationLblBangsa: "Bangsa",
    applicationLblNyatakan: "Nyatakan",
    applicationLblTempatLahir: "Tempat lahir",
    applicationLblJantina: "Jantina",
    applicationLblIcNo: "No. kad pengenalan",
    applicationLblIcBaru: "Baru",
    applicationLblIcLama: "Lama",
    applicationIcHint: "* Wajib diisi lengkap mengikut borang rasmi.",
    applicationLblAlamatRumah: "Alamat kediaman / rumah",
    applicationLblAlamatPejabat: "Alamat pejabat",
    applicationLblPekerjaan: "Pekerjaan",
    applicationLblTelRumah: "No. telefon rumah",
    applicationLblTelPejabat: "No. telefon pejabat",
    applicationLblTelBimbit: "No. telefon bimbit",
    applicationLblEmail: "E-mel",
    applicationLblKawasanParlimen: "Kawasan parlimen",
    applicationLblKawasanNegeri: "Kawasan negeri",
    applicationLblKategoriAhli: "Kategori ahli",
    applicationLblProposerName: "Pencadang — nama",
    applicationLblProposerIc: "Pencadang — no. kad pengenalan",
    applicationLblProposerJawatan: "Pencadang — jawatan",
    applicationLblSupporterName: "Penyokong — nama",
    applicationLblSupporterIc: "Penyokong — no. kad pengenalan",
    applicationLblSupporterJawatan: "Penyokong — jawatan",
    applicationOptAgamaIslam: "Islam",
    applicationOptAgamaKristian: "Kristian",
    applicationOptAgamaLain: "Lain-lain",
    applicationOptJantinaLelaki: "Lelaki",
    applicationOptJantinaPerempuan: "Perempuan",
    applicationOptPekerjaan_kerajaan: "Kerajaan",
    applicationOptPekerjaan_swasta: "Swasta",
    applicationOptPekerjaan_sendiri: "Sendiri",
    applicationOptPekerjaan_lain: "Lain-lain",
    applicationOptKategori_induk: "Induk",
    applicationOptKategori_belia: "Belia",
    applicationOptKategori_wanita: "Wanita",
    applicationOptKategori_pemuda: "Pemuda",
    applicationOptParlimenSelect: "Pilih kawasan parlimen (Sarawak)",
    applicationOptDunSelect: "Pilih kawasan DUN (Sarawak)",
    applicationBangsaSelect: "Pilih bangsa",
    applicationBangsa_melayu_melanau: "Melayu / Melanau",
    applicationBangsa_iban: "Iban",
    applicationBangsa_kedayan: "Kedayan",
    applicationBangsa_bidayuh: "Bidayuh",
    applicationBangsa_kayan: "Kayan",
    applicationBangsa_kelabit: "Kelabit",
    applicationBangsa_kenyah: "Kenyah",
    applicationBangsa_lun_bawang: "Lun Bawang",
    applicationBangsa_lain: "Lain-lain",
    applicationProposerHint:
      "Ruangan pencadang dan penyokong dipaparkan seperti di borang rasmi tetapi dilengkapkan oleh cawangan / ibu pejabat — tidak diisi dalam borang digital ini.",
    applicationDeclarationBody:
      "Saya memohon menjadi ahli Parti Pesaka Bumiputera Bersatu Sarawak. Jika diterima, saya sanggup mematuhi undang-undang pertubuhan PBB seperti dalam Perlembagaan, dan mengaku bukan ahli parti lain. Saya mengaku semua keterangan di atas adalah benar.",
    applicationDeclarationCheckbox: "Saya bersetuju dengan pengakuan di atas.",
    applicationOfficeNote:
      "Ruangan untuk kegunaan cawangan / ibu pejabat (mesyuarat, cop, semakan) tidak diisi dalam borang digital ini — lengkapkan pada salinan PDF bercetak jika diperlukan.",
    applicationSubmitBtn: "Simpan permohonan (peranti ini)",
    applicationSubmitDone:
      "Permohonan disimpan pada pelayar anda. Muat turun borang rasmi, cetak, dan serahkan kepada cawangan bersama dokumen sokongan.",
    membershipCardAria: "Pratontak kad ahli Belia PBB",
    membershipCardBadge: "Belia PBB",
    membershipCardTitle: "Kad ahli",
  },
  en: {
    navHome: "Home",
    navMembers: "Members",
    navResources: "Resources",
    navProfile: "Profile",
    navMain: "Main navigation",
    back: "Back",
    membersTitle: "Members",
    profileTitle: "Profile",
    greetingHey: "Hey, {{name}}! 👋",
    latestNews: "Latest News",
    jiwaBaktiLink: "Jiwa Bakti",
    newsSeeMore: "See more",
    newsLoadError: "Could not load news. Please try again.",
    newsSource: "Jiwa Bakti",
    membersListAria: "Member list",
    membersSearchPlaceholder: "Search name or constituency…",
    memberPending: "Details coming soon",
    membersNoResults: "No matches",
    resourcesSectionAria: "Resources",
    resourcesConstitutionHint: "PDF · tap to open",
    profileSectionAria: "Profile",
    profilePhotoAria: "Add or change profile photo",
    profilePhotoHint: "Tap circle to add photo",
    profileName: "Name",
    profileNamePlaceholder: "Your name",
    profileCawangan: "Cawangan",
    profileCawanganSelect: "Select cawangan",
    languageLabel: "Language",
    sheetDragAria: "Drag up or down: Sayap Parti",
    kenaliParti: "Kenali Parti",
    sayapParti: "Sayap Parti",
    kenaliAbout: "About",
    kenaliApply: "Apply",
    kenaliConstitution: "Constitution",
    kenaliStructure: "Structure",
    fabAria: "Constitution AI assistant",
    constitutionChatTitle: "Constitution · AI",
    constitutionChatCloseAria: "Close",
    constitutionChatPlaceholder: "Ask about the constitution…",
    constitutionChatSend: "Send",
    constitutionChatDisclaimer:
      "Answers are based on stored constitution text only — not legal advice. Refer to the official document when it matters.",
    constitutionChatEmpty: "Try: What are the membership requirements?",
    constitutionChatUnavailable:
      "Chat is not configured for this URL. Deploy the API (see repo) or run npm run dev:full locally.",
    constitutionChatLoading: "Thinking…",
    constitutionChatErrorGeneric: "Network or server error.",
    constitutionChatNoReply: "No reply",
    logoAlt: "PBB logo",
    profileSave: "Save profile",
    profileSaved: "Profile saved",
    profileCreditLead: "This webapp is developed by",
    profileCreditHandleAria: "@aaronagai on LinkedIn",
    applicationTitle: "PBB membership application",
    applicationSubtitle:
      "Complete this form based on the official BORANG PERMOHONAN KEAHLIAN PBB (use capitals where the form requires). Data is stored on this device until you hand it in at a branch.",
    applicationDownloadBlank: "Download official PDF form",
    applicationSectionIdentity: "Personal details",
    applicationSectionAddress: "Address & employment",
    applicationSectionContact: "Contact",
    applicationSectionElectoral: "Electoral areas",
    applicationSectionCategory: "Membership category",
    applicationSectionProposer: "Proposer & supporter",
    applicationSectionDeclaration: "Declaration",
    applicationLblCawangan: "Branch (cawangan)",
    applicationLblRantingNo: "Ranting no.",
    applicationLblNamaIc: "Full name (as on ID card)",
    applicationLblTarikhLahir: "Date of birth",
    applicationLblAgama: "Religion",
    applicationLblBangsa: "Ethnicity / community",
    applicationLblNyatakan: "Specify",
    applicationLblTempatLahir: "Place of birth",
    applicationLblJantina: "Gender",
    applicationLblIcNo: "Identity card number",
    applicationLblIcBaru: "New IC",
    applicationLblIcLama: "Old IC",
    applicationIcHint: "* Must be completed fully as on the official form.",
    applicationLblAlamatRumah: "Home address",
    applicationLblAlamatPejabat: "Office address",
    applicationLblPekerjaan: "Occupation",
    applicationLblTelRumah: "Home telephone",
    applicationLblTelPejabat: "Office telephone",
    applicationLblTelBimbit: "Mobile telephone",
    applicationLblEmail: "Email",
    applicationLblKawasanParlimen: "Parliamentary constituency",
    applicationLblKawasanNegeri: "State constituency",
    applicationLblKategoriAhli: "Member category",
    applicationLblProposerName: "Proposer — name",
    applicationLblProposerIc: "Proposer — IC number",
    applicationLblProposerJawatan: "Proposer — position",
    applicationLblSupporterName: "Supporter — name",
    applicationLblSupporterIc: "Supporter — IC number",
    applicationLblSupporterJawatan: "Supporter — position",
    applicationOptAgamaIslam: "Islam",
    applicationOptAgamaKristian: "Christian",
    applicationOptAgamaLain: "Other",
    applicationOptJantinaLelaki: "Male",
    applicationOptJantinaPerempuan: "Female",
    applicationOptPekerjaan_kerajaan: "Government",
    applicationOptPekerjaan_swasta: "Private sector",
    applicationOptPekerjaan_sendiri: "Self-employed",
    applicationOptPekerjaan_lain: "Other",
    applicationOptKategori_induk: "Induk",
    applicationOptKategori_belia: "Belia",
    applicationOptKategori_wanita: "Wanita",
    applicationOptKategori_pemuda: "Pemuda",
    applicationOptParlimenSelect: "Select parliamentary constituency (Sarawak)",
    applicationOptDunSelect: "Select state constituency (Sarawak)",
    applicationBangsaSelect: "Select ethnicity",
    applicationBangsa_melayu_melanau: "Malay / Melanau",
    applicationBangsa_iban: "Iban",
    applicationBangsa_kedayan: "Kedayan",
    applicationBangsa_bidayuh: "Bidayuh",
    applicationBangsa_kayan: "Kayan",
    applicationBangsa_kelabit: "Kelabit",
    applicationBangsa_kenyah: "Kenyah",
    applicationBangsa_lun_bawang: "Lun Bawang",
    applicationBangsa_lain: "Other",
    applicationProposerHint:
      "Proposer and supporter fields mirror the printed form but are completed by the branch / headquarters — they are not filled in this digital form by design.",
    applicationDeclarationBody:
      "I apply to become a member of Parti Pesaka Bumiputera Bersatu Sarawak. If accepted, I agree to comply with PBB’s laws as in the Constitution, and confirm I am not a member of another party. I declare the information above is true.",
    applicationDeclarationCheckbox: "I agree with the declaration above.",
    applicationOfficeNote:
      "Sections reserved for branch / headquarters (meeting date, chop, processing) are not filled in this digital form — complete them on a printed PDF if required.",
    applicationSubmitBtn: "Save application (this device)",
    applicationSubmitDone:
      "Saved in your browser. Download the official PDF, print, and submit to your branch with supporting documents.",
    membershipCardAria: "Belia PBB membership card preview",
    membershipCardBadge: "Belia PBB",
    membershipCardTitle: "Membership card",
  },
} as const;

export type MessageKey = keyof typeof messages.ms;

type I18nContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: MessageKey) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function readLanguageFromStorage(): Language {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return "ms";
    const p = JSON.parse(raw) as { language?: string };
    return p.language === "en" ? "en" : "ms";
  } catch {
    return "ms";
  }
}

function persistLanguage(lang: Language) {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    const base = raw ? (JSON.parse(raw) as Record<string, unknown>) : {};
    localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify({ ...base, language: lang })
    );
  } catch {
    /* ignore */
  }
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLangState] = useState<Language>(() => readLanguageFromStorage());

  const setLanguage = useCallback((lang: Language) => {
    setLangState(lang);
    persistLanguage(lang);
    document.documentElement.lang = lang === "en" ? "en" : "ms";
  }, []);

  useLayoutEffect(() => {
    document.documentElement.lang = language === "en" ? "en" : "ms";
  }, [language]);

  const t = useCallback(
    (key: MessageKey) => messages[language][key],
    [language]
  );

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error("useI18n must be used within I18nProvider");
  }
  return ctx;
}
