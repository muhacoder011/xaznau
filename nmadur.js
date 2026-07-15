/* ================= QR Scanner Manager ================= */

let scanner = null;

function startScanner() {
    if (scanner) {
        try { scanner.stop(); } catch (e) { /* silent */ }
        scanner = null;
    }
    const readerEl = document.getElementById("reader");
    if (!readerEl) {
        alert("❌ Skanner elementi topilmadi!");
        return;
    }
    readerEl.innerHTML = "";
    
    // Check if Html5Qrcode is loaded
    if (typeof Html5Qrcode === 'undefined') {
        alert("❌ QR kutubxonasi yuklanmadi. Internet aloqasini tekshiring.");
        return;
    }
    
    scanner = new Html5Qrcode("reader");
    scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        function() {} // silent error
    ).catch(function(err) {
        console.warn("📷 Kamera ishga tushmadi:", err);
        // Try with user-facing camera as fallback
        if (scanner && typeof scanner.start === 'function') {
            scanner.start(
                { facingMode: "user" },
                { fps: 10, qrbox: { width: 250, height: 250 } },
                onScanSuccess,
                function() {}
            ).catch(function(err2) {
                console.warn("📷 Old kamera ham ishlamadi:", err2);
                alert("❌ Kamerani ishga tushirib bo'lmadi.\n\nIltimos, kamera ruxsatini tekshiring va qayta urinib ko'ring.");
            });
        } else {
            alert("❌ Kamerani ishga tushirib bo'lmadi.\n\nIltimos, kamera ruxsatini tekshiring va qayta urinib ko'ring.");
        }
    });
}

function stopScanner() {
    if (scanner && typeof scanner.stop === 'function') {
        try { scanner.stop(); } catch (e) { /* silent */ }
        scanner = null;
    }
}

/* ---------- Flashlight Toggle ---------- */
let flashOn = false;
function toggleFlashlight() {
    if (!scanner) return;
    if (typeof scanner.getRunningTrackCameraCapabilities === 'function') {
        try {
            const caps = scanner.getRunningTrackCameraCapabilities();
            if (caps && caps.torchFeature && caps.torchFeature.isSupported()) {
                flashOn = !flashOn;
                caps.torchFeature.apply(flashOn);
                return flashOn;
            }
        } catch (e) { /* not supported */ }
    }
    console.warn("<i class='fa-solid fa-flashlight'></i> +\"Fonar qo'llab-quvvatlanmaydi");
    return false;
}

console.log("📷 QR Scanner yuklandi");