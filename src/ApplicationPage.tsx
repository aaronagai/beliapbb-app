import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { applicationEndpoint, attachApplicationPdf, bytesToBase64, submitApplication, uploadSignedForm } from "./applicationApi";
import { useI18n, type MessageKey } from "./i18n";
import { SignedFormUpload } from "./SignedFormUpload";
import { BorangPreview } from "./BorangPreview";
import { SignaturePad, type SignatureResult } from "./SignaturePad";
import type { Draft } from "./joinData";
import { JOIN_SCREENS, JoinScreenBody, PARTS, RAIL_LABEL, Reveal, partFill, useLast, screenIndex, validateScreen, type ScreenId } from "./JoinFlow";
import { ArrowLeft } from "reicon-react";
import { BANGSA_MSG } from "./joinData";
import { parseIc } from "./icInfo";
import { normaliseDraft } from "./normalise";
import { fireConfetti } from "./confetti";
import { parlimenOf } from "./joinData";
import { WelcomePack } from "./WelcomePack";
import { track } from "./analytics";
import { ApplicationSteps } from "./ApplicationSteps";
import { clearApplication, markApplicationSigned, readApplication, saveApplication, type ApplicationRecord } from "./applicationRecord";
import type { BorangOp } from "./borangPdf";
import {
  CAWANGAN_OPTIONS,
  getCawanganDisplayLabel,
} from "./cawanganOptions";

const BORANG_PDF = `${import.meta.env.BASE_URL}borang-permohonan-pbb.pdf`;
const DRAFT_KEY = "beliapbb_application_draft";

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
  tiadaEmail: false,
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

