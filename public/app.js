/**
 * Executive Production & Defect Quality Dashboard
 * Powered by Node.js Backend + Google Spreadsheet Database Sync + Drag-and-Drop
 */

// State Management
let appConfig = null;
let masterDataset = [];
let workerDataset = [];
let activeDataset = [];
let dailyTrendData = [];
let defectTimeSeriesData = [];

// Chart References
let dailyTrendChartObj = null;
let workerBarChartObj = null;
let defectCriteriaChartObj = null;
let scatterChartObj = null;

// Node.js Backend Base URL
const API_BASE = window.location.origin;

// Initial Default Fallbacks
const DEFAULT_CONFIG = {
  app: {
    title: "Executive Production & Defect Quality Dashboard",
    subtitle: "Sistem Pemantauan Efisiensi Produksi, Cacat Produk, & Evaluasi Kinerja Pekerja",
    warehouse: "Gudang 3",
    theme: "dark"
  },
  menus: [
    { id: "menu-kpi", label: "Executive Dashboard", icon: "fa-solid fa-gauge-high", section: "kpiSection", visible: true, order: 1 },
    { id: "menu-insights", label: "Key Insights & AI", icon: "fa-solid fa-brain", section: "insightsSection", visible: true, order: 2 },
    { id: "menu-charts", label: "Visual Analytics", icon: "fa-solid fa-chart-line", section: "chartsSection", visible: true, order: 3 },
    { id: "menu-heatmap", label: "Matrix Heatmap", icon: "fa-solid fa-border-all", section: "heatmapSection", visible: true, order: 4 },
    { id: "menu-table", label: "Detail Rekapitulasi", icon: "fa-solid fa-table", section: "tableSection", visible: true, order: 5 },
    { id: "menu-master", label: "Master Mandor & Lokal", icon: "fa-solid fa-id-card-clip", section: "masterSection", visible: true, order: 6 }
  ],
  widgets: [
    { id: "widget-kpi-garapan", title: "Total Garapan", visible: true, order: 1 },
    { id: "widget-kpi-telak", title: "Kerusakan Telak", visible: true, order: 2 },
    { id: "widget-kpi-mandor", title: "Kerusakan Mandor", visible: true, order: 3 },
    { id: "widget-kpi-gap", title: "Gap Variansi", visible: true, order: 4 },
    { id: "widget-kpi-best", title: "Best Quality Worker", visible: true, order: 5 },
    { id: "widget-chart-trend", title: "Analisis Tren Harian", visible: true, order: 6 },
    { id: "widget-chart-worker", title: "Perbandingan per Pekerja", visible: true, order: 7 },
    { id: "widget-chart-criteria", title: "Tren Kriteria Cacat", visible: true, order: 8 },
    { id: "widget-chart-scatter", title: "Scatter Garapan vs Defect", visible: true, order: 9 },
    { id: "heatmapSection", title: "Heatmap Cacat per Lokal", visible: true, order: 10 },
    { id: "tableSection", title: "Tabel Rekapitulasi", visible: true, order: 11 },
    { id: "masterSection", title: "Master Mandor & Lokal", visible: true, order: 12 }
  ],
  thresholds: {
    toleranceLimit: 1.0,
    highRiskLimit: 2.0
  },
  defectCriteria: [
    { key: "cowong", label: "COWONG", code: "CW", color: "#00f2fe", visible: true },
    { key: "papir_kusut", label: "PAPIR KUSUT", code: "PK", color: "#38ef7d", visible: true },
    { key: "lem_kurang", label: "LEM KURANG", code: "LK", color: "#10b981", visible: true },
    { key: "talipan_kotor", label: "TALIPAN KOTOR", code: "TK", color: "#f59e0b", visible: true },
    { key: "muntir", label: "MUNTIR", code: "MT", color: "#ec4899", visible: true },
    { key: "medot", label: "MEDOT", code: "MD", color: "#ff4b2b", visible: true },
    { key: "atos", label: "ATOS", code: "AT", color: "#8b5cf6", visible: true },
    { key: "mekar_mingkup", label: "MEKAR-MINGKUP", code: "MM", color: "#ff416c", visible: true }
  ],
  googleSheets: {
    webAppUrl: "",
    autoSync: true,
    lastSync: null
  }
};

// ==========================================
// 1. BOOTSTRAP & INITIALIZATION
// ==========================================
window.addEventListener('DOMContentLoaded', async () => {
  setupDragAndDrop();
  setupMobileToggle();
  await loadInitialData();
  applyAppConfig();
  renderNavigationMenus();
  renderMasterDataTable();
  populateFilterOptions();
  populateLineCriteriaFilter();
  initDateFilterLimits();
  renderMasterTable();
  renderHeatmapTable();
  updateKPIs();
  initCharts();
  updateSyncBadge();
  switchMainView('kpiSection');
});

// Setup Full-window Drag and Drop
function setupDragAndDrop() {
  const overlay = document.getElementById('dragDropOverlay');
  let dragCounter = 0;

  window.addEventListener('dragenter', (e) => {
    e.preventDefault();
    dragCounter++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      overlay.classList.add('active');
    }
  });

  window.addEventListener('dragover', (e) => {
    e.preventDefault();
  });

  window.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragCounter--;
    if (dragCounter <= 0) {
      overlay.classList.remove('active');
      dragCounter = 0;
    }
  });

  window.addEventListener('drop', (e) => {
    e.preventDefault();
    dragCounter = 0;
    overlay.classList.remove('active');

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      processExcelFile(files[0]);
    }
  });
}

function setupMobileToggle() {
  const btn = document.getElementById('mobileMenuToggle');
  if (btn) {
    btn.addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('hidden');
    });
  }
}

// Load data from Node.js backend or localStorage
async function loadInitialData() {
  try {
    const res = await fetch(`${API_BASE}/api/data`);
    if (res.ok) {
      const json = await res.json();
      if (json.status === 'success' && json.data) {
        appConfig = json.data.config && Object.keys(json.data.config).length > 0 ? json.data.config : DEFAULT_CONFIG;
        masterDataset = Array.isArray(json.data.master) ? json.data.master : [];
        if (json.data.database && json.data.database.workers) {
          workerDataset = json.data.database.workers;
          dailyTrendData = json.data.database.dailyTrend || [];
          defectTimeSeriesData = json.data.database.defectTimeSeries || [];
        }
      }
    }
  } catch (err) {
    console.warn("Node.js API unavailable, using local persistence / defaults:", err);
  }

  // Fallback to localStorage if backend was empty
  if (!appConfig) {
    const storedCfg = localStorage.getItem('app_config');
    appConfig = storedCfg ? JSON.parse(storedCfg) : JSON.parse(JSON.stringify(DEFAULT_CONFIG));
  }
  if (!masterDataset || masterDataset.length === 0) {
    const storedMaster = localStorage.getItem('app_master');
    masterDataset = storedMaster ? JSON.parse(storedMaster) : [];
  }
  if (!workerDataset || workerDataset.length === 0) {
    const storedWorkers = localStorage.getItem('app_workers');
    if (storedWorkers) {
      workerDataset = JSON.parse(storedWorkers);
    }
  }

  activeDataset = [...workerDataset];
}

