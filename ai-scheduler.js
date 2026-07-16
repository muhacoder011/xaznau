/* ================= YO'LCHI — KUNLIK MISSIYA ================= */
/* AI travel companion — daily mission system for weekend trips  */
/* Replaces old daily task scheduler (kundalik vazifa)           */
/* ============================================================== */

let missionState = JSON.parse(localStorage.getItem('yolchi_mission')) || null;
let missionHistory = JSON.parse(localStorage.getItem('yolchi_mission_history')) || [];

/* ---------- Independent Toast ---------- */
function schedulerToast(icon, text, duration) {
    duration = duration || 2000;
    const existing = document.querySelector('.scheduler-toast');
    if (existing) existing.remove();
    const toast = document.createElement('div');
    toast.className = 'scheduler-toast';
    toast.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%) scale(0.8);z-index:9999;background:linear-gradient(135deg,var(--gold,#dda23a),var(--gold-deep,#a86b1f));color:#3a2708;padding:26px 30px;border-radius:20px;text-align:center;font-weight:800;font-size:16px;opacity:0;pointer-events:none;transition:all .3s cubic-bezier(.2,1.4,.4,1);box-shadow:0 20px 40px rgba(0,0,0,0.25);font-family:Inter,sans-serif;';
    toast.innerHTML = '<span style="font-size:34px;display:block;margin-bottom:6px;">' + icon + '</span>' + text;
    document.body.appendChild(toast);
    requestAnimationFrame(() => { toast.style.opacity = '1'; toast.style.transform = 'translate(-50%,-50%) scale(1)'; });
    setTimeout(() => { toast.style.opacity = '0'; toast.style.transform = 'translate(-50%,-50%) scale(0.8)'; setTimeout(() => toast.remove(), 300); }, duration);
}

/* ---------- Mission Database — sayohat missiyalari ---------- */
const MISSION_POOL = {
    general: [
        { title: 'Mahalliy taomni tatib ko\'r', desc: 'Bugungi joydagi eng mashhur milliy taomni buyurtma qiling va fotosuratga oling!', icon: '<i class="fa-solid fa-utensils"></i>', stars: 3 },
        { title: 'Bir mahalliy bilan suhbat', desc: 'Biror mahalliy aholi bilan suhbatlashing va uning hikoyasini eshiting.', icon: '<i class="fa-solid fa-comment"></i>', stars: 3 },
        { title: 'Yangi do\'st orttir', desc: 'Sayohat paytida kim bilandir tanishing. Yangi do\'st – yangi eshik!', icon: '<i class="fa-solid fa-handshake"></i>', stars: 4 },
        { title: '5 ta surat ol', desc: 'Shaharning eng chiroyli 5 joyini suratga oling va kollektsiya yarating.', icon: '<i class="fa-solid fa-camera"></i>', stars: 3 },
        { title: 'Mahalliy transportda yur', desc: 'Mahalliy jamoat transportida bir bekat yuring. Yangi tajriba!', icon: '<i class="fa-solid fa-bus"></i>', stars: 4 },
        { title: 'Biror narsa sovg\'a qil', desc: 'Sayohatdan biror kichik sovg\'a oling va uni birovga bering.', icon: '<i class="fa-solid fa-gift"></i>', stars: 5 },
        { title: 'Qo\'lda yozilgan xat', desc: 'Biror kafeda o\'tirib, qo\'lda xat yozing. Eski usul – eng samimiy usul!', icon: '<i class="fa-solid fa-envelope"></i>', stars: 4 },
        { title: 'Adashib qol', desc: 'Ataylab xaritaga qaramasdan bir ko\'cha bilan yuring. Yangi kashfiyotlar!', icon: '<i class="fa-solid fa-map"></i>', stars: 5 },
        { title: 'Mahalliy musiqani tingla', desc: 'Biror mahalliy musiqachi yoki an\'anaviy kuyni tinglang.', icon: '<i class="fa-solid fa-music"></i>', stars: 3 },
        { title: 'Bir kunda 10 km yur', desc: 'Bugun piyoda 10 kilometr masofani bosib o\'ting. Sog\'lik va kashfiyot!', icon: '<i class="fa-solid fa-person-walking"></i>', stars: 4 },
        { title: 'Bir narsani birinchi marta sinab ko\'r', desc: 'Hayotingizda birinchi marta biror narsa qiling. Yangi taassurotlar!', icon: '<i class="fa-solid fa-bullseye"></i>', stars: 5 },
        { title: 'Kun chiqishini kutib ol', desc: 'Erta turib, quyosh chiqishini tomosha qiling. Kunni go\'zal boshlang!', icon: '<i class="fa-solid fa-sun"></i>', stars: 4 },
        { title: 'Mahalliy bozorga bor', desc: 'Shaharning markaziy bozoriga boring. Mahalliy hayotni his qiling!', icon: '<i class="fa-solid fa-store"></i>', stars: 3 },
        { title: 'Biror narsani o\'rgan', desc: 'Bugun biror yangi narsani o\'rganing — tarix, hunar yoki til.', icon: '<i class="fa-solid fa-book-open"></i>', stars: 4 },
        { title: 'Bir kunlik vlogger bo\'l', desc: 'Kuningizni video yoki ovozli xotira shaklida yozib oling.', icon: '<i class="fa-solid fa-video"></i>', stars: 5 },
        { title: 'Tabiat bilan bog\'lan', desc: 'Eng yaqin bog\' yoki tabiat burchagiga boring. 10 daqiqa tinch dam oling.', icon: '<i class="fa-solid fa-leaf"></i>', stars: 3 },
        { title: 'Bir mahalliy ibodatxoni ziyorat qil', desc: 'Shahardagi masjid, cherkov yoki ma\'badni ziyorat qiling.', icon: '<i class="fa-solid fa-mosque"></i>', stars: 3 },
        { title: 'Kun botishini kuzat', desc: 'Kun botishini eng chiroyli nuqtadan kuzating. Romantik lahza!', icon: '<i class="fa-solid fa-sun"></i>', stars: 4 }
    ],
    food: [
        { title: '5 xil mahalliy taom', desc: 'Bugun 5 xil mahalliy taomni tatib ko\'ring. Oshxona sayohati!', icon: '<i class="fa-solid fa-utensils"></i>', stars: 4 },
        { title: 'Ko\'cha taomlari', desc: 'Faqat ko\'cha taomlaridan iborat kun o\'tkazing. Eng mazali narsalar ko\'chada!', icon: '<i class="fa-solid fa-burger"></i>', stars: 4 },
        { title: 'O\'zing pishir', desc: 'Biror mahalliy taomni o\'zingiz tayyorlashni o\'rganing.', icon: '<i class="fa-solid fa-utensils"></i>', stars: 5 },
        { title: 'Nonvoyxonaga bor', desc: 'Mahalliy nonvoyxonaga boring va yangi pishgan nonni tatib ko\'ring.', icon: '<i class="fa-solid fa-bread-slice"></i>', stars: 3 }
    ],
    photo: [
        { title: 'Eng yaxshi selfi', desc: 'Shaharning eng mashhur joyida selfi oling va ijtimoiy tarmoqlarda ulashing.', icon: '<i class="fa-solid fa-camera"></i>', stars: 3 },
        { title: 'Portretlar galereyasi', desc: 'Bugun 5 xil odamning portret suratini oling (ruxsat so\'rab).', icon: '<i class="fa-solid fa-camera"></i>', stars: 5 }
    ],
    cultural: [
        { title: 'An\'anaviy kiyim kiy', desc: 'Mahalliy an\'anaviy kiyimda suratga tushing.', icon: '<i class="fa-solid fa-tshirt"></i>', stars: 5 },
        { title: 'Mahalliy bayramga qatnash', desc: 'Agar bugun biror bayram bo\'lsa, unda ishtirok eting!', icon: '<i class="fa-solid fa-circle-check"></i>', stars: 5 },
        { title: 'Muzeyga bor', desc: 'Shahardagi eng qiziqarli muzeyni ziyorat qiling.', icon: '<i class="fa-solid fa-landmark"></i>', stars: 3 }
    ],
    adventure: [
        { title: 'Tog\'ga chiq', desc: 'Eng yaqin tepalik yoki tog\'ga chiqing. Yuqoridan shahar manzarasi!', icon: '<i class="fa-solid fa-mountain"></i>', stars: 5 },
        { title: 'Daryo bo\'ylab sayr', desc: 'Shahardagi daryo yoki kanal bo\'ylab sayr qiling.', icon: '<i class="fa-solid fa-water"></i>', stars: 3 },
        { title: 'Velosiped ijarasi', desc: 'Velosiped olib, shahar bo\'ylab sayohat qiling. Erkinlik hissi!', icon: '<i class="fa-solid fa-bicycle"></i>', stars: 4 },
        { title: 'Yulduzlarni tomosha qil', desc: 'Kechasi yulduzlarni tomosha qiling. Shahar chiroqlaridan uzoqroqda.', icon: '<i class="fa-solid fa-star"></i>', stars: 5 }
    ]
};

/* ---------- Mission Generation ---------- */
function getDayIndex() { return new Date().getDay(); }
function isWeekend() { const d = getDayIndex(); return d === 0 || d === 6; }

function getActiveTripInfo() {
    if (typeof state !== 'undefined' && state !== null && state.activeTripId) {
        const trip = state.trips.find(t => t.id === state.activeTripId);
        if (trip && trip.started && !trip.completed) {
            const currentStop = trip.stops[trip.currentIndex];
            return {
                active: true,
                city: trip.city,
                currentStop: currentStop ? currentStop.name : null,
                tripId: trip.id
            };
        }
    }
    return { active: false };
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function generateMission() {
    const tripInfo = getActiveTripInfo();
    const hour = new Date().getHours();
    const isSleepTime = hour >= 22 || hour < 5;
    
    if (isSleepTime) {
        return {
            id: 'mission-' + Date.now(),
            title: '<i class="fa-solid fa-moon"></i> Dam olish va tiklanish',
            desc: 'Tanangiz va miyangizni dam oldiring. Ertangi sarguzasht uchun kuch to\'plang! Ertaga yangi missiya kutmoqda.',
            icon: '<i class="fa-solid fa-moon"></i>',
            stars: 1,
            date: new Date().toISOString().split('T')[0],
            completed: false,
            auto: true
        };
    }
    
    let pool = [];
    
    if (tripInfo.active) {
        const r = Math.random();
        if (r < 0.4) pool = MISSION_POOL.food;
        else if (r < 0.7) pool = MISSION_POOL.photo;
        else if (r < 0.9) pool = MISSION_POOL.adventure;
        else pool = MISSION_POOL.cultural;
    } else {
        pool = MISSION_POOL.general;
    }
    
    const mission = pickRandom(pool);
    
    let desc = mission.desc;
    if (tripInfo.active && tripInfo.currentStop) {
        desc = desc + ' Hozirgi joyingiz: ' + tripInfo.currentStop;
    }
    
    return {
        id: 'mission-' + Date.now(),
        title: mission.icon + ' ' + mission.title,
        desc: desc,
        icon: mission.icon,
        stars: mission.stars,
        date: new Date().toISOString().split('T')[0],
        completed: false,
        auto: false,
        tripCity: tripInfo.active ? tripInfo.city : null,
        tripStop: tripInfo.active ? tripInfo.currentStop : null
    };
}

/* ---------- Mission State Management ---------- */
function getTodayMission() {
    const today = new Date().toISOString().split('T')[0];
    if (missionState && missionState.date === today) {
        return missionState;
    }
    missionState = generateMission();
    localStorage.setItem('yolchi_mission', JSON.stringify(missionState));
    return missionState;
}

function completeMission() {
    if (!missionState || missionState.completed) return;
    
    missionState.completed = true;
    localStorage.setItem('yolchi_mission', JSON.stringify(missionState));
    
    const starAmount = missionState.stars || 3;
    if (typeof state !== 'undefined' && state !== null) {
        const hasBoost = (state.ownedItems || []).includes('boost');
        const multiplier = hasBoost ? 2 : 1;
        const awarded = starAmount * multiplier;
        state.stars = (state.stars || 0) + awarded;
        if (typeof saveStars === 'function') saveStars();
        if (typeof renderAll === 'function') renderAll();
        
        schedulerToast('<i class="fa-solid fa-star"></i>', '+' + awarded + ' yulduz! Missiya bajarildi! <i class="fa-solid fa-circle-check"></i>', 3000);
    } else {
        schedulerToast('<i class="fa-solid fa-star"></i>', '+' + starAmount + ' yulduz! Missiya bajarildi! <i class="fa-solid fa-circle-check"></i>', 3000);
    }
    
    missionHistory.push({ ...missionState, completedAt: new Date().toISOString() });
    if (missionHistory.length > 50) missionHistory = missionHistory.slice(-50);
    localStorage.setItem('yolchi_mission_history', JSON.stringify(missionHistory));
    
    renderMissionContainer('aiSchedulerContainer');
    if (typeof updateHomeSchedulerWidget === 'function') updateHomeSchedulerWidget();
}

function refreshMission() {
    missionState = generateMission();
    localStorage.setItem('yolchi_mission', JSON.stringify(missionState));
    renderMissionContainer('aiSchedulerContainer');
    if (typeof updateHomeSchedulerWidget === 'function') updateHomeSchedulerWidget();
}

/* ---------- Active Trip Mission Override ---------- */
function setTripMission(tripCity, stopName) {
    const pool = [...MISSION_POOL.general, ...MISSION_POOL.food, ...MISSION_POOL.photo, ...MISSION_POOL.cultural, ...MISSION_POOL.adventure];
    const mission = pickRandom(pool);
    
    missionState = {
        id: 'mission-' + Date.now(),
        title: mission.icon + ' ' + mission.title,
        desc: mission.desc + ' ' + tripCity + ' shahrida!',
        icon: mission.icon,
        stars: mission.stars + 1,
        date: new Date().toISOString().split('T')[0],
        completed: false,
        auto: false,
        tripCity: tripCity,
        tripStop: stopName
    };
    localStorage.setItem('yolchi_mission', JSON.stringify(missionState));
    
    renderMissionContainer('aiSchedulerContainer');
    if (typeof updateHomeSchedulerWidget === 'function') updateHomeSchedulerWidget();
}

/* ---------- UI Rendering ---------- */
function renderMissionContainer(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    
    const mission = getTodayMission();
    const tripInfo = getActiveTripInfo();
    const hour = new Date().getHours();
    const isSleepTime = hour >= 22 || hour < 5;
    const isW = isWeekend();
    
    // Time-based greeting
    const timeGreeting = hour < 12 ? 'Xayrli tong <i class="fa-solid fa-sun"></i>' : hour < 18 ? 'Xayrli kun <i class="fa-solid fa-sun"></i>' : 'Xayrli kech <i class="fa-solid fa-city"></i>';
    
    let html = '<div class="mission-container">';
    
    // Header
    html += '<div class="mission-header">';
    html += '<div class="mission-greeting">' + timeGreeting + '</div>';
    html += '<div class="mission-date">' + new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '</div>';
    html += '</div>';
    
    // Trip status banner
    if (tripInfo.active) {
        html += '<div class="trip-status-banner">';
        html += '<span class="tsb-icon"><i class="fa-solid fa-suitcase"></i></span>';
        html += '<div class="tsb-content">';
        html += '<div class="tsb-title">' + tripInfo.city + ' — jonli sayohat</div>';
        if (tripInfo.currentStop) {
            html += '<div class="tsb-stop"><i class="fa-solid fa-location-dot"></i> Hozir: ' + tripInfo.currentStop + '</div>';
        }
        html += '</div>';
        html += '</div>';
    } else if (isW) {
        html += '<div class="weekend-banner">';
        html += '<span class="tsb-icon"><i class="fa-solid fa-circle-check"></i></span>';
        html += '<div class="tsb-content">';
        html += '<div class="tsb-title">Dam olish kuni!</div>';
        html += '<div class="tsb-stop">Bugun sayohatga chiqish uchun ajoyib kun!</div>';
        html += '</div>';
        html += '</div>';
    }
    
    // Sleep time message
    if (isSleepTime) {
        html += '<div class="sleep-mission-card reveal">';
        html += '<div class="sleep-icon"><i class="fa-solid fa-moon"></i></div>';
        html += '<div class="sleep-text">';
        html += '<strong>Dam olish vaqti</strong><br>';
        html += '<span style="font-size:12px;opacity:0.8;">Ertangi sarguzashtlar uchun kuch to\'plang!</span>';
        html += '</div>';
        html += '</div>';
    }
    
    // Mission card
    if (mission && !isSleepTime) {
        const isDone = mission.completed;
        html += '<div class="mission-card reveal ' + (isDone ? 'mission-done' : '') + '">';
        html += '<div class="mission-badge"><i class="fa-solid fa-bullseye"></i> Kunlik Missiya</div>';
        
        if (isDone) {
            html += '<div class="mission-complete-icon"><i class="fa-solid fa-check"></i></div>';
        }
        
        html += '<div class="mission-icon-large">' + (mission.icon || '<i class="fa-solid fa-bullseye"></i>') + '</div>';
        html += '<h2 class="mission-title">' + mission.title + '</h2>';
        html += '<p class="mission-desc">' + mission.desc + '</p>';
        
        // Star reward
        html += '<div class="mission-stars">';
        html += '<span class="ms-label">Mukofot:</span>';
        for (let i = 0; i < (mission.stars || 3); i++) {
            html += '<span class="ms-star"><i class="fa-solid fa-star"></i></span>';
        }
        html += '<span class="ms-count">+' + (mission.stars || 3) + ' yulduz</span>';
        html += '</div>';
        
        // Action buttons
        html += '<div class="mission-actions">';
        if (!isDone) {
            html += '<button class="cta-btn mission-complete-btn" onclick="completeMission()"><i class="fa-solid fa-check"></i> Missiyani bajarildi deb belgilash</button>';
            html += '<button class="cta-btn ghost mission-refresh-btn" onclick="if(confirm(\'Yangi missiya generatsiya qilinsinmi?\'))refreshMission()"><i class="fa-solid fa-rotate"></i> Yangi missiya</button>';
        } else {
            html += '<div class="mission-done-message">';
            html += '<span class="md-icon"><i class="fa-solid fa-circle-check"></i></span>';
            html += '<span>Bugungi missiya bajarildi! Ertaga yangi sarguzasht kutmoqda.</span>';
            html += '</div>';
            html += '<button class="cta-btn ghost" onclick="refreshMission()"><i class="fa-solid fa-rotate"></i> Yangi missiya</button>';
        }
        html += '</div>';
        html += '</div>';
    }
    
    // Suggestions / travel prompts
    if (!isSleepTime) {
        html += '<div class="mission-section-title"><i class="fa-solid fa-lightbulb"></i> Sayohat maslahatlari</div>';
        html += '<div class="mission-tips">';
        
        const tips = [
            { icon: '<i class="fa-solid fa-bottle-water"></i>', text: 'Quyosh kremini unutmang!' },
            { icon: '<i class="fa-solid fa-droplet"></i>', text: 'Ko\'proq suv iching — 2 litr!' },
            { icon: '<i class="fa-solid fa-mobile-screen-button"></i>', text: 'Yo\'l xaritangizni yuklab oling' },
            { icon: '<i class="fa-solid fa-battery-full"></i>', text: 'Powerbank oling!' },
            { icon: '<i class="fa-solid fa-shoe-prints"></i>', text: 'Qulay poyabzal kiying' }
        ];
        
        const shuffled = tips.sort(() => Math.random() - 0.5).slice(0, 3);
        shuffled.forEach(tip => {
            html += '<div class="tip-item">';
            html += '<span class="tip-icon">' + tip.icon + '</span>';
            html += '<span class="tip-text">' + tip.text + '</span>';
            html += '</div>';
        });
        html += '</div>';
    }
    
    // Mission history (last few)
    if (missionHistory.length > 0) {
        html += '<div class="mission-section-title"><i class="fa-solid fa-scroll"></i> Missiyalar tarixi</div>';
        html += '<div class="mission-history">';
        const recent = missionHistory.slice(-5).reverse();
        recent.forEach(h => {
            const date = h.date ? h.date.split('T')[0] : '';
            html += '<div class="history-item">';
            html += '<span class="hi-icon">' + (h.icon || '<i class="fa-solid fa-bullseye"></i>') + '</span>';
            html += '<span class="hi-title">' + (h.title || '').replace(/[^\w\s\u0600-\u06FF\u0400-\u04FF]/g, '').trim() + '</span>';
            html += '<span class="hi-date">' + date + '</span>';
            html += '<span class="hi-status"><i class="fa-solid fa-check"></i></span>';
            html += '</div>';
        });
        html += '</div>';
    }
    
    html += '</div>'; // mission-container
    
    el.innerHTML = html;
}

/* ---------- Initialize ---------- */
var missionInitialized = false;

function initAIScheduler(containerId) {
    if (missionInitialized) {
        renderMissionContainer(containerId);
        return;
    }
    missionInitialized = true;
    
    renderMissionContainer(containerId);
    
    // AI o'zi taklif qilmaydi — faqat foydalanuvchi yozganda javob beradi
    
    if (typeof updateHomeSchedulerWidget === 'function') updateHomeSchedulerWidget();
}

/* ---------- Export for global use ---------- */
window.initScheduler = initAIScheduler;
window.renderScheduler = renderMissionContainer;
window.completeMission = completeMission;
window.refreshMission = refreshMission;
window.setTripMission = setTripMission;
window.getTodayMission = getTodayMission;
