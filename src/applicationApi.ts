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
  | { ok: true; ref: string }
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
