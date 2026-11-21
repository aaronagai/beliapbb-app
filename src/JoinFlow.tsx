import { useEffect, useState, type ReactNode } from "react";
import { getCawanganDisplayLabel } from "./cawanganOptions";
import { BANGSA_MSG, BANGSA_VALUES, PARLIMEN_SARAWAK_OPTIONS, SARAWAK_TOWNS, cawanganUnder, parlimenOf, type Draft } from "./joinData";
import { SARAWAK_CODE, STATE_NAMES, parseIc } from "./icInfo";
import { formatPhone, isMobile } from "./normalise";
import type { MessageKey } from "./i18n";

/**
 * The join form: five short screens and a review. Most of what the paper form asks is already in the IC
 * number (date of birth, gender, age, member category, birthplace state), so we read it instead of asking.
 * Icons and illustrations don't exist yet; every spot for one is a plain grey circle (`.join-dot`).
 */
export type ScreenId = "kamu" | "cawangan" | "lagi" | "hubungi" | "kerja" | "review" | "kategori";

/** `hidden` screens are skipped when moving through the form; they open from a review row ("Ubah"). */
export type JoinScreen = { id: ScreenId; hidden?: true };

export const JOIN_SCREENS: JoinScreen[] = [
  { id: "kamu" },
  { id: "cawangan" },
  { id: "lagi" },
  { id: "hubungi" },
  { id: "kerja" },
  { id: "review" },
  { id: "kategori", hidden: true },
];

export const screenIndex = (id: ScreenId) => JOIN_SCREENS.findIndex((s) => s.id === id);
/** Screens that count towards the progress bar. */
export const VISIBLE_COUNT = JOIN_SCREENS.filter((s) => !s.hidden).length;

const digits = (s: string) => s.replace(/\D/g, "");
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** 980519135123 → 980519-13-5123 while typing. */
export function formatIc(raw: string): string {
  const x = digits(raw).slice(0, 12);
  return [x.slice(0, 6), x.slice(6, 8), x.slice(8, 12)].filter(Boolean).join("-");
}

/** The message to show when someone presses Next too early, or null when the screen is complete. */
export function validateScreen(id: ScreenId, d: Draft): MessageKey | null {
  const need = "joinNeed" as const;
  switch (id) {
    case "kamu": {
      if (!d.nama.trim()) return need;
      const ic = parseIc(d.noKadPengenalan);
      if (!ic.ok) return "applicationErrorIc";
      return null; // under 18s can still apply; the secretariat follows up
    }
    case "cawangan": return d.kawasanParlimen && d.cawangan ? null : need;
    case "lagi": return d.tempatLahir.trim() && d.agama && d.bangsa ? null : need;
    case "hubungi": {
      if (!d.telBimbit.trim() || !d.alamatRumah.trim()) return need;
      if (!isMobile(d.telBimbit)) return "joinPhoneBad";
      return d.tiadaEmail || EMAIL.test(d.email.trim()) ? null : "joinEmailNeed";
    }
    case "kerja": return d.pekerjaan ? null : need;
    case "kategori": return d.kategoriAhli ? null : need;
    default: return null;
  }
}

type T = (key: MessageKey) => string;

