import { useCallback, useEffect, useState } from "react";
import { applicationEndpoint, attachApplicationPdf, bytesToBase64, submitApplication, uploadSignedForm } from "./applicationApi";
import { useI18n, type MessageKey } from "./i18n";
import { SignedFormUpload } from "./SignedFormUpload";
import { BorangPreview } from "./BorangPreview";
import { SignaturePad, type SignatureResult } from "./SignaturePad";
import { WelcomePack } from "./WelcomePack";
import { ApplicationSteps } from "./ApplicationSteps";
import { clearApplication, markApplicationSigned, readApplication, saveApplication, type ApplicationRecord } from "./applicationRecord";
import type { BorangOp } from "./borangPdf";
import {
  CAWANGAN_OPTIONS,
  DUN_CAWANGAN_OPTIONS,
  getCawanganDisplayLabel,
} from "./cawanganOptions";

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

/** Fields the receiving script requires, with the label shown when one is missing. */
const REQUIRED: [keyof Draft, MessageKey][] = [
  ["cawangan", "applicationLblCawangan"],
  ["nama", "applicationLblNamaIc"],
  ["noKadPengenalan", "applicationLblIcNo"],
  ["telBimbit", "applicationLblTelBimbit"],
  ["kategoriAhli", "applicationLblKategoriAhli"],
];

type SendState =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent"; ref: string }
  | { kind: "error"; message: string };

/** The applicant's filled-in official form, made in their browser after a successful submit. */
type PdfState =
  | { kind: "none" }
  | { kind: "making" }
  | { kind: "ready"; url: string; name: string; ops: BorangOp[] }
  | { kind: "failed" };

/** The form, one short step at a time. Required fields are checked when leaving their step. */
const STEPS = ["stepWho", "stepContact", "stepMembership", "stepReview"] as const;
const STEP_REQUIRED: (keyof Draft)[][] = [["cawangan", "nama", "noKadPengenalan"], ["telBimbit"], ["kategoriAhli"], []];

function hasDraftContent(d: Draft): boolean {
  return Boolean(d.nama || d.cawangan || d.noKadPengenalan || d.telBimbit || d.email || d.alamatRumah);
}

/** First visit: carry the name and cawangan over from the Saya profile so nothing is typed twice. */
function prefillFromProfile(d: Draft): Draft {
  if (hasDraftContent(d)) return d;
  try {
    const raw = localStorage.getItem("beliapbb_profile");
    if (!raw) return d;
    const p = JSON.parse(raw) as { name?: unknown; cawangan?: unknown };
    const name = typeof p.name === "string" ? p.name.trim() : "";
    const cawangan = typeof p.cawangan === "string" && CAWANGAN_OPTIONS.includes(p.cawangan) ? p.cawangan : "";
    return { ...d, nama: name.toUpperCase(), cawangan };
  } catch {
    return d;
  }
}

/** dd/mm/yyyy in Kuching time, as printed next to the signature. */
const kuchingToday = () => new Date().toLocaleDateString("en-GB", { timeZone: "Asia/Kuching" });

async function makeFilledPdf(
  data: Draft,
  ref: string,
  signature?: { dataUrl: string; aspect: number; date: string },
): Promise<{ bytes: Uint8Array; ops: BorangOp[] }> {
  const [{ fillBorangPdf }, template] = await Promise.all([
    import("./borangPdf"),
    fetch(BORANG_PDF).then((r) => {
      if (!r.ok) throw new Error("template");
      return r.arrayBuffer();
    }),
  ]);
  return fillBorangPdf(template, data, ref, signature);
}