// Persist data locally and to Node.js backend
async function saveAllDataLocally() {
  // Save to LocalStorage
  localStorage.setItem('app_config', JSON.stringify(appConfig));
  localStorage.setItem('app_master', JSON.stringify(masterDataset));
  localStorage.setItem('app_workers', JSON.stringify(workerDataset));

  // Save to Node.js backend
  try {
    await fetch(`${API_BASE}/api/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        database: {
          lastUpdated: new Date().toISOString(),
          workers: workerDataset,
          dailyTrend: dailyTrendData,
          defectTimeSeries: defectTimeSeriesData
        },
        master: masterDataset,
        config: appConfig
      })
    });
  } catch (e) {
    console.warn("Could not save to Node server:", e);
  }

  // Trigger Google Sheet sync if autoSync is enabled and URL is set
  if (appConfig.googleSheets && appConfig.googleSheets.autoSync && appConfig.googleSheets.webAppUrl) {
    syncWithGoogleSheet(true);
  }
}

// ==========================================
// 2. DYNAMIC MENUS & CONFIGURATION
// ==========================================
function applyAppConfig() {
  if (!appConfig) return;

  // Identity
  if (appConfig.app) {
    document.getElementById('pageTitle').innerText = appConfig.app.title || "Executive Dashboard";
    document.getElementById('headerAppTitle').innerText = appConfig.app.title || "Executive Dashboard";
    document.getElementById('sidebarAppTitle').innerText = (appConfig.app.title || "Defect Analytics").split(" ")[0] + " Analytics";
    document.getElementById('headerAppSubtitle').innerText = appConfig.app.subtitle || "";
    document.getElementById('headerWarehouseBadge').innerText = appConfig.app.warehouse || "Gudang 3";
    document.getElementById('sidebarWarehouseLabel').innerText = (appConfig.app.warehouse || "Gudang 3") + " BI";
  }

  // Thresholds
  if (appConfig.thresholds) {
    document.getElementById('badgeHighRiskLimit').innerText = `> ${appConfig.thresholds.highRiskLimit}% High Risk`;
  }

  // Widgets Visibility
  if (appConfig.widgets) {
    appConfig.widgets.forEach(w => {
      const el = document.getElementById(w.id);
      if (el) {
        el.style.display = w.visible ? '' : 'none';
      }
    });
  }
}

function renderNavigationMenus() {
  const container = document.getElementById('navContainer');
  if (!container || !appConfig.menus) return;

  container.innerHTML = '';
  const sorted = [...appConfig.menus].sort((a, b) => a.order - b.order);

  sorted.forEach((menu, idx) => {
    if (!menu.visible) return;

    const targetSec = menu.section.replace('#', '');
    const a = document.createElement('a');
    a.href = "javascript:void(0)";
    a.id = `sideNav-${targetSec}`;
    a.className = `nav-item flex items-center justify-between px-4 py-3 rounded-xl font-medium transition-all duration-200 ${idx === 0 ? 'text-white glass-nav-active' : 'text-slate-400 hover:text-white hover:bg-white/5'}`;
    a.onclick = function() {
      switchMainView(targetSec);
      if (window.innerWidth < 768) {
        document.getElementById('sidebar').classList.add('hidden');
      }
    };

    a.innerHTML = `
      <div class="flex items-center space-x-3">
        <i class="${menu.icon || 'fa-solid fa-circle-dot'} text-neon-cyan text-base w-5"></i>
        <span>${menu.label}</span>
      </div>
    `;
    container.appendChild(a);
  });
}

// ==========================================
// VIEW SWITCHER (TIDAK PANJANG KE BAWAH)
// ==========================================
let currentActiveView = 'kpiSection';

function switchMainView(viewId) {
  currentActiveView = viewId;
  const sections = ['kpiSection', 'insightsSection', 'chartsSection', 'heatmapSection', 'tableSection', 'masterSection'];

  if (viewId === 'all') {
    sections.forEach(sId => {
      const el = document.getElementById(sId);
      if (el) el.style.display = '';
    });
    const lbl = document.getElementById('currentViewLabel');
    if (lbl) lbl.innerText = 'Tampilan: Semua Bagian (Lengkap)';
  } else if (viewId === 'kpiSection' || viewId === 'insightsSection') {
    // Tampilkan hanya Executive Dashboard & Insights
    sections.forEach(sId => {
      const el = document.getElementById(sId);
      if (el) {
        el.style.display = (sId === 'kpiSection' || sId === 'insightsSection') ? '' : 'none';
      }
    });
    const lbl = document.getElementById('currentViewLabel');
    if (lbl) lbl.innerText = 'Tampilan: Executive Dashboard';
  } else {
    // Tampilkan hanya menu yang dipilih
    sections.forEach(sId => {
      const el = document.getElementById(sId);
      if (el) {
        el.style.display = (sId === viewId) ? '' : 'none';
      }
    });
    const labelsMap = {
      'chartsSection': 'Visual Analytics',
      'heatmapSection': 'Matrix Heatmap',
      'tableSection': 'Detail Rekapitulasi',
      'masterSection': 'Master Mandor & Lokal'
    };
    const lbl = document.getElementById('currentViewLabel');
    if (lbl) lbl.innerText = 'Tampilan: ' + (labelsMap[viewId] || viewId);
  }

  // Update Segmented Tab Controls
  document.querySelectorAll('.segmented-tab').forEach(btn => {
    btn.classList.remove('active');
  });
  const activeTabBtn = document.getElementById(`tabNav-${viewId}`);
  if (activeTabBtn) {
    activeTabBtn.classList.add('active');
  }

  // Update Tombol Sidebar
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.remove('glass-nav-active', 'text-white');
    el.classList.add('text-slate-400');
  });
  const activeSidebarItem = document.getElementById(`sideNav-${viewId}`);
  if (activeSidebarItem) {
    activeSidebarItem.classList.add('glass-nav-active', 'text-white');
    activeSidebarItem.classList.remove('text-slate-400');
  }

  // Re-render chart size jika tab visual analytics aktif
  if (viewId === 'chartsSection' || viewId === 'all') {
    setTimeout(() => {
      if (dailyTrendChartObj) dailyTrendChartObj.resize();
      if (workerBarChartObj) workerBarChartObj.resize();
      if (defectCriteriaChartObj) defectCriteriaChartObj.resize();
      if (scatterChartObj) scatterChartObj.resize();
    }, 60);
  }

  // Scroll lembut ke header
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==========================================
// 3. EXCEL / CSV DRAG & DROP PARSER
// ==========================================
function handleExcelUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  processExcelFile(file);
}

function cleanStr(val) {
  if (!val) return '';
  return val.toString().trim();
}

function cleanKey(val) {
  if (!val) return '';
  return val.toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '');
}

function parseNum(val) {
  if (typeof val === 'number') return val;
  if (!val) return 0;
  let str = val.toString().replace(/[^0-9.,-]/g, '').replace(',', '.');
  return parseFloat(str) || 0;
}

function processExcelFile(file) {
  showToast(`Membaca file: ${file.name}...`);
  const reader = new FileReader();

  reader.onload = function(e) {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array', cellDates: true, raw: false });

      let parsedAny = false;

      workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        const matrix = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        if (matrix && matrix.length > 0) {
          const ok = parseSheetMatrix(matrix, sheetName);
          if (ok) parsedAny = true;
        }
      });

      if (parsedAny) {
        populateFilterOptions();
        populateLineCriteriaFilter();
        initDateFilterLimits();
        renderMasterTable();
        renderHeatmapTable();
        renderMasterDataTable();
        updateKPIs();
        updateChartsWithNewData();
        saveAllDataLocally();
        showToast(`File ${file.name} Berhasil Diproses & Disimpan!`);
      } else {
        showToast("Format tabel tidak terdeteksi. Pastikan kolom Nama Pekerja atau Lokal tersedia.");
      }
    } catch (err) {
      console.error("Gagal membaca file Excel:", err);
      showToast("Gagal memproses file Excel. Periksa format file.");
    }
  };

  reader.readAsArrayBuffer(file);
}

function parseSheetMatrix(matrix, sheetName) {
  // 1. Detect if sheet is Master Data (NAMA LOKAL, NAMA MANDOR, BRAND)
  for (let r = 0; r < Math.min(matrix.length, 5); r++) {
    const rowStr = matrix[r].map(c => cleanKey(c)).join(' ');
    if (rowStr.includes('namalokal') && rowStr.includes('namamandor')) {
      return parseMasterSheet(matrix, r);
    }
  }

  // 2. Detect if sheet is Form Kerusakan / Kartu Giling Gudang 3 (with CW, PK, LK, TK, MT, MD, AT, MM)
  for (let r = 0; r < Math.min(matrix.length, 12); r++) {
    const rowStr = matrix[r].map(c => cleanKey(c)).join(' ');
    if (rowStr.includes('westeater') || (rowStr.includes('cw') && rowStr.includes('pk') && rowStr.includes('mm'))) {
      return parseKartuGilingSheet(matrix, r);
    }
  }

  // 3. Detect Standard Rekap Defect Sheet (TANGGAL, NAMA TELAK, MANDOR, LOKAL, GARAPAN, COWONG...)
  return parseStandardRekapSheet(matrix);
}

// Parser: Master Data Mandor & Lokal
function parseMasterSheet(matrix, headerRowIdx) {
  const headers = matrix[headerRowIdx].map(c => cleanKey(c));
  const lokalIdx = headers.findIndex(h => h.includes('lokal'));
  const mandorIdx = headers.findIndex(h => h.includes('mandor'));
  const brandIdx = headers.findIndex(h => h.includes('brand') || h.includes('merek'));

  let count = 0;
  for (let r = headerRowIdx + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || row.length === 0) continue;
    const lokal = cleanStr(row[lokalIdx]);
    const mandor = cleanStr(row[mandorIdx]);
    const brand = brandIdx !== -1 ? cleanStr(row[brandIdx]) : '';

    if (lokal || mandor) {
      const existing = masterDataset.find(m => m.lokal.toLowerCase() === lokal.toLowerCase());
      if (existing) {
        existing.mandor = mandor || existing.mandor;
        existing.brand = brand || existing.brand;
      } else {
        masterDataset.push({ lokal, mandor, brand });
      }
      count++;
    }
  }
  return count > 0;
}

// Parser: Kartu Giling (Form Kerusakan Rokok Gudang 3)
function parseKartuGilingSheet(matrix, headerRowIdx) {
  // Extract metadata from header area (top 12 rows)
  let sheetLokal = "";
  let sheetMandor = "";
  let sheetBrand = "";
  let sheetProduksi = 0;
  let sheetTelak = "";

  for (let r = 0; r < Math.min(matrix.length, 12); r++) {
    const row = matrix[r];
    if (!Array.isArray(row)) continue;
    for (let c = 0; c < row.length; c++) {
      const cellText = cleanStr(row[c]).toLowerCase();
      if (cellText.includes('lokal') && c + 1 < row.length) {
        let val = cleanStr(row[c + 1]) || cleanStr(row[c + 2]) || cleanStr(row[c + 3]);
        val = val.replace(/[:"']/g, '').replace(/contoh/i, '').trim();
        if (val && !sheetLokal) sheetLokal = val.toUpperCase();
      }
      if ((cellText.includes('mandor') || cellText.includes('petugasmandor')) && c + 1 < row.length) {
        let val = cleanStr(row[c + 1]) || cleanStr(row[c + 2]) || cleanStr(row[c + 3]);
        val = val.replace(/[:"']/g, '').replace(/contoh/i, '').trim();
        if (val && !sheetMandor) sheetMandor = val;
      }
      if (cellText.includes('brand') && c + 1 < row.length) {
        let val = cleanStr(row[c + 1]) || cleanStr(row[c + 2]) || cleanStr(row[c + 3]);
        val = val.replace(/[:"']/g, '').trim();
        if (val && !sheetBrand) sheetBrand = val;
      }
      if ((cellText.includes('jumlah produksi') || cellText.includes('produksi')) && c + 1 < row.length) {
        let val = parseNum(row[c + 1]) || parseNum(row[c + 2]) || parseNum(row[c + 3]);
        if (val > 0 && sheetProduksi === 0) sheetProduksi = val;
      }
      if (cellText.includes('petugas telak') && c + 1 < row.length) {
        let val = cleanStr(row[c + 1]) || cleanStr(row[c + 2]);
        val = val.replace(/[:"']/g, '').trim();
        if (val && !sheetTelak) sheetTelak = val;
      }
    }
  }

  // Cross reference with master dataset if mandor or brand is missing
  if (sheetLokal) {
    const matchedMaster = masterDataset.find(m => m.lokal.toLowerCase() === sheetLokal.toLowerCase());
    if (matchedMaster) {
      if (!sheetMandor) sheetMandor = matchedMaster.mandor;
      if (!sheetBrand) sheetBrand = matchedMaster.brand;
    }
  }

  // Find column indexes for Worker Table
  let nameIdx = -1;
  let codeCols = {};

  const codeMap = {
    'cw': 'cowong',
    'pk': 'papir_kusut',
    'lk': 'lem_kurang',
    'tk': 'talipan_kotor',
    'mt': 'muntir',
    'md': 'medot',
    'at': 'atos',
    'mm': 'mekar_mingkup'
  };

  // Inspect rows around headerRowIdx (down to headerRowIdx + 4)
  for (let r = Math.max(0, headerRowIdx - 2); r <= Math.min(matrix.length - 1, headerRowIdx + 4); r++) {
    if (!matrix[r]) continue;
    matrix[r].forEach((cell, cIdx) => {
      const k = cleanKey(cell);
      if (['nama', 'namalengkap', 'worker', 'operator'].some(x => k.includes(x)) && nameIdx === -1) {
        nameIdx = cIdx;
      }
      if (codeMap[k]) {
        codeCols[codeMap[k]] = cIdx;
      }
    });
  }

  if (nameIdx === -1) nameIdx = 2; // fallback typical NO, NO KARTU, NAMA

  let added = 0;
  for (let r = headerRowIdx + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!row || row.length === 0) continue;
    const name = cleanStr(row[nameIdx]);
    if (!name || ['total', 'jumlah', 'keterangan', 'weste', 'no urut', 'no kartu'].some(k => name.toLowerCase().includes(k))) continue;

    let workerObj = workerDataset.find(w => w.name.toLowerCase() === name.toLowerCase());
    if (!workerObj) {
      workerObj = {
        name: name,
        lokal: sheetLokal || "1A",
        mandor: sheetMandor || "",
        brand: sheetBrand || "",
        garapan: sheetProduksi > 0 ? Math.round(sheetProduksi / 18) : 30000,
        telak: 0,
        mandorDefect: 0,
        pctTelak: 0,
        pctMandor: 0,
        defects: {}
      };
      workerDataset.push(workerObj);
    } else {
      if (sheetLokal && !workerObj.lokal) workerObj.lokal = sheetLokal;
      if (sheetMandor && !workerObj.mandor) workerObj.mandor = sheetMandor;
      if (sheetBrand && !workerObj.brand) workerObj.brand = sheetBrand;
    }

    let rowSum = 0;
    Object.keys(codeCols).forEach(defKey => {
      const val = parseNum(row[codeCols[defKey]]);
      workerObj.defects[defKey] = (workerObj.defects[defKey] || 0) + val;
      rowSum += val;
    });

    workerObj.telak += rowSum;
    workerObj.pctTelak = workerObj.garapan > 0 ? parseFloat(((workerObj.telak / workerObj.garapan) * 100).toFixed(2)) : 0;
    added++;
  }

  activeDataset = [...workerDataset];
  return added > 0;
}

// Parser: Standard Rekap Defect
function parseStandardRekapSheet(matrix) {
  let headerRowIdx = -1;
  let nameColIdx = -1;
  let lokalColIdx = -1;
  let mandorColIdx = -1;
  let brandColIdx = -1;
  let garapanColIdx = -1;
  let mandorDefectColIdx = -1;
  let dateColIdx = -1;
  let detectedDefectCols = [];

  for (let r = 0; r < Math.min(matrix.length, 15); r++) {
    const row = matrix[r];
    if (!Array.isArray(row)) continue;

    row.forEach((cellVal, cIdx) => {
      const k = cleanKey(cellVal);
      if (!k) return;

      if (['nama', 'namatelak', 'pekerja', 'operator', 'namapekerja'].some(x => k.includes(x)) && nameColIdx === -1) {
        nameColIdx = cIdx;
        headerRowIdx = r;
      } else if (['lokal', 'lokalkerja', 'line'].some(x => k.includes(x))) {
        lokalColIdx = cIdx;
      } else if (['namamandor', 'petugasmandor'].some(x => k.includes(x))) {
        mandorColIdx = cIdx;
      } else if (['brand', 'merek'].some(x => k.includes(x))) {
        brandColIdx = cIdx;
      } else if (['garapan', 'produksi', 'totalgarapan', 'hasil'].some(x => k.includes(x))) {
        garapanColIdx = cIdx;
      } else if (['kerusakanmandor', 'cacatmandor', 'mandor'].some(x => k.includes(x)) && cIdx !== mandorColIdx) {
        mandorDefectColIdx = cIdx;
      } else if (['tanggal', 'date', 'tgl'].some(x => k.includes(x))) {
        dateColIdx = cIdx;
      }
    });

    if (nameColIdx !== -1) {
      headerRowIdx = r;
      break;
    }
  }

  if (headerRowIdx === -1) headerRowIdx = 0;
  const headerRow = matrix[headerRowIdx] || [];

  const knownCriteria = appConfig.defectCriteria.map(d => d.key);
  const ignoredWords = ['kekuranganpapir', 'kurangpapir', 'absensi', 'kerusakantelak', 'kerusakanmandor', 'total', 'no'];

  headerRow.forEach((colName, cIdx) => {
    if ([nameColIdx, lokalColIdx, mandorColIdx, brandColIdx, garapanColIdx, mandorDefectColIdx, dateColIdx].includes(cIdx)) return;
    const ck = cleanKey(colName);
    if (!ck || ignoredWords.some(w => ck.includes(w))) return;

    let matchedKey = knownCriteria.find(k => cleanKey(k) === ck || ck.includes(cleanKey(k)));
    if (!matchedKey) matchedKey = ck;

    detectedDefectCols.push({ colIdx: cIdx, key: matchedKey, label: cleanStr(colName).toUpperCase() });
  });

  let aggregated = {};
  let dateTrendMap = {};
  let minDate = null;
  let maxDate = null;

  for (let r = headerRowIdx + 1; r < matrix.length; r++) {
    const row = matrix[r];
    if (!Array.isArray(row) || row.length === 0) continue;

    let name = nameColIdx !== -1 ? cleanStr(row[nameColIdx]) : '';
    if (!name || ['total', 'jumlah', 'rekap', 'average', 'sum'].some(k => name.toLowerCase().includes(k))) continue;

    let lokal = lokalColIdx !== -1 ? cleanStr(row[lokalColIdx]) : '';
    let mandor = mandorColIdx !== -1 ? cleanStr(row[mandorColIdx]) : '';
    let brand = brandColIdx !== -1 ? cleanStr(row[brandColIdx]) : '';
    let garapan = garapanColIdx !== -1 ? parseNum(row[garapanColIdx]) : 0;
    let mandorDefect = mandorDefectColIdx !== -1 ? parseNum(row[mandorDefectColIdx]) : 0;

    // Match master data if lokal/mandor missing
    if (lokal && !mandor) {
      const m = masterDataset.find(x => x.lokal.toLowerCase() === lokal.toLowerCase());
      if (m) {
        mandor = m.mandor;
        if (!brand) brand = m.brand;
      }
    }

    let telak = 0;
    let rowDefects = {};

    detectedDefectCols.forEach(col => {
      let val = parseNum(row[col.colIdx]);
      rowDefects[col.key] = val;
      telak += val;
    });

    if (row[cleanKey('kerusakantelak')] && parseNum(row[cleanKey('kerusakantelak')]) > 0) {
      telak = parseNum(row[cleanKey('kerusakantelak')]);
    }

    if (!aggregated[name]) {
      aggregated[name] = {
        name,
        lokal: lokal || "1A",
        mandor: mandor || "",
        brand: brand || "",
        garapan: 0,
        telak: 0,
        mandorDefect: 0,
        defects: {}
      };
    }

    aggregated[name].garapan += garapan;
    aggregated[name].telak += telak;
    aggregated[name].mandorDefect += mandorDefect;
    if (lokal && !aggregated[name].lokal) aggregated[name].lokal = lokal;
    if (mandor && !aggregated[name].mandor) aggregated[name].mandor = mandor;
    if (brand && !aggregated[name].brand) aggregated[name].brand = brand;

    Object.keys(rowDefects).forEach(dKey => {
      aggregated[name].defects[dKey] = (aggregated[name].defects[dKey] || 0) + rowDefects[dKey];
    });

    // Handle date tracking
    if (dateColIdx !== -1 && row[dateColIdx]) {
      let rawD = row[dateColIdx];
      let d = rawD instanceof Date ? rawD : new Date(rawD);
      if (d && !isNaN(d.getTime())) {
        if (!minDate || d < minDate) minDate = d;
        if (!maxDate || d > maxDate) maxDate = d;
        const dStr = d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
        if (!dateTrendMap[dStr]) dateTrendMap[dStr] = { date: d.toISOString().split('T')[0], label: dStr, telak: 0, mandor: 0 };
        dateTrendMap[dStr].telak += telak;
        dateTrendMap[dStr].mandor += mandorDefect;
      }
    }
  }

  const results = Object.values(aggregated).map(item => {
    const pctTelak = item.garapan > 0 ? (item.telak / item.garapan) * 100 : 0;
    const pctMandor = item.garapan > 0 ? (item.mandorDefect / item.garapan) * 100 : 0;
    return {
      name: item.name,
      lokal: item.lokal,
      mandor: item.mandor,
      brand: item.brand,
      garapan: item.garapan,
      telak: item.telak,
      mandorDefect: item.mandorDefect,
      pctTelak: parseFloat(pctTelak.toFixed(2)),
      pctMandor: parseFloat(pctMandor.toFixed(2)),
      defects: item.defects
    };
  });

  if (results.length > 0) {
    workerDataset = results;
    activeDataset = [...workerDataset];
    if (Object.keys(dateTrendMap).length > 0) {
      dailyTrendData = Object.values(dateTrendMap);
    }
    return true;
  }
  return false;
}

// ==========================================
// 4. GOOGLE SPREADSHEET 2-WAY SYNC
// ==========================================
function updateSyncBadge() {
  const badge = document.getElementById('sheetSyncBadge');
  const info = document.getElementById('sheetSyncInfo');
  const dot = document.getElementById('headerSyncDot');
  const url = appConfig.googleSheets ? appConfig.googleSheets.webAppUrl : '';

  if (url) {
    if (dot) dot.className = "w-2 h-2 rounded-full bg-emerald-400";
    if (badge) {
      badge.className = "text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-semibold";
      badge.innerText = "Connected";
    }
    if (info) {
      info.innerText = appConfig.googleSheets.lastSync
        ? `Terakhir sync: ${new Date(appConfig.googleSheets.lastSync).toLocaleTimeString('id-ID')}`
        : "Terhubung ke Google Spreadsheet";
    }
  } else {
    if (dot) dot.className = "w-2 h-2 rounded-full bg-slate-600";
    if (badge) {
      badge.className = "text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400";
      badge.innerText = "Offline";
    }
    if (info) info.innerText = "Database tersimpan aman di browser & backend Node.js.";
  }
}

function openGoogleSheetModal() {
  const modal = document.getElementById('googleSheetModal');
  const input = document.getElementById('sheetWebAppUrlInput');
  const toggle = document.getElementById('sheetAutoSyncToggle');

  input.value = appConfig.googleSheets?.webAppUrl || '';
  toggle.checked = appConfig.googleSheets?.autoSync !== false;
  modal.classList.remove('hidden');
}

function closeGoogleSheetModal() {
  document.getElementById('googleSheetModal').classList.add('hidden');
}

function saveGoogleSheetSettings() {
  const url = document.getElementById('sheetWebAppUrlInput').value.trim();
  const autoSync = document.getElementById('sheetAutoSyncToggle').checked;

  if (!appConfig.googleSheets) appConfig.googleSheets = {};
  appConfig.googleSheets.webAppUrl = url;
  appConfig.googleSheets.autoSync = autoSync;

  saveAllDataLocally();
  updateSyncBadge();
  closeGoogleSheetModal();
  showToast("Pengaturan Google Spreadsheet Disimpan!");
}

async function syncWithGoogleSheet(isSilent = false) {
  const url = appConfig.googleSheets?.webAppUrl;
  if (!url) {
    if (!isSilent) {
      openGoogleSheetModal();
      showToast("Harap masukkan URL Web App Google Apps Script terlebih dahulu.");
    }
    return;
  }

  if (!isSilent) showToast("Mengirim data ke Google Spreadsheet...");

  const payload = {
    action: "syncAll",
    workers: workerDataset,
    master: masterDataset,
    config: appConfig
  };

  try {
    // Sync directly or via Node backend proxy
    let res = null;
    try {
      res = await fetch(`${API_BASE}/api/sync/googlesheet`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ webAppUrl: url, data: payload })
      });
    } catch (e) {
      // Fallback direct post
      res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }

    const data = await res.json();
    if (data.status === 'success') {
      appConfig.googleSheets.lastSync = new Date().toISOString();
      updateSyncBadge();
      saveAllDataLocally();
      if (!isSilent) showToast("Sukses! Data tersimpan permanen di Google Spreadsheet!");
    } else {
      if (!isSilent) showToast("Gagal menyimpan ke Google Spreadsheet: " + (data.message || ''));
    }
  } catch (err) {
    console.error("Sync error:", err);
    if (!isSilent) showToast("Gagal terhubung ke Google Spreadsheet. Periksa koneksi internet atau izin Web App.");
  }
}

async function fetchFromGoogleSheet() {
  const url = appConfig.googleSheets?.webAppUrl;
  if (!url) {
    showToast("Masukkan URL Google Apps Script terlebih dahulu.");
    return;
  }

  showToast("Mengambil data terbaru dari Google Spreadsheet...");

  try {
    let res = null;
    try {
      res = await fetch(`${API_BASE}/api/sync/googlesheet?url=${encodeURIComponent(url)}`);
    } catch (e) {
      res = await fetch(url);
    }

    const json = await res.json();
    if (json.status === 'success' && json.data) {
      if (json.data.workers && json.data.workers.length > 0) {
        workerDataset = json.data.workers;
        activeDataset = [...workerDataset];
      }
      if (json.data.master && json.data.master.length > 0) {
        masterDataset = json.data.master;
      }
      if (json.data.config) {
        appConfig = json.data.config;
      }

      appConfig.googleSheets.lastSync = new Date().toISOString();
      saveAllDataLocally();
      applyAppConfig();
      renderNavigationMenus();
      renderMasterDataTable();
      populateFilterOptions();
      renderMasterTable();
      renderHeatmapTable();
      updateKPIs();
      updateChartsWithNewData();
      updateSyncBadge();
      closeGoogleSheetModal();
      showToast("Data Berhasil Disinkronkan dari Google Spreadsheet!");
    } else {
      showToast("Format respons Google Spreadsheet tidak valid.");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    showToast("Gagal menarik data dari Google Spreadsheet.");
  }
}

function copyAppsScriptCode() {
  const code = `/**
 * GOOGLE APPS SCRIPT DATABASE BACKEND UNTUK EXECUTIVE QUALITY DASHBOARD
 */
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var prodSheet = ss.getSheetByName("DATABASE_PRODUKSI");
  var masterSheet = ss.getSheetByName("MASTER_LOKAL_MANDOR");
  var configSheet = ss.getSheetByName("KONFIGURASI");

  var result = {
    status: "success",
    timestamp: new Date().toISOString(),
    data: {
      workers: prodSheet ? getSheetDataAsJson(prodSheet) : [],
      master: masterSheet ? getSheetDataAsJson(masterSheet) : [],
      config: configSheet && configSheet.getRange("A2").getValue() ? JSON.parse(configSheet.getRange("A2").getValue()) : null
    }
  };
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var postData = JSON.parse(e.postData.contents);

    if (postData.workers && Array.isArray(postData.workers)) {
      var prodSheet = ss.getSheetByName("DATABASE_PRODUKSI") || ss.insertSheet("DATABASE_PRODUKSI");
      prodSheet.clearContents();
      var headers = ["Nama Pekerja", "Lokal", "Mandor", "Brand", "Total Garapan", "Kerusakan Telak", "Kerusakan Mandor", "Rasio % Telak", "Rasio % Mandor", "COWONG", "PAPIR KUSUT", "LEM KURANG", "TALIPAN KOTOR", "MUNTIR", "MEDOT", "ATOS", "MEKAR-MINGKUP", "Last Updated"];
      prodSheet.appendRow(headers);
      var rows = postData.workers.map(function(w) {
        var d = w.defects || {};
        return [w.name, w.lokal, w.mandor, w.brand, w.garapan, w.telak, w.mandorDefect || w.mandor, w.pctTelak, w.pctMandor, d.cowong||0, d.papir_kusut||0, d.lem_kurang||0, d.talipan_kotor||0, d.muntir||0, d.medot||0, d.atos||0, d.mekar_mingkup||0, new Date().toLocaleString("id-ID")];
      });
      if (rows.length > 0) prodSheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    }

    if (postData.master && Array.isArray(postData.master)) {
      var masterSheet = ss.getSheetByName("MASTER_LOKAL_MANDOR") || ss.insertSheet("MASTER_LOKAL_MANDOR");
      masterSheet.clearContents();
      masterSheet.appendRow(["NAMA LOKAL", "NAMA MANDOR", "BRAND", "Last Updated"]);
      var mRows = postData.master.map(function(m) { return [m.lokal, m.mandor, m.brand, new Date().toLocaleString("id-ID")]; });
      if (mRows.length > 0) masterSheet.getRange(2, 1, mRows.length, 4).setValues(mRows);
    }

    if (postData.config) {
      var configSheet = ss.getSheetByName("KONFIGURASI") || ss.insertSheet("KONFIGURASI");
      configSheet.clearContents();
      configSheet.appendRow(["Config_JSON", "Saved_At"]);
      configSheet.appendRow([JSON.stringify(postData.config), new Date().toLocaleString("id-ID")]);
    }

    return ContentService.createTextOutput(JSON.stringify({ status: "success", message: "Data tersimpan permanen!" })).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getSheetDataAsJson(sheet) {
  var values = sheet.getDataRange().getValues();
  if (!values || values.length <= 1) return [];
  var headers = values[0];
  var result = [];
  for (var i = 1; i < values.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j].toString().toLowerCase().trim().replace(/[^a-z0-9]/g, '_')] = values[i][j];
    }
    result.push(obj);
  }
  return result;
}`;

  navigator.clipboard.writeText(code).then(() => {
    showToast("Kode Google Apps Script disalin ke Clipboard!");
  }).catch(() => {
    showToast("Silakan buka file google-apps-script.js di folder aplikasi.");
  });
}

// ==========================================
// 5. CUSTOMIZER (MENU & DASHBOARD BUILDER)
// ==========================================
function openCustomizerModal() {
  document.getElementById('customizerModal').classList.remove('hidden');
  renderCustomizerMenus();
  renderCustomizerWidgets();
  renderCustomizerThresholds();
  renderCustomizerCriteria();
  renderCustomizerIdentity();
  switchCustomizerTab('tab-menus');
}

function closeCustomizerModal() {
  document.getElementById('customizerModal').classList.add('hidden');
}

function switchCustomizerTab(tabId) {
  ['tab-menus', 'tab-widgets', 'tab-thresholds', 'tab-criteria', 'tab-identity'].forEach(id => {
    document.getElementById(id).classList.add('hidden');
    const btn = document.getElementById('tabBtn-' + id.replace('tab-', ''));
    if (btn) {
      btn.classList.remove('border-neon-cyan', 'text-neon-cyan', 'font-bold');
      btn.classList.add('border-transparent', 'text-slate-400');
    }
  });

  document.getElementById(tabId).classList.remove('hidden');
  const activeBtn = document.getElementById('tabBtn-' + tabId.replace('tab-', ''));
  if (activeBtn) {
    activeBtn.classList.add('border-neon-cyan', 'text-neon-cyan', 'font-bold');
    activeBtn.classList.remove('border-transparent', 'text-slate-400');
  }
}

function renderCustomizerMenus() {
  const container = document.getElementById('menusManagerList');
  container.innerHTML = '';

  const menus = appConfig.menus || [];
  menus.sort((a, b) => a.order - b.order).forEach((menu, idx) => {
    const item = document.createElement('div');
    item.className = "flex items-center justify-between p-3 rounded-xl bg-navy-950/60 border border-white/10 gap-3";
    item.innerHTML = `
      <div class="flex items-center gap-3 flex-1">
        <span class="w-6 text-center text-xs text-slate-500 font-mono">${idx + 1}</span>
        <input type="text" value="${menu.label}" onchange="updateMenuLabel('${menu.id}', this.value)" class="glass-input text-xs text-white rounded-lg py-1 px-2.5 flex-1">
        <input type="text" value="${menu.icon}" placeholder="FontAwesome Icon" onchange="updateMenuIcon('${menu.id}', this.value)" class="glass-input text-xs text-neon-cyan font-mono rounded-lg py-1 px-2 w-36">
      </div>
      <div class="flex items-center gap-2">
        <button onclick="moveMenuOrder(${idx}, -1)" ${idx === 0 ? 'disabled class="opacity-30"' : 'class="p-1.5 text-slate-400 hover:text-white"'}><i class="fa-solid fa-arrow-up"></i></button>
        <button onclick="moveMenuOrder(${idx}, 1)" ${idx === menus.length - 1 ? 'disabled class="opacity-30"' : 'class="p-1.5 text-slate-400 hover:text-white"'}><i class="fa-solid fa-arrow-down"></i></button>
        <button onclick="toggleMenuVisibility('${menu.id}')" class="p-1.5 ${menu.visible ? 'text-neon-emerald' : 'text-slate-600'}">
          <i class="fa-solid ${menu.visible ? 'fa-eye' : 'fa-eye-slash'}"></i>
        </button>
      </div>
    `;
    container.appendChild(item);
  });
}

function moveMenuOrder(idx, direction) {
  const menus = appConfig.menus;
  const targetIdx = idx + direction;
  if (targetIdx < 0 || targetIdx >= menus.length) return;

  const temp = menus[idx].order;
  menus[idx].order = menus[targetIdx].order;
  menus[targetIdx].order = temp;

  renderCustomizerMenus();
}

function toggleMenuVisibility(menuId) {
  const m = appConfig.menus.find(x => x.id === menuId);
  if (m) {
    m.visible = !m.visible;
    renderCustomizerMenus();
  }
}

function updateMenuLabel(menuId, val) {
  const m = appConfig.menus.find(x => x.id === menuId);
  if (m) m.label = val;
}

function updateMenuIcon(menuId, val) {
  const m = appConfig.menus.find(x => x.id === menuId);
  if (m) m.icon = val;
}

function addNewCustomMenu() {
  const id = 'menu-' + Date.now();
  const order = appConfig.menus.length + 1;
  appConfig.menus.push({
    id,
    label: "Menu Baru",
    icon: "fa-solid fa-star",
    section: "chartsSection",
    visible: true,
    order
  });
  renderCustomizerMenus();
}

function renderCustomizerWidgets() {
  const container = document.getElementById('widgetsManagerList');
  container.innerHTML = '';

  const widgets = appConfig.widgets || [];
  widgets.forEach(w => {
    const item = document.createElement('div');
    item.className = "flex items-center justify-between p-3 rounded-xl bg-navy-950/60 border border-white/10";
    item.innerHTML = `
      <span class="text-xs text-white font-medium">${w.title}</span>
      <label class="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" onchange="toggleWidgetVisibility('${w.id}', this.checked)" ${w.visible ? 'checked' : ''} class="sr-only peer">
        <div class="w-9 h-5 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-neon-cyan"></div>
      </label>
    `;
    container.appendChild(item);
  });
}

function toggleWidgetVisibility(widgetId, isVisible) {
  const w = appConfig.widgets.find(x => x.id === widgetId);
  if (w) w.visible = isVisible;
}

function renderCustomizerThresholds() {
  document.getElementById('inputToleranceLimit').value = appConfig.thresholds?.toleranceLimit || 1.0;
  document.getElementById('inputHighRiskLimit').value = appConfig.thresholds?.highRiskLimit || 2.0;
}

function renderCustomizerCriteria() {
  const container = document.getElementById('criteriaManagerList');
  container.innerHTML = '';

  appConfig.defectCriteria.forEach((crit, idx) => {
    const item = document.createElement('div');
    item.className = "flex items-center justify-between p-2.5 rounded-xl bg-navy-950/60 border border-white/10 gap-2";
    item.innerHTML = `
      <span class="text-xs font-mono text-neon-cyan w-10">${crit.code || 'CR'}</span>
      <input type="text" value="${crit.label}" onchange="appConfig.defectCriteria[${idx}].label = this.value" class="glass-input text-xs text-white rounded-lg py-1 px-2.5 flex-1">
      <input type="color" value="${crit.color || '#00f2fe'}" onchange="appConfig.defectCriteria[${idx}].color = this.value" class="w-8 h-8 rounded bg-transparent cursor-pointer border border-white/20">
    `;
    container.appendChild(item);
  });
}

function addNewDefectCriterion() {
  const name = prompt("Masukkan Nama Kriteria Cacat Baru:");
  if (!name) return;
  const key = cleanKey(name);
  appConfig.defectCriteria.push({
    key,
    label: name.toUpperCase(),
    code: name.substring(0, 2).toUpperCase(),
    color: "#ff4b2b",
    visible: true
  });
  renderCustomizerCriteria();
}

function renderCustomizerIdentity() {
  document.getElementById('inputAppTitle').value = appConfig.app?.title || '';
  document.getElementById('inputAppSubtitle').value = appConfig.app?.subtitle || '';
  document.getElementById('inputWarehouseName').value = appConfig.app?.warehouse || '';
}

function saveCustomizerSettings() {
  if (!appConfig.thresholds) appConfig.thresholds = {};
  appConfig.thresholds.toleranceLimit = parseFloat(document.getElementById('inputToleranceLimit').value) || 1.0;
  appConfig.thresholds.highRiskLimit = parseFloat(document.getElementById('inputHighRiskLimit').value) || 2.0;

  if (!appConfig.app) appConfig.app = {};
  appConfig.app.title = document.getElementById('inputAppTitle').value;
  appConfig.app.subtitle = document.getElementById('inputAppSubtitle').value;
  appConfig.app.warehouse = document.getElementById('inputWarehouseName').value;

  applyAppConfig();
  renderNavigationMenus();
  populateLineCriteriaFilter();
  renderHeatmapTable();
  renderMasterTable();
  saveAllDataLocally();
  closeCustomizerModal();
  showToast("Pengaturan Menu & Dashboard Berhasil Disimpan!");
}

function resetCustomizerToDefault() {
  if (confirm("Reset seluruh menu dan widget ke konfigurasi awal?")) {
    appConfig = JSON.parse(JSON.stringify(DEFAULT_CONFIG));
    applyAppConfig();
    renderNavigationMenus();
    saveAllDataLocally();
    closeCustomizerModal();
    showToast("Konfigurasi Berhasil Direset ke Awal");
  }
}

// ==========================================
// 6. MASTER DATA MANAGEMENT (MANDOR & LOKAL)
// ==========================================
function renderMasterDataTable() {
  const tbody = document.getElementById('masterDataTableBody');
  if (!tbody) return;
  tbody.innerHTML = '';

  masterDataset.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.className = "hover:bg-white/5 transition";
    tr.innerHTML = `
      <td class="py-3 px-3 text-slate-400 font-mono">${idx + 1}</td>
      <td class="py-3 px-3 font-semibold text-neon-cyan font-mono">${item.lokal}</td>
      <td class="py-3 px-4 font-medium text-white">${item.mandor}</td>
      <td class="py-3 px-4 text-slate-300 font-semibold">${item.brand || '-'}</td>
      <td class="py-3 px-3 text-center">
        <button onclick="editMasterItem(${idx})" class="text-neon-cyan hover:underline text-xs mr-2"><i class="fa-solid fa-pen"></i></button>
        <button onclick="deleteMasterItem(${idx})" class="text-neon-rose hover:underline text-xs"><i class="fa-solid fa-trash"></i></button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function openAddMasterModal() {
  document.getElementById('masterModalTitle').innerHTML = '<i class="fa-solid fa-plus text-neon-emerald"></i><span> Tambah Master Mandor & Lokal</span>';
  document.getElementById('masterEditIndex').value = "-1";
  document.getElementById('inputMasterLokal').value = "";
  document.getElementById('inputMasterMandor').value = "";
  document.getElementById('inputMasterBrand').value = "";
  document.getElementById('masterDataModal').classList.remove('hidden');
}

