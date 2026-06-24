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
    navMenuOpen: "Buka menu",
    navMenuClose: "Tutup menu",
    themeLight: "Mod cerah",
    themeDark: "Mod gelap",
    themeToggleAria: "Tukar antara mod cerah dan gelap",
    footerAria: "Pengaki laman",
    footerWingLabel: "Sayap Rasmi",
    footerCopyright: "Belia PBB © {{endYear}}",
    footerLanguageNameEn: "English",
    footerLanguageNameMs: "Bahasa Malaysia",
    footerSocialNavAria: "Pautan media sosial",
    footerSocialXAria: "Belia PBB di X",
    footerSocialLinkedInAria: "Belia PBB di LinkedIn",
    footerSocialInstagramAria: "Belia PBB di Instagram",
    footerSocialTikTokAria: "Belia PBB di TikTok",
    footerSocialDiscordAria: "Belia PBB di Discord",
    footerSocialFacebookAria: "Belia PBB di Facebook",
    footerNavAria: "Pautan pengaki",
    footerSiteHeading: "Laman",
    footerResourcesHeading: "Sumber",
    footerColHome: "Utama",
    footerColResources: "Sumber",
    footerColFocus: "Fokus",
    back: "Kembali",
    membersTitle: "Ahli",
    profileTitle: "Profil",
    greetingHey: "Hai, {{name}}! 👋",
    latestNews: "Berita terkini",
    jiwaBaktiLink: "Jiwa Bakti",
    newsViewAll: "Lihat semua",
    newsSeeMore: "Lihat lagi",
    newsLoadError: "Tidak dapat memuat berita. Cuba lagi.",
    newsSource: "Jiwa Bakti",
    membersListAria: "Senarai ahli",
    membersSearchPlaceholder: "Cari nama atau kawasan…",
    memberPending: "Maklumat akan dikemas kini",
    membersNoResults: "Tiada padanan",
    resourcesSectionAria: "Sumber",
    resourcesConstitutionHint: "Dokumen PDF · ketik untuk buka",
    resourcesMeetingRulesTitle: "Peraturan Mesyuarat",
    resourcesMeetingRulesHint: "Akan dikemas kini · belum tersedia",
    profileSectionAria: "Profil",
    profilePhotoAria: "Tambah atau tukar foto profil",
    profilePhotoHint: "Ketik bulatan untuk tambah foto",
    profileName: "Nama",
    profileNamePlaceholder: "Nama anda",
    profileCawangan: "Cawangan",
    profileCawanganSelect: "Pilih Cawangan",
    cawanganSetiausahaEksekutif: "Setiausaha Eksekutif",
    languageLabel: "Bahasa",
    languageToggleAria: "Tukar bahasa antara Bahasa Melayu dan English",
    sheetDragAria: "Seret untuk naik atau turun: Sayap Parti",
    kenaliParti: "Kenali Parti",
    kenaliLearnMore: "Ketahui lebih lanjut",
    sayapParti: "Sayap Parti",
    sayapMkt: "Majlis Kerja Tertinggi",
    kenaliAbout: "Tentang",
    kenaliApply: "Mohon",
    kenaliConstitution: "Perlembagaan",
    kenaliHistory: "Sejarah",
    kenaliStructure: "Struktur",
    headerApplyAria: "Ke permohonan keahlian",
    headerApplyLabel: "Apply",
    welcomeEyebrow: "Selamat datang",
    welcomeTitle: "Belia PBB",
    welcomeDeck:
      "Portal rasmi ahli muda Parti Bersatu Bumiputera Sarawak — berita, sumber, dan permohonan keahlian dalam satu tempat.",
    welcomeContinue: "Teruskan",
    welcomeCloseAria: "Tutup dialog selamat datang",
    welcomeEmailPlaceholder: "E-mel anda",
    joinFabLabel: "Sertai sekarang",
    joinFabHint: "Cuma 2 minit!",
    joinFabAria: "Ke permohonan keahlian",
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
    applicationTitle: "Permohonan Keahlian PBB",
    applicationSubtitle:
      "Isi borang ini mengikut keterangan dalam Borang Permohonan Keahlian PBB (huruf besar jika diperlukan). Data disimpan pada peranti anda sehingga dihantar ke cawangan.",
    applicationDownloadBlank: "Muat Turun Borang PDF Rasmi",
    applicationSectionIdentity: "Butiran Peribadi",
    applicationSectionAddress: "Alamat & Pekerjaan",
    applicationSectionContact: "Hubungan",
    applicationSectionElectoral: "Kawasan Pilihan Raya",
    applicationSectionCategory: "Kategori Ahli",
    applicationSectionProposer: "Pencadang & Penyokong",
    applicationSectionDeclaration: "Pengakuan",
    applicationLblCawangan: "Cawangan",
    applicationLblRantingNo: "No. Ranting",
    applicationLblNamaIc: "Nama (Seperti dalam Kad Pengenalan)",
    applicationLblTarikhLahir: "Tarikh Lahir",
    applicationLblAgama: "Agama",
    applicationLblBangsa: "Bangsa",
    applicationLblNyatakan: "Nyatakan",
    applicationLblTempatLahir: "Tempat Lahir",
    applicationLblJantina: "Jantina",
    applicationLblIcNo: "No. Kad Pengenalan",
    applicationLblIcBaru: "Baru",
    applicationLblIcLama: "Lama",
    applicationIcHint: "* Wajib diisi lengkap mengikut borang rasmi.",
    applicationLblAlamatRumah: "Alamat Kediaman / Rumah",
    applicationLblAlamatPejabat: "Alamat Pejabat",
    applicationLblPekerjaan: "Pekerjaan",
    applicationLblTelRumah: "No. Telefon Rumah",
    applicationLblTelPejabat: "No. Telefon Pejabat",
    applicationLblTelBimbit: "No. Telefon Bimbit",
    applicationLblEmail: "E-mel",
    applicationLblKawasanParlimen: "Kawasan Parlimen",
    applicationLblKawasanNegeri: "Kawasan Negeri (DUN)",
    applicationLblKategoriAhli: "Kategori Ahli",
    applicationLblProposerName: "Pencadang — Nama",
    applicationLblProposerIc: "Pencadang — No. Kad Pengenalan",
    applicationLblProposerJawatan: "Pencadang — Jawatan",
    applicationLblSupporterName: "Penyokong — Nama",
    applicationLblSupporterIc: "Penyokong — No. Kad Pengenalan",
    applicationLblSupporterJawatan: "Penyokong — Jawatan",
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
    applicationOptParlimenSelect: "Pilih Kawasan Parlimen (Sarawak)",
    applicationOptDunSelect: "Pilih Kawasan DUN (Sarawak)",
    applicationBangsaSelect: "Pilih Bangsa",
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
      "Ruangan pencadang dan penyokong dipaparkan seperti di borang rasmi tetapi dilengkapkan oleh cawangan atau ibu pejabat — tidak diisi dalam borang digital ini.",
    applicationDeclarationBody:
      "Saya memohon menjadi ahli Parti Pesaka Bumiputera Bersatu Sarawak. Jika diterima, saya sanggup mematuhi undang-undang pertubuhan PBB seperti dalam Perlembagaan, dan mengaku bukan ahli parti lain. Saya mengaku semua keterangan di atas adalah benar.",
    applicationDeclarationCheckbox: "Saya bersetuju dengan pengakuan di atas.",
    applicationOfficeNote:
      "Ruangan untuk kegunaan cawangan atau ibu pejabat (tarikh mesyuarat, cop, semakan) tidak diisi dalam borang digital ini — lengkapkan pada salinan PDF bercetak jika perlu.",
    applicationSubmitBtn: "Simpan Permohonan (Peranti Ini)",
    applicationSubmitDone:
      "Permohonan disimpan pada pelayar anda. Muat turun borang rasmi, cetak, dan serahkan kepada cawangan bersama dokumen sokongan.",
    membershipCardAria: "Pratontak kad ahli Belia PBB",
    membershipCardBadge: "Belia PBB",
    membershipCardTitle: "Kad ahli",
    focusAgendaTitle: "Agenda Fokus",
    agendaEducation: "Pendidikan",
    agendaEmployment: "Pekerjaan",
    agendaEmergingTech: "Pemerkasaan Teknologi",
    agendaCardAria: "Buka {{label}}",
    agendaEducationTitle: "Pendidikan",
    agendaEmploymentTitle: "Pekerjaan",
    agendaEmergingTechTitle: "Pemerkasaan Teknologi",
    agendaComingSoon: "Akan datang",
    agendaPlaceholderBody: "Kandungan akan dikemas kini tidak lama lagi.",
  },
  en: {
    navHome: "Home",
    navMembers: "Members",
    navResources: "Resources",
    navProfile: "Profile",
    navMain: "Main navigation",
    navMenuOpen: "Open menu",
    navMenuClose: "Close menu",
    themeLight: "Light mode",
    themeDark: "Dark mode",
    themeToggleAria: "Switch between light and dark mode",
    footerAria: "Site footer",
    footerWingLabel: "An Official Wing of",
    footerCopyright: "Belia PBB © {{endYear}}",
    footerLanguageNameEn: "English",
    footerLanguageNameMs: "Bahasa Malaysia",
    footerSocialNavAria: "Social media links",
    footerSocialXAria: "Belia PBB on X",
    footerSocialLinkedInAria: "Belia PBB on LinkedIn",
    footerSocialInstagramAria: "Belia PBB on Instagram",
    footerSocialTikTokAria: "Belia PBB on TikTok",
    footerSocialDiscordAria: "Belia PBB on Discord",
    footerSocialFacebookAria: "Belia PBB on Facebook",
    footerNavAria: "Footer links",
    footerSiteHeading: "Site",
    footerResourcesHeading: "Resources",
    footerColHome: "Home",
    footerColResources: "Resources",
    footerColFocus: "Focus",
    back: "Back",
    membersTitle: "Members",
    profileTitle: "Profile",
    greetingHey: "Hey, {{name}}! 👋",
    latestNews: "Latest News",
    jiwaBaktiLink: "Jiwa Bakti",
    newsViewAll: "View all",
    newsSeeMore: "See more",
    newsLoadError: "Could not load news. Please try again.",
    newsSource: "Jiwa Bakti",
    membersListAria: "Member list",
    membersSearchPlaceholder: "Search name or constituency…",
    memberPending: "Details coming soon",
    membersNoResults: "No matches",
    resourcesSectionAria: "Resources",
    resourcesConstitutionHint: "PDF · tap to open",
    resourcesMeetingRulesTitle: "Meeting Rules",
    resourcesMeetingRulesHint: "Coming soon · not available yet",
    profileSectionAria: "Profile",
    profilePhotoAria: "Add or change profile photo",
    profilePhotoHint: "Tap circle to add photo",
    profileName: "Name",
    profileNamePlaceholder: "Your name",
    profileCawangan: "Cawangan",
    profileCawanganSelect: "Select Cawangan",
    cawanganSetiausahaEksekutif: "Executive Secretary",
    languageLabel: "Language",
    languageToggleAria: "Switch language between Bahasa Melayu and English",
    sheetDragAria: "Drag up or down: Party Wings",
    kenaliParti: "About Us",
    kenaliLearnMore: "Learn more",
    sayapParti: "Party Wings",
    sayapMkt: "Majlis Kerja Tertinggi",
    kenaliAbout: "About",
    kenaliApply: "Apply",
    kenaliConstitution: "Constitution",
    kenaliHistory: "History",
    kenaliStructure: "Structure",
    headerApplyAria: "Go to membership application",
    headerApplyLabel: "Apply",
    welcomeEyebrow: "Welcome",
    welcomeTitle: "Belia PBB",
    welcomeDeck:
      "The official youth portal for Parti Bersatu Bumiputera Sarawak — news, resources, and membership in one place.",
    welcomeContinue: "Continue",
    welcomeCloseAria: "Close welcome dialog",
    welcomeEmailPlaceholder: "Your email",
    joinFabLabel: "Join now",
    joinFabHint: "It takes 2 mins!",
    joinFabAria: "Go to membership application",
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
    applicationTitle: "PBB Membership Application",
    applicationSubtitle:
      "Complete this form based on the official Borang Permohonan Keahlian PBB (use capitals where the form requires). Data is stored on this device until you hand it in at a branch.",
    applicationDownloadBlank: "Download Official PDF Form",
    applicationSectionIdentity: "Personal Details",
    applicationSectionAddress: "Address & Employment",
    applicationSectionContact: "Contact",
    applicationSectionElectoral: "Electoral Areas",
    applicationSectionCategory: "Membership Category",
    applicationSectionProposer: "Proposer & Supporter",
    applicationSectionDeclaration: "Declaration",
    applicationLblCawangan: "Branch (Cawangan)",
    applicationLblRantingNo: "Ranting No.",
    applicationLblNamaIc: "Full Name (As on ID Card)",
    applicationLblTarikhLahir: "Date of Birth",
    applicationLblAgama: "Religion",
    applicationLblBangsa: "Ethnicity / Community",
    applicationLblNyatakan: "Specify",
    applicationLblTempatLahir: "Place of Birth",
    applicationLblJantina: "Gender",
    applicationLblIcNo: "Identity Card Number",
    applicationLblIcBaru: "New IC",
    applicationLblIcLama: "Old IC",
    applicationIcHint: "* Must be completed fully as on the official form.",
    applicationLblAlamatRumah: "Home Address",
    applicationLblAlamatPejabat: "Office Address",
    applicationLblPekerjaan: "Occupation",
    applicationLblTelRumah: "Home Telephone",
    applicationLblTelPejabat: "Office Telephone",
    applicationLblTelBimbit: "Mobile Telephone",
    applicationLblEmail: "Email",
    applicationLblKawasanParlimen: "Parliamentary Constituency",
    applicationLblKawasanNegeri: "State Constituency (DUN)",
    applicationLblKategoriAhli: "Member Category",
    applicationLblProposerName: "Proposer — Name",
    applicationLblProposerIc: "Proposer — IC Number",
    applicationLblProposerJawatan: "Proposer — Position",
    applicationLblSupporterName: "Supporter — Name",
    applicationLblSupporterIc: "Supporter — IC Number",
    applicationLblSupporterJawatan: "Supporter — Position",
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
    applicationOptParlimenSelect: "Select Parliamentary Constituency (Sarawak)",
    applicationOptDunSelect: "Select State Constituency (DUN, Sarawak)",
    applicationBangsaSelect: "Select Ethnicity",
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
      "Proposer and supporter fields mirror the printed form but are completed by the branch or headquarters — they are not filled in this digital form by design.",
    applicationDeclarationBody:
      "I apply to become a member of Parti Pesaka Bumiputera Bersatu Sarawak. If accepted, I agree to comply with PBB’s laws as in the Constitution, and confirm I am not a member of another party. I declare the information above is true.",
    applicationDeclarationCheckbox: "I agree with the declaration above.",
    applicationOfficeNote:
      "Sections reserved for the branch or headquarters (meeting date, chop, processing) are not filled in this digital form — complete them on a printed PDF if required.",
    applicationSubmitBtn: "Save Application (This Device)",
    applicationSubmitDone:
      "Saved in your browser. Download the official PDF, print, and submit to your branch with supporting documents.",
    membershipCardAria: "Belia PBB membership card preview",
    membershipCardBadge: "Belia PBB",
    membershipCardTitle: "Membership card",
    focusAgendaTitle: "Focus Agenda",
    agendaEducation: "Education",
    agendaEmployment: "Employment",
    agendaEmergingTech: "Emerging Technology",
    agendaCardAria: "Open {{label}}",
    agendaEducationTitle: "Education",
    agendaEmploymentTitle: "Employment",
    agendaEmergingTechTitle: "Emerging Technology",
    agendaComingSoon: "Coming soon",
    agendaPlaceholderBody: "Content coming soon.",
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
