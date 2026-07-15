function giveKey(placeId) {
    if (!placeId) {
        alert("❌ Noto'g'ri QR kod");
        return;
    }

    // <i class='fa-solid fa-magnifying-glass"></i> VERIFY: Find the place in adminPlaces — only admin-created QR codes are valid
    if (typeof adminPlaces === 'undefined' || adminPlaces === null || adminPlaces.length === 0) {
        alert("❌ Hali hech qanday joy qo'shilmagan.\n\nAdmin panel orqali joy qo'shing.");
        return;
    }

    const place = adminPlaces.find(p => String(p.id) === String(placeId));
    if (!place) {
        alert("❌ Bu QR kod tizimda ro'yxatdan o'tmagan.\n\nFaqat admin tomonidan yaratilgan QR kodlar amal qiladi.");
        return;
    }

    const starAmount = place.stars || 3;

    // Check if already used
    let used = [];
    try {
        used = JSON.parse(localStorage.getItem("yolchi_used")) || [];
    } catch(e) {
        used = [];
    }

    const alreadyUsed = used.includes(String(placeId));
    
    // If already used but there's a pending stop verification, still allow stop completion
    if (alreadyUsed) {
        if (typeof state !== 'undefined' && state !== null && state.pendingVerification && 
            String(state.pendingVerification.placeId) === String(placeId)) {
            // Allow stop verification to proceed even though QR was already scanned
            // Stars were already given, just resolve the stop
            if (typeof resolveStopVerification === 'function') {
                resolveStopVerification(placeId);
            }
            return;
        }
        alert("❌ Siz bu joyni oldin skan qilgansiz.\n\nHar bir joydan faqat bir marta yulduz olish mumkin.");
        return;
    }

    used.push(String(placeId));
    localStorage.setItem("yolchi_used", JSON.stringify(used));

    // Update state - give stars
    if (typeof state !== 'undefined' && state !== null) {
        // Double stars if boost is active
        const hasBoost = (state.ownedItems || []).includes('boost');
        const multiplier = hasBoost ? 2 : 1;
        const awardedStars = starAmount * multiplier;
        state.stars = (state.stars || 0) + awardedStars;
        // Save to localStorage
        if (typeof saveStars === 'function') saveStars();
        if (typeof saveUsed === 'function') saveUsed();
    }

    // Show toast with star icon
    if (typeof showToast === 'function') {
        showToast('<i class="fa-solid fa-star"></i>', `+${starAmount} yulduz!`);
    }
    
    if (typeof renderAll === 'function') {
        renderAll();
    }

    // Check if this scan resolves a pending stop verification
    if (typeof resolveStopVerification === 'function') {
        resolveStopVerification(placeId);
    }

    const totalStars = (state && state.stars) || 0;
    alert(`✅ Joy tekshirildi va tasdiqlandi!\n\n📍 "${place.name}" (${place.city || 'Noma\'lum'})\n⭐ +${starAmount} yulduz\n⭐ Jami yulduzlar: ${totalStars}`);
}