/**
 * GOOGLE APPS SCRIPT MULTI-TAB INPUT MANDOR & AUTO-DATABASE REKAP
 * PT. SUKUN WARTONO INDONESIA — DIVISI PENGAWASAN MUTU & PRODUKSI
 * =====================================================================
 * ARSITEKTUR SISTEM:
 * 1. Setiap Mandor memiliki TAB SENDIRI untuk input harian (misal: "1A - M. NIRWANSYAH")
 * 2. Mandor HANYA mengisi di tab mereka masing-masing (sangat aman, tidak saling timpa)
 * 3. Tab "DATABASE_PRODUKSI" otomatis ter-link secara REAL-TIME merangkum semua tab mandor
 * 4. Dashboard Web SQC-Pro membaca dari DATABASE_PRODUKSI dengan Auto-Refresh 30 detik!
 */

// 1. MENU TOOLBAR DI GOOGLE SPREADSHEET
function onOpen() {
  try {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('🏭 MENU SUKUN QC')
      .addItem('🚀 1-Klik Buat 16 Tab Input Mandor + Database Rekap Otomatis', 'setupSistemMultiTabMandor')
      .addItem('🔄 Sinkronkan / Rekap Ulang Semua Tab Mandor', 'rekapSemuaTabMandor')
      .addSeparator()
      .addItem('ℹ️ Petunjuk Deploy Web App', 'tampilkanPetunjukDeploy')
      .addToUi();
  } catch(e) {
    Logger.log("Info onOpen: " + e.message);
  }
}

