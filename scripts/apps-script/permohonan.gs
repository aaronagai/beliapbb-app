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
  // Filled in by the secretariat, never by the form.
  ["Disemak oleh", null],
  ["Catatan", null],
  // Link to the filled official PDF in Drive; added by the attach step below.
  ["Borang PDF", null],
  // Signed paper form uploaded back by the applicant (photo/scan); blank = still missing.
  ["Borang Bertandatangan", null],
  ["Diterima (bertandatangan)", null],
  // "Digital" = drawn on screen in the app; "Kertas" = printed, signed and uploaded as a photo/scan.
  ["Jenis tandatangan", null],
];

var REQUIRED = ["cawangan", "nama", "noKadPengenalan", "telBimbit"];

function doPost(e) {
  try {
    var payload = JSON.parse((e && e.postData && e.postData.contents) || "{}");

    // Second step: the app sends the filled-in official PDF for an application it just submitted.
    if (payload.action === "attach") return handleAttach(payload);
    // Later: the applicant uploads a photo/scan of the signed paper form.
    if (payload.action === "signed") return handleSigned(payload);

    // Spam trap: real visitors never see or fill the "website" field.
    if (payload.website) return reply({ ok: true, ref: "BPBB-0" });

    var missing = REQUIRED.filter(function (k) { return !clean(payload[k]); });
    if (missing.length) return reply({ ok: false, error: "missing", fields: missing });
    if (payload.pengakuan !== true) return reply({ ok: false, error: "declaration" });
    if (!/^\d{12}$/.test(String(payload.noKadPengenalan).replace(/\D/g, ""))) {
      return reply({ ok: false, error: "ic" });
    }

    if (!underRateLimit()) return reply({ ok: false, error: "busy" });

    var p = normalise(payload);
    var lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      var sheet = targetSheet();
      ensureHeader(sheet);
      var ref = "BPBB-" + new Date().getFullYear() + "-" + pad(nextRefNumber(sheet), 5);
      var row = COLUMNS.map(function (col) {
        var header = col[0], getter = col[1];
        if (header === "Rujukan") return ref;
        if (header === "Diterima") return new Date();
        if (header === "Status") return "Baharu";
        var value = typeof getter === "function" ? getter(p) : p[getter];
        return safeCell(value);
      });
      sheet.appendRow(row);
    } finally {
      lock.releaseLock();
    }

    notify(ref, p.nama, clean(p.cawangan));
    // One-time token (6 h) that lets this applicant's browser attach the PDF to this row, once.
    var token = Utilities.getUuid();
    CacheService.getScriptCache().put("attach-" + ref, token, 21600);
    return reply({ ok: true, ref: ref, token: token });
  } catch (err) {
    console.error(err);
    return reply({ ok: false, error: "server" });
  }
}

/**
 * One-time (safe to re-run): sets up the secretariat's review tools on the sheet.
 * Run from the Apps Script editor: select setupReviewWorkflow → Run.
 *  - Status column: dropdown (Baharu / Disemak / Lulus / Tolak) with a colour per status
 *  - Repeat IC numbers: Nama + IC cells turn orange when the same IC appears on another row
 *  - "Disemak oleh" and "Catatan" columns added at the end; header row frozen
 */
var STATUS_OPTIONS = ["Baharu", "Disemak", "Lulus", "Tolak"];
var STATUS_COLORS = { Baharu: "#fff2cc", Disemak: "#cfe2f3", Lulus: "#d9ead3", Tolak: "#f4cccc" };

