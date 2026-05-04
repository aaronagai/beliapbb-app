import { useCallback, useState } from "react";
import { useI18n, type MessageKey } from "./i18n";
import { CAWANGAN_OPTIONS, formatCawanganLabel } from "./cawanganOptions";

const BORANG_PDF = `${import.meta.env.BASE_URL}borang-permohonan-pbb.pdf`;
const DRAFT_KEY = "beliapbb_application_draft";

const PARLIMEN_SARAWAK_OPTIONS = [
  "P.192 MAS GADING",
  "P.193 SANTUBONG",
  "P.194 PETRA JAYA",
  "P.195 BANDAR KUCHING",
  "P.196 STAMPIN",
  "P.197 KOTA SAMARAHAN",
  "P.198 PUNCAK BORNEO",
  "P.199 SERIAN",
  "P.200 BATANG SADONG",
  "P.201 BATANG LUPAR",
  "P.202 SRI AMAN",
  "P.203 LUBOK ANTU",
  "P.204 BETONG",
  "P.205 SARATOK",
  "P.206 TANJONG MANIS",
  "P.207 IGAN",
  "P.208 SARIKEI",
  "P.209 JULAU",
  "P.210 KANOWIT",
  "P.211 LANANG",
  "P.212 SIBU",
  "P.213 MUKAH",
  "P.214 SELANGAU",
  "P.215 KAPIT",
  "P.216 HULU RAJANG",
  "P.217 BINTULU",
  "P.218 SIBUTI",
  "P.219 MIRI",
  "P.220 BARAM",
  "P.221 LIMBANG",
  "P.222 LAWAS",
] as const;

const BANGSA_VALUES = [
  "melayu_melanau",
  "iban",
  "kedayan",
  "bidayuh",
  "kayan",
  "kelabit",
  "kenyah",
  "lun_bawang",
  "lain",
] as const;

type BangsaVal = (typeof BANGSA_VALUES)[number];

const BANGSA_MSG: Record<BangsaVal, MessageKey> = {
  melayu_melanau: "applicationBangsa_melayu_melanau",
  iban: "applicationBangsa_iban",
  kedayan: "applicationBangsa_kedayan",
  bidayuh: "applicationBangsa_bidayuh",
  kayan: "applicationBangsa_kayan",
  kelabit: "applicationBangsa_kelabit",
  kenyah: "applicationBangsa_kenyah",
  lun_bawang: "applicationBangsa_lun_bawang",
  lain: "applicationBangsa_lain",
};

type Draft = {
  cawangan: string;
  rantingNo: string;
  nama: string;
  tarikhLahir: string;
  agama: "" | "islam" | "kristian" | "lain";
  agamaLain: string;
  bangsa: BangsaVal | "";
  bangsaLain: string;
  tempatLahir: string;
  jantina: "" | "lelaki" | "perempuan";
  icBaru: boolean;
  icLama: boolean;
  noKadPengenalan: string;
  alamatRumah: string;
  alamatPejabat: string;
  pekerjaan: "" | "kerajaan" | "swasta" | "sendiri" | "lain";
  pekerjaanNyata: string;
  telRumah: string;
  telPejabat: string;
  telBimbit: string;
  email: string;
  kawasanParlimen: string;
  kawasanNegeri: string;
  kategoriAhli: "" | "induk" | "belia" | "wanita" | "pemuda";
  pengakuan: boolean;
  pencadangNama: string;
  pencadangIc: string;
  pencadangJawatan: string;
  penyokongNama: string;
  penyokongIc: string;
  penyokongJawatan: string;
};