function editMasterItem(idx) {
  const m = masterDataset[idx];
  document.getElementById('masterModalTitle').innerHTML = '<i class="fa-solid fa-pen text-neon-cyan"></i><span> Edit Master Mandor & Lokal</span>';
  document.getElementById('masterEditIndex').value = idx;
  document.getElementById('inputMasterLokal').value = m.lokal;
  document.getElementById('inputMasterMandor').value = m.mandor;
  document.getElementById('inputMasterBrand').value = m.brand || '';
  document.getElementById('masterDataModal').classList.remove('hidden');
}

function closeMasterModal() {
  document.getElementById('masterDataModal').classList.add('hidden');
}

function saveMasterItem() {
  const idx = parseInt(document.getElementById('masterEditIndex').value);
  const lokal = document.getElementById('inputMasterLokal').value.trim();
  const mandor = document.getElementById('inputMasterMandor').value.trim();
  const brand = document.getElementById('inputMasterBrand').value.trim();

  if (!lokal || !mandor) {
    showToast("Nama Lokal dan Mandor harus diisi!");
    return;
  }

  if (idx === -1) {
    masterDataset.push({ lokal, mandor, brand });
  } else {
    masterDataset[idx] = { lokal, mandor, brand };
  }

  renderMasterDataTable();
  populateFilterOptions();
  saveAllDataLocally();
  closeMasterModal();
  showToast("Master Data Berhasil Disimpan!");
}

