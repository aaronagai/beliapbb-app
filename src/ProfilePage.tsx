import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  CAWANGAN_OPTIONS,
  formatCawanganLabel,
  isValidCawangan,
} from "./cawanganOptions";
import { useI18n } from "./i18n";

const PROFILE_STORAGE_KEY = "beliapbb_profile";
const PROFILE_CREDIT_HREF = "https://www.linkedin.com/in/aaronagai/";

type ProfileState = {
  name: string;
  cawangan: string;
  photoDataUrl: string | null;
};

const defaultProfile: ProfileState = {
  name: "",
  cawangan: "",
  photoDataUrl: null,
};

function readStored(): ProfileState {
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return defaultProfile;
    const p = JSON.parse(raw) as Record<string, unknown>;
    return {
      name: typeof p.name === "string" ? p.name : "",
      cawangan:
        typeof p.cawangan === "string" && isValidCawangan(p.cawangan) ? p.cawangan : "",
      photoDataUrl: typeof p.photoDataUrl === "string" ? p.photoDataUrl : null,
    };
  } catch {
    return defaultProfile;
  }
}

function IconPersonLarge() {
  return (
    <svg className="profile-photo-placeholder-icon" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
      />
    </svg>
  );
}

/** 文 + A — language / translate motif (matches common “translate” pictogram). */
function LanguageScriptIcon() {
  return (
    <svg className="profile-lang-icon" viewBox="0 0 24 24" aria-hidden>
      <text
        x="0.5"
        y="15.5"
        fill="currentColor"
        fontSize="12.5"
        fontWeight="700"
        fontFamily="'PingFang SC','PingFang TC','Hiragino Sans GB','Microsoft YaHei','Noto Sans CJK SC',sans-serif"
      >
        文
      </text>
      <text
        x="10"
        y="21"
        fill="currentColor"
        fontSize="10.5"
        fontWeight="700"
        fontFamily="'Universal Sans', 'Inter', system-ui, sans-serif"
      >
        A
      </text>
    </svg>
  );
}

export function ProfilePage() {
  const fileInputId = useId();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<ProfileState>(() => readStored());
  const { language, setLanguage, t } = useI18n();

  const update = useCallback((patch: Partial<ProfileState>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
  }, []);

  const [showSaved, setShowSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const saveProfile = useCallback(() => {
    try {
      localStorage.setItem(
        PROFILE_STORAGE_KEY,
        JSON.stringify({ ...profile, language })
      );
    } catch {
      /* quota / private mode */
    }
    setShowSaved(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setShowSaved(false), 2500);
  }, [profile, language]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

  const onPickPhoto = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file?.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        const url = typeof reader.result === "string" ? reader.result : null;
        if (url) update({ photoDataUrl: url });
      };
      reader.readAsDataURL(file);
      e.target.value = "";
    },
    [update]
  );

  return (
    <section className="section section--profile" aria-label={t("profileSectionAria")}>
      <div className="profile-card">
        <div className="profile-photo-row">
          <input
            ref={fileInputRef}
            id={fileInputId}
            type="file"
            accept="image/*"
            className="profile-file-input"
            onChange={onPickPhoto}
          />
          <button
            type="button"
            className="profile-photo-preview"
            onClick={() => fileInputRef.current?.click()}
            aria-label={t("profilePhotoAria")}
          >
            {profile.photoDataUrl ? (
              <img src={profile.photoDataUrl} alt="" width={88} height={88} />
            ) : (
              <IconPersonLarge />
            )}
          </button>
          <p className="profile-add-photo-hint">{t("profilePhotoHint")}</p>
        </div>
      </div>

      <div className="profile-card">
        <label className="profile-field" htmlFor="profile-name">
          <span className="profile-label">{t("profileName")}</span>
          <input
            id="profile-name"
            className="profile-input"
            type="text"
            autoComplete="name"
            value={profile.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder={t("profileNamePlaceholder")}
          />
        </label>
      </div>

      <div className="profile-card">
        <label className="profile-field" htmlFor="profile-cawangan">
          <span className="profile-label">{t("profileCawangan")}</span>
          <select
            id="profile-cawangan"
            className="profile-input profile-select"
            value={profile.cawangan}
            onChange={(e) => update({ cawangan: e.target.value })}
          >
            <option value="">{t("profileCawanganSelect")}</option>
            {CAWANGAN_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {formatCawanganLabel(opt)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="profile-save-row">
        <button type="button" className="profile-save-btn" onClick={saveProfile}>
          {t("profileSave")}
        </button>
        <p className="profile-saved-msg" role="status" aria-live="polite">
          {showSaved ? t("profileSaved") : null}
        </p>
      </div>

      <div className="profile-lang-row">
        <label className="profile-lang-wrap profile-lang-wrap--combined">
          <span className="visually-hidden">{t("languageLabel")}</span>
          <span className="profile-lang-icon-slot" aria-hidden>
            <LanguageScriptIcon />
          </span>
          <select
            className="profile-lang-select profile-lang-select--in-pill"
            value={language}
            onChange={(e) => setLanguage(e.target.value === "en" ? "en" : "ms")}
            aria-label={t("languageLabel")}
          >
            <option value="ms">Bahasa Melayu</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>

      <p className="profile-credit">
        <span>{t("profileCreditLead")}</span>{" "}
        <a
          href={PROFILE_CREDIT_HREF}
          target="_blank"
          rel="noopener noreferrer"
          className="profile-credit-link"
          aria-label={t("profileCreditHandleAria")}
        >
          @aaronagai
        </a>
      </p>
    </section>
  );
}