const emptyDraft: Draft = {
  cawangan: "",
  rantingNo: "",
  nama: "",
  tarikhLahir: "",
  agama: "",
  agamaLain: "",
  bangsa: "",
  bangsaLain: "",
  tempatLahir: "",
  jantina: "",
  icBaru: false,
  icLama: false,
  noKadPengenalan: "",
  alamatRumah: "",
  alamatPejabat: "",
  pekerjaan: "",
  pekerjaanNyata: "",
  telRumah: "",
  telPejabat: "",
  telBimbit: "",
  email: "",
  kawasanParlimen: "",
  kawasanNegeri: "",
  kategoriAhli: "",
  pengakuan: false,
  pencadangNama: "",
  pencadangIc: "",
  pencadangJawatan: "",
  penyokongNama: "",
  penyokongIc: "",
  penyokongJawatan: "",
};

function readDraft(): Draft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return emptyDraft;
    const p = JSON.parse(raw) as Partial<Draft>;
    return { ...emptyDraft, ...p };
  } catch {
    return emptyDraft;
  }
}

export function ApplicationPage() {
  const { t } = useI18n();
  const [d, setD] = useState<Draft>(() => readDraft());
  const [saved, setSaved] = useState(false);

  const bangsaLabel = useCallback((v: BangsaVal) => t(BANGSA_MSG[v]), [t]);

  const patch = useCallback((p: Partial<Draft>) => {
    setD((prev) => ({ ...prev, ...p }));
    setSaved(false);
  }, []);

  const submit = useCallback(() => {
    if (!d.pengakuan) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
      setSaved(true);
    } catch {
      /* ignore */
    }
  }, [d]);

  const pekerjaanNeedsDetail = d.pekerjaan === "kerajaan" || d.pekerjaan === "swasta" || d.pekerjaan === "sendiri" || d.pekerjaan === "lain";

  return (
    <section className="section section--apply" aria-label={t("applicationTitle")}>
      <div className="application-intro profile-card">
        <p className="application-intro-text">{t("applicationSubtitle")}</p>
        <a className="application-pdf-link" href={BORANG_PDF} target="_blank" rel="noopener noreferrer">
          {t("applicationDownloadBlank")}
        </a>
      </div>

      <div className="application-form">
        <h2 className="application-section-title">{t("applicationSectionIdentity")}</h2>
        <div className="profile-card">
          <label className="profile-field" htmlFor="app-cawangan">
            <span className="profile-label">{t("applicationLblCawangan")}</span>
            <select
              id="app-cawangan"
              className="profile-input profile-select"
              value={d.cawangan}
              onChange={(e) => patch({ cawangan: e.target.value })}
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
        <div className="profile-card">
          <label className="profile-field" htmlFor="app-ranting">
            <span className="profile-label">{t("applicationLblRantingNo")}</span>
            <input
              id="app-ranting"
              className="profile-input"
              value={d.rantingNo}
              onChange={(e) => patch({ rantingNo: e.target.value })}
              autoComplete="off"
            />
          </label>
        </div>
        <div className="profile-card">
          <label className="profile-field" htmlFor="app-nama">
            <span className="profile-label">{t("applicationLblNamaIc")}</span>
            <input
              id="app-nama"
              className="profile-input"
              value={d.nama}
              onChange={(e) => patch({ nama: e.target.value })}
              autoComplete="name"
            />
          </label>
        </div>
        <div className="profile-card">
          <label className="profile-field" htmlFor="app-dob">
            <span className="profile-label">{t("applicationLblTarikhLahir")}</span>
            <input
              id="app-dob"
              className="profile-input"
              type="date"
              value={d.tarikhLahir}
              onChange={(e) => patch({ tarikhLahir: e.target.value })}
            />
          </label>
        </div>

        <div className="profile-card">
          <fieldset className="application-fieldset">
            <legend className="profile-label">{t("applicationLblAgama")}</legend>
            <label className="application-radio">
              <input type="radio" name="agama" checked={d.agama === "islam"} onChange={() => patch({ agama: "islam", agamaLain: "" })} />
              <span>{t("applicationOptAgamaIslam")}</span>
            </label>
            <label className="application-radio">
              <input type="radio" name="agama" checked={d.agama === "kristian"} onChange={() => patch({ agama: "kristian", agamaLain: "" })} />
              <span>{t("applicationOptAgamaKristian")}</span>
            </label>
            <label className="application-radio">
              <input type="radio" name="agama" checked={d.agama === "lain"} onChange={() => patch({ agama: "lain" })} />
              <span>{t("applicationOptAgamaLain")}</span>
            </label>
            {d.agama === "lain" ? (
              <input
                className="profile-input application-radio-follow"
                value={d.agamaLain}
                onChange={(e) => patch({ agamaLain: e.target.value })}
                placeholder={t("applicationLblNyatakan")}
              />
            ) : null}
          </fieldset>
        </div>

        <div className="profile-card">
          <label className="profile-field" htmlFor="app-bangsa">
            <span className="profile-label">{t("applicationLblBangsa")}</span>
            <select
              id="app-bangsa"
              className="profile-input profile-select"
              value={d.bangsa}
              onChange={(e) => patch({ bangsa: e.target.value as BangsaVal | "", bangsaLain: "" })}
            >
              <option value="">{t("applicationBangsaSelect")}</option>
              {BANGSA_VALUES.map((v) => (
                <option key={v} value={v}>
                  {bangsaLabel(v)}
                </option>
              ))}
            </select>
          </label>
          {d.bangsa === "lain" ? (
            <label className="profile-field application-field-spaced" htmlFor="app-bangsa-lain">
              <span className="profile-label">{t("applicationLblNyatakan")}</span>
              <input
                id="app-bangsa-lain"
                className="profile-input"
                value={d.bangsaLain}
                onChange={(e) => patch({ bangsaLain: e.target.value })}
              />
            </label>
          ) : null}
        </div>

        <div className="profile-card">
          <label className="profile-field" htmlFor="app-tempat-lahir">
            <span className="profile-label">{t("applicationLblTempatLahir")}</span>
            <input
              id="app-tempat-lahir"
              className="profile-input"
              value={d.tempatLahir}
              onChange={(e) => patch({ tempatLahir: e.target.value })}
            />
          </label>
        </div>

        <div className="profile-card">
          <fieldset className="application-fieldset">
            <legend className="profile-label">{t("applicationLblJantina")}</legend>
            <label className="application-radio">
              <input type="radio" name="jantina" checked={d.jantina === "lelaki"} onChange={() => patch({ jantina: "lelaki" })} />
              <span>{t("applicationOptJantinaLelaki")}</span>
            </label>
            <label className="application-radio">
              <input type="radio" name="jantina" checked={d.jantina === "perempuan"} onChange={() => patch({ jantina: "perempuan" })} />
              <span>{t("applicationOptJantinaPerempuan")}</span>
            </label>
          </fieldset>
        </div>

        <div className="profile-card">
          <label className="profile-field" htmlFor="app-ic">
            <span className="profile-label">{t("applicationLblIcNo")}</span>
            <input
              id="app-ic"
              className="profile-input"
              inputMode="numeric"
              value={d.noKadPengenalan}
              onChange={(e) => patch({ noKadPengenalan: e.target.value })}
              autoComplete="off"
            />
          </label>
          <div className="application-ic-flags">
            <label className="application-check">
              <input type="checkbox" checked={d.icBaru} onChange={(e) => patch({ icBaru: e.target.checked })} />
              <span>{t("applicationLblIcBaru")}</span>
            </label>
            <label className="application-check">
              <input type="checkbox" checked={d.icLama} onChange={(e) => patch({ icLama: e.target.checked })} />
              <span>{t("applicationLblIcLama")}</span>
            </label>
          </div>
          <p className="application-hint">{t("applicationIcHint")}</p>
        </div>

        <h2 className="application-section-title">{t("applicationSectionAddress")}</h2>
        <div className="profile-card">
          <label className="profile-field" htmlFor="app-addr-home">
            <span className="profile-label">{t("applicationLblAlamatRumah")}</span>
            <textarea
              id="app-addr-home"
              className="profile-input application-textarea"
              rows={3}
              value={d.alamatRumah}
              onChange={(e) => patch({ alamatRumah: e.target.value })}
            />
          </label>
        </div>
        <div className="profile-card">
          <label className="profile-field" htmlFor="app-addr-work">
            <span className="profile-label">{t("applicationLblAlamatPejabat")}</span>
            <textarea
              id="app-addr-work"
              className="profile-input application-textarea"
              rows={3}
              value={d.alamatPejabat}
              onChange={(e) => patch({ alamatPejabat: e.target.value })}
            />
          </label>
        </div>

        <div className="profile-card">
          <fieldset className="application-fieldset">
            <legend className="profile-label">{t("applicationLblPekerjaan")}</legend>
            {(
              [
                ["kerajaan", "applicationOptPekerjaan_kerajaan"],
                ["swasta", "applicationOptPekerjaan_swasta"],
                ["sendiri", "applicationOptPekerjaan_sendiri"],
                ["lain", "applicationOptPekerjaan_lain"],
              ] as const
            ).map(([p, key]) => (
              <label key={p} className="application-radio">
                <input type="radio" name="pekerjaan" checked={d.pekerjaan === p} onChange={() => patch({ pekerjaan: p })} />
                <span>{t(key)}</span>
              </label>
            ))}
            {pekerjaanNeedsDetail ? (
              <input
                className="profile-input application-radio-follow"
                value={d.pekerjaanNyata}
                onChange={(e) => patch({ pekerjaanNyata: e.target.value })}
                placeholder={t("applicationLblNyatakan")}
              />
            ) : null}
          </fieldset>
        </div>

        <h2 className="application-section-title">{t("applicationSectionContact")}</h2>
        <div className="profile-card">
          <label className="profile-field" htmlFor="app-tel-r">
            <span className="profile-label">{t("applicationLblTelRumah")}</span>
            <input id="app-tel-r" className="profile-input" value={d.telRumah} onChange={(e) => patch({ telRumah: e.target.value })} />
          </label>
        </div>
        <div className="profile-card">
          <label className="profile-field" htmlFor="app-tel-p">
            <span className="profile-label">{t("applicationLblTelPejabat")}</span>
            <input id="app-tel-p" className="profile-input" value={d.telPejabat} onChange={(e) => patch({ telPejabat: e.target.value })} />
          </label>
        </div>
        <div className="profile-card">
          <label className="profile-field" htmlFor="app-tel-m">
            <span className="profile-label">{t("applicationLblTelBimbit")}</span>
            <input id="app-tel-m" className="profile-input" value={d.telBimbit} onChange={(e) => patch({ telBimbit: e.target.value })} />
          </label>
        </div>
        <div className="profile-card">
          <label className="profile-field" htmlFor="app-email">
            <span className="profile-label">{t("applicationLblEmail")}</span>
            <input
              id="app-email"
              type="email"
              className="profile-input"
              value={d.email}
              onChange={(e) => patch({ email: e.target.value })}
              autoComplete="email"
            />
          </label>
        </div>

        <h2 className="application-section-title">{t("applicationSectionElectoral")}</h2>
        <div className="profile-card">
          <label className="profile-field" htmlFor="app-kp">
            <span className="profile-label">{t("applicationLblKawasanParlimen")}</span>
            <select
              id="app-kp"
              className="profile-input profile-select"
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
          </label>
        </div>
        <div className="profile-card">
          <label className="profile-field" htmlFor="app-kn">
            <span className="profile-label">{t("applicationLblKawasanNegeri")}</span>
            <select
              id="app-kn"
              className="profile-input profile-select"
              value={d.kawasanNegeri}
              onChange={(e) => patch({ kawasanNegeri: e.target.value })}
            >
              <option value="">{t("applicationOptDunSelect")}</option>
              {CAWANGAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {formatCawanganLabel(opt)}
                </option>
              ))}
            </select>
          </label>
        </div>

        <h2 className="application-section-title">{t("applicationSectionCategory")}</h2>
        <div className="profile-card">
          <fieldset className="application-fieldset">
            <legend className="profile-label">{t("applicationLblKategoriAhli")}</legend>
            {(
              [
                ["induk", "applicationOptKategori_induk"],
                ["wanita", "applicationOptKategori_wanita"],
                ["pemuda", "applicationOptKategori_pemuda"],
                ["belia", "applicationOptKategori_belia"],
              ] as const
            ).map(([k, key]) => (
              <label key={k} className="application-radio">
                <input type="radio" name="kat" checked={d.kategoriAhli === k} onChange={() => patch({ kategoriAhli: k })} />
                <span>{t(key)}</span>
              </label>
            ))}
          </fieldset>
        </div>

        <h2 className="application-section-title">{t("applicationSectionProposer")}</h2>
        <div className="profile-card">
          <p className="application-hint">{t("applicationProposerHint")}</p>
          <label className="profile-field" htmlFor="app-pen-n">
            <span className="profile-label">{t("applicationLblProposerName")}</span>
            <input id="app-pen-n" className="profile-input" value={d.pencadangNama} onChange={(e) => patch({ pencadangNama: e.target.value })} />
          </label>
          <label className="profile-field application-field-spaced" htmlFor="app-pen-ic">
            <span className="profile-label">{t("applicationLblProposerIc")}</span>
            <input id="app-pen-ic" className="profile-input" value={d.pencadangIc} onChange={(e) => patch({ pencadangIc: e.target.value })} />
          </label>
          <label className="profile-field application-field-spaced" htmlFor="app-pen-j">
            <span className="profile-label">{t("applicationLblProposerJawatan")}</span>
            <input id="app-pen-j" className="profile-input" value={d.pencadangJawatan} onChange={(e) => patch({ pencadangJawatan: e.target.value })} />
          </label>
        </div>
        <div className="profile-card">
          <label className="profile-field" htmlFor="app-peny-n">
            <span className="profile-label">{t("applicationLblSupporterName")}</span>
            <input id="app-peny-n" className="profile-input" value={d.penyokongNama} onChange={(e) => patch({ penyokongNama: e.target.value })} />
          </label>
          <label className="profile-field application-field-spaced" htmlFor="app-peny-ic">
            <span className="profile-label">{t("applicationLblSupporterIc")}</span>
            <input id="app-peny-ic" className="profile-input" value={d.penyokongIc} onChange={(e) => patch({ penyokongIc: e.target.value })} />
          </label>
          <label className="profile-field application-field-spaced" htmlFor="app-peny-j">
            <span className="profile-label">{t("applicationLblSupporterJawatan")}</span>
            <input id="app-peny-j" className="profile-input" value={d.penyokongJawatan} onChange={(e) => patch({ penyokongJawatan: e.target.value })} />
          </label>
        </div>

        <h2 className="application-section-title">{t("applicationSectionDeclaration")}</h2>
        <div className="profile-card">
          <p className="application-declaration-text">{t("applicationDeclarationBody")}</p>
          <label className="application-check application-declaration-check">
            <input type="checkbox" checked={d.pengakuan} onChange={(e) => patch({ pengakuan: e.target.checked })} />
            <span>{t("applicationDeclarationCheckbox")}</span>
          </label>
        </div>

        <p className="application-office-note">{t("applicationOfficeNote")}</p>

        <div className="application-actions">
          <button type="button" className="profile-save-btn" disabled={!d.pengakuan} onClick={submit}>
            {t("applicationSubmitBtn")}
          </button>
          {saved ? (
            <p className="application-saved-msg" role="status">
              {t("applicationSubmitDone")}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
