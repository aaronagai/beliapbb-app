/**
 * Belia PBB — membership applications → private Google Sheet.
 *
 * Writes to the sheet "Permohonan Ahli Belia PBB (SULIT)" (SHEET_ID below), so the project can be
 * bound to that sheet or standalone. The app (Sertai tab) POSTs the form as JSON; each valid
 * application becomes one row with a reference number.
 *
 * Deploy (once, by the sheet owner):
 *   1. Open the sheet → Extensions → Apps Script (or any Apps Script project), replace Code.gs
 *      with this file, save.
 *   2. Deploy → New deployment → type "Web app"; Execute as: Me; Who has access: Anyone.
 *   3. Authorise when asked, then copy the Web app URL (ends in /exec) into the site config
 *      (VITE_APPLICATION_ENDPOINT).
 * After editing this file: Deploy → Manage deployments → edit → Version: New version.
 *
 * Anyone on the internet can call this endpoint, so every value is treated as untrusted.
 */

/** Who gets a short "new application" email (name + cawangan only, never the IC number). */
var NOTIFY_EMAIL = "hello@beliapbb.com";
var SHEET_ID = "1MQ5ZiTEtL--8NXaz7K7j2W92kIijhLxIZczBgtugqAo";
var SHEET_NAME = ""; // empty = first tab
var MAX_PER_MINUTE = 30; // all callers combined; stops floods

/** Sheet column order. Must match the header row. [header, getter(payload)] */
var COLUMNS = [
  ["Rujukan", null],
  ["Diterima", null],
  ["Status", null],
  ["Cawangan", "cawangan"],
  ["No. Ranting", "rantingNo"],
  ["Nama", "nama"],
  ["Tarikh Lahir", "tarikhLahir"],
  ["Agama", "agama"],
  ["Agama (lain)", "agamaLain"],
  ["Bangsa", "bangsa"],
  ["Bangsa (lain)", "bangsaLain"],
  ["Tempat Lahir", "tempatLahir"],
  ["Jantina", "jantina"],
  ["Jenis KP", function (p) { return p.icBaru ? "Baru" : p.icLama ? "Lama" : ""; }],
  ["No. Kad Pengenalan", "noKadPengenalan"],
  ["Alamat Rumah", "alamatRumah"],
  ["Alamat Pejabat", "alamatPejabat"],
  ["Pekerjaan", "pekerjaan"],
  ["Pekerjaan (nyatakan)", "pekerjaanNyata"],
  ["Tel. Rumah", "telRumah"],
  ["Tel. Pejabat", "telPejabat"],
  ["Tel. Bimbit", "telBimbit"],
  ["E-mel", "email"],
  ["Kawasan Parlimen", "kawasanParlimen"],
  ["Kawasan Negeri", "kawasanNegeri"],
  ["Kategori Ahli", "kategoriAhli"],
  ["Pengakuan", function (p) { return p.pengakuan === true ? "Ya" : ""; }],
  ["Pencadang Nama", "pencadangNama"],
  ["Pencadang KP", "pencadangIc"],
  ["Pencadang Jawatan", "pencadangJawatan"],
  ["Penyokong Nama", "penyokongNama"],
  ["Penyokong KP", "penyokongIc"],
  ["Penyokong Jawatan", "penyokongJawatan"],
];

var REQUIRED = ["cawangan", "nama", "noKadPengenalan", "telBimbit", "kategoriAhli"];

function doPost(e) {
  try {
    var payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // Spam trap: real visitors never see or fill the "website" field.
    if (payload.website) return reply({ ok: true, ref: "BPBB-0" });

    var missing = REQUIRED.filter(function (k) { return !clean(payload[k]); });
    if (missing.length) return reply({ ok: false, error: "missing", fields: missing });
    if (payload.pengakuan !== true) return reply({ ok: false, error: "declaration" });
    if (!/^\d{12}$/.test(String(payload.noKadPengenalan).replace(/\D/g, ""))) {
      return reply({ ok: false, error: "ic" });
    }

    if (!underRateLimit()) return reply({ ok: false, error: "busy" });

    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = targetSheet();
      ensureHeader(sheet);
      var ref = "BPBB-" + new Date().getFullYear() + "-" + pad(sheet.getLastRow(), 5);
      var row = COLUMNS.map(function (col) {
        var header = col[0], getter = col[1];
        if (header === "Rujukan") return ref;
        if (header === "Diterima") return new Date();
        if (header === "Status") return "Baharu";
        var value = typeof getter === "function" ? getter(payload) : payload[getter];
        return safeCell(value);
      });
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }

    notify(ref, clean(payload.nama), clean(payload.cawangan));
    return reply({ ok: true, ref: ref });
  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: "server" });
  }
}

/** Lets the app (and you) check the deployment is reachable. */
function doGet() {
  return reply({ ok: true, service: "belia-pbb-permohonan" });
}

function targetSheet() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  return SHEET_NAME ? ss.getSheetByName(SHEET_NAME) : ss.getSheets()[0];
}

function ensureHeader(sheet) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(COLUMNS.map(function (c) { return c[0]; }));
    sheet.setFrozenRows(1);
  }
}

function clean(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim().slice(0, 500);
}

/**
 * Store every answer as plain text: the leading apostrophe stops Sheets turning IC and phone
 * numbers into numbers (losing leading zeros), dates into dates, and "=..." into formulas.
 */
function safeCell(value) {
  var text = clean(value);
  return text ? "'" + text : "";
}

function pad(n, width) {
  var s = String(n);
  while (s.length < width) s = "0" + s;
  return s;
}

function underRateLimit() {
  var cache = CacheService.getScriptCache();
  var key = "rate-" + Math.floor(Date.now() / 60000);
  var count = Number(cache.get(key) || 0) + 1;
  cache.put(key, String(count), 120);
  return count <= MAX_PER_MINUTE;
}

function notify(ref, nama, cawangan) {
  if (!NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: "Permohonan baharu " + ref + ": " + nama,
      body:
        "Permohonan keahlian baharu diterima.\n\n" +
        "Rujukan: " + ref + "\n" +
        "Nama: " + nama + "\n" +
        "Cawangan: " + cawangan + "\n\n" +
        "Butiran penuh dalam sheet: https://docs.google.com/spreadsheets/d/" + SHEET_ID + "/edit",
    });
  } catch (err) {
    console.error("notify failed", err);
  }
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