function deleteMasterItem(idx) {
  if (confirm(`Hapus master ${masterDataset[idx].lokal}?`)) {
    masterDataset.splice(idx, 1);
    renderMasterDataTable();
    populateFilterOptions();
    saveAllDataLocally();
    showToast("Master Data Dihapus");
  }
}

// ==========================================
// 7. FILTERS & PRESENTATION
// ==========================================
function populateFilterOptions() {
  const workerSelect = document.getElementById('workerFilter');
  const lokalSelect = document.getElementById('lokalFilter');
  const brandSelect = document.getElementById('brandFilter');

  workerSelect.innerHTML = '<option value="all" class="bg-navy-900">Semua Pekerja</option>';
  lokalSelect.innerHTML = '<option value="all" class="bg-navy-900">Semua Lokal</option>';
  brandSelect.innerHTML = '<option value="all" class="bg-navy-900">Semua Brand</option>';

  const workers = [...new Set(workerDataset.map(w => w.name))].sort();
  workers.forEach(w => {
    const opt = document.createElement('option');
    opt.value = w;
    opt.className = 'bg-navy-900';
    opt.innerText = w;
    workerSelect.appendChild(opt);
  });

  const lokals = [...new Set([...workerDataset.map(w => w.lokal), ...masterDataset.map(m => m.lokal)])].filter(Boolean).sort();
  lokals.forEach(l => {
    const opt = document.createElement('option');
    opt.value = l;
    opt.className = 'bg-navy-900';
    opt.innerText = `Lokal ${l}`;
    lokalSelect.appendChild(opt);
  });

  const brands = [...new Set([...workerDataset.map(w => w.brand), ...masterDataset.map(m => m.brand)])].filter(Boolean).sort();
  brands.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.className = 'bg-navy-900';
    opt.innerText = b;
    brandSelect.appendChild(opt);
  });
}

