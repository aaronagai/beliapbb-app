import type { ReactNode } from "react";
import { CAWANGAN_OPTIONS, getCawanganDisplayLabel } from "./cawanganOptions";
import { BANGSA_MSG, BANGSA_VALUES, PARLIMEN_SARAWAK_OPTIONS, type Draft } from "./joinData";
import type { MessageKey } from "./i18n";

/**
 * The join form as a sequence of short screens, one question each (the Duolingo / Airbnb pattern):
 * three chapters, a chapter intro at the start of each, choices as big cards, and a review screen last.
 * Same fields and same Draft as before; only the way they are asked changed.
 *
 * Icons and illustrations don't exist yet, so every spot for one is a plain grey circle (`.join-dot`).
 */
export type ScreenId =
  | "intro1" | "cawangan" | "nama" | "ic" | "lahir" | "jantina" | "agama" | "bangsa"
  | "intro2" | "telefon" | "alamat" | "pekerjaan" | "tambahan"
  | "intro3" | "kategori" | "kawasan"
  | "review";

export type JoinScreen = { id: ScreenId; chapter: 0 | 1 | 2; optional?: boolean };

export const JOIN_SCREENS: JoinScreen[] = [
  { id: "intro1", chapter: 0 },
  { id: "cawangan", chapter: 0 },
  { id: "nama", chapter: 0 },
  { id: "ic", chapter: 0 },
  { id: "lahir", chapter: 0 },
  { id: "jantina", chapter: 0 },
  { id: "agama", chapter: 0 },
  { id: "bangsa", chapter: 0 },
  { id: "intro2", chapter: 1 },
  { id: "telefon", chapter: 1 },
  { id: "alamat", chapter: 1 },
  { id: "pekerjaan", chapter: 1 },
  { id: "tambahan", chapter: 1, optional: true },
  { id: "intro3", chapter: 2 },
  { id: "kategori", chapter: 2 },
  { id: "kawasan", chapter: 2, optional: true },
  { id: "review", chapter: 2 },
];

export const screenIndex = (id: ScreenId) => JOIN_SCREENS.findIndex((s) => s.id === id);

const digits = (s: string) => s.replace(/\D/g, "");

/** 980519135123 → 980519-13-5123 while typing. */
export function formatIc(raw: string): string {
  const x = digits(raw).slice(0, 12);
  return [x.slice(0, 6), x.slice(6, 8), x.slice(8, 12)].filter(Boolean).join("-");
}

/** The message to show when someone presses Next too early, or null when the screen is complete. */
export function validateScreen(id: ScreenId, d: Draft): MessageKey | null {
  const need = "joinNeed" as const;
  switch (id) {
    case "cawangan": return d.cawangan ? null : need;
    case "nama": return d.nama.trim() ? null : need;
    case "ic": return digits(d.noKadPengenalan).length === 12 ? null : "applicationErrorIc";
    case "lahir": return d.tarikhLahir ? null : need;
    case "jantina": return d.jantina ? null : need;
    case "agama": return d.agama ? null : need;
    case "bangsa": return d.bangsa ? null : need;
    case "telefon": return d.telBimbit.trim() ? null : need;
    case "alamat": return d.alamatRumah.trim() ? null : need;
    case "pekerjaan": return d.pekerjaan ? null : need;
    case "kategori": return d.kategoriAhli ? null : need;
    default: return null;
  }
}

type T = (key: MessageKey) => string;

/** One big tappable card in a group (a radio, visually and for screen readers). */
function Choices<V extends string>({
  label,
  value,
  options,
  onPick,
  grid = false,
}: {
  label: string;
  value: V | "";
  options: readonly (readonly [V, string])[];
  onPick: (v: V) => void;
  grid?: boolean;
}) {
  return (
    <div className={`join-options${grid ? " join-options--grid" : ""}`} role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} className="join-option" onClick={() => onPick(v)}>
          <span className="join-dot" aria-hidden />
          <span>{text}</span>
        </button>
      ))}
    </div>
  );
}

function Private({ t }: { t: T }) {
  return (
    <p className="join-private">
      <span className="join-dot join-dot--sm" aria-hidden />
      {t("joinPrivate")}
    </p>
  );
}

function Heading({ title, hint }: { title: string; hint?: string }) {
  return (
    <>
      <h2 className="join-title">{title}</h2>
      {hint ? <p className="join-hint">{hint}</p> : null}
    </>
  );
}

const CHAPTER_KEYS: [MessageKey, MessageKey][] = [
  ["joinCh1Title", "joinCh1Body"],
  ["joinCh2Title", "joinCh2Body"],
  ["joinCh3Title", "joinCh3Body"],
];