function setupReviewWorkflow() {
  var sheet = targetSheet();
  ensureHeader(sheet);
  var headers = COLUMNS.map(function (c) { return c[0]; });
  // Make sure every header exists (adds the two new secretariat columns to the existing sheet).
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.setFrozenRows(1);
  sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold");

  var col = function (name) { return headers.indexOf(name) + 1; };
  var last = Math.max(sheet.getMaxRows(), 1000);
  var rows = last - 1;

  var statusCol = col("Status");
  var statusRange = sheet.getRange(2, statusCol, rows, 1);
  statusRange.setDataValidation(
    SpreadsheetApp.newDataValidation().requireValueInList(STATUS_OPTIONS, true).setAllowInvalid(false).build()
  );

  var rules = STATUS_OPTIONS.map(function (name) {
    return SpreadsheetApp.newConditionalFormatRule()
      .whenTextEqualTo(name).setBackground(STATUS_COLORS[name]).setRanges([statusRange]).build();
  });

  // Repeat IC: compare digits only, so 010101-13-1234 and 010101131234 count as the same person.
  var icCol = col("No. Kad Pengenalan");
  var L = columnLetter(icCol);
  var strip = function (ref) { return 'SUBSTITUTE(SUBSTITUTE(' + ref + ',"-","")," ","")'; };
  var dupFormula =
    '=AND($' + L + '2<>"",SUMPRODUCT(--(' + strip('$' + L + '$2:$' + L + '$' + last) + '=' + strip('$' + L + '2') + '))>1)';
  var namaCol = col("Nama");
  var dupRanges = [sheet.getRange(2, namaCol, rows, 1), sheet.getRange(2, icCol, rows, 1)];
  rules.push(
    SpreadsheetApp.newConditionalFormatRule().whenFormulaSatisfied(dupFormula).setBackground("#fce5cd").setBold(true).setRanges(dupRanges).build()
  );

  sheet.setConditionalFormatRules(rules);
  console.log("Review workflow set up on '" + sheet.getName() + "'.");
}

function columnLetter(n) {
  var s = "";
  while (n > 0) { var m = (n - 1) % 26; s = String.fromCharCode(65 + m) + s; n = Math.floor((n - 1) / 26); }
  return s;
}

/**
 * Tidy every answer the same way, whatever sent it (the form, an old link, anything): capitals for names,
 * places and addresses; one phone format (012-3456789); one IC format (980519-13-5123); lower-case e-mail;
 * readable words instead of internal codes. Keep in sync with src/normalise.ts in the app.
 */
var LABELS = {
  agama: { islam: "Islam", kristian: "Kristian", lain: "Lain-lain" },
  bangsa: {
    melayu_melanau: "Melayu / Melanau", iban: "Iban", kedayan: "Kedayan", bidayuh: "Bidayuh", kayan: "Kayan",
    kelabit: "Kelabit", kenyah: "Kenyah", lun_bawang: "Lun Bawang", lain: "Lain-lain",
  },
  jantina: { lelaki: "Lelaki", perempuan: "Perempuan" },
  pekerjaan: { kerajaan: "Kerajaan", swasta: "Swasta", sendiri: "Sendiri", lain: "Lain-lain" },
  kategoriAhli: { induk: "Induk", belia: "Belia", wanita: "Wanita", pemuda: "Pemuda" },
};

function fmtPhone(v) {
  var d = String(v == null ? "" : v).replace(/\D/g, "");
  if (!d) return "";
  if (d.indexOf("60") === 0 && d.length >= 11) d = "0" + d.slice(2); // +60 12 345 6789
  if (d.charAt(0) !== "0" && d.length >= 9) d = "0" + d; // 12-3456789 typed without the leading 0
  var cut = /^01/.test(d) || /^08/.test(d) ? 3 : 2; // 012-… and Sarawak 08x-… keep three digits
  return d.slice(0, cut) + "-" + d.slice(cut);
}

function fmtIc(v) {
  var d = String(v == null ? "" : v).replace(/\D/g, "");
  return d.length === 12 ? d.slice(0, 6) + "-" + d.slice(6, 8) + "-" + d.slice(8) : d;
}