function populateLineCriteriaFilter() {
  const criteriaSelect = document.getElementById('lineCriteriaFilter');
  if (!criteriaSelect) return;
  criteriaSelect.innerHTML = '<option value="all" class="bg-navy-900">Semua Kriteria (Total)</option>';

  appConfig.defectCriteria.forEach(col => {
    const opt = document.createElement('option');
    opt.value = col.key;
    opt.className = 'bg-navy-900';
    opt.innerText = col.label;
    criteriaSelect.appendChild(opt);
  });
}

function initDateFilterLimits() {
  if (defectTimeSeriesData && defectTimeSeriesData.length > 0) {
    const startDateInput = document.getElementById('lineDateStart');
    const endDateInput = document.getElementById('lineDateEnd');
    const dates = defectTimeSeriesData.map(d => d.date).sort();
    if (startDateInput && endDateInput) {
      startDateInput.value = dates[0];
      endDateInput.value = dates[dates.length - 1];
    }
  }
}

function applyGlobalFilters() {
  const selectedWorker = document.getElementById('workerFilter').value;
  const selectedLokal = document.getElementById('lokalFilter').value;
  const selectedBrand = document.getElementById('brandFilter').value;
  const searchText = document.getElementById('globalSearchInput').value.toLowerCase();

  activeDataset = workerDataset.filter(w => {
    const matchWorker = selectedWorker === 'all' || w.name === selectedWorker;
    const matchLokal = selectedLokal === 'all' || w.lokal === selectedLokal;
    const matchBrand = selectedBrand === 'all' || w.brand === selectedBrand;
    const matchSearch = !searchText ||
      w.name.toLowerCase().includes(searchText) ||
      (w.lokal && w.lokal.toLowerCase().includes(searchText)) ||
      (w.brand && w.brand.toLowerCase().includes(searchText));

    return matchWorker && matchLokal && matchBrand && matchSearch;
  });

  renderMasterTable();
  renderHeatmapTable();
  updateKPIs();
  updateChartsWithNewData();
}