/** Compact selectable pills, for short lists that share a screen with other questions. */
function Chips<V extends string>({
  label,
  value,
  options,
  onPick,
}: {
  label: string;
  value: V | "";
  options: readonly (readonly [V, string])[];
  onPick: (v: V) => void;
}) {
  return (
    <div className="join-chips" role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} className="join-chip" onClick={() => onPick(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

/** Big tappable cards (used for the one-off category screen). */
function Choices<V extends string>({
  label,
  value,
  options,
  onPick,
}: {
  label: string;
  value: V | "";
  options: readonly (readonly [V, string])[];
  onPick: (v: V) => void;
}) {
  return (
    <div className="join-options" role="radiogroup" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" role="radio" aria-checked={value === v} className="join-option" onClick={() => onPick(v)}>
          <span className="join-dot" aria-hidden />
          <span>{text}</span>
        </button>
      ))}
    </div>
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

const KATEGORI_KEY = (k: string) => `applicationOptKategori_${k}` as MessageKey;

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
    case "kamu":
      return <Kamu d={d} patch={patch} t={t} />;
    case "cawangan":
      return <Cawangan d={d} patch={patch} t={t} />;
    case "lagi":
      return <Lagi d={d} patch={patch} t={t} />;
    case "hubungi":
      return <Hubungi d={d} patch={patch} t={t} />;
    case "kerja":
      return <Kerja d={d} patch={patch} t={t} />;
    case "kategori":
      return (
        <>
          <Heading title={t("qKategori")} hint={t("qKategoriHint")} />
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
    default:
      return null;
  }
}

type BodyProps = { d: Draft; patch: (p: Partial<Draft>) => void; t: T };

/** Name and IC. The IC fills in birth date, gender, category and (outside Sarawak) birthplace by itself. */
function Kamu({ d, patch, t }: BodyProps) {
  const ic = parseIc(d.noKadPengenalan);

  const onIc = (raw: string) => {
    const formatted = formatIc(raw);
    const info = parseIc(formatted);
    const next: Partial<Draft> = { noKadPengenalan: formatted, icBaru: true, icLama: false };
    if (info.ok) {
      next.tarikhLahir = info.dob;
      next.jantina = info.jantina;
      next.kategoriAhli = info.kategori ?? "";
      if (info.state && info.place !== SARAWAK_CODE) next.tempatLahir = info.state; // born elsewhere in Malaysia: the state is enough
      else if (STATE_NAMES.includes(d.tempatLahir)) next.tempatLahir = ""; // an earlier autofill no longer applies
    } else {
      next.tarikhLahir = "";
      next.jantina = "";
      next.kategoriAhli = "";
      if (STATE_NAMES.includes(d.tempatLahir)) next.tempatLahir = "";
    }
    patch(next);
  };

  return (
    <>
      <Heading title={t("qKamu")} />
      <label className="join-label" htmlFor="join-nama">
        {t("applicationLblNamaIc")}
      </label>
      <input id="join-nama" className="profile-input join-input" autoComplete="name" autoFocus value={d.nama} onChange={(e) => patch({ nama: e.target.value })} />

      <label className="join-label" htmlFor="join-ic">
        {t("applicationLblIcNo")}
      </label>
      <input
        id="join-ic"
        className="profile-input join-input"
        inputMode="numeric"
        autoComplete="off"
        placeholder="000000-00-0000"
        value={d.noKadPengenalan}
        onChange={(e) => onIc(e.target.value)}
      />

      {ic.ok ? (
        <p className="join-derived" role="status">
          {ic.kategori ? (
            <>
              {ic.jantina === "lelaki" ? t("applicationOptJantinaLelaki") : t("applicationOptJantinaPerempuan")} · {ic.age} {t("joinYears")} ·{" "}
              <strong>{t(KATEGORI_KEY(ic.kategori))}</strong>
            </>
          ) : (
            t("joinUnder18")
          )}
        </p>
      ) : null}
    </>
  );
}

/** Parlimen first, then only the cawangan under it. */
function Cawangan({ d, patch, t }: BodyProps) {
  // A saved profile or draft may have a cawangan but no Parlimen yet: work it out.
  useEffect(() => {
    if (d.cawangan && !d.kawasanParlimen) patch({ kawasanParlimen: parlimenOf(d.cawangan) });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [help, setHelp] = useState(false);
  const options = d.kawasanParlimen ? cawanganUnder(d.kawasanParlimen) : [];

  return (
    <>
      <Heading title={t("qCawangan")} hint={t("qCawanganHint")} />
      <div className="join-label-row">
        <label className="join-label" htmlFor="join-parlimen">
          {t("applicationLblKawasanParlimen")}
        </label>
        <button type="button" className="join-info" aria-expanded={help} aria-label={t("joinParlimenHelpAria")} onClick={() => setHelp(!help)}>
          ?
        </button>
      </div>
      {help ? (
        <p className="join-helpbox">
          {t("joinParlimenHelp")}{" "}
          <a href="https://mysprsemak.spr.gov.my/semakan/daftarPemilih" target="_blank" rel="noopener noreferrer">
            {t("joinParlimenHelpLink")}
          </a>
        </p>
      ) : null}
      <select
        id="join-parlimen"
        className="profile-input profile-select join-input"
        value={d.kawasanParlimen}
        onChange={(e) => {
          const parlimen = e.target.value;
          const keep = d.cawangan && cawanganUnder(parlimen).includes(d.cawangan);
          patch({ kawasanParlimen: parlimen, cawangan: keep ? d.cawangan : "", kawasanNegeri: keep ? d.kawasanNegeri : "" });
        }}
      >
        <option value="">{t("applicationOptParlimenSelect")}</option>
        {PARLIMEN_SARAWAK_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>

      <label className="join-label" htmlFor="join-cawangan">
        {t("applicationLblCawangan")}
      </label>
      <select
        id="join-cawangan"
        className="profile-input profile-select join-input"
        disabled={!d.kawasanParlimen}
        value={d.cawangan}
        onChange={(e) => patch({ cawangan: e.target.value, kawasanNegeri: e.target.value })}
      >
        <option value="">{d.kawasanParlimen ? t("profileCawanganSelect") : t("joinPickParlimenFirst")}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {getCawanganDisplayLabel(opt, t)}
          </option>
        ))}
      </select>

      <input
        className="profile-input join-input join-input--second"
        aria-label={t("applicationLblRantingNo")}
        placeholder={`${t("applicationLblRantingNo")} (${t("joinOptional")})`}
        value={d.rantingNo}
        onChange={(e) => patch({ rantingNo: e.target.value })}
      />
    </>
  );
}

/** Birthplace (only asked when the IC says Sarawak), religion and race, as compact chips. */
function Lagi({ d, patch, t }: BodyProps) {
  const ic = parseIc(d.noKadPengenalan);
  const bornSarawak = ic.ok && ic.place === SARAWAK_CODE;
  const bornElsewhereMy = ic.ok && ic.state !== null && ic.place !== SARAWAK_CODE;
  const [otherTown, setOtherTown] = useState(() => bornSarawak && d.tempatLahir !== "" && !(SARAWAK_TOWNS as readonly string[]).includes(d.tempatLahir));

  return (
    <>
      <Heading title={t("qLagi")} />

      <label className="join-label" htmlFor="join-pob">
        {t("applicationLblTempatLahir")}
      </label>
      {bornElsewhereMy ? (
        <p className="join-fixed">
          {d.tempatLahir} <span className="join-optional">({t("joinFromIc")})</span>
        </p>
      ) : bornSarawak ? (
        <>
          <select
            id="join-pob"
            className="profile-input profile-select join-input"
            value={otherTown ? "__lain" : d.tempatLahir}
            onChange={(e) => {
              if (e.target.value === "__lain") {
                setOtherTown(true);
                patch({ tempatLahir: "" });
              } else {
                setOtherTown(false);
                patch({ tempatLahir: e.target.value });
              }
            }}
          >
            <option value="">{t("joinPickTown")}</option>
            {SARAWAK_TOWNS.map((town) => (
              <option key={town} value={town}>
                {town}
              </option>
            ))}
            <option value="__lain">{t("applicationOptAgamaLain")}</option>
          </select>
          {otherTown ? (
            <input
              className="profile-input join-input join-input--second"
              aria-label={t("applicationLblNyatakan")}
              placeholder={t("applicationLblNyatakan")}
              autoFocus
              value={d.tempatLahir}
              onChange={(e) => patch({ tempatLahir: e.target.value })}
            />
          ) : null}
        </>
      ) : (
        <input id="join-pob" className="profile-input join-input" placeholder={t("joinBornAbroad")} value={d.tempatLahir} onChange={(e) => patch({ tempatLahir: e.target.value })} />
      )}

      <p className="join-label">{t("applicationLblAgama")}</p>
      <Chips
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
          value={d.agamaLain}
          onChange={(e) => patch({ agamaLain: e.target.value })}
        />
      ) : null}

      <p className="join-label">{t("applicationLblBangsa")}</p>
      <Chips
        label={t("applicationLblBangsa")}
        value={d.bangsa}
        onPick={(v) => patch({ bangsa: v, bangsaLain: v === "lain" ? d.bangsaLain : "" })}
        options={BANGSA_VALUES.map((v) => [v, t(BANGSA_MSG[v])] as const)}
      />
      {d.bangsa === "lain" ? (
        <input
          className="profile-input join-input join-input--second"
          placeholder={t("applicationLblNyatakan")}
          aria-label={t("applicationLblNyatakan")}
          value={d.bangsaLain}
          onChange={(e) => patch({ bangsaLain: e.target.value })}
        />
      ) : null}
    </>
  );
}

