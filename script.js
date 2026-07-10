/* ================= YO'LCHI App — Global Utilities ================= */
/* Performance monitoring, app-wide helpers, and initialization tracking */

const APP_VERSION = '2.1.0';
const APP_START_TIME = Date.now();

/* ---------- Performance Logger ---------- */
const perfLog = [];

function logPerf(label) {
    const elapsed = Date.now() - APP_START_TIME;
    perfLog.push({ label, time: elapsed });
    if (elapsed > 3000) {
        console.warn(`⚠️ [PERF] ${label}: ${elapsed}ms — sekin yuklanish!`);
    } else {
        console.log(`✅ [PERF] ${label}: ${elapsed}ms`);
    }
}

/* ---------- Safe DOM Helpers ---------- */
function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
function ce(tag, attrs) {
    const el = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(k => {
        if (k === 'text') el.textContent = attrs[k];
        else if (k === 'html') el.innerHTML = attrs[k];
        else el.setAttribute(k, attrs[k]);
    });
    return el;
}

/* ---------- Debounce ---------- */
function debounce(fn, ms) {
    let timer;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), ms || 300);
    };
}

/* ---------- Throttle ---------- */
function throttle(fn, ms) {
    let last = 0;
    return function(...args) {
        const now = Date.now();
        if (now - last >= (ms || 300)) {
            last = now;
            fn.apply(this, args);
        }
    };
}

/* ---------- Network Status ---------- */
function getNetworkStatus() {
    return navigator.onLine ? '📶 Online' : '📵 Offline';
}

window.addEventListener('online', () => console.log('📶 Tarmoq ulandi'));
window.addEventListener('offline', () => console.warn('📵 Tarmoq uzildi'));

/* ---------- Keyboard Shortcuts ---------- */
document.addEventListener('keydown', function(e) {
    // Escape closes any open overlay
    if (e.key === 'Escape') {
        const overlays = document.querySelectorAll('.task-manager-overlay, [id*="scannerOverlay"]');
        overlays.forEach(o => { if (o.style && o.style.display !== 'none') { o.remove ? o.remove() : (o.style.display = 'none'); } });
    }
    // Ctrl+K — search/chat focus
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const searchBox = document.querySelector('.search-box');
        if (searchBox) searchBox.click();
    }
});

/* ---------- Init ---------- */
logPerf('script.js yuklandi');

document.addEventListener('DOMContentLoaded', function() {
    logPerf('DOM tayyor');
    // Initialize scheduler widget after a short delay to let ai-scheduler.js load
    setTimeout(function() {
        if (typeof updateHomeSchedulerWidget === 'function') {
            updateHomeSchedulerWidget();
            logPerf('Scheduler widget yangilandi');
        }
    }, 500);
});

console.log(`🚀 YO'LCHI v${APP_VERSION} ishga tushdi!`);