// 2. FUNGSI UTAMA: MEMBUAT 16 TAB MANDOR + TAB DATABASE OTOMATIS
function setupSistemMultiTabMandor() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  var daftarMandor = [
  {
    "lokal": "1A",
    "mandor": "M. NIRWANSYAH",
    "brand": "MW"
  },
  {
    "lokal": "1B",
    "mandor": "SABILI ABIDUL H.",
    "brand": "KS New"
  },
  {
    "lokal": "1C",
    "mandor": "LUSI M.",
    "brand": "Gemilang"
  },
  {
    "lokal": "1D",
    "mandor": "EKA HAPPY",
    "brand": "Istimea"
  },
  {
    "lokal": "1E",
    "mandor": "JANNAH",
    "brand": "Abu-abu"
  },
  {
    "lokal": "1F",
    "mandor": "NOOR SULIKAN.",
    "brand": "Orange Fresh"
  },
  {
    "lokal": "2A",
    "mandor": "M. NAUFAL A.",
    "brand": "SSB"
  },
  {
    "lokal": "2B",
    "mandor": "M. NURDIN",
    "brand": "Premiere"
  },
  {
    "lokal": "2C",
    "mandor": "ALI MAHMUD A.",
    "brand": "Sukun 2000"
  },
  {
    "lokal": "2D",
    "mandor": "CHOFIFAH",
    "brand": "Intan"
  },
  {
    "lokal": "2E",
    "mandor": "SUWARSIH",
    "brand": "Biru Sapphiere"
  },
  {
    "lokal": "2F",
    "mandor": "MURYATI",
    "brand": "MW"
  },
  {
    "lokal": "3A",
    "mandor": "PURYANI",
    "brand": "Intan"
  },
  {
    "lokal": "3B",
    "mandor": "MUSLIKIN",
    "brand": "MW"
  },
  {
    "lokal": "3C",
    "mandor": "PIPIT P.",
    "brand": "Gemilang"
  },
  {
    "lokal": "3D",
    "mandor": "ZUMROH",
    "brand": "Istimea"
  }
];

  var headers = [
    "LOKAL", "TANGGAL", "NAMA MANDOR", "NAMA TELAK", "BRAND", 
    "ABSENSI GILING", "GARAPAN", "COWONG", "PAPIR KUSUT", "LEM KURANG", 
    "TALIPAN KOTOR", "MUNTIR", "MEDOT", "ATOS", "MEKAR-MINGKUP", 
    "KERUSAKAN TELAK", "KERUSAKAN MANDOR", "KEKURANGAN PAPIR", "% RASIO TELAK", "% RASIO MANDOR"
  ];

  // A. BUAT TAB DATABASE_PRODUKSI (Master Rekap)
  var sheetProd = ss.getSheetByName("DATABASE_PRODUKSI");
  if (!sheetProd) {
    sheetProd = ss.insertSheet("DATABASE_PRODUKSI", 0);
  }
  sheetProd.clear();
  sheetProd.appendRow(headers);
  formatHeaderRange(sheetProd, 1, 1, 1, headers.length, "#0F172A", "#38BDF8");
  sheetProd.setFrozenRows(1);

  // Formula VSTACK untuk otomatis menggabungkan seluruh tab mandor
  var vstackParts = [];

  // B. BUAT 16 TAB INPUT KHUSUS SETIAP MANDOR
  for (var i = 0; i < daftarMandor.length; i++) {
    var m = daftarMandor[i];
    var tabName = m.lokal + " - " + m.mandor;
    vstackParts.push("IFERROR(FILTER('" + tabName + "'!A2:T, '" + tabName + "'!B2:B<\"\"))");

    var sheetM = ss.getSheetByName(tabName);
    if (!sheetM) {
      sheetM = ss.insertSheet(tabName, i + 1);
    }
    sheetM.clear();
    sheetM.appendRow(headers);

    // Format Header Tab Mandor dengan warna Hijau Elegan
    formatHeaderRange(sheetM, 1, 1, 1, headers.length, "#064E3B", "#34D399");
    sheetM.setFrozenRows(1);

    // Tambahkan 1 baris contoh input
    var sampleDate = new Date().toLocaleDateString("id-ID");
    var sampleRow = [
      m.lokal, sampleDate, m.mandor, "Contoh Telak", m.brand || "MW", 
      1.0, 50000, 100, 15, 20, 10, 15, 80, 20, 120, 
      "=SUM(H2:O2)", 800, 0, "=(P2/G2)*100", "=(Q2/G2)*100"
    ];
    sheetM.appendRow(sampleRow);
    autoFitColumns(sheetM, headers.length);
  }

  // Pasang Master Formula VSTACK di sel A2 DATABASE_PRODUKSI
  var formulaStr = "=VSTACK(" + vstackParts.join(", ") + ")";
  try {
    sheetProd.getRange("A2").setFormula(formulaStr);
  } catch(e) {
    // Jika VSTACK formula belum didukung di versi sheet user, jalankan rekap script
    rekapSemuaTabMandor();
  }
  autoFitColumns(sheetProd, headers.length);

  // C. BUAT TAB MASTER REFERENSI
  var sheetMaster = ss.getSheetByName("MASTER_LOKAL_MANDOR");
  if (!sheetMaster) sheetMaster = ss.insertSheet("MASTER_LOKAL_MANDOR");
  sheetMaster.clear();
  sheetMaster.appendRow(["NAMA LOKAL", "NAMA MANDOR", "BRAND", "KETERANGAN"]);
  daftarMandor.forEach(function(item) {
    sheetMaster.appendRow([item.lokal, item.mandor, item.brand, "Aktif"]);
  });
  formatHeaderRange(sheetMaster, 1, 1, 1, 4, "#0F172A", "#34D399");
  autoFitColumns(sheetMaster, 4);

  // Hapus Sheet1 kosong jika ada
  var defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Sheet 1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch(err) {}
  }

  ss.setActiveSheet(sheetProd);
  try {
    SpreadsheetApp.getUi().alert("✅ BERHASIL SELESAI!\n\n16 Tab Mandor terpisah telah selesai dibuat!\nSetiap mandor kini punya tab sendiri.\nData dari seluruh tab otomatis ter-link masuk ke tab DATABASE_PRODUKSI secara realtime.");
  } catch (e) {
    Logger.log("✅ BERHASIL: 16 Tab Mandor terpisah & DATABASE_PRODUKSI telah selesai dibuat!");
  }
}

// 3. FUNGSI REKAP SCRIPT (CADANGAN SINKRONISASI SEMUA TAB MANDOR)
function rekapSemuaTabMandor() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheetProd = ss.getSheetByName("DATABASE_PRODUKSI");
  if (!sheetProd) return;

  var headers = [
    "LOKAL", "TANGGAL", "NAMA MANDOR", "NAMA TELAK", "BRAND", 
    "ABSENSI GILING", "GARAPAN", "COWONG", "PAPIR KUSUT", "LEM KURANG", 
    "TALIPAN KOTOR", "MUNTIR", "MEDOT", "ATOS", "MEKAR-MINGKUP", 
    "KERUSAKAN TELAK", "KERUSAKAN MANDOR", "KEKURANGAN PAPIR", "% RASIO TELAK", "% RASIO MANDOR"
  ];

  var allRows = [];
  var sheets = ss.getSheets();

  for (var s = 0; s < sheets.length; s++) {
    var sh = sheets[s];
    var sName = sh.getName();
    // Cari tab mandor (yang ada strip "-" seperti "1A - M. NIRWANSYAH")
    if (sName.indexOf(" - ") !== -1) {
      var data = sh.getDataRange().getValues();
      for (var r = 1; r < data.length; r++) {
        var row = data[r];
        if (row[0] && row[1]) { // Ada lokal & tanggal
          allRows.push(row);
        }
      }
    }
  }

  if (allRows.length > 0) {
    sheetProd.clear();
    sheetProd.appendRow(headers);
    sheetProd.getRange(2, 1, allRows.length, headers.length).setValues(allRows);
    formatHeaderRange(sheetProd, 1, 1, 1, headers.length, "#0F172A", "#38BDF8");
    sheetProd.setFrozenRows(1);
  }
}

