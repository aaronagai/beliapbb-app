import { useRef, useState } from "react";
import { applicationEndpoint, uploadSignedForm } from "./applicationApi";
import { useI18n, type MessageKey } from "./i18n";

const MAX_FILES = 3;
const MAX_BYTES = 4 * 1024 * 1024;
const MAX_SIDE = 2000;

function toBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1] ?? "");
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });
}

/** Phone photos are huge: shrink to ~2000px JPEG. PDFs are sent as they are (size-checked). */
async function prepare(file: File): Promise<string> {
  if (file.type === "application/pdf") {
    if (file.size > MAX_BYTES) throw new Error("toobig");
    return toBase64(file);
  }
  if (!file.type.startsWith("image/")) throw new Error("type");
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bmp.width, bmp.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bmp.width * scale);
  canvas.height = Math.round(bmp.height * scale);
  canvas.getContext("2d")?.drawImage(bmp, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", 0.82));
  if (!blob || blob.size > MAX_BYTES) throw new Error("toobig");
  return toBase64(blob);
}

type State = { kind: "idle" } | { kind: "sending" } | { kind: "done" } | { kind: "error"; key: MessageKey };

export function SignedFormUpload({ initialRef = "", initialIc = "" }: { initialRef?: string; initialIc?: string }) {
  const { t } = useI18n();
  const endpoint = applicationEndpoint();
  const [ref, setRef] = useState(initialRef);
  const [ic, setIc] = useState(initialIc);
  const [files, setFiles] = useState<File[]>([]);
  const [state, setState] = useState<State>({ kind: "idle" });
  const input = useRef<HTMLInputElement>(null);

  if (!endpoint) return null;

  const send = async () => {
    if (!ref.trim() || ic.replace(/\D/g, "").length !== 12) return setState({ kind: "error", key: "signedErrorMatch" });
    if (!files.length) return setState({ kind: "error", key: "signedErrorNoFile" });
    setState({ kind: "sending" });
    try {
      const data = await Promise.all(files.map(prepare));
      const result = await uploadSignedForm(endpoint, ref, ic.replace(/\D/g, ""), data);
      if (result.ok) {
        setFiles([]);
        return setState({ kind: "done" });
      }
      const map: Record<string, MessageKey> = {
        match: "signedErrorMatch",
        locked: "signedErrorLocked",
        busy: "signedErrorGeneric",
        nofile: "signedErrorNoFile",
        toobig: "signedErrorTooBig",
        type: "signedErrorType",
      };
      setState({ kind: "error", key: map[result.error] ?? "signedErrorGeneric" });
    } catch (e) {
      const m = e instanceof Error ? e.message : "";
      setState({ kind: "error", key: m === "toobig" ? "signedErrorTooBig" : m === "type" ? "signedErrorType" : "signedErrorGeneric" });
    }
  };

  if (state.kind === "done") {
    return (
      <div className="application-signed profile-card" role="status">
        <h2 className="application-signed-title">{t("signedDoneTitle")}</h2>
        <p className="application-sent-pdf-note">{t("signedDoneBody")}</p>
      </div>
    );
  }

  return (
    <div className="application-signed profile-card">
      <h2 className="application-signed-title">{t("signedTitle")}</h2>
      <p className="application-sent-pdf-note">{t("signedIntro")}</p>
      <label className="profile-field" htmlFor="signed-ref">
        <span className="profile-label">{t("signedLblRef")}</span>
        <input id="signed-ref" className="profile-input" value={ref} onChange={(e) => setRef(e.target.value)} placeholder="BPBB-2026-00001" autoComplete="off" />
      </label>
      <label className="profile-field application-field-spaced" htmlFor="signed-ic">
        <span className="profile-label">{t("signedLblIc")}</span>
        <input id="signed-ic" className="profile-input" inputMode="numeric" value={ic} onChange={(e) => setIc(e.target.value)} autoComplete="off" />
      </label>
      <input
        ref={input}
        type="file"
        accept="image/*,application/pdf"
        multiple
        hidden
        onChange={(e) => setFiles(Array.from(e.target.files ?? []).slice(0, MAX_FILES))}
      />
      <button type="button" className="profile-save-btn profile-save-btn--secondary application-signed-pick" onClick={() => input.current?.click()}>
        {files.length ? t("signedPicked").replace("{{n}}", String(files.length)) : t("signedPick")}
      </button>
      <button type="button" className="profile-save-btn" onClick={() => void send()} disabled={state.kind === "sending"}>
        {state.kind === "sending" ? t("signedSending") : t("signedSend")}
      </button>
      {state.kind === "error" ? (
        <p className="application-error-msg" role="alert">
          {t(state.key)}
        </p>
      ) : null}
    </div>
  );
}
