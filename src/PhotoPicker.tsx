import { useRef, useState } from "react";
import { Camera } from "reicon-react";
import { useI18n } from "./i18n";
import { photoFromFile } from "./photo";

/** The passport-style photo for the form's photo box: tap the frame to take one or choose from the gallery. */
export function PhotoPicker({ value, onChange }: { value: string | null; onChange: (dataUrl: string | null) => void }) {
  const { t } = useI18n();
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState(false);

  const pick = async (file?: File) => {
    if (!file) return;
    setError(false);
    try {
      onChange(await photoFromFile(file));
    } catch {
      setError(true);
    }
  };

  return (
    <div className="photo-picker">
      <button type="button" className="photo-frame" data-filled={!!value} onClick={() => input.current?.click()} aria-label={value ? t("photoChange") : t("photoPick")}>
        {value ? <img src={value} alt={t("photoAlt")} /> : <Camera size={32} aria-hidden />}
      </button>
      <div className="photo-side">
        <button type="button" className="profile-save-btn profile-save-btn--secondary photo-btn" onClick={() => input.current?.click()}>
          {value ? t("photoChange") : t("photoPick")}
        </button>
        {error ? <p className="join-nudge photo-error" role="alert">{t("photoBad")}</p> : null}
      </div>
      <input
        ref={input}
        type="file"
        accept="image/*"
        hidden
        onChange={(e) => {
          void pick(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
    </div>
  );
}