export function JoinScreenBody({
  screen,
  d,
  patch,
  t,
}: {
  screen: JoinScreen;
  d: Draft;
  patch: (p: Partial<Draft>) => void;
  t: T;
}): ReactNode {
  switch (screen.id) {
    case "intro1":
    case "intro2":
    case "intro3": {
      const [title, body] = CHAPTER_KEYS[screen.chapter];
      return (
        <div className="join-intro">
          <span className="join-art" aria-hidden />
          <p className="join-kicker">{t("joinPart").replace("{{n}}", String(screen.chapter + 1))}</p>
          <h2 className="join-title">{t(title)}</h2>
          <p className="join-hint">{t(body)}</p>
        </div>
      );
    }

    case "cawangan":
      return (
        <>
          <Heading title={t("qCawangan")} hint={t("qCawanganHint")} />
          <select
            className="profile-input profile-select join-input"
            aria-label={t("applicationLblCawangan")}
            value={d.cawangan}
            onChange={(e) => {
              const v = e.target.value;
              // The state seat follows the cawangan, so it never has to be asked.
              patch({ cawangan: v, kawasanNegeri: /^N\.\d+\s/.test(v) ? v : "" });
            }}
          >
            <option value="">{t("profileCawanganSelect")}</option>
            {CAWANGAN_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {getCawanganDisplayLabel(opt, t)}
              </option>
            ))}
          </select>
          <input
            className="profile-input join-input join-input--second"
            aria-label={t("applicationLblRantingNo")}
            placeholder={t("applicationLblRantingNo")}
            value={d.rantingNo}
            onChange={(e) => patch({ rantingNo: e.target.value })}
          />
        </>
      );

    case "nama":
      return (
        <>
          <Heading title={t("qNama")} hint={t("qNamaHint")} />
          <input
            className="profile-input join-input"
            aria-label={t("applicationLblNamaIc")}
            autoComplete="name"
            autoFocus
            value={d.nama}
            onChange={(e) => patch({ nama: e.target.value })}
          />
        </>
      );

    case "ic":
      return (
        <>
          <Heading title={t("qIc")} hint={t("qIcHint")} />
          <input
            className="profile-input join-input"
            aria-label={t("applicationLblIcNo")}
            inputMode="numeric"
            autoComplete="off"
            autoFocus
            placeholder="000000-00-0000"
            value={d.noKadPengenalan}
            onChange={(e) => patch({ noKadPengenalan: formatIc(e.target.value), icBaru: true, icLama: false })}
          />
          <Private t={t} />
        </>
      );

    case "lahir":
      return (
        <>
          <Heading title={t("qLahir")} />
          <label className="join-label" htmlFor="join-dob">
            {t("applicationLblTarikhLahir")}
          </label>
          <input
            id="join-dob"
            type="date"
            className="profile-input join-input"
            max={new Date().toISOString().slice(0, 10)}
            value={d.tarikhLahir}
            onChange={(e) => patch({ tarikhLahir: e.target.value })}
          />
          <label className="join-label" htmlFor="join-pob">
            {t("applicationLblTempatLahir")}
          </label>
          <input id="join-pob" className="profile-input join-input" value={d.tempatLahir} onChange={(e) => patch({ tempatLahir: e.target.value })} />
        </>
      );

    case "jantina":
      return (
        <>
          <Heading title={t("qJantina")} />
          <Choices
            label={t("applicationLblJantina")}
            value={d.jantina}
            onPick={(v) => patch({ jantina: v })}
            options={[
              ["lelaki", t("applicationOptJantinaLelaki")],
              ["perempuan", t("applicationOptJantinaPerempuan")],
            ]}
          />
        </>
      );

    case "agama":
      return (
        <>
          <Heading title={t("qAgama")} />
          <Choices
            label={t("applicationLblAgama")}
            value={d.agama}
            onPick={(v) => patch({ agama: v, agamaLain: v === "lain" ? d.agamaLain : "" })}
            options={[
              ["islam", t("applicationOptAgamaIslam")],
              ["kristian", t("applicationOptAgamaKristian")],
              ["lain", t("applicationOptAgamaLain")],
            ]}
          />
          {d.agama === "lain" ? (
            <input
              className="profile-input join-input join-input--second"
              placeholder={t("applicationLblNyatakan")}
              aria-label={t("applicationLblNyatakan")}
              autoFocus
              value={d.agamaLain}
              onChange={(e) => patch({ agamaLain: e.target.value })}
            />
          ) : null}
        </>
      );

    case "bangsa":
      return (
        <>
          <Heading title={t("qBangsa")} />
          <Choices
            label={t("applicationLblBangsa")}
            value={d.bangsa}
            grid
            onPick={(v) => patch({ bangsa: v, bangsaLain: v === "lain" ? d.bangsaLain : "" })}
            options={BANGSA_VALUES.map((v) => [v, t(BANGSA_MSG[v])] as const)}
          />
          {d.bangsa === "lain" ? (
            <input
              className="profile-input join-input join-input--second"
              placeholder={t("applicationLblNyatakan")}
              aria-label={t("applicationLblNyatakan")}
              autoFocus
              value={d.bangsaLain}
              onChange={(e) => patch({ bangsaLain: e.target.value })}
            />
          ) : null}
        </>
      );

    case "telefon":
      return (
        <>
          <Heading title={t("qTelefon")} hint={t("qTelefonHint")} />
          <label className="join-label" htmlFor="join-tel">
            {t("applicationLblTelBimbit")}
          </label>
          <input
            id="join-tel"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            autoFocus
            className="profile-input join-input"
            value={d.telBimbit}
            onChange={(e) => patch({ telBimbit: e.target.value })}
          />
          <label className="join-label" htmlFor="join-email">
            {t("applicationLblEmail")} <span className="join-optional">({t("joinOptional")})</span>
          </label>
          <input
            id="join-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            className="profile-input join-input"
            value={d.email}
            onChange={(e) => patch({ email: e.target.value })}
          />
        </>
      );

    case "alamat":
      return (
        <>
          <Heading title={t("qAlamat")} />
          <textarea
            className="profile-input join-input join-textarea"
            aria-label={t("applicationLblAlamatRumah")}
            autoComplete="street-address"
            rows={4}
            autoFocus
            value={d.alamatRumah}
            onChange={(e) => patch({ alamatRumah: e.target.value })}
          />
          <Private t={t} />
        </>
      );

    case "pekerjaan":
      return (
        <>
          <Heading title={t("qPekerjaan")} />
          <Choices
            label={t("applicationLblPekerjaan")}
            value={d.pekerjaan}
            onPick={(v) => patch({ pekerjaan: v })}
            options={[
              ["kerajaan", t("applicationOptPekerjaan_kerajaan")],
              ["swasta", t("applicationOptPekerjaan_swasta")],
              ["sendiri", t("applicationOptPekerjaan_sendiri")],
              ["lain", t("applicationOptPekerjaan_lain")],
            ]}
          />
          {d.pekerjaan ? (
            <input
              className="profile-input join-input join-input--second"
              placeholder={`${t("applicationLblNyatakan")} (${t("joinOptional")})`}
              aria-label={t("applicationLblNyatakan")}
              value={d.pekerjaanNyata}
              onChange={(e) => patch({ pekerjaanNyata: e.target.value })}
            />
          ) : null}
        </>
      );

    case "tambahan":
      return (
        <>
          <Heading title={t("qTambahan")} hint={t("qTambahanHint")} />
          <label className="join-label" htmlFor="join-office">
            {t("applicationLblAlamatPejabat")}
          </label>
          <textarea id="join-office" className="profile-input join-input join-textarea" rows={3} value={d.alamatPejabat} onChange={(e) => patch({ alamatPejabat: e.target.value })} />
          <label className="join-label" htmlFor="join-telrumah">
            {t("applicationLblTelRumah")}
          </label>
          <input id="join-telrumah" type="tel" inputMode="tel" className="profile-input join-input" value={d.telRumah} onChange={(e) => patch({ telRumah: e.target.value })} />
          <label className="join-label" htmlFor="join-telpejabat">
            {t("applicationLblTelPejabat")}
          </label>
          <input id="join-telpejabat" type="tel" inputMode="tel" className="profile-input join-input" value={d.telPejabat} onChange={(e) => patch({ telPejabat: e.target.value })} />
        </>
      );

    case "kategori":
      return (
        <>
          <Heading title={t("qKategori")} />
          <Choices
            label={t("applicationLblKategoriAhli")}
            value={d.kategoriAhli}
            onPick={(v) => patch({ kategoriAhli: v })}
            options={[
              ["belia", t("applicationOptKategori_belia")],
              ["pemuda", t("applicationOptKategori_pemuda")],
              ["wanita", t("applicationOptKategori_wanita")],
              ["induk", t("applicationOptKategori_induk")],
            ]}
          />
        </>
      );

    case "kawasan":
      return (
        <>
          <Heading title={t("qKawasan")} hint={t("qKawasanHint")} />
          <select
            className="profile-input profile-select join-input"
            aria-label={t("applicationLblKawasanParlimen")}
            value={d.kawasanParlimen}
            onChange={(e) => patch({ kawasanParlimen: e.target.value })}
          >
            <option value="">{t("applicationOptParlimenSelect")}</option>
            {PARLIMEN_SARAWAK_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </>
      );

    default:
      return null;
  }
}