function resetAllFilters() {
  document.getElementById('workerFilter').value = 'all';
  document.getElementById('lokalFilter').value = 'all';
  document.getElementById('brandFilter').value = 'all';
  document.getElementById('globalSearchInput').value = '';
  document.getElementById('lineCriteriaFilter').value = 'all';

  initDateFilterLimits();
  applyGlobalFilters();
  updateDefectLineChart();
  showToast('Semua Filter Telah Direset');
}

// ==========================================
// 8. TABLES & KPI METRICS
// ==========================================
function updateKPIs() {
  let totalGarapan = activeDataset.reduce((a, b) => a + (b.garapan || 0), 0);
  let totalTelak = activeDataset.reduce((a, b) => a + (b.telak || 0), 0);
  let totalMandor = activeDataset.reduce((a, b) => a + (b.mandorDefect || b.mandor || 0), 0);
  let gap = totalMandor - totalTelak;

  let pctTelak = totalGarapan > 0 ? (totalTelak / totalGarapan) * 100 : 0;
  let pctMandor = totalGarapan > 0 ? (totalMandor / totalGarapan) * 100 : 0;
  let gapPct = totalTelak > 0 ? ((gap / totalTelak) * 100) : 0;

  document.getElementById('kpiGarapan').innerText = totalGarapan.toLocaleString('id-ID');
  document.getElementById('kpiTelak').innerText = totalTelak.toLocaleString('id-ID');
  document.getElementById('kpiTelakPct').innerText = pctTelak.toFixed(2) + '%';
  document.getElementById('kpiMandor').innerText = Math.round(totalMandor).toLocaleString('id-ID');
  document.getElementById('kpiMandorPct').innerText = pctMandor.toFixed(2) + '%';

  document.getElementById('kpiGap').innerText = (gap >= 0 ? '+' : '') + Math.round(gap).toLocaleString('id-ID');
  document.getElementById('kpiGapPct').innerText = (gapPct >= 0 ? '+' : '') + gapPct.toFixed(1) + '% Mandor';

  if (activeDataset.length > 0) {
    let sorted = [...activeDataset].sort((a, b) => a.pctTelak - b.pctTelak);
    let best = sorted[0];
    document.getElementById('kpiBestWorker').innerText = best.name;
    document.getElementById('kpiBestWorker').title = best.name;
    document.getElementById('kpiBestWorkerLokal').innerText = 'Lokal ' + (best.lokal || '-');
    document.getElementById('kpiBestWorkerPct').innerText = best.pctTelak.toFixed(2) + '% Defect';
  } else {
    document.getElementById('kpiBestWorker').innerText = '-';
    document.getElementById('kpiBestWorkerLokal').innerText = '-';
    document.getElementById('kpiBestWorkerPct').innerText = '0,00%';
  }
}