export function ApplicationPage({ onFocusChange, onExit }: { onFocusChange?: (focus: boolean) => void; onExit?: () => void }) {
  const { t } = useI18n();
  const endpoint = applicationEndpoint();
  const [d, setD] = useState<Draft>(() => prefillFromProfile(readDraft()));
  const [saved, setSaved] = useState(false);
  const [send, setSend] = useState<SendState>({ kind: "idle" });
  const [pdf, setPdf] = useState<PdfState>({ kind: "none" });
  /** Kept in memory only, to pre-fill the signed-form upload right after submitting. */
  const [sentIc, setSentIc] = useState("");
  /** The submitted answers, kept in memory so the form can be re-drawn with the signature on it. */
  const [sentData, setSentData] = useState<Draft | null>(null);
  const [signature, setSignature] = useState<SignatureResult | null>(null);
  /** Signature drawn on the form page itself, before submitting (optional). */
  const [formSignature, setFormSignature] = useState<SignatureResult | null>(null);
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [signError, setSignError] = useState<MessageKey | null>(null);
  /** After submitting: the sign page, then the welcome pack on its own page. */
  const [stage, setStage] = useState<"sign" | "welcome">("sign");
  /** Which short step of the form is showing (0-3), and whether the intro has been dismissed. */
  const [step, setStep] = useState(0);
  const [started, setStarted] = useState(() => hasDraftContent(readDraft()));
  const [stepError, setStepError] = useState<string | null>(null);
  /** The official form as it will print, shown on the review step. */
  const [previewOps, setPreviewOps] = useState<BorangOp[] | null>(null);
  /** An application already sent from this device. */
  const [record, setRecord] = useState<ApplicationRecord | null>(() => readApplication());
  /** Joining (intro, steps, the pages right after sending) runs without the tab bar; the status view does not. */
  const focusMode = send.kind === "sent" || !record;
  useEffect(() => {
    onFocusChange?.(focusMode);
    return () => onFocusChange?.(false);
  }, [focusMode, onFocusChange]);
  /* Spam trap: hidden from people, filled in by bots */
  const [website, setWebsite] = useState("");

  const bangsaLabel = useCallback((v: BangsaVal) => t(BANGSA_MSG[v]), [t]);

  const patch = useCallback((p: Partial<Draft>) => {
    setD((prev) => ({ ...prev, ...p }));
    setSaved(false);
  }, []);

  const saveLocally = useCallback(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(d));
      return true;
    } catch {
      return false;
    }
  }, [d]);

  // Autosave: nothing typed is lost if the tab closes or the phone sleeps.
  useEffect(() => {
    if (send.kind === "sent") return;
    const id = window.setTimeout(() => {
      if (hasDraftContent(d)) saveLocally();
    }, 500);
    return () => window.clearTimeout(id);
  }, [d, send.kind, saveLocally]);

  // Review step: draw the official form from the answers so far (no reference number yet).
  useEffect(() => {
    if (step !== 3 || send.kind === "sent") return;
    let live = true;
    setPreviewOps(null);
    makeFilledPdf(d, "")
      .then((made) => live && setPreviewOps(made.ops))
      .catch(() => live && setPreviewOps([]));
    return () => {
      live = false;
    };
    // Only when the review step opens; later edits to the declaration don't redraw the form.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const validateStep = (n: number): string | null => {
    const labels = Object.fromEntries(REQUIRED) as Record<string, MessageKey>;
    const missing = STEP_REQUIRED[n].filter((k) => !String(d[k]).trim()).map((k) => t(labels[k as string]));
    if (missing.length) return t("applicationErrorMissing").replace("{{fields}}", missing.join(", "));
    if (n === 0 && d.noKadPengenalan.replace(/\D/g, "").length !== 12) return t("applicationErrorIc");
    return null;
  };

  const goStep = (next: number) => {
    setStepError(null);
    setStep(next);
    window.scrollTo({ top: 0 });
  };

  const nextStep = () => {
    const err = validateStep(step);
    if (err) setStepError(err);
    else goStep(step + 1);
  };

  const sendOnline = useCallback(async (url: string) => {
    const missing = REQUIRED.filter(([key]) => !String(d[key]).trim()).map(([, label]) => t(label));
    if (missing.length) {
      setSend({ kind: "error", message: t("applicationErrorMissing").replace("{{fields}}", missing.join(", ")) });
      return;
    }
    if (d.noKadPengenalan.replace(/\D/g, "").length !== 12) {
      setSend({ kind: "error", message: t("applicationErrorIc") });
      return;
    }
    setSend({ kind: "sending" });
    const submitted = d; // keep the answers: the form is cleared below, the PDF is made from this copy
    const result = await submitApplication(url, { ...d, website });
    if (result.ok) {
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        /* private mode */
      }
      setD(emptyDraft);
      setSentIc(submitted.noKadPengenalan.replace(/\D/g, ""));
      setSentData(submitted);
      const rec: ApplicationRecord = { ref: result.ref, signed: false, at: new Date().toISOString() };
      saveApplication(rec);
      setRecord(rec);
      setSend({ kind: "sent", ref: result.ref });
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Fill in the official PDF on this device (with the signature, if they drew one on the form page).
      setPdf({ kind: "making" });
      let bytes: Uint8Array | null = null;
      let filedSigned = false;
      try {
        const sig = formSignature ? { ...formSignature, date: kuchingToday() } : undefined;
        const made = await makeFilledPdf(submitted, result.ref, sig);
        bytes = made.bytes;
        const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
        setPdf({
          kind: "ready",
          url: URL.createObjectURL(blob),
          name: `Borang-PBB-${result.ref}${sig ? "-bertandatangan" : ""}.pdf`,
          ops: made.ops,
        });
        if (sig) {
          // Signed on the form page: file the signed copy now (this also e-mails it to the applicant).
          const up = await uploadSignedForm(url, result.ref, submitted.noKadPengenalan.replace(/\D/g, ""), [bytesToBase64(bytes)], "digital");
          filedSigned = up.ok;
          if (up.ok) {
            setSigned(true);
            markApplicationSigned();
            setRecord((r) => (r ? { ...r, signed: true } : r));
          }
        }
      } catch {
        setPdf({ kind: "failed" });
      }
      setFormSignature(null);
      // Not signed here (or filing failed): hand over the filled form so the applicant still gets their e-mail.
      if (!filedSigned && result.token) void attachApplicationPdf(url, result.ref, result.token, bytes);
      return;
    }
    saveLocally();
    setSend({
      kind: "error",
      message: result.error === "ic" ? t("applicationErrorIc") : t("applicationErrorGeneric"),
    });
  }, [d, website, formSignature, saveLocally, t]);

  /** Stamp the drawn signature and today's date onto the form, show it, and file the signed copy. */
  const signForm = useCallback(async () => {
    if (send.kind !== "sent" || !sentData || !endpoint) return;
    if (!signature) {
      setSignError("signPadNeed");
      return;
    }
    setSigning(true);
    setSignError(null);
    try {
      const made = await makeFilledPdf(sentData, send.ref, { ...signature, date: kuchingToday() });
      const blob = new Blob([made.bytes as BlobPart], { type: "application/pdf" });
      const result = await uploadSignedForm(endpoint, send.ref, sentIc, [bytesToBase64(made.bytes)], "digital");
      // Show the signed form either way; only mark it submitted once the secretariat has it.
      setPdf((prev) => {
        if (prev.kind === "ready") URL.revokeObjectURL(prev.url);
        return { kind: "ready", url: URL.createObjectURL(blob), name: `Borang-PBB-${send.ref}-bertandatangan.pdf`, ops: made.ops };
      });
      if (result.ok) {
        setSigned(true);
        markApplicationSigned();
        setRecord((r) => (r ? { ...r, signed: true } : r));
      } else setSignError(result.error === "busy" || result.error === "network" || result.error === "server" ? "signedErrorGeneric" : "signedErrorMatch");
    } catch {
      setSignError("signedErrorGeneric");
    } finally {
      setSigning(false);
    }
  }, [send, sentData, endpoint, signature, sentIc]);

  const submit = useCallback(() => {
    if (!d.pengakuan) return;
    if (endpoint) {
      void sendOnline(endpoint);
      return;
    }
    setSaved(saveLocally());
  }, [d, endpoint, sendOnline, saveLocally]);

  const pekerjaanNeedsDetail = d.pekerjaan === "kerajaan" || d.pekerjaan === "swasta" || d.pekerjaan === "sendiri" || d.pekerjaan === "lain";

  const startAnother = () => {
    if (pdf.kind === "ready") URL.revokeObjectURL(pdf.url);
    setPdf({ kind: "none" });
    setSentIc("");
    setSentData(null);
    setSignature(null);
    setSigned(false);
    setSignError(null);
    setFormSignature(null);
    clearApplication();
    setRecord(null);
    setStep(0);
    setStarted(false);
    setStepError(null);
    setPreviewOps(null);
    setStage("sign");
    setSend({ kind: "idle" });
  };

  const goTo = (next: "sign" | "welcome") => {
    setStage(next);
    window.scrollTo({ top: 0 });
  };

  if (send.kind === "sent" && stage === "welcome") {
    return (
      <section className="section section--apply" aria-label={t("applicationTitle")}>
        <WelcomePack reference={send.ref} signed={signed} onBack={() => goTo("sign")} onAnother={startAnother} onDone={onExit} />
      </section>
    );
  }

  if (send.kind === "sent") {
    return (
      <section className="section section--apply" aria-label={t("applicationTitle")}>
        <div className="application-sent profile-card" role="status">
          <h2>{t("applicationSentTitle")}</h2>
          <p className="application-sent-ref">{send.ref}</p>
          <p>{t("applicationSentBody")}</p>
          <ApplicationSteps signed={signed} />
          {pdf.kind === "making" ? <p className="application-sent-pdf-note">{t("applicationPdfMaking")}</p> : null}
          {pdf.kind === "ready" ? (
            <>
              <BorangPreview ops={pdf.ops} />
              {signed ? (
                <div className="application-sign" role="status">
                  <h3 className="application-signed-title">{t("signDoneTitle")}</h3>
                  <p className="application-sent-pdf-note">{t("signDoneBody")}</p>
                </div>
              ) : (
                <div className="application-sign">
                  <h3 className="application-signed-title">{t("signPadTitle")}</h3>
                  <p className="application-sent-pdf-note">{t("signPadIntro")}</p>
                  <SignaturePad onChange={setSignature} disabled={signing} />
                  <button type="button" className="profile-save-btn application-sent-pdf-btn" onClick={() => void signForm()} disabled={signing}>
                    {signing ? t("signPadSigning") : t("signPadSubmit")}
                  </button>
                  {signError ? (
                    <p className="application-error-msg" role="alert">
                      {t(signError)}
                    </p>
                  ) : null}
                </div>
              )}
              <a className="profile-save-btn profile-save-btn--secondary application-sent-pdf-btn" href={pdf.url} download={pdf.name}>
                {t(signed ? "applicationPdfDownloadSigned" : "applicationPdfDownload")}
              </a>
              {signed ? null : <p className="application-sent-pdf-note">{t("applicationPdfNext")}</p>}
            </>
          ) : null}
          {pdf.kind === "failed" ? <p className="application-sent-pdf-note">{t("applicationPdfFailed")}</p> : null}
          {signed ? null : (
            <details className="application-signed-details">
              <summary>{t("signPaperSummary")}</summary>
              <SignedFormUpload initialRef={send.ref} initialIc={sentIc} />
            </details>
          )}
          {pdf.kind === "making" ? null : (
            <button
              type="button"
              className={`profile-save-btn application-sent-next${signed ? "" : " profile-save-btn--secondary"}`}
              onClick={() => goTo("welcome")}
            >
              {t("welcomePackNext")}
            </button>
          )}
        </div>
      </section>
    );
  }

  // Already applied from this device: show where it stands instead of a blank form.
  if (record) {
    return (
      <section className="section section--apply" aria-label={t("applicationTitle")}>
        <WelcomePack
          reference={record.ref}
          signed={record.signed}
          title={t("statusTitle")}
          intro={t("statusIntro")}
          pendingText={t("statusPending")}
          onAnother={startAnother}
        >
          {record.signed ? null : (
            <SignedFormUpload
              initialRef={record.ref}
              onDone={() => {
                markApplicationSigned();
                setRecord((r) => (r ? { ...r, signed: true } : r));
              }}
            />
          )}
        </WelcomePack>
      </section>
    );
  }

  if (!started) {
    return (
      <section className="section section--apply" aria-label={t("applicationTitle")}>
        <div className="application-start profile-card">
          <h2>{t("startTitle")}</h2>
          <p className="application-sent-pdf-note">{t("startBody")}</p>
          <ol className="application-start-steps">
            <li>{t("startS1")}</li>
            <li>{t("startS2")}</li>
            <li>{t("startS3")}</li>
          </ol>
          <button
            type="button"
            className="profile-save-btn"
            onClick={() => {
              setStarted(true);
              window.scrollTo({ top: 0 });
            }}
          >
            {t("startBtn")}
          </button>
          {endpoint ? (
            <details className="application-signed-details">
              <summary>{t("startHaveRef")}</summary>
              <SignedFormUpload />
            </details>
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <section className="section section--apply" aria-label={t("applicationTitle")}>
      <nav className="form-stepper" aria-label={t("stepsAria")}>
        <p className="form-stepper-count">
          {t("stepCount").replace("{{n}}", String(step + 1)).replace("{{total}}", String(STEPS.length))} · <strong>{t(STEPS[step])}</strong>
        </p>
        <div className="form-stepper-bar" role="presentation">
          {STEPS.map((key, i) => (
            <span key={key} data-state={i < step ? "done" : i === step ? "current" : "todo"} />
          ))}
        </div>
      </nav>

      <div className="application-form">
        {step === 0 ? (
          <>
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
                  {getCawanganDisplayLabel(opt, t)}
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

          </>
        ) : null}
        {step === 1 ? (
          <>
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

          </>
        ) : null}
        {step === 2 ? (
          <>
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
              {DUN_CAWANGAN_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {getCawanganDisplayLabel(opt, t)}
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

          </>
        ) : null}
        {step === 3 ? (
          <>
        <h2 className="application-section-title">{t("reviewTitle")}</h2>
        <p className="application-sent-pdf-note">{t("reviewHint")}</p>
        {previewOps === null ? <p className="application-sent-pdf-note">{t("applicationPdfMaking")}</p> : previewOps.length ? <BorangPreview ops={previewOps} /> : null}

        <h2 className="application-section-title">{t("applicationSectionDeclaration")}</h2>
        <div className="profile-card profile-card--tight-top">
          <p className="application-declaration-text">{t("applicationDeclarationBody")}</p>
          <p className="application-declaration-text">{t("applicationPrivacyNote")}</p>
          <label className="application-check application-declaration-check">
            <input type="checkbox" checked={d.pengakuan} onChange={(e) => patch({ pengakuan: e.target.checked })} />
            <span>{t("applicationDeclarationCheckbox")}</span>
          </label>

          <div className="application-form-sign">
            <h3 className="application-signed-title">{t("formSignTitle")}</h3>
            <p className="application-sent-pdf-note">{t("formSignHint")}</p>
            <SignaturePad onChange={setFormSignature} disabled={send.kind === "sending"} />
          </div>
        </div>

        <p className="application-office-note">{t("applicationOfficeNote")}</p>

          </>
        ) : null}

        <label className="application-hp" aria-hidden="true">
          Website
          <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
        </label>

        <div className="application-actions">
          {step < 3 ? (
            <button type="button" className="profile-save-btn" onClick={nextStep}>
              {t("stepNext")}
            </button>
          ) : (
            <button type="button" className="profile-save-btn" disabled={!d.pengakuan || send.kind === "sending"} onClick={submit}>
              {endpoint ? t(send.kind === "sending" ? "applicationSending" : "applicationSendBtn") : t("applicationSubmitBtn")}
            </button>
          )}
          {step > 0 ? (
            <button
              type="button"
              className="profile-save-btn profile-save-btn--secondary"
              onClick={() => goStep(step - 1)}
              disabled={send.kind === "sending"}
            >
              {t("stepBack")}
            </button>
          ) : null}
          {stepError ? (
            <p className="application-error-msg" role="alert">
              {stepError}
            </p>
          ) : null}
          {send.kind === "error" ? (
            <p className="application-error-msg" role="alert">
              {send.message}
            </p>
          ) : null}
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
