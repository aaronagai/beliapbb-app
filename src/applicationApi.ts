/**
 * Membership applications go to a private Google Sheet through an Apps Script web app
 * (scripts/apps-script/permohonan.gs). Until its URL is configured, the form only saves
 * on the visitor's device.
 */
/** "Belia PBB permohonan" web app, deployed from Aaron's Google account. */
const DEPLOYED_ENDPOINT =
  "https://script.google.com/macros/s/AKfycbxWGCsn0oxdurW2Af5YITy2kKgroCpLufHdiyGyo3KHti5PFBgWHKNylKP46kyDXYZoNQ/exec";

export function applicationEndpoint(): string | null {
  const url = import.meta.env.VITE_APPLICATION_ENDPOINT?.trim() || DEPLOYED_ENDPOINT;
  return url || null;
}

export type SubmitResult =
  | { ok: true; ref: string; token?: string }
  | { ok: false; error: "missing" | "declaration" | "ic" | "busy" | "server" | "network"; fields?: string[] };

/** Sent as text/plain so the browser skips the CORS preflight Apps Script can't answer. */
export async function submitApplication(endpoint: string, payload: Record<string, unknown>): Promise<SubmitResult> {
  try {
    const res = await fetch(endpoint, { method: "POST", body: JSON.stringify(payload) });
    const data = (await res.json()) as SubmitResult;
    return data && typeof data.ok === "boolean" ? data : { ok: false, error: "server" };
  } catch {
    return { ok: false, error: "network" };
  }
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) bin += String.fromCharCode(...bytes.subarray(i, i + chunk));
  return btoa(bin);
}

/**
 * Step 2 of an application: hands the filled-in official PDF to the script, which files it in the
 * secretariat's private Drive folder and e-mails it to the applicant. Best effort: the applicant
 * already has the PDF on screen, so a failure here is not shown as an error. With no PDF the script
 * still sends the plain confirmation e-mail.
 */
export async function attachApplicationPdf(endpoint: string, ref: string, token: string, pdf: Uint8Array | null): Promise<boolean> {
  try {
    const b64 = pdf ? bytesToBase64(pdf) : "";
    const res = await fetch(endpoint, { method: "POST", body: JSON.stringify({ action: "attach", ref, token, pdf: b64 }) });
    const data = (await res.json()) as { ok?: boolean };
    return data.ok === true;
  } catch {
    return false;
  }
}

export type SignedResult = { ok: true } | { ok: false; error: "match" | "locked" | "busy" | "nofile" | "toobig" | "type" | "server" | "network" };

/** Uploads photos/scans of the signed paper form (base64, no data-URL prefix). */
export async function uploadSignedForm(
  endpoint: string,
  ref: string,
  ic: string,
  files: string[],
  method: "kertas" | "digital" = "kertas",
): Promise<SignedResult> {
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      body: JSON.stringify({ action: "signed", ref: ref.trim().toUpperCase(), ic, method, files: files.map((data) => ({ data })) }),
    });
    const data = (await res.json()) as SignedResult;
    return data && typeof data.ok === "boolean" ? data : { ok: false, error: "server" };
  } catch {
    return { ok: false, error: "network" };
  }
}
