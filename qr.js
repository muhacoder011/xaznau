/* ================= QR Scan Success Handler ================= */

const SCANNED_IDS = new Set();
let lastScanTime = 0;

function onScanSuccess(decodedText) {
    const now = Date.now();
    
    // Prevent double-scan within 3 seconds
    if (now - lastScanTime < 3000) return;
    lastScanTime = now;
    
    // Stop scanner first
    if (typeof stopScanner === 'function') {
        stopScanner();
    } else if (window.scanner && typeof window.scanner.stop === 'function') {
        try { window.scanner.stop(); } catch(e) {}
    }

    let placeId = null;
    let rawText = decodedText.trim();

    try {
        // New format: yolchi://place?id=123&city=Toshkent
        if (rawText.startsWith("yolchi://")) {
            const url = new URL(rawText);
            placeId = url.searchParams.get("id");
        }
        // Old format: https://yolchi.uz/?place=123
        else if (rawText.includes("yolchi.uz") || rawText.includes("place=")) {
            const url = new URL(rawText);
            placeId = url.searchParams.get("place");
        }
        // JSON format: {"id": 123, "name": "...", "city": "..."}
        else if (rawText.startsWith("{")) {
            try {
                const json = JSON.parse(rawText);
                placeId = json.id || json.placeId || json.key;
            } catch(e) { placeId = null; }
        }
        // Direct ID
        else {
            // If it's a numeric ID, use as-is; otherwise try to extract numbers
            placeId = rawText.replace(/^[^a-zA-Z0-9_-]+/, '');
        }
    } catch(e) {
        placeId = rawText.replace(/^[^a-zA-Z0-9_-]+/, '');
    }

    // Prevent duplicate scan
    if (placeId && SCANNED_IDS.has(placeId)) {
        console.log('♻️ QR kod qayta skan qilindi (ignored):', placeId);
        if (typeof closeScannerOverlay !== 'undefined') {
            setTimeout(closeScannerOverlay, 300);
        }
        return;
    }

    if (placeId) {
        SCANNED_IDS.add(placeId);
        giveKey(placeId);
    } else {
        // Vibrate on error if supported
        if (navigator.vibrate) navigator.vibrate(200);
        alert("❌ Noto'g'ri QR kod (ID topilmadi)");
    }

    // Close scanner overlay after a short delay
    if (typeof closeScannerOverlay !== 'undefined') {
        setTimeout(closeScannerOverlay, 800);
    }
}

// Clear scanned IDs daily (midnight reset)
function resetScannedIds() {
    SCANNED_IDS.clear;
}
// Auto-reset every 24 hours
setInterval(resetScannedIds, 24 * 60 * 60 * 1000);

console.log("♻️ QR handler yuklandi");