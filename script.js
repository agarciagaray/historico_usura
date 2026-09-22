// ==== FETCH DATA FROM GOOGLE SHEETS CSV ====
// URL obtained from "Publicar como CSV"
const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vReZeRecGcMJLWIqcaDJtIHRnksGIdEUwfCPVkuyA6z0W5OkHMJExgj7vPNd71Z26Q19zZK6gUOhxSm/pub?output=csv";

// Data structure used throughout the UI
/**
 * @typedef {{ inicio: string; fin: string; tea: number; tnm: number; ajustada: number; diaria: number }} Row
 */
let rawData = [];

/**
 * Parse CSV text into an array of Row objects.
 * Expected columns: inicio, fin, tea, tnm, ajustada, diaria
 */
function parseCsv(text) {
  const rows = text.trim().split(/\r?\n/);
  // First line may contain headers – ignore if it contains non‑numeric data in column 3
  const hasHeader = Number.isNaN(parseFloat((rows[0] || "").split(",")[2]?.replace(/["']/g, '')));
  const startIdx = hasHeader ? 1 : 0;
  const data = [];
  
  for (let i = startIdx; i < rows.length; i++) {
    const rowStr = rows[i];
    if (!rowStr.trim()) continue;
    
    // Split by comma, ignoring commas inside double quotes
    const cols = [];
    let current = '';
    let inQuotes = false;
    for (let j = 0; j < rowStr.length; j++) {
      const char = rowStr[j];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cols.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    cols.push(current.trim());
    
    if (cols.length < 5) continue; // skip malformed lines

    const inicio = cols[0];
    const fin = cols[1];
    const teaStr = cols[2];
    
    let tnmStr, ajustadaStr, diariaStr;
    if (cols.length === 5) {
       ajustadaStr = cols[3];
       diariaStr = cols[4];
    } else {
       tnmStr = cols[3];
       ajustadaStr = cols[4];
       diariaStr = cols[5];
    }

    const tea = parseFloat(teaStr.replace(/[,]/g, "."));
    const ajustada = parseFloat(ajustadaStr.replace(/[,]/g, "."));
    const diaria = parseFloat(diariaStr.replace(/[,]/g, "."));
    
    // Calculate TNM if it wasn't in the CSV, otherwise parse it
    const tnm = cols.length === 5 
      ? (Math.pow(1 + tea / 100, 1/12) - 1) * 100 
      : parseFloat(tnmStr.replace(/[,]/g, "."));

    data.push({
      inicio: inicio,
      fin: fin,
      tea: tea,
      tnm: tnm,
      ajustada: ajustada,
      diaria: diaria,
    });
  }
  return data;
}

/** Load CSV, populate rawData, then render UI */
async function loadData() {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const csvText = await response.text();
    rawData = parseCsv(csvText);
    // Ensure newest records first (most recent at index 0)
    rawData.sort((a, b) => {
      const da = new Date(a.inicio.split("/").reverse().join("-"));
      const db = new Date(b.inicio.split("/").reverse().join("-"));
      return db - da;
    });
    renderTable(rawData);
    initChart();
  } catch (err) {
    console.error("Error loading CSV data:", err);
    const tableBody = document.getElementById('tableBody');
    if (tableBody) tableBody.innerHTML = `<tr><td colspan="6" class="py-8 text-center text-white/60">No se pudieron cargar los datos.</td></tr>`;
  }
}

// ==== RENDER TABLE ==== //
const tableBody = document.getElementById('tableBody');
let sortKey = '';
let sortAsc = true;

function renderTable(data) {
  tableBody.innerHTML = data.map(row => `
    <tr>
      <td>${row.inicio}</td>
      <td>${row.fin}</td>
      <td>${row.tea.toFixed(2)}</td>
      <td>${row.tnm.toFixed(5)}</td>
      <td>${row.ajustada.toFixed(2)}</td>
      <td>${row.diaria.toFixed(5)}</td>
    </tr>
  `).join('');
}

// ==== FILTERS ==== //
const searchInput = document.getElementById('searchInput');
const yearFilter = document.getElementById('yearFilter');

function filterData() {
  const query = searchInput.value.toLowerCase();
  const year = yearFilter.value;
  let filtered = rawData.filter(row => {
    const matchQuery = row.inicio.toLowerCase().includes(query) || row.fin.toLowerCase().includes(query);
    const matchYear = year ? row.inicio.includes(year) : true;
    return matchQuery && matchYear;
  });
  if (sortKey) {
    filtered.sort((a, b) => {
      let va = a[sortKey];
      let vb = b[sortKey];
      if (typeof va === 'string') {
        va = va.split('/').reverse().join('');
        vb = vb.split('/').reverse().join('');
      }
      return (va < vb ? -1 : va > vb ? 1 : 0) * (sortAsc ? 1 : -1);
    });
  }
  renderTable(filtered);
}

searchInput.addEventListener('input', filterData);
yearFilter.addEventListener('change', filterData);

document.querySelectorAll('th[data-sort]').forEach(th => {
  th.addEventListener('click', () => {
    const key = th.dataset.sort;
    if (sortKey === key) {
      sortAsc = !sortAsc;
    } else {
      sortKey = key;
      sortAsc = true;
    }
    filterData();
  });
});

// ==== CHART (TENDENCIA) ==== //
let chartInstance = null;
function initChart() {
  const ctx = document.getElementById('trendChart').getContext('2d');
  const chartData = rawData.slice(0, 12).reverse(); // últimos 12 meses
  if (chartInstance) chartInstance.destroy();
  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: chartData.map(d => d.inicio),
      datasets: [{
        label: 'Tasa Efectiva Anual (%)',
        data: chartData.map(d => d.tea),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2.5,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#0a0e17',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(17, 24, 39, 0.95)',
          titleColor: '#f1f5f9',
          bodyColor: '#94a3b8',
          borderColor: 'rgba(255,255,255,0.08)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: { label: ctx => ctx.parsed.y.toFixed(2) + '%' }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          ticks: { color: '#64748b', font: { size: 11, family: 'JetBrains Mono' }, maxRotation: 45 }
        },
        y: {
          grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
          ticks: { color: '#64748b', font: { size: 11, family: 'JetBrains Mono' }, callback: v => v + '%' }
        }
      },
      interaction: { intersect: false, mode: 'index' }
    }
  });
}

// ==== ANIMATIONS (GSAP) ==== //
gsap.registerPlugin(ScrollTrigger);
// Hero animations
gsap.from('.hero-badge', { opacity: 0, y: 20, duration: 0.6, delay: 0.2 });
gsap.from('.hero-title', { opacity: 0, y: 30, duration: 0.8, delay: 0.3 });
gsap.from('.hero-subtitle', { opacity: 0, y: 20, duration: 0.6, delay: 0.5 });
gsap.from('.stat-card', { opacity: 0, y: 30, duration: 0.6, stagger: 0.1, delay: 0.7 });
// Chart animation
gsap.from('.chart-container', { scrollTrigger: { trigger: '.chart-section', start: 'top 80%', toggleActions: 'play none none none' }, opacity: 0, y: 40, duration: 0.8 });
// Table animation
gsap.from('.table-wrapper', { scrollTrigger: { trigger: '.table-section', start: 'top 80%', toggleActions: 'play none none none' }, opacity: 0, y: 40, duration: 0.8 });
// Fade‑in elements
document.querySelectorAll('.fade-in').forEach(el => {
  gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }, opacity: 0, y: 24, duration: 0.6 });
});
// Counter animation for main rate
const currentRateEl = document.getElementById('currentRate');
const targetRate = 27.66; // you may compute this dynamically later
let currentRate = 0;
function animateCounter() {
  const duration = 1500;
  const start = performance.now();
  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    currentRate = eased * targetRate;
    currentRateEl.textContent = currentRate.toFixed(2).replace('.', ',') + '%';
    if (progress < 1) requestAnimationFrame(update);
  }
  requestAnimationFrame(update);
}
ScrollTrigger.create({ trigger: '.hero', start: 'top 80%', once: true, onEnter: animateCounter });
// Smooth scroll for navigation links
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

// ==== INICIALIZAR ==== //
window.addEventListener('DOMContentLoaded', loadData);