function renderMasterTable() {
  const tbody = document.getElementById('masterTableBody');
  tbody.innerHTML = '';

  const highLimit = appConfig.thresholds?.highRiskLimit || 2.0;

  activeDataset.forEach(row => {
    const mandorVal = row.mandorDefect !== undefined ? row.mandorDefect : (row.mandor || 0);
    const gap = mandorVal - row.telak;
    const isHighRisk = row.pctTelak > highLimit || row.pctMandor > highLimit;

    const tr = document.createElement('tr');
    tr.className = `hover:bg-white/[0.03] transition-colors ${isHighRisk ? 'bg-red-500/[0.04]' : ''}`;

    tr.innerHTML = `
      <td class="py-3 px-3 font-semibold text-white flex items-center gap-2">
        <span class="w-1.5 h-1.5 rounded-full ${isHighRisk ? 'bg-red-400' : 'bg-emerald-400'}"></span>
        ${row.name}
      </td>
      <td class="py-3 px-2 text-center">
        <span class="px-2 py-0.5 rounded bg-white/[0.04] font-mono text-[11px] text-slate-300">${row.lokal || '-'}</span>
      </td>
      <td class="py-3 px-3 text-slate-300">${row.mandor || '-'}</td>
      <td class="py-3 px-3 font-medium text-slate-400">${row.brand || '-'}</td>
      <td class="py-3 px-3 text-right num-font font-medium text-slate-200">${row.garapan.toLocaleString('id-ID')}</td>
      <td class="py-3 px-3 text-right num-font text-blue-400 font-semibold">${row.telak.toLocaleString('id-ID')}</td>
      <td class="py-3 px-3 text-right num-font text-purple-400 font-semibold">${Math.round(mandorVal).toLocaleString('id-ID')}</td>
      <td class="py-3 px-3 text-right num-font text-amber-400 font-medium">${gap >= 0 ? '+' : ''}${Math.round(gap).toLocaleString('id-ID')}</td>
      <td class="py-3 px-3 text-right num-font font-bold ${row.pctTelak > highLimit ? 'text-red-400' : 'text-emerald-400'}">${row.pctTelak.toFixed(2)}%</td>
      <td class="py-3 px-3 text-right num-font font-bold ${row.pctMandor > highLimit ? 'text-red-400' : 'text-blue-400'}">${row.pctMandor.toFixed(2)}%</td>
      <td class="py-3 px-2 text-center">
        ${isHighRisk
          ? '<span class="px-2 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 font-semibold">High Risk</span>'
          : '<span class="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">Normal</span>'}
      </td>
    `;
    tbody.appendChild(tr);
  });

  document.getElementById('rekapTableInfo').innerText = `Menampilkan ${activeDataset.length} dari ${workerDataset.length} Operator`;
}

function renderHeatmapTable() {
  const headerRow = document.getElementById('heatmapHeader');
  const tbody = document.getElementById('heatmapBody');

  const activeCols = appConfig.defectCriteria.filter(c => c.visible !== false);

  let headerHTML = `<tr class="border-b border-white/[0.08] text-slate-400 uppercase font-semibold text-[11px]"><th class="py-3 px-3 text-left">Lokal / Operator</th>`;
  activeCols.forEach(col => {
    headerHTML += `<th class="py-3 px-2">${col.label}</th>`;
  });
  headerHTML += `<th class="py-3 px-2 text-right">Rata % Telak</th></tr>`;
  headerRow.innerHTML = headerHTML;

  tbody.innerHTML = '';

  const tolLimit = appConfig.thresholds?.toleranceLimit || 1.2;
  const highLimit = appConfig.thresholds?.highRiskLimit || 2.0;

  activeDataset.forEach(row => {
    const tr = document.createElement('tr');
    tr.className = 'hover:bg-white/[0.03] transition-colors';

    let rowHTML = `
      <td class="py-2.5 px-3 text-left font-medium text-white flex items-center justify-between">
        <span class="truncate max-w-[140px]">${row.name}</span>
        <span class="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.04] text-slate-300">${row.lokal || '-'}</span>
      </td>
    `;

    activeCols.forEach(col => {
      const count = (row.defects && row.defects[col.key]) ? row.defects[col.key] : 0;
      const pct = row.garapan > 0 ? (count / row.garapan) * 100 : 0;

      let hmClass = 'hm-cell-low';
      if (pct >= highLimit) hmClass = 'hm-cell-high';
      else if (pct >= tolLimit) hmClass = 'hm-cell-mid';

      rowHTML += `
        <td class="py-2.5 px-1">
          <div class="py-1 px-1.5 rounded-lg text-[11px] num-font ${hmClass}">
            ${count.toLocaleString('id-ID')}
          </div>
        </td>
      `;
    });

    rowHTML += `
      <td class="py-2.5 px-2 text-right num-font font-bold ${row.pctTelak > highLimit ? 'text-red-400' : 'text-emerald-400'}">
        ${row.pctTelak.toFixed(2)}%
      </td>
    `;

    tr.innerHTML = rowHTML;
    tbody.appendChild(tr);
  });
}

