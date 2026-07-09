function onScanSuccess(decodedText) {
    // Stop scanner first
    if (typeof stopScanner === 'function') {
        stopScanner();
    } else if (window.scanner && typeof window.scanner.stop === 'function') {
        try { window.scanner.stop(); } catch(e) {}
    }

    let placeId = null;

    try {
        // New format: yolchi://place?id=123&city=Toshkent
        if (decodedText.startsWith("yolchi://")) {
            const url = new URL(decodedText);
            placeId = url.searchParams.get("id");
        }
        // Old format: https://yolchi.uz/?place=123
        else if (decodedText.includes("yolchi.uz") || decodedText.includes("place=")) {
            const url = new URL(decodedText);
            placeId = url.searchParams.get("place");
        }
        // Direct ID
        else {
            placeId = decodedText.trim();
        }
    } catch(e) {
        // If URL parsing fails, try as plain ID
        placeId = decodedText.trim();
    }

    if (placeId) {
        giveKey(placeId);
    } else {
        alert("❌ Noto'g'ri QR kod (ID topilmadi)");
    }

    // Close scanner overlay after a short delay
    if (typeof closeScannerOverlay !== 'undefined') {
        setTimeout(closeScannerOverlay, 800);
    }
}