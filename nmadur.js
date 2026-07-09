let scanner = null;

function startScanner(){
    if (scanner) {
        try { scanner.stop(); } catch(e) {}
        scanner = null;
    }
    const readerEl = document.getElementById("reader");
    if (!readerEl) {
        alert("Skanner elementi topilmadi!");
        return;
    }
    readerEl.innerHTML = "";
    scanner = new Html5Qrcode("reader");
    scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        function() {} // qr error callback (silent)
    ).catch(function(err) {
        console.warn("Kamera ishga tushmadi:", err);
        alert("❌ Kamerani ishga tushirib bo'lmadi.\n\nIltimos, kamera ruxsatini tekshiring.");
    });
}

function stopScanner() {
    if (scanner && typeof scanner.stop === 'function') {
        try {
            scanner.stop();
        } catch(e) {}
        scanner = null;
    }
}