/** Phone, e-mail (encouraged; "no e-mail" is allowed) and home address. */
function Hubungi({ d, patch, t }: BodyProps) {
  return (
    <>
      <Heading title={t("qTelefon")} />
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
        placeholder="012-3456789"
        value={d.telBimbit}
        onChange={(e) => patch({ telBimbit: e.target.value })}
        onBlur={() => patch({ telBimbit: formatPhone(d.telBimbit) })}
      />

      <label className="join-label" htmlFor="join-email">
        {t("applicationLblEmail")}
      </label>
      <input
        id="join-email"
        type="email"
        inputMode="email"
        autoComplete="email"
        autoCapitalize="none"
        className="profile-input join-input"
        disabled={d.tiadaEmail}
        value={d.email}
        onChange={(e) => patch({ email: e.target.value })}
      />
      <label className="join-check">
        <input type="checkbox" checked={d.tiadaEmail} onChange={(e) => patch({ tiadaEmail: e.target.checked, email: e.target.checked ? "" : d.email })} />
        <span>{t("joinNoEmail")}</span>
      </label>
      <p className={d.tiadaEmail ? "join-nudge" : "join-note"}>{t(d.tiadaEmail ? "joinNoEmailNudge" : "joinEmailWhy")}</p>

      <label className="join-label" htmlFor="join-alamat">
        {t("applicationLblAlamatRumah")}
      </label>
      <textarea
        id="join-alamat"
        className="profile-input join-input join-textarea"
        autoComplete="street-address"
        rows={3}
        value={d.alamatRumah}
        onChange={(e) => patch({ alamatRumah: e.target.value })}
      />
    </>
  );
}

