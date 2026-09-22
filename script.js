// ===== DATOS =====
const rawData = [
    { inicio: '01/08/2026', fin: '31/08/2026', tea: 29.66, tnm: 2.18814, ajustada: 27.66, diaria: 0.00071 },
    { inicio: '01/07/2026', fin: '31/07/2026', tea: 28.79, tnm: 2.13083, ajustada: 26.79, diaria: 0.00069 },
    { inicio: '01/06/2026', fin: '30/06/2026', tea: 28.79, tnm: 2.13083, ajustada: 26.79, diaria: 0.00069 },
    { inicio: '01/05/2026', fin: '31/05/2026', tea: 28.17, tnm: 2.08976, ajustada: 26.17, diaria: 0.00068 },
    { inicio: '01/04/2026', fin: '30/04/2026', tea: 26.76, tnm: 1.99570, ajustada: 24.76, diaria: 0.00065 },
    { inicio: '01/03/2026', fin: '31/03/2026', tea: 25.52, tnm: 1.91218, ajustada: 23.52, diaria: 0.00062 },
    { inicio: '01/02/2026', fin: '28/02/2026', tea: 25.23, tnm: 1.89253, ajustada: 23.23, diaria: 0.00062 },
    { inicio: '01/01/2026', fin: '31/01/2026', tea: 24.36, tnm: 1.83336, ajustada: 22.36, diaria: 0.00060 },
    { inicio: '01/12/2025', fin: '31/12/2025', tea: 25.02, tnm: 1.87828, ajustada: 22.98, diaria: 0.00062 },
    { inicio: '01/11/2025', fin: '30/11/2025', tea: 24.99, tnm: 1.87625, ajustada: 22.96, diaria: 0.00062 },
    { inicio: '01/10/2025', fin: '31/10/2025', tea: 24.36, tnm: 1.83336, ajustada: 22.39, diaria: 0.06057 },
    { inicio: '01/09/2025', fin: '30/09/2025', tea: 25.01, tnm: 1.87761, ajustada: 22.97, diaria: 0.062 },
    { inicio: '01/08/2025', fin: '31/08/2025', tea: 25.17, tnm: 1.88847, ajustada: 23.12, diaria: 0.062 },
    { inicio: '01/07/2025', fin: '31/07/2025', tea: 24.78, tnm: 1.86197, ajustada: 22.78, diaria: 0.06241 },
    { inicio: '01/06/2025', fin: '30/06/2025', tea: 25.55, tnm: 1.91421, ajustada: 23.55, diaria: 0.06452 },
    { inicio: '01/05/2025', fin: '31/05/2025', tea: 25.97, tnm: 1.94257, ajustada: 23.97, diaria: 0.06567 },
    { inicio: '01/04/2025', fin: '30/04/2025', tea: 25.62, tnm: 1.91894, ajustada: 23.62, diaria: 0.06471 },
    { inicio: '01/03/2025', fin: '31/03/2025', tea: 24.92, tnm: 1.87149, ajustada: 22.92, diaria: 0.06279 },
    { inicio: '01/02/2025', fin: '28/02/2025', tea: 26.3, tnm: 1.96480, ajustada: 24.3, diaria: 0.06658 },
    { inicio: '01/01/2025', fin: '31/01/2025', tea: 24.89, tnm: 1.86945, ajustada: 22.89, diaria: 0.06271 },
    { inicio: '01/12/2024', fin: '31/12/2024', tea: 26.39, tnm: 1.97085, ajustada: 24.39, diaria: 0.06682 },
    { inicio: '01/11/2024', fin: '30/11/2024', tea: 27.9, tnm: 2.07182, ajustada: 25.9, diaria: 0.07096 },
    { inicio: '01/10/2024', fin: '31/10/2024', tea: 28.17, tnm: 2.08976, ajustada: 26.17, diaria: 0.0717 }
];

// ===== RENDER TABLA =====
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

renderTable(rawData);

// ===== FILTROS =====
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
            if (va < vb) return sortAsc ? -1 : 1;
            if (va > vb) return sortAsc ? 1 : -1;
            return 0;
        });
    }
    renderTable(filtered);
}

searchInput.addEventListener('input', filterData);
yearFilter.addEventListener('change', filterData);

// ===== ORDENAMIENTO =====
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

// ===== GRÁFICO DE TENDENCIA =====
const ctx = document.getElementById('trendChart').getContext('2d');
const chartData = rawData.slice(0, 12).reverse(); // Últimos 12 meses
new Chart(ctx, {
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
                callbacks: { label: function(context) { return context.parsed.y.toFixed(2) + '%'; } }
            }
        },
        scales: {
            x: {
                grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                ticks: { color: '#64748b', font: { size: 11, family: 'JetBrains Mono' }, maxRotation: 45 }
            },
            y: {
                grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false },
                ticks: { color: '#64748b', font: { size: 11, family: 'JetBrains Mono' }, callback: function(value) { return value + '%'; } }
            }
        },
        interaction: { intersect: false, mode: 'index' }
    }
});

// ===== ANIMACIONES GSAP =====
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
// Fade-in elements
document.querySelectorAll('.fade-in').forEach(el => {
    gsap.from(el, { scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }, opacity: 0, y: 24, duration: 0.6 });
});
// Contador animado para la tasa principal
const currentRateEl = document.getElementById('currentRate');
const targetRate = 27.66;
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
// Smooth scroll for nav links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = document.querySelector(link.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