// 4. API DUA ARAH (GET & POST) UNTUK DASHBOARD WEB
function doGet(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var result = {
      status: "success",
      timestamp: new Date().toISOString(),
      data: { workers: [], master: [] }
    };

    var prodSheet = ss.getSheetByName("DATABASE_PRODUKSI");
    if (prodSheet) result.data.workers = getSheetDataAsJson(prodSheet);

    var masterSheet = ss.getSheetByName("MASTER_LOKAL_MANDOR");
    if (masterSheet) result.data.master = getSheetDataAsJson(masterSheet);

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var postData = JSON.parse(e.postData.contents);

    if (postData.workers && Array.isArray(postData.workers)) {
      var prodSheet = ss.getSheetByName("DATABASE_PRODUKSI");
      if (!prodSheet) prodSheet = ss.insertSheet("DATABASE_PRODUKSI", 0);
      prodSheet.clear();

      var headers = [
        "LOKAL", "TANGGAL", "NAMA MANDOR", "NAMA TELAK", "BRAND", 
        "ABSENSI GILING", "GARAPAN", "COWONG", "PAPIR KUSUT", "LEM KURANG", 
        "TALIPAN KOTOR", "MUNTIR", "MEDOT", "ATOS", "MEKAR-MINGKUP", 
        "KERUSAKAN TELAK", "KERUSAKAN MANDOR", "KEKURANGAN PAPIR"
      ];
      prodSheet.appendRow(headers);

      var rows = postData.workers.map(function(w) {
        var d = w.defects || {};
        return [
          w.lokal || "",
          new Date().toLocaleDateString("id-ID"),
          w.mandor || "",
          w.name || "",
          w.brand || "",
          1.0,
          w.garapan || 0,
          d.cowong || 0,
          d.papir_kusut || 0,
          d.lem_kurang || 0,
          d.talipan_kotor || 0,
          d.muntir || 0,
          d.medot || 0,
          d.atos || 0,
          d.mekar_mingkup || 0,
          w.telak || 0,
          w.mandorDefect || w.mandor || 0,
          0
        ];
      });

      if (rows.length > 0) {
        prodSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
      }
      formatHeaderRange(prodSheet, 1, 1, 1, headers.length, "#0F172A", "#38BDF8");
      prodSheet.setFrozenRows(1);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data tersimpan!" })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

// 5. HELPER PARSER & FORMATTING
function getSheetDataAsJson(sheet) {
  var values = sheet.getDataRange().getValues();
  if (!values || values.length <= 1) return [];
  var headers = values[0];
  var result = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j].toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
      obj[key] = row[j];
    }
    result.push(obj);
  }
  return result;
}

function formatHeaderRange(sheet, startRow, startCol, numRows, numCols, bgColor, fontColor) {
  try {
    sheet.getRange(startRow, startCol, numRows, numCols)
      .setBackground(bgColor).setFontColor(fontColor).setFontWeight("bold").setFontFamily("Arial");
  } catch(e) {}
}

function autoFitColumns(sheet, numCols) {
  try { sheet.autoResizeColumns(1, numCols); } catch(e) {}
}

function tampilkanPetunjukDeploy() {
  try {
    var html = HtmlService.createHtmlOutput(
      '<p><b>Cara Mendapatkan Link Web App:</b></p>' +
      '<ol><li>Klik tombol biru <b>Deploy</b> > <b>New deployment</b>.</li>' +
      '<li>Pilih <b>Web app</b>, akses: <b>Anyone</b>.</li>' +
      '<li>Klik <b>Deploy</b> dan salin URL ke dashboard.</li></ol>'
    ).setWidth(400).setHeight(220);
    SpreadsheetApp.getUi().showModalDialog(html, 'Petunjuk Deploy Web App');
  } catch(e) {
    Logger.log("Petunjuk: Deploy > New deployment > Web app > Anyone");
  }
}