/** Work, with the optional extras tucked away. */
function Kerja({ d, patch, t }: BodyProps) {
  return (
    <>
      <Heading title={t("qPekerjaan")} />
      <Chips
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

      <details className="join-more">
        <summary>{t("joinMore")}</summary>
        <label className="join-label" htmlFor="join-office">
          {t("applicationLblAlamatPejabat")}
        </label>
        <textarea id="join-office" className="profile-input join-input join-textarea" rows={3} value={d.alamatPejabat} onChange={(e) => patch({ alamatPejabat: e.target.value })} />
        <label className="join-label" htmlFor="join-telrumah">
          {t("applicationLblTelRumah")}
        </label>
        <input id="join-telrumah" type="tel" inputMode="tel" className="profile-input join-input" value={d.telRumah} onChange={(e) => patch({ telRumah: e.target.value })} onBlur={() => patch({ telRumah: formatPhone(d.telRumah) })} />
        <label className="join-label" htmlFor="join-telpejabat">
          {t("applicationLblTelPejabat")}
        </label>
        <input id="join-telpejabat" type="tel" inputMode="tel" className="profile-input join-input" value={d.telPejabat} onChange={(e) => patch({ telPejabat: e.target.value })} onBlur={() => patch({ telPejabat: formatPhone(d.telPejabat) })} />
      </details>
    </>
  );
}