function normalise(p) {
  var up = function (v) { return clean(v).replace(/[ \t]+/g, " ").toUpperCase(); };
  var lines = function (v) {
    return String(v == null ? "" : v).split(/\r?\n/).map(function (l) { return l.replace(/[ \t]+/g, " ").trim(); }).filter(Boolean).join("\n").slice(0, 500).toUpperCase();
  };
  var label = function (group, key, other) {
    var k = clean(key);
    if (!k) return "";
    return k === "lain" && other ? "Lain-lain" : (LABELS[group][k] || up(k));
  };
  var o = {};
  for (var k in p) o[k] = p[k];
  o.nama = up(p.nama);
  o.noKadPengenalan = fmtIc(p.noKadPengenalan);
  o.icBaru = o.noKadPengenalan.length === 14 ? true : p.icBaru;
  o.rantingNo = up(p.rantingNo).replace(/\s*\/\s*/g, "/");
  o.tempatLahir = up(p.tempatLahir);
  o.alamatRumah = lines(p.alamatRumah);
  o.alamatPejabat = lines(p.alamatPejabat);
  o.pekerjaanNyata = up(p.pekerjaanNyata);
  o.agamaLain = up(p.agamaLain);
  o.bangsaLain = up(p.bangsaLain);
  o.telRumah = fmtPhone(p.telRumah);
  o.telPejabat = fmtPhone(p.telPejabat);
  o.telBimbit = fmtPhone(p.telBimbit);
  o.email = clean(p.email).toLowerCase();
  o.agama = label("agama", p.agama, o.agamaLain);
  o.bangsa = label("bangsa", p.bangsa, o.bangsaLain);
  o.jantina = label("jantina", p.jantina);
  o.pekerjaan = label("pekerjaan", p.pekerjaan, o.pekerjaanNyata);
  o.kategoriAhli = label("kategoriAhli", p.kategoriAhli);
  return o;
}

/** Run from the editor (select testNormalise → Run): shows how sample entries get tidied. Writes nothing. */
function testNormalise() {
  var sample = {
    nama: "  mohammad   naz  ", noKadPengenalan: "980519135123", rantingNo: "197 / 17 / 05", tempatLahir: "hospital kapit",
    alamatRumah: "no 12,  jalan   ujian\n\n sibu ", telBimbit: "+60 12 345 6789", telRumah: "082375755", telPejabat: "",
    email: " Ujian@Gmail.COM ", agama: "islam", bangsa: "melayu_melanau", jantina: "lelaki", pekerjaan: "swasta", kategoriAhli: "belia",
  };
  var n = normalise(sample);
  console.log(JSON.stringify({ nama: n.nama, ic: n.noKadPengenalan, ranting: n.rantingNo, tempat: n.tempatLahir, alamat: n.alamatRumah,
    tel: n.telBimbit, telRumah: n.telRumah, email: n.email, agama: n.agama, bangsa: n.bangsa, jantina: n.jantina, kerja: n.pekerjaan, kategori: n.kategoriAhli }));
  console.log("phones: " + [fmtPhone("0198749009"), fmtPhone("016-8871060"), fmtPhone("011 1234 5678"), fmtPhone("03-12345678"), fmtPhone("12-3456789")].join(" | "));
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

/**
 * Reference numbers come from a counter (not the row count), so deleting test rows can never
 * cause a reference to be reused. Starts from the number of applications already in the sheet.
 */
function nextRefNumber(sheet) {
  var props = PropertiesService.getScriptProperties();
  var n = Number(props.getProperty("refCounter"));
  if (!n) n = Math.max(sheet.getLastRow() - 1, 0);
  n += 1;
  props.setProperty("refCounter", String(n));
  return n;
}

var PDF_FOLDER_NAME = "Borang Permohonan PBB (SULIT)";
var MAX_PDF_BYTES = 2 * 1024 * 1024;

/** Private Drive folder for the filled PDFs (created on first use, only the owner can open it). */
function pdfFolder() {
  var props = PropertiesService.getScriptProperties();
  var id = props.getProperty("pdfFolderId");
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (err) { /* deleted: make a new one */ }
  }
  var folder = DriveApp.createFolder(PDF_FOLDER_NAME);
  props.setProperty("pdfFolderId", folder.getId());
  return folder;
}

/**
 * Step 2: store the applicant's filled-in official form, link it in the sheet, and e-mail it to
 * the applicant. Needs the one-time token from step 1. With no PDF (the browser could not make
 * one) the applicant still gets the plain confirmation.
 */