/** The last screen of the form: review, declaration, signature, send. */
const REVIEW = screenIndex("review");
const PENGAKUAN = screenIndex("pengakuan");

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
    const cawangan = typeof p.cawangan === "string" && /^N\.\d+\s/.test(p.cawangan) && CAWANGAN_OPTIONS.includes(p.cawangan) ? p.cawangan : "";
    return { ...d, nama: name.toUpperCase(), cawangan, kawasanNegeri: cawangan, kawasanParlimen: cawangan ? parlimenOf(cawangan) : "" };
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
  /** The signed copy is being filed (takes a few seconds): show that instead of the signing pad. */
  const [filing, setFiling] = useState(false);
  const [signError, setSignError] = useState<MessageKey | null>(null);
  /** After submitting: the sign page, then the welcome pack on its own page. */
  const [stage, setStage] = useState<"sign" | "welcome">("sign");
  /** Which short step of the form is showing (0-3), and whether the intro has been dismissed. */
  const [step, setStep] = useState(0);
  /** Furthest screen reached, so the desktop step list only lets you jump to places you have been. */
  const [maxStep, setMaxStep] = useState(0);
  /** True for a beat after a successful send, so the review fades away before the received page appears. */
  const [leaving, setLeaving] = useState(false);
  /** Which way the last move went (screens slide in from that side), and whether a review row sent us back to edit. */
  const [dir, setDir] = useState<"forward" | "back">("forward");
  const [returnTo, setReturnTo] = useState(false);
  const [started, setStarted] = useState(() => hasDraftContent(readDraft()));
  const [stepError, setStepError] = useState<string | null>(null);
  /** The official form as it will print, shown on the review step. */
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

  const errorText = stepError ?? (send.kind === "error" ? send.message : null);
  const shownError = useLast(errorText);

  // Desktop step list: slide the marker to the current step (measured, so it follows any text wrapping).
  const railRef = useRef<HTMLElement>(null);
  const [railReady, setRailReady] = useState(false);
  const moveRail = useCallback(() => {
    const el = railRef.current;
    const li = el?.querySelector<HTMLElement>('li[aria-current="step"]');
    const group = el?.querySelector<HTMLElement>('.join-rail-part[data-state="now"]');
    if (!el || !li || !group) return;
    el.style.setProperty("--item-y", `${li.offsetTop}px`);
    el.style.setProperty("--item-h", `${li.offsetHeight}px`);
    el.style.setProperty("--group-y", `${group.offsetTop}px`);
    el.style.setProperty("--group-h", `${group.offsetHeight}px`);
  }, []);
  useLayoutEffect(() => {
    moveRail();
    const id = requestAnimationFrame(() => setRailReady(true)); // no slide on the very first paint
    window.addEventListener("resize", moveRail);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", moveRail);
    };
  });

  const patch = useCallback((p: Partial<Draft>) => {
    setD((prev) => ({ ...prev, ...p }));
    setSaved(false);
    setStepError(null); // an old "answer this first" message goes away as soon as they change something
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

  // Celebrate when the received page arrives: a burst from the check badge as it pops.
  useEffect(() => {
    if (send.kind !== "sent") return;
    const id = window.setTimeout(() => {
      const b = document.querySelector(".sent-badge")?.getBoundingClientRect();
      fireConfetti(b ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : { x: window.innerWidth / 2, y: window.innerHeight / 3 });
    }, 360);
    return () => window.clearTimeout(id);
  }, [send.kind]);

  const go = (i: number, direction: "forward" | "back") => {
    track("join_step", { step: i + 1, screen: JOIN_SCREENS[i].id, back: direction === "back" });
    // The pad starts empty each time the declaration screen opens, so drop any older drawn signature.
    if (i === PENGAKUAN) setFormSignature(null);
    setStepError(null);
    setDir(direction);
    setStep(i);
    setMaxStep((m) => Math.max(m, Math.min(i, REVIEW)));
    window.scrollTo({ top: 0 });
  };

  /** From the desktop step list: go straight to a screen you have already been to. */
  const goToStep = (i: number) => {
    if (i === step || sending) return;
    setReturnTo(false);
    go(i, i < step ? "back" : "forward");
  };

  const next = () => {
    const err = validateScreen(JOIN_SCREENS[step].id, d) ?? (JOIN_SCREENS[step].id === "pengakuan" && !formSignature ? "joinSignNeed" : null);
    if (err) {
      setStepError(t(err));
      track("join_step_blocked", { screen: JOIN_SCREENS[step].id });
      return;
    }
    setReturnTo(false);
    go(returnTo ? REVIEW : step + 1, "forward");
  };

  const back = () => go(step - 1, "back");

  /** From a review row: edit one answer, then come straight back to the review. */
  const jumpTo = (id: ScreenId) => {
    setReturnTo(true);
    go(screenIndex(id), "back");
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
    track("join_submit", { signed: formSignature !== null });
    const submitted = normaliseDraft({ ...d, pengakuan: true }); // signing is the agreement. Tidied like the sheet will be; kept because the form is cleared below
    const result = await submitApplication(url, { ...submitted, website });
    if (result.ok) {
      track("join_submitted", { signed: formSignature !== null });
      setLeaving(true);
      await new Promise((r) => window.setTimeout(r, window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 170));
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
      setLeaving(false);
      window.scrollTo({ top: 0 });
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
          setFiling(true);
          const up = await uploadSignedForm(url, result.ref, submitted.noKadPengenalan.replace(/\D/g, ""), [bytesToBase64(bytes)], "digital");
          filedSigned = up.ok;
          setFiling(false);
          if (up.ok) {
            track("join_signed", { method: "digital", where: "form" });
            setSigned(true);
            markApplicationSigned();
            setRecord((r) => (r ? { ...r, signed: true } : r));
          }
        }
      } catch {
        setPdf({ kind: "failed" });
      }
      setFiling(false);
      setFormSignature(null);
      // Not signed here (or filing failed): hand over the filled form so the applicant still gets their e-mail.
      if (!filedSigned && result.token) void attachApplicationPdf(url, result.ref, result.token, bytes);
      return;
    }
    track("join_submit_failed", { error: result.error });
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
        track("join_signed", { method: "digital", where: "after" });
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
    if (!formSignature) return;
    if (endpoint) {
      void sendOnline(endpoint);
      return;
    }
    setSaved(saveLocally());
  }, [d, formSignature, endpoint, sendOnline, saveLocally]);


  const startAnother = () => {
    track("join_another");
    if (pdf.kind === "ready") URL.revokeObjectURL(pdf.url);
    setPdf({ kind: "none" });
    setSentIc("");
    setSentData(null);
    setSignature(null);
    setSigned(false);
    setFiling(false);
    setSignError(null);
    setFormSignature(null);
    clearApplication();
    setRecord(null);
    setStep(0);
    setMaxStep(0);
    setStarted(false);
    setStepError(null);
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
        <WelcomePack reference={send.ref} signed={signed} onBack={() => goTo("sign")} onAnother={startAnother} onDone={() => {
            track("join_done");
            onExit?.();
          }}
        />
      </section>
    );
  }

  if (send.kind === "sent") {
    return (
      <section className="section section--apply" aria-label={t("applicationTitle")}>
        <div className="application-sent profile-card" role="status">
          <div className="sent-badge" aria-hidden>
            <svg viewBox="0 0 56 56" width="56" height="56" fill="none">
              <circle className="sent-badge-disc" cx="28" cy="28" r="28" />
              <path className="sent-badge-check" d="M17 29.5l7.5 7.5L39.5 21" pathLength="1" />
            </svg>
          </div>
          <h2>{t("applicationSentTitle")}</h2>
          <p className="application-sent-ref">{send.ref}</p>
          <p>{t("applicationSentBody")}</p>
          <ApplicationSteps signed={signed} />
          {pdf.kind === "making" ? <p className="application-sent-pdf-note">{t("applicationPdfMaking")}</p> : null}
          {pdf.kind === "ready" ? (
            <>
              <section className="sent-stage">
                <header className="sent-stage-bar">
                  <h3>{t("sentFormTitle")}</h3>
                  <a className="sent-stage-download" href={pdf.url} download={pdf.name} onClick={() => track("form_downloaded", { signed, where: "bar" })}>
                    {t("sentDownloadPdf")}
                  </a>
                </header>
                <BorangPreview ops={pdf.ops} />
              </section>
              {signed ? (
                <div className="application-sign" role="status">
                  <h3 className="application-signed-title">{t("signDoneTitle")}</h3>
                  <p className="application-sent-pdf-note">{t("signDoneBody")}</p>
                </div>
              ) : filing ? (
                <div className="application-sign" role="status">
                  <h3 className="application-signed-title">{t("signFiling")}</h3>
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
              <a
                className="profile-save-btn application-sent-pdf-btn sent-download-phone"
                href={pdf.url}
                download={pdf.name}
                onClick={() => track("form_downloaded", { signed })}
              >
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
              track("join_started");
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

  const screen = JOIN_SCREENS[step];
  /** Next looks grey until this screen's required answers are in, then goes solid (it stays tappable to explain what is missing). */
  const ready = screen.id === "review" ? !!formSignature : !validateScreen(screen.id, d) && (screen.id !== "pengakuan" || !!formSignature);
  const isReview = screen.id === "review";
  const sending = send.kind === "sending";

  // Review cards (Turo style): the answers grouped in a few cards, tidied exactly as the sheet will hold them.
  const ic = parseIc(d.noKadPengenalan);
  const nd = normaliseDraft(d);
  const dash = (v: string) => v || "—";
  const gender = ic.ok ? (ic.jantina === "lelaki" ? t("applicationOptJantinaLelaki") : t("applicationOptJantinaPerempuan")) : "";
  const icValue = ic.ok ? `${nd.noKadPengenalan} · ${gender} · ${ic.age} ${t("joinYears")}` : nd.noKadPengenalan;
  const agamaKey = { islam: "applicationOptAgamaIslam", kristian: "applicationOptAgamaKristian", lain: "applicationOptAgamaLain" } as const;
  const agamaValue = d.agama === "lain" ? nd.agamaLain || t(agamaKey.lain) : d.agama ? t(agamaKey[d.agama]) : "";
  const bangsaValue = d.bangsa === "lain" ? nd.bangsaLain || t(BANGSA_MSG.lain) : d.bangsa ? t(BANGSA_MSG[d.bangsa]) : "";
  const kerjaValue = d.pekerjaan ? `${t(`applicationOptPekerjaan_${d.pekerjaan}` as MessageKey)}${nd.pekerjaanNyata ? ` (${nd.pekerjaanNyata})` : ""}` : "";
  const kategoriValue =
    ic.ok && !ic.kategori
      ? t("joinUnder18Row")
      : d.kategoriAhli
        ? `${t(`applicationOptKategori_${d.kategoriAhli}` as MessageKey)}${ic.ok && ic.kategori === d.kategoriAhli ? ` · ${t("joinByAge")}` : ""}`
        : "";
  const reviewCards: { title: MessageKey; edit: ScreenId; rows: [MessageKey, string][] }[] = [
    {
      title: "reviewCardPeople",
      edit: "kamu",
      rows: [
        ["joinRowName", nd.nama],
        ["joinRowIc", icValue],
        ["applicationLblTempatLahir", nd.tempatLahir],
        ["applicationLblAgama", agamaValue],
        ["applicationLblBangsa", bangsaValue],
      ],
    },
    {
      title: "reviewCardContact",
      edit: "hubungi",
      rows: [
        ["applicationLblTelBimbit", nd.telBimbit],
        ["joinRowEmail", nd.email || (d.tiadaEmail ? t("joinNoEmail") : "")],
        ["applicationLblAlamatRumah", nd.alamatRumah],
      ],
    },
    {
      title: "reviewCardMember",
      edit: "cawangan",
      rows: [
        ["joinRowCaw", d.cawangan ? getCawanganDisplayLabel(d.cawangan, t) : ""],
        ["joinRowKat", kategoriValue],
        ["applicationLblPekerjaan", kerjaValue],
      ],
    },
  ];

  return (
    <section className="section section--apply" aria-label={t("applicationTitle")}>
      <div className="join" data-dir={dir} data-leaving={leaving || undefined}>
        <nav className="join-progress" aria-label={t("stepsAria")}>
          {PARTS.map((label, p) => (
            <div key={label} className="join-part" data-state={screen.part === p ? "now" : screen.part > p ? "done" : "next"} aria-current={screen.part === p ? "step" : undefined} aria-label={t(label)}>
              <span className="join-seg">
                <i style={{ ["--p" as string]: partFill(p, step) } as React.CSSProperties} />
              </span>
            </div>
          ))}
        </nav>

        <aside className={`join-rail${railReady ? " is-ready" : ""}`} ref={railRef} aria-label={t("stepsAria")}>
          <span className="join-rail-bar join-rail-bar--group" aria-hidden />
          <span className="join-rail-bar" aria-hidden />
          {PARTS.map((label, p) => {
            const at = screen.hidden ? REVIEW : step; // editing the category from the review still counts as "review"
            const items = JOIN_SCREENS.map((sc, i) => [sc, i] as const).filter(([sc]) => sc.part === p && RAIL_LABEL[sc.id]);
            const groupState = items.every(([, i]) => i < at) ? "done" : items.some(([, i]) => i === at) ? "now" : "next";
            return (
              <div key={label} className="join-rail-part" data-state={groupState}>
                <p className="join-rail-title">
                  {t(label)}
                  <span className="join-rail-chevron" aria-hidden />
                </p>
                <ul>
                  {items.map(([sc, i]) => (
                    <li key={sc.id} data-state={i < at ? "done" : i === at ? "now" : "next"} aria-current={i === at ? "step" : undefined}>
                      {i !== at && i <= maxStep && (i !== REVIEW || formSignature) ? (
                        <button type="button" className="join-rail-btn" onClick={() => goToStep(i)}>
                          {t(RAIL_LABEL[sc.id]!)}
                        </button>
                      ) : (
                        <>
                          {t(RAIL_LABEL[sc.id]!)}
                        </>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </aside>

        <form
          className="join-screen"
          key={screen.id}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            if (isReview) {
              if (formSignature && !sending) submit();
            } else next();
          }}
        >
          <div className="join-body">
            {screen.id === "pengakuan" ? (
              <>
                <h2 className="join-title">{t("applicationSectionDeclaration")}</h2>

                <div className="join-declaration">
          <p className="application-declaration-text">{t("applicationDeclarationBody")}</p>
          <p className="join-note">{t("joinSignAgree")}</p>

          <div className="application-form-sign">
            <h3 className="application-signed-title">{t("formSignTitle")}</h3>
            <p className="application-sent-pdf-note">{t("formSignHint")}</p>
            <SignaturePad onChange={setFormSignature} disabled={send.kind === "sending"} />
          </div>
        </div>
              </>
            ) : isReview ? (
              <>
                <h2 className="join-title">{t("reviewTitle")}</h2>
                <p className="join-hint">{t("reviewHint")}</p>
                <div className="review-cards">
                  {reviewCards.map((card) => (
                    <section key={card.title} className="review-card">
                      <header className="review-card-head">
                        <h3>{t(card.title)}</h3>
                        <button type="button" className="join-link" onClick={() => jumpTo(card.edit)}>
                          {t("joinChange")}
                        </button>
                      </header>
                      <dl>
                        {card.rows.map(([label, value]) => (
                          <div key={label}>
                            <dt>{t(label)}</dt>
                            <dd>{dash(value)}</dd>
                          </div>
                        ))}
                      </dl>
                    </section>
                  ))}
                  <section className="review-card">
                    <header className="review-card-head">
                      <h3>{t("reviewCardSign")}</h3>
                      <button type="button" className="join-link" onClick={() => jumpTo("pengakuan")}>
                        {t("joinChange")}
                      </button>
                    </header>
                    {formSignature ? <img className="review-sign" src={formSignature.dataUrl} alt={t("reviewCardSign")} /> : <p className="review-empty">—</p>}
                  </section>
                </div>
              </>
            ) : (
              <JoinScreenBody screen={screen} d={d} patch={patch} t={t} />
            )}
          </div>

          <label className="application-hp" aria-hidden="true">
            Website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
          </label>

          <Reveal open={!!errorText}>
            <p className="application-error-msg" role="alert">
              {shownError}
            </p>
          </Reveal>
          {saved ? (
            <p className="application-saved-msg" role="status">
              {t("applicationSubmitDone")}
            </p>
          ) : null}

          <div className={`join-footer${isReview ? " join-footer--inline" : ""}`}>
            {step > 0 && !returnTo ? (
              <button type="button" className="join-link join-back" onClick={back} disabled={sending} aria-label={t("stepBack")}>
                <span className="join-back-arrow" aria-hidden>
                  <ArrowLeft size={22} />
                </span>
                <span className="join-back-text">{t("stepBack")}</span>
              </button>
            ) : null}
            <div className="join-footer-end">
              <button type="submit" className="profile-save-btn join-next" disabled={isReview ? !ready || sending : false} aria-disabled={!ready}>
                {isReview
                  ? endpoint
                    ? t(sending ? "applicationSending" : "applicationSendBtn")
                    : t("applicationSubmitBtn")
                  : returnTo
                    ? t("joinSave")
                    : t("stepNext")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
