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
    kenaliAmanat: "Amanat",
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
    kenaliAmanat: "Amanat",
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