function handleAttach(payload) {
  var ref = clean(payload.ref);
  var token = clean(payload.token);
  if (!/^BPBB-\d{4}-\d{5,}$/.test(ref)) return reply({ ok: false, error: "ref" });
  var cache = CacheService.getScriptCache();
  var expected = cache.get("attach-" + ref);
  if (!expected || expected !== token) return reply({ ok: false, error: "token" });
  if (!underRateLimit()) return reply({ ok: false, error: "busy" });
  cache.remove("attach-" + ref); // single use

  var sheet = targetSheet();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colOf = function (name) { return headers.indexOf(name) + 1; };
  var hit = sheet.getRange(1, 1, sheet.getLastRow(), 1).createTextFinder(ref).matchEntireCell(true).findNext();
  if (!hit) return reply({ ok: false, error: "ref" });
  var row = hit.getRow();
  var cell = function (name) { return colOf(name) ? String(sheet.getRange(row, colOf(name)).getValue()).replace(/^'/, "") : ""; };
  var nama = cell("Nama"), cawangan = cell("Cawangan"), email = cell("E-mel");

  var blob = null;
  var b64 = typeof payload.pdf === "string" ? payload.pdf : "";
  if (b64 && b64.length <= MAX_PDF_BYTES * 1.4) {
    var bytes = Utilities.base64Decode(b64);
    var isPdf = bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
    if (isPdf && bytes.length <= MAX_PDF_BYTES) {
      var safeName = nama.replace(/[^A-Za-z0-9 ]/g, "").trim().slice(0, 40);
      blob = Utilities.newBlob(bytes, "application/pdf", ref + (safeName ? " - " + safeName : "") + ".pdf");
      var file = pdfFolder().createFile(blob);
      var linkCol = colOf("Borang PDF");
      if (!linkCol) {
        linkCol = headers.length + 1;
        sheet.getRange(1, linkCol).setValue("Borang PDF");
      }
      sheet.getRange(row, linkCol).setFormula('=HYPERLINK("' + file.getUrl() + '","Buka borang")');
    }
  }
  confirmApplicant(ref, nama, cawangan, email, blob);
  return reply({ ok: true, stored: !!blob });
}

/**
 * The applicant uploads a photo/scan of the printed, signed form. Identified by reference number
 * plus IC number (both must match the row). Files go to a per-application subfolder of the private
 * Drive folder; the row gets a link and a received time. Wrong guesses lock that reference for an hour.
 */
var MAX_SIGNED_FILES = 3;
var MAX_SIGNED_BYTES = 4 * 1024 * 1024;

function fileKind(bytes) {
  if (bytes.length > 4 && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return { mime: "application/pdf", ext: "pdf" };
  if (bytes.length > 3 && (bytes[0] & 255) === 0xff && (bytes[1] & 255) === 0xd8) return { mime: "image/jpeg", ext: "jpg" };
  if (bytes.length > 4 && (bytes[0] & 255) === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return { mime: "image/png", ext: "png" };
  return null;
}

function handleSigned(payload) {
  var ref = clean(payload.ref);
  var ic = String(payload.ic || "").replace(/\D/g, "");
  if (!/^BPBB-\d{4}-\d{5,}$/.test(ref) || ic.length !== 12) return reply({ ok: false, error: "match" });

  var cache = CacheService.getScriptCache();
  var failKey = "signed-fail-" + ref;
  var fails = Number(cache.get(failKey) || 0);
  if (fails >= 5) return reply({ ok: false, error: "locked" });
  if (!underRateLimit()) return reply({ ok: false, error: "busy" });

  var sheet = targetSheet();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var colOf = function (name) { return headers.indexOf(name) + 1; };
  var hit = sheet.getRange(1, 1, sheet.getLastRow(), 1).createTextFinder(ref).matchEntireCell(true).findNext();
  var row = hit ? hit.getRow() : 0;
  var cell = function (name) { return row && colOf(name) ? String(sheet.getRange(row, colOf(name)).getValue()).replace(/^'/, "") : ""; };
  if (!row || cell("No. Kad Pengenalan").replace(/\D/g, "") !== ic) {
    cache.put(failKey, String(fails + 1), 3600);
    return reply({ ok: false, error: "match" });
  }

  var digital = payload.method === "digital";
  var files = Array.isArray(payload.files) ? payload.files.slice(0, MAX_SIGNED_FILES) : [];
  if (!files.length) return reply({ ok: false, error: "nofile" });
  var decoded = [];
  for (var i = 0; i < files.length; i++) {
    var b64 = files[i] && typeof files[i].data === "string" ? files[i].data : "";
    if (!b64 || b64.length > MAX_SIGNED_BYTES * 1.4) return reply({ ok: false, error: "toobig" });
    var bytes = Utilities.base64Decode(b64);
    var kind = bytes.length <= MAX_SIGNED_BYTES ? fileKind(bytes) : null;
    if (!kind) return reply({ ok: false, error: "type" });
    decoded.push({ bytes: bytes, kind: kind });
  }

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var parent = pdfFolder();
    var sub = parent.getFoldersByName(ref);
    var folder = sub.hasNext() ? sub.next() : parent.createFolder(ref);
    var stamp = Utilities.formatDate(new Date(), "Asia/Kuching", "yyyyMMdd-HHmmss");
    decoded.forEach(function (f, idx) {
      folder.createFile(Utilities.newBlob(f.bytes, f.kind.mime, ref + "-bertandatangan-" + stamp + "-" + (idx + 1) + "." + f.kind.ext));
    });
    var count = 0;
    var it = folder.getFiles();
    while (it.hasNext()) { it.next(); count++; }

    var ensureCol = function (name) {
      var c = colOf(name);
      if (!c) { c = sheet.getLastColumn() + 1; sheet.getRange(1, c).setValue(name); headers[c - 1] = name; }
      return c;
    };
    sheet.getRange(row, ensureCol("Borang Bertandatangan")).setFormula('=HYPERLINK("' + folder.getUrl() + '","Buka (' + count + ' fail)")');
    sheet.getRange(row, ensureCol("Diterima (bertandatangan)")).setValue(new Date());
    sheet.getRange(row, ensureCol("Jenis tandatangan")).setValue(digital ? "Digital" : "Kertas");
  } finally {
    lock.releaseLock();
  }
  cache.remove(failKey);
  // Signed on screen = the application arrived complete (already alerted). Only paper uploads need a second alert.
  if (!digital) notifySigned(ref, cell("Nama"), cell("Cawangan"), digital);
  // Digital signature: the signed PDF itself is the applicant's copy.
  if (digital && decoded[0].kind.ext === "pdf") {
    sendSignedCopy(ref, cell("Nama"), cell("E-mel"), Utilities.newBlob(decoded[0].bytes, "application/pdf", ref + " - bertandatangan.pdf"));
  }
  return reply({ ok: true });
}

/** Short alert to the secretariat that a signed form came in (name + cawangan only, never the IC). */
function notifySigned(ref, nama, cawangan, digital) {
  if (!NOTIFY_EMAIL) return;
  try {
    MailApp.sendEmail({
      to: NOTIFY_EMAIL,
      subject: "Borang bertandatangan diterima " + ref + ": " + nama,
      body:
        (digital ? "Pemohon telah menandatangani borang secara digital (lukis di skrin)." : "Pemohon telah memuat naik borang bertandatangan (kertas).") + "\n\n" +
        "Rujukan: " + ref + "\n" +
        "Nama: " + nama + "\n" +
        "Cawangan: " + cawangan + "\n\n" +
        "Fail ada dalam sheet (lajur Borang Bertandatangan): https://docs.google.com/spreadsheets/d/" + SHEET_ID + "/edit",
    });
  } catch (err) {
    console.error("notifySigned failed", err);
  }
}

/**
 * Send to an applicant. Comes from this Google account's address under the name "Belia PBB Sarawak";
 * replies go to NOTIFY_EMAIL (hello@, which forwards to the secretariat). hello@ itself can't be the
 * sender without a Google Workspace mailbox, so we don't try.
 */
function deliver(email, subject, body, blob) {
  MailApp.sendEmail({
    to: email, replyTo: NOTIFY_EMAIL, name: "Belia PBB Sarawak", subject: subject, body: body, attachments: blob ? [blob] : [],
  });
}

/** Signed copy for an applicant who signed on screen. */
function sendSignedCopy(ref, nama, email, blob) {
  if (!email || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email)) return;
  try {
    if (MailApp.getRemainingDailyQuota() < 20) return;
    deliver(
      email,
      "Borang keahlian Belia PBB bertandatangan (" + ref + ")",
      "Salam " + nama + ",\n\nBorang permohonan keahlian anda yang telah ditandatangani dilampirkan (PDF). " +
        "Urus setia akan menyemak permohonan anda dan menghubungi anda.\n\nNombor rujukan: " + ref + "\n\n---\n" +
        "Hi " + nama + ", your signed membership application form is attached (PDF). The secretariat will review it and contact you. " +
        "Reference: " + ref + "\n\nBelia PBB Sarawak\nhttps://beliapbb.com",
      blob
    );
  } catch (err) {
    console.error("signed copy failed", err);
  }
}

/**
 * Short confirmation to the applicant (reference number only, never the IC number).
 * Skipped when the e-mail is missing/invalid or the daily mail quota is nearly used up, so the
 * secretariat alert above always has room. Sent from NOTIFY_EMAIL (needs the Gmail alias); replies go there too.
 */
function confirmApplicant(ref, nama, cawangan, email, pdfBlob) {
  if (!email || !/^[^\s@,;<>]+@[^\s@,;<>]+\.[^\s@,;<>]+$/.test(email)) return;
  try {
    if (MailApp.getRemainingDailyQuota() < 20) return;
    var subject = "Permohonan keahlian Belia PBB diterima (" + ref + ")";
    var body =
      "Salam " + nama + ",\n\n" +
      "Terima kasih. Permohonan keahlian Belia PBB anda telah kami terima.\n\n" +
      "Nombor rujukan: " + ref + "\n" +
      "Cawangan: " + cawangan + "\n\n" +
      (pdfBlob
        ? "Borang permohonan anda yang telah diisi dilampirkan (PDF). Sila tandatangani borang: lukis tandatangan anda di skrin pada https://beliapbb.com/sertai/, atau cetak borang, tandatangan pada ruangan pemohon, kemudian ambil gambar atau imbas dan muat naik di pautan yang sama menggunakan nombor rujukan dan no. kad pengenalan anda. Permohonan hanya lengkap selepas borang bertandatangan diterima.\n\n"
        : "") +
      "Urus setia akan menyemak permohonan anda dan menghubungi anda. " +
      "Sila simpan nombor rujukan ini dan sebutkannya jika anda menghubungi kami di " + NOTIFY_EMAIL + ".\n\n" +
      "---\n" +
      "Hi " + nama + ", we have received your Belia PBB membership application. " +
      "Your reference number is " + ref + ". " +
      (pdfBlob
        ? "Your filled-in application form is attached (PDF). Please sign it: draw your signature on screen at https://beliapbb.com/sertai/, or print it, sign the applicant box, then photograph or scan it and upload it at the same link with your reference number and IC number. Your application is complete only once the signed form is received. "
        : "") +
      "The secretariat will review it and contact you. " +
      "Questions: " + NOTIFY_EMAIL + ".\n\n" +
      "Belia PBB Sarawak\nhttps://beliapbb.com";
    deliver(email, subject, body, pdfBlob);
  } catch (err) {
    console.error("confirm failed", err);
  }
}

/**
 * Run from the Apps Script editor (select testConfirmEmail → Run) to preview the applicant e-mail.
 * Sends one e-mail with a dummy reference to the address below; writes nothing to the sheet.
 * Leave TEST_TO empty to send to the account running the script.
 */
function testConfirmEmail() {
  var TEST_TO = ""; // e.g. "you@example.com"
  var to = TEST_TO || Session.getEffectiveUser().getEmail();
  confirmApplicant("BPBB-TEST-00000", "Ujian", "Cawangan Ujian", to);
  console.log("Test e-mail sent to " + to);
}

/**
 * Run once from the editor (select authorizeAll → Run) after adding new features: makes Google ask for every
 * permission the script uses (sheet, Drive folder, mail) in one go. Sends and writes nothing.
 */
function authorizeAll() {
  SpreadsheetApp.openById(SHEET_ID).getName();
  DriveApp.getRootFolder().getName();
  console.log("OK. Mail quota left today: " + MailApp.getRemainingDailyQuota());
}

function reply(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