// ==========================================
// 9. CHARTS (CHART.JS - ENTERPRISE PALETTE)
// ==========================================
function initCharts() {
  Chart.defaults.font.family = "'Plus Jakarta Sans', -apple-system, sans-serif";
  Chart.defaults.color = '#94A3B8';

  // 1. Daily Trend Chart
  const ctxTrend = document.getElementById('dailyTrendChart').getContext('2d');
  const gradBlue = ctxTrend.createLinearGradient(0, 0, 0, 240);
  gradBlue.addColorStop(0, 'rgba(59, 130, 246, 0.25)');
  gradBlue.addColorStop(1, 'rgba(59, 130, 246, 0.0)');

  const gradPurple = ctxTrend.createLinearGradient(0, 0, 0, 240);
  gradPurple.addColorStop(0, 'rgba(139, 92, 246, 0.25)');
  gradPurple.addColorStop(1, 'rgba(139, 92, 246, 0.0)');

  dailyTrendChartObj = new Chart(ctxTrend, {
    type: 'line',
    data: {
      labels: dailyTrendData.map(d => d.label),
      datasets: [
        {
          label: 'Telak',
          data: dailyTrendData.map(d => d.telak),
          borderColor: '#3B82F6',
          backgroundColor: gradBlue,
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6
        },
        {
          label: 'Mandor',
          data: dailyTrendData.map(d => d.mandor),
          borderColor: '#8B5CF6',
          backgroundColor: gradPurple,
          fill: true,
          tension: 0.35,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // 2. Worker Bar Chart
  const ctxWorker = document.getElementById('workerBarChart').getContext('2d');
  workerBarChartObj = new Chart(ctxWorker, {
    type: 'bar',
    data: {
      labels: activeDataset.map(w => w.name.split(' ')[0] + ' (' + (w.lokal || '') + ')'),
      datasets: [
        {
          label: 'Telak',
          data: activeDataset.map(w => w.telak),
          backgroundColor: '#3B82F6',
          borderRadius: 4
        },
        {
          label: 'Mandor',
          data: activeDataset.map(w => w.mandorDefect || w.mandor || 0),
          backgroundColor: '#8B5CF6',
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 10 } } }
      }
    }
  });

  // 3. Defect Criteria Chart
  const ctxDefect = document.getElementById('defectCriteriaChart').getContext('2d');
  defectCriteriaChartObj = createDefectLineChart(ctxDefect);

  // 4. Scatter Chart
  const ctxScatter = document.getElementById('scatterChart').getContext('2d');
  scatterChartObj = new Chart(ctxScatter, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Garapan vs Defect Rate',
        data: activeDataset.map(w => ({ x: (w.garapan || 0) / 1000000, y: w.pctTelak, name: w.name })),
        backgroundColor: '#10B981',
        borderColor: '#10B981',
        pointRadius: 5,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(ctx) {
              const raw = ctx.raw;
              return `${raw.name}: ${raw.x.toFixed(2)}M Garapan, ${raw.y.toFixed(2)}% Defect`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: 'Total Garapan (Juta Batang)', color: '#64748B', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { font: { size: 10 } }
        },
        y: {
          title: { display: true, text: '% Defect Telak', color: '#64748B', font: { size: 10 } },
          grid: { color: 'rgba(255,255,255,0.04)' },
          ticks: { font: { size: 10 } }
        }
      }
    }
  });
}

function createDefectLineChart(ctx) {
  const selectedCriteria = document.getElementById('lineCriteriaFilter')?.value || 'all';
  const startDate = document.getElementById('lineDateStart')?.value || '';
  const endDate = document.getElementById('lineDateEnd')?.value || '';

  let filtered = defectTimeSeriesData.filter(d => {
    if (startDate && d.date < startDate) return false;
    if (endDate && d.date > endDate) return false;
    return true;
  });

  if (filtered.length === 0) filtered = defectTimeSeriesData;

  const labels = filtered.map(d => d.label);
  let datasets = [];

  const hexToRgba = (hex, opacity) => {
    let c = hex.replace('#', '');
    if (c.length === 3) c = c.split('').map(x => x + x).join('');
    const num = parseInt(c, 16);
    return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${opacity})`;
  };

  const palette = {
    'cowong': '#3B82F6',
    'papir_kusut': '#10B981',
    'lem_kurang': '#06B6D4',
    'talipan_kotor': '#F59E0B',
    'muntir': '#8B5CF6',
    'medot': '#EC4899',
    'atos': '#6366F1',
    'mekar_mingkup': '#EF4444'
  };

  if (selectedCriteria === 'all') {
    datasets = appConfig.defectCriteria.filter(c => c.visible !== false).map(cfg => {
      const color = palette[cfg.key] || cfg.color || '#3B82F6';
      const grad = ctx.createLinearGradient(0, 0, 0, 220);
      grad.addColorStop(0, hexToRgba(color, 0.2));
      grad.addColorStop(1, hexToRgba(color, 0.0));

      return {
        label: cfg.label,
        data: filtered.map(d => d[cfg.key] || 0),
        borderColor: color,
        backgroundColor: grad,
        fill: true,
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2.5
      };
    });
  } else {
    const colObj = appConfig.defectCriteria.find(c => c.key === selectedCriteria) || { label: selectedCriteria.toUpperCase() };
    const color = palette[selectedCriteria] || colObj.color || '#3B82F6';
    const grad = ctx.createLinearGradient(0, 0, 0, 240);
    grad.addColorStop(0, hexToRgba(color, 0.3));
    grad.addColorStop(1, 'rgba(11, 15, 23, 0.0)');

    datasets = [{
      label: colObj.label,
      data: filtered.map(d => d[selectedCriteria] || 0),
      borderColor: color,
      pointBackgroundColor: '#FFFFFF',
      pointBorderColor: color,
      backgroundColor: grad,
      fill: true,
      tension: 0.35,
      borderWidth: 2.5,
      pointRadius: 4
    }];
  }

  return new Chart(ctx, {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: selectedCriteria === 'all',
          position: 'top',
          labels: { color: '#94A3B8', font: { size: 10 }, boxWidth: 10 }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { font: { size: 10 } } }
      }
    }
  });
}

function updateDefectLineChart() {
  if (defectCriteriaChartObj) {
    defectCriteriaChartObj.destroy();
  }
  const ctxDefect = document.getElementById('defectCriteriaChart').getContext('2d');
  defectCriteriaChartObj = createDefectLineChart(ctxDefect);
}

function updateChartsWithNewData() {
  if (workerBarChartObj) {
    workerBarChartObj.data.labels = activeDataset.map(w => w.name.split(' ')[0] + ' (' + (w.lokal || '') + ')');
    workerBarChartObj.data.datasets[0].data = activeDataset.map(w => w.telak);
    workerBarChartObj.data.datasets[1].data = activeDataset.map(w => w.mandorDefect || w.mandor || 0);
    workerBarChartObj.update();
  }

  if (scatterChartObj) {
    scatterChartObj.data.datasets[0].data = activeDataset.map(w => ({
      x: (w.garapan || 0) / 1000000,
      y: w.pctTelak,
      name: w.name
    }));
    scatterChartObj.update();
  }

  updateDefectLineChart();
  document.getElementById('workerCountBadge').innerText = `${activeDataset.length} Workers`;
}

// ==========================================
// 10. EXPORT FUNCTIONS
// ==========================================
function exportDataExcel() {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Rekapitulasi Produksi & Defect
  const rekapRows = activeDataset.map(w => {
    const obj = {
      "Nama Pekerja": w.name,
      "Lokal": w.lokal,
      "Mandor": w.mandor,
      "Brand": w.brand,
      "Total Garapan": w.garapan,
      "Kerusakan Telak": w.telak,
      "Kerusakan Mandor": w.mandorDefect || w.mandor || 0,
      "Gap Variansi": (w.mandorDefect || w.mandor || 0) - w.telak,
      "Rasio % Telak": w.pctTelak + "%",
      "Rasio % Mandor": w.pctMandor + "%"
    };
    appConfig.defectCriteria.forEach(c => {
      obj[c.label] = (w.defects && w.defects[c.key]) ? w.defects[c.key] : 0;
    });
    return obj;
  });
  const wsRekap = XLSX.utils.json_to_sheet(rekapRows);
  XLSX.utils.book_append_sheet(wb, wsRekap, "Rekapitulasi Produksi");

  // Sheet 2: Master Data
  const wsMaster = XLSX.utils.json_to_sheet(masterDataset);
  XLSX.utils.book_append_sheet(wb, wsMaster, "Master Mandor & Lokal");

  XLSX.writeFile(wb, `Rekap_Produksi_Defect_${new Date().toISOString().split('T')[0]}.xlsx`);
  showToast("File Excel Berhasil Diunduh!");
}

function exportDataCSV() {
  let csv = "Nama Pekerja,Lokal,Mandor,Brand,Total Garapan,Kerusakan Telak,Kerusakan Mandor,Gap,Pct Telak,Pct Mandor\n";
  activeDataset.forEach(row => {
    const mandorVal = row.mandorDefect || row.mandor || 0;
    const gap = mandorVal - row.telak;
    csv += `"${row.name}","${row.lokal}","${row.mandor}","${row.brand}",${row.garapan},${row.telak},${mandorVal},${gap},${row.pctTelak}%,${row.pctMandor}%\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Rekap_Produksi_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("File CSV Berhasil Diunduh!");
}

function exportMasterDataExcel() {
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(masterDataset);
  XLSX.utils.book_append_sheet(wb, ws, "Master Lokal Mandor Brand");
  XLSX.writeFile(wb, `Master_Lokal_Mandor_${new Date().toISOString().split('T')[0]}.xlsx`);
  showToast("File Master Data Excel Diunduh!");
}

// Toast Helper
function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'glass-card text-xs text-white py-2.5 px-4 rounded-xl shadow-2xl border border-neon-cyan/40 flex items-center space-x-2 animate-bounce pointer-events-auto';
  toast.innerHTML = `<i class="fa-solid fa-circle-check text-neon-cyan text-sm"></i> <span>${msg}</span>`;

  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('opacity-0', 'transition-opacity', 'duration-500');
    setTimeout(() => toast.remove(), 500);
  }, 3500);
}
