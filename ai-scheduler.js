/* ================= AI KUNLIK VAZIFALARNI REJALASHTIRISH ================= */
/* AI Daily Task Scheduler — advanced daily planning with Pomodoro timer      */
/* ========================================================================= */

let taskSchedule = JSON.parse(localStorage.getItem('yolchi_tasks')) || [];
let taskHistory = JSON.parse(localStorage.getItem('yolchi_task_history')) || [];
let pomodoroState = JSON.parse(localStorage.getItem('yolchi_pomodoro')) || { running: false, minutes: 25, seconds: 0, active: false };

/* ---------- Default daily tasks ---------- */
const DEFAULT_TASKS = [
    { id: 'task-1', title: '📋 Kunni rejalashtirish', time: '08:00', days: [1,2,3,4,5,6,0], active: true, desc: 'Bugungi muhim ishlarni belgilang', cat: 'work' },
    { id: 'task-2', title: '☀️ Tonggi sport', time: '06:30', days: [1,2,3,4,5,6], active: true, desc: '30 daqiqa yengil mashq', cat: 'health' },
    { id: 'task-3', title: '🧘 Meditatsiya', time: '07:00', days: [1,2,3,4,5,6,0], active: true, desc: '10 daqiqa nafas olish mashqi', cat: 'health' },
    { id: 'task-4', title: '📚 O\'qish', time: '20:00', days: [1,2,3,4,5,6,0], active: true, desc: '30 daqiqa kitob o\'qish', cat: 'study' },
    { id: 'task-5', title: '📝 Kunlik hisobot', time: '21:00', days: [1,2,3,4,5,6,0], active: true, desc: 'Kun davomida bajarilgan ishlarni yozib borish', cat: 'work' }
];

const CATEGORIES = [
    { id: 'work', label: '💼 Ish', color: '#1f6d4c' },
    { id: 'personal', label: '👤 Shaxsiy', color: '#dda23a' },
    { id: 'health', label: '❤️ Sog\'liq', color: '#c96b3e' },
    { id: 'study', label: '📖 O\'qish', color: '#3a7d94' },
    { id: 'other', label: '📌 Boshqa', color: '#5c6c60' }
];
const CAT_ICONS = { work: '💼', personal: '👤', health: '❤️', study: '📖', other: '📌' };

function initTasks() {
    if (taskSchedule.length === 0) {
        taskSchedule = JSON.parse(JSON.stringify(DEFAULT_TASKS));
        saveTasks();
    }
}
initTasks();

function saveTasks() { localStorage.setItem('yolchi_tasks', JSON.stringify(taskSchedule)); }
function saveTaskHistory() { localStorage.setItem('yolchi_task_history', JSON.stringify(taskHistory)); }
function savePomodoro() { localStorage.setItem('yolchi_pomodoro', JSON.stringify(pomodoroState)); }

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

/* ---------- Core Functions ---------- */
function getDayIndex() { return new Date().getDay(); }

function getTodayTasks() {
    const today = getDayIndex();
    return taskSchedule.filter(t => t.active && t.days.includes(today)).sort((a, b) => a.time.localeCompare(b.time));
}

function getNextTask() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    for (const task of getTodayTasks()) {
        const [h, m] = task.time.split(':').map(Number);
        if (h * 60 + m > currentMinutes) return task;
    }
    return null;
}

function addManualTask(title, time, days, desc, cat) {
    const task = { id: 'task-' + Date.now(), title: title, time: time, days: days || [1,2,3,4,5,6,0], active: true, desc: desc || '', cat: cat || 'other', manual: true };
    taskSchedule.push(task); saveTasks(); return task;
}

function toggleTaskCompletion(taskId) {
    const today = new Date().toISOString().split('T')[0];
    const existing = taskHistory.find(h => h.taskId === taskId && h.date === today);
    if (existing) { existing.done = !existing.done; }
    else { taskHistory.push({ taskId, date: today, done: true }); }
    saveTaskHistory();
    return existing ? existing.done : true;
}

function isTaskDone(taskId) {
    const today = new Date().toISOString().split('T')[0];
    const found = taskHistory.find(h => h.taskId === taskId && h.date === today);
    return found ? found.done : false;
}

function getTodayStats() {
    const todayTasks = getTodayTasks();
    const done = todayTasks.filter(t => isTaskDone(t.id)).length;
    return { total: todayTasks.length, done, pct: todayTasks.length > 0 ? Math.round((done / todayTasks.length) * 100) : 0 };
}

function isTaskDue(task) {
    if (!task || !task.active) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [h, m] = task.time.split(':').map(Number);
    return Math.abs(currentMinutes - (h * 60 + m)) <= 30 && !isTaskDone(task.id);
}

function getPendingReminders() { return getTodayTasks().filter(t => isTaskDue(t)); }

function getCategoryLabel(catId) { const c = CATEGORIES.find(c => c.id === catId); return c ? c.label : '📌 Boshqa'; }

/* ---------- AI Smart Suggestions ---------- */

/* AI generates suggested tasks based on time of day and user patterns */
function aiSuggestTasks() {
    const hour = new Date().getHours();
    const suggestions = [];
    
    if (hour >= 5 && hour < 8) {
        suggestions.push({ title: '☀️ Erta turish', time: '06:00', desc: 'Kunni barvaqt boshlash samaradorlikni oshiradi' });
        suggestions.push({ title: '🏃 Tonggi yugurish', time: '06:30', desc: '30 daqiqa ochiq havoda yugurish' });
        suggestions.push({ title: '🚿 Ertalabki dush', time: '07:00', desc: 'Energiya olish uchun salqin dush' });
        suggestions.push({ title: '🥣 Nonushta', time: '07:30', desc: 'To\'yimli va sog\'lom nonushta qilish' });
    } else if (hour >= 8 && hour < 12) {
        suggestions.push({ title: '💼 Asosiy ishlar', time: '09:00', desc: 'Eng muhim vazifalarni bajarish' });
        suggestions.push({ title: '☕ Qisqa tanaffus', time: '10:30', desc: '10 daqiqa dam olish va suv ichish' });
    } else if (hour >= 12 && hour < 14) {
        suggestions.push({ title: '🍽️ Tushlik', time: '12:30', desc: 'To\'yimli tushlik qilish va dam olish' });
        suggestions.push({ title: '😴 Qisqa uyqu', time: '13:00', desc: '20 daqiqa power nap — energiya zaxirasini to\'ldirish' });
    } else if (hour >= 14 && hour < 17) {
        suggestions.push({ title: '💻 Davomiy ishlar', time: '14:00', desc: 'Tushdan keyingi vazifalarni bajarish' });
        suggestions.push({ title: '🚶 Sayr qilish', time: '16:00', desc: '15 daqiqa toza havoda sayr qilish' });
    } else if (hour >= 17 && hour < 20) {
        suggestions.push({ title: '🏋️ Kechki sport', time: '18:00', desc: '1 soat sport zalida yoki uyda mashq' });
        suggestions.push({ title: '🚿 Kechki dush', time: '19:00', desc: 'Kun charchog\'ini yuvish' });
    } else if (hour >= 20 && hour < 23) {
        suggestions.push({ title: '👨‍👩‍👧 Oila bilan vaqt', time: '20:00', desc: 'Oilangiz bilan muloqot qilish' });
        suggestions.push({ title: '📖 Yotish oldi o\'qish', time: '21:30', desc: '30 daqiqa kitob o\'qish' });
    } else {
        suggestions.push({ title: '😴 Uyquga tayyorgarlik', time: '22:00', desc: 'Telefonni chetga qo\'yib, uyquga tayyorlanish' });
        suggestions.push({ title: '🌜 Uyqu', time: '23:00', desc: 'Yetarlicha uyqu — sog\'lik garovi' });
    }
    
    return suggestions;
}

/* ---------- AI Smart Suggestions (Improved) ---------- */
function aiSuggestTasks() {
    const hour = new Date().getHours();
    const s = [];
    if (hour >= 5 && hour < 6) {
        s.push({ title: '🌅 Saharlik', time: '05:00', desc: 'Saharlik vaqti — tonggi ovqatlanish', cat: 'health' });
    } else if (hour >= 6 && hour < 8) {
        s.push({ title: '🏃 Tonggi yugurish', time: '06:30', desc: '30 daqiqa ochiq havoda yugurish', cat: 'health' });
        s.push({ title: '🧘 Ertalabki yoga', time: '07:00', desc: '15 daqiqa yoga yoki cho\'zilish', cat: 'health' });
        s.push({ title: '🥣 Nonushta', time: '07:30', desc: 'To\'yimli va sog\'lom nonushta', cat: 'health' });
        s.push({ title: '📰 Yangiliklar', time: '07:45', desc: 'Kun muhim yangiliklarini o\'qish', cat: 'personal' });
    } else if (hour >= 8 && hour < 12) {
        s.push({ title: '💼 Eng muhim vazifa', time: '09:00', desc: 'Kunning eng muhim ishini bajarish', cat: 'work' });
        s.push({ title: '☕ Kofe-break', time: '10:30', desc: '10 daqiqa dam olish va suv ichish', cat: 'work' });
        s.push({ title: '💻 Pochta va xabarlar', time: '11:00', desc: 'Email va xabarlarni tekshirish', cat: 'work' });
    } else if (hour >= 12 && hour < 14) {
        s.push({ title: '🍽️ Tushlik', time: '12:30', desc: 'To\'yimli tushlik va dam olish', cat: 'health' });
        s.push({ title: '😴 Power nap', time: '13:15', desc: '20 daqiqa qisqa uyqu', cat: 'health' });
    } else if (hour >= 14 && hour < 17) {
        s.push({ title: '💻 Davomiy ish', time: '14:00', desc: 'Tushdan keyingi vazifalarni bajarish', cat: 'work' });
        s.push({ title: '🚶 Sayr', time: '16:00', desc: '15 daqiqa toza havoda sayr', cat: 'health' });
    } else if (hour >= 17 && hour < 20) {
        s.push({ title: '🏋️ Sport', time: '18:00', desc: '1 soat sport mashg\'uloti', cat: 'health' });
        s.push({ title: '🚿 Kechki dush', time: '19:00', desc: 'Kun charchog\'ini yuvish', cat: 'health' });
    } else if (hour >= 20 && hour < 22) {
        s.push({ title: '👨\u200d👩\u200d👧 Oila vaqti', time: '20:00', desc: 'Oilangiz bilan muloqot qilish', cat: 'personal' });
        s.push({ title: '📖 Kitob o\'qish', time: '21:00', desc: '30 daqiqa kitob o\'qish', cat: 'study' });
    } else {
        s.push({ title: '📝 Kunlik hisobot', time: '22:00', desc: 'Kun yakuni bo\'yicha hisobot', cat: 'work' });
        s.push({ title: '😴 Uyquga tayyorgarlik', time: '22:30', desc: 'Telefonni chetga qo\'yish', cat: 'health' });
        s.push({ title: '🌜 Uyqu', time: '23:00', desc: 'Xayrli tun! 7-8 soat uyqu', cat: 'health' });
    }
    return s;
}

function addMinutesToTime(time, minutes) {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    const newH = Math.floor(total / 60) % 24;
    const newM = total % 60;
    return String(newH).padStart(2, '0') + ':' + String(newM).padStart(2, '0');
}

/* ---------- Pomodoro Timer ---------- */
function togglePomodoro() {
    if (!pomodoroState.active) { pomodoroState = { running: false, minutes: 25, seconds: 0, active: true }; savePomodoro(); }
    else { pomodoroState.active = false; pomodoroState.running = false; savePomodoro(); }
    renderAIScheduler('aiSchedulerContainer');
}
function startPomodoro() { pomodoroState.running = true; savePomodoro(); renderAIScheduler('aiSchedulerContainer'); }
function pausePomodoro() { pomodoroState.running = false; savePomodoro(); renderAIScheduler('aiSchedulerContainer'); }
function resetPomodoro() { pomodoroState.minutes = 25; pomodoroState.seconds = 0; pomodoroState.running = false; savePomodoro(); renderAIScheduler('aiSchedulerContainer'); }
function setPomodoroTime(min) { pomodoroState.minutes = min; pomodoroState.seconds = 0; pomodoroState.running = false; savePomodoro(); renderAIScheduler('aiSchedulerContainer'); }

function pomodoroTick() {
    if (!pomodoroState.active || !pomodoroState.running) return;
    if (pomodoroState.seconds === 0) {
        if (pomodoroState.minutes === 0) {
            pomodoroState.running = false; savePomodoro();
            schedulerToast('⏰', 'Pomodoro tugadi! 5 daqiqa dam oling 🎉', 4000);
            renderAIScheduler('aiSchedulerContainer'); return;
        }
        pomodoroState.minutes--; pomodoroState.seconds = 59;
    } else { pomodoroState.seconds--; }
    savePomodoro();
    const display = document.getElementById('pomodoroDisplay');
    if (display) { display.textContent = String(pomodoroState.minutes).padStart(2,'0') + ':' + String(pomodoroState.seconds).padStart(2,'0'); }
}
setInterval(pomodoroTick, 1000);

/* ---------- UI Rendering ---------- */
function renderAIScheduler(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const todayTasks = getTodayTasks();
    const stats = getTodayStats();
    const nextTask = getNextTask();
    const pendingReminders = getPendingReminders();
    const suggestions = aiSuggestTasks();
    const hour = new Date().getHours();
    const isSleepTime = hour >= 22 || hour < 5;
    
    let timeGreeting;
    if (isSleepTime) timeGreeting = '🌜 Xayrli tun!';
    else if (hour < 12) timeGreeting = '🌅 Xayrli tong!';
    else if (hour < 18) timeGreeting = '☀️ Xayrli kun!';
    else timeGreeting = '🌆 Xayrli kech!';
    
    let html = '<div class="ai-scheduler"><div class="scheduler-header"><div class="scheduler-greeting">' + timeGreeting + '</div><div class="scheduler-date">' + new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '</div></div>';
    
    if (isSleepTime) {
        html += '<div class="sleep-mode-card"><span class="sleep-icon">🌜</span><div class="sleep-text"><strong>Dam olish vaqti</strong><br><span style="font-size:12px;opacity:0.8;">Tana va miyangizni dam oldiring. Ertangi kun uchun kuch to\'plang!</span></div></div>';
    }
    
    html += '<div class="scheduler-stats"><div class="sched-stat"><span class="sched-stat-num">' + stats.done + '/' + stats.total + '</span><span class="sched-stat-lbl">Bajarildi</span></div><div class="sched-stat"><span class="sched-stat-num">' + stats.pct + '%</span><span class="sched-stat-lbl">Samaradorlik</span></div><div class="sched-stat"><span class="sched-stat-num">' + (nextTask ? '🕐' : '✅') + '</span><span class="sched-stat-lbl">' + (nextTask ? 'Keyingi' : 'Tugadi') + '</span></div></div>';
    
    if (nextTask && !isSleepTime) {
        html += '<div class="next-task-widget" onclick="scrollToTask(\'' + nextTask.id + '\')"><div class="next-task-label">⌛ Keyingi vazifa</div><div class="next-task-title">' + nextTask.title + '</div><div class="next-task-time">🕐 ' + nextTask.time + '</div></div>';
    } else if (todayTasks.length > 0 && stats.done === stats.total && !isSleepTime) {
        html += '<div class="next-task-widget done"><div class="next-task-label" style="font-size:24px;">🎉</div><div class="next-task-title">Bugungi barcha vazifalar bajarildi!</div></div>';
    }
    
    if (pendingReminders.length > 0 && !isSleepTime) {
        html += '<div class="reminder-alert"><span class="reminder-icon">🔔</span><div class="reminder-text"><strong>' + pendingReminders[0].title + '</strong> — bajarish vaqti keldi!</div><button class="reminder-btn" onclick="completeReminder(\'' + pendingReminders[0].id + '\')">✅ Bajarildi</button></div>';
    }
    
    html += '<div class="scheduler-section-title">📋 Bugungi vazifalar</div><div class="task-list" id="taskListToday">';
    if (todayTasks.length === 0) {
        html += '<div class="empty-tasks"><div class="eic">🎉</div><p>Bugun uchun vazifalar yo\'q. Yangi vazifa qo\'shing!</p></div>';
    } else {
        todayTasks.forEach(function(t) {
            var done = isTaskDone(t.id);
            var catIcon = CAT_ICONS[t.cat] || '📌';
            html += '<div class="task-item ' + (done ? 'done' : '') + '" data-task-id="' + t.id + '"><div class="task-check" onclick="toggleTask(\'' + t.id + '\')">' + (done ? '✓' : '○') + '</div><div class="task-content"><div class="task-title">' + catIcon + ' ' + t.title + '</div><div class="task-time">🕐 ' + t.time + (t.desc ? ' · ' + t.desc : '') + '</div></div><div class="task-actions"><button class="task-move-btn" onclick="moveTask(\'' + t.id + '\',-1)" title="Yuqoriga">▲</button><button class="task-move-btn" onclick="moveTask(\'' + t.id + '\',1)" title="Pastga">▼</button><button class="task-edit-btn" onclick="editTask(\'' + t.id + '\')" title="Tahrirlash">✎</button><button class="task-del-btn" onclick="deleteTask(\'' + t.id + '\')" title="O\'chirish">✕</button></div></div>';
        });
    }
    html += '</div>';
    
    if (!isSleepTime) {
        html += '<button class="cta-btn add-task-btn" onclick="showAddTaskForm()">➕ Yangi vazifa qo\'shish</button>';
        html += '<div id="addTaskForm" style="display:none;margin-top:16px;"><input id="newTaskTitle" placeholder="Vazifa nomi" style="width:100%;padding:12px;margin-bottom:8px;border-radius:12px;border:1px solid var(--line);background:var(--surface);font-size:14px;"><div style="display:flex;gap:8px;margin-bottom:8px;"><input id="newTaskTime" type="time" style="flex:1;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--surface);font-size:14px;"><select id="newTaskCat" style="flex:1;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--surface);font-size:14px;">' + CATEGORIES.map(function(c) { return '<option value="' + c.id + '">' + c.label + '</option>'; }).join('') + '</select></div><input id="newTaskDesc" placeholder="Tavsif (ixtiyoriy)" style="width:100%;padding:12px;margin-bottom:10px;border-radius:12px;border:1px solid var(--line);background:var(--surface);font-size:14px;"><div style="display:flex;gap:10px;"><button class="cta-btn" onclick="saveNewTask()" style="flex:1;">💾 Saqlash</button><button class="cta-btn ghost" onclick="cancelAddTask()" style="flex:1;">✕ Bekor qilish</button></div></div>';
    }
    
    // Pomodoro
    html += '<div class="scheduler-section-title" style="margin-top:20px;">🍅 Pomodoro timer</div><div class="pomodoro-card"><div class="pomodoro-display" id="pomodoroDisplay">' + String(pomodoroState.minutes).padStart(2,'0') + ':' + String(pomodoroState.seconds).padStart(2,'0') + '</div><div class="pomodoro-presets">' + [15,25,45,60].map(function(m) { return '<button class="pom-preset-btn ' + (pomodoroState.active && pomodoroState.minutes === m && !pomodoroState.running ? 'active' : '') + '" onclick="setPomodoroTime(' + m + ')">' + m + 'm</button>'; }).join('') + '</div><div class="pomodoro-actions">' + (!pomodoroState.active ? '<button class="cta-btn" onclick="togglePomodoro()" style="flex:1;">▶️ Boshlash</button>' : !pomodoroState.running ? '<button class="cta-btn" onclick="startPomodoro()" style="flex:1;">▶️ Davom</button><button class="cta-btn ghost" onclick="resetPomodoro()" style="flex:1;">🔄 Qayta</button><button class="cta-btn ghost" onclick="togglePomodoro()" style="flex:1;">✕ Yopish</button>' : '<button class="cta-btn" onclick="pausePomodoro()" style="flex:1;">⏸️ Pauza</button><button class="cta-btn ghost" onclick="resetPomodoro()" style="flex:1;">🔄 Qayta</button>') + '</div></div>';
    
    // AI suggestions
    html += '<div class="scheduler-section-title" style="margin-top:20px;">🤖 AI tavsiyalari</div><p class="ai-hint">Hozirgi vaqtga asoslangan AI tavsiyalari</p><div class="ai-suggestions">' + suggestions.slice(0,5).map(function(s) { return '<div class="suggestion-card" onclick="addSuggestedTask(\'' + s.title.replace(/'/g, '') + '\',\'' + s.time + '\',\'' + (s.desc || '').replace(/'/g, '') + '\',\'' + (s.cat || 'other') + '\')"><div class="sugg-icon">' + s.title.split(' ')[0] + '</div><div class="sugg-content"><div class="sugg-title">' + s.title + '</div><div class="sugg-desc">' + s.desc + '</div><div class="sugg-time">🕐 ' + s.time + '</div></div><button class="sugg-add">+</button></div>'; }).join('') + '</div>';
    
    // Manage
    html += '<div class="scheduler-section-title" style="margin-top:24px;">⚙️ Boshqarish</div><div class="manage-tasks"><button class="cta-btn ghost" onclick="openTaskManager()" style="margin-bottom:8px;">📋 Barcha vazifalar</button><button class="cta-btn ghost" onclick="showWeeklyPlan()" style="margin-bottom:8px;">📅 Haftalik reja</button><button class="cta-btn ghost" onclick="resetDefaultTasks()">🔄 Standart vazifalarni tiklash</button></div></div>';
    
    el.innerHTML = html;
}

/* ---------- Task Actions ---------- */
function toggleTask(taskId) {
    toggleTaskCompletion(taskId);
    var stats = getTodayStats();
    var taskEl = document.querySelector('.task-item[data-task-id="' + taskId + '"]');
    if (taskEl) { taskEl.classList.toggle('done'); var check = taskEl.querySelector('.task-check'); if (check) check.textContent = isTaskDone(taskId) ? '✓' : '○'; }
    var numEl = document.querySelector('.sched-stat-num');
    if (numEl) numEl.textContent = stats.done + '/' + stats.total;
}

function completeReminder(taskId) {
    toggleTaskCompletion(taskId);
    var taskEl = document.querySelector('.task-item[data-task-id="' + taskId + '"]');
    if (taskEl) { taskEl.classList.add('done'); taskEl.querySelector('.task-check').textContent = '✓'; }
    renderAIScheduler('aiSchedulerContainer');
    schedulerToast('✅', 'Vazifa bajarildi!');
}

function moveTask(taskId, direction) {
    var idx = taskSchedule.findIndex(function(t) { return t.id === taskId; });
    if (idx === -1) return;
    var newIdx = idx + direction;
    if (newIdx < 0 || newIdx >= taskSchedule.length) return;
    var temp = taskSchedule[idx]; taskSchedule[idx] = taskSchedule[newIdx]; taskSchedule[newIdx] = temp;
    saveTasks();
    renderAIScheduler('aiSchedulerContainer');
}

function showAddTaskForm() {
    var form = document.getElementById('addTaskForm');
    if (form) { form.style.display = 'block'; document.getElementById('newTaskTime').value = new Date().toTimeString().slice(0, 5); form.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
}

function cancelAddTask() { var form = document.getElementById('addTaskForm'); if (form) form.style.display = 'none'; }

function saveNewTask() {
    var title = document.getElementById('newTaskTitle').value.trim();
    var time = document.getElementById('newTaskTime').value;
    var desc = document.getElementById('newTaskDesc').value.trim();
    var cat = (document.getElementById('newTaskCat') && document.getElementById('newTaskCat').value) || 'other';
    if (!title || !time) { alert('Iltimos, vazifa nomi va vaqtini kiriting!'); return; }
    addManualTask(title, time, [1,2,3,4,5,6,0], desc, cat);
    document.getElementById('newTaskTitle').value = ''; document.getElementById('newTaskDesc').value = '';
    cancelAddTask();
    renderAIScheduler('aiSchedulerContainer');
    schedulerToast('✅', 'Vazifa qo\'shildi!');
}

function addSuggestedTask(title, time, desc, cat) {
    addManualTask(title, time, [1,2,3,4,5,6,0], desc, cat || 'other');
    renderAIScheduler('aiSchedulerContainer');
    schedulerToast('✅', 'AI tavsiyasi qo\'shildi!');
}

function deleteTask(taskId) {
    if (!confirm('Bu vazifani o\'chirishni tasdiqlaysizmi?')) return;
    taskSchedule = taskSchedule.filter(function(t) { return t.id !== taskId; });
    saveTasks();
    renderAIScheduler('aiSchedulerContainer');
}

function editTask(taskId) {
    var task = taskSchedule.find(function(t) { return t.id === taskId; });
    if (!task) return;
    var form = document.getElementById('addTaskForm');
    form.style.display = 'block';
    document.getElementById('newTaskTitle').value = task.title;
    document.getElementById('newTaskTime').value = task.time;
    document.getElementById('newTaskDesc').value = task.desc || '';
    var catSelect = document.getElementById('newTaskCat');
    if (catSelect) catSelect.value = task.cat || 'other';
    taskSchedule = taskSchedule.filter(function(t) { return t.id !== taskId; });
    saveTasks();
    form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ---------- Weekly Plan Modal ---------- */
function showWeeklyPlan() {
    var dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    var today = getDayIndex();
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:1000;display:flex;align-items:center;justify-content:center;';
    var html = '<div style="background:var(--surface);border-radius:20px;padding:24px;width:92%;max-width:420px;max-height:80vh;overflow-y:auto;position:relative;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h3 style="font-size:17px;">📅 Haftalik reja</h3><button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button></div>';
    dayNames.forEach(function(d, dayIdx) {
        var dayTasks = taskSchedule.filter(function(t) { return t.active && t.days.includes(dayIdx); }).sort(function(a,b) { return a.time.localeCompare(b.time); });
        var isToday = dayIdx === today;
        html += '<div style="margin-bottom:12px;' + (isToday ? 'background:var(--surface-2);border-radius:12px;padding:10px;border:2px solid var(--green);' : '') + '"><div style="font-weight:700;font-size:13px;margin-bottom:6px;' + (isToday ? 'color:var(--green);' : '') + '">' + (isToday ? '📍 ' : '') + d + ' (' + dayTasks.length + ')</div>' + (dayTasks.length === 0 ? '<div style="font-size:11px;color:var(--ink-soft);padding:4px 0;">Vazifalar yo\'q</div>' : dayTasks.map(function(t) { return '<div style="display:flex;justify-content:space-between;font-size:12px;padding:4px 0;border-bottom:1px solid var(--line);"><span>' + t.title + '</span><span style="color:var(--ink-soft);">' + t.time + '</span></div>'; }).join('')) + '</div>';
    });
    html += '</div>';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
}

/* ---------- Task Manager (Improved) ---------- */
function openTaskManager() {
    var dayNames = ['Ya', 'Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh'];
    var overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:1000;display:flex;align-items:center;justify-content:center;';
    var html = '<div style="background:var(--surface);border-radius:20px;padding:24px;width:92%;max-width:420px;max-height:80vh;overflow-y:auto;position:relative;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;"><h3 style="font-size:17px;">📋 Barcha vazifalar</h3><button onclick="this.parentElement.parentElement.parentElement.remove()" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button></div><p style="font-size:12px;color:var(--ink-soft);margin-bottom:12px;">Vazifani yoqish/o\'chirish uchun kunlarni bosing</p>';
    taskSchedule.forEach(function(t) {
        var dayCheckboxes = dayNames.map(function(d, i) {
            return '<label style="font-size:11px;display:flex;flex-direction:column;align-items:center;gap:1px;cursor:pointer;padding:4px 2px;border-radius:6px;' + (t.days.includes(i) ? 'background:var(--green);color:#fff;' : 'background:var(--surface-2);') + '"><input type="checkbox" class="day-cb" data-task-id="' + t.id + '" data-day="' + i + '" ' + (t.days.includes(i) ? 'checked' : '') + ' onchange="updateTaskDays(\'' + t.id + '\',' + i + ',this.checked)" style="display:none;"><span style="font-size:10px;font-weight:700;">' + d + '</span></label>';
        }).join('');
        var catIcon = CAT_ICONS[t.cat] || '📌';
        html += '<div style="background:var(--surface-2);border-radius:12px;padding:12px;margin-bottom:10px;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;"><span style="font-weight:600;font-size:13px;">' + catIcon + ' ' + t.title + '</span><span style="font-size:12px;color:var(--ink-soft);">🕐 ' + t.time + '</span></div><div style="display:flex;gap:4px;flex-wrap:wrap;">' + dayCheckboxes + '</div>' + (t.desc ? '<div style="font-size:11px;color:var(--ink-soft);margin-top:6px;">' + t.desc + '</div>' : '') + '<div style="margin-top:8px;"><button onclick="deleteTask(\'' + t.id + '\');this.parentElement.parentElement.parentElement.parentElement.remove();openTaskManager();" style="background:var(--danger);color:#fff;border:none;padding:4px 12px;border-radius:8px;font-size:11px;cursor:pointer;">🗑 O\'chirish</button></div></div>';
    });
    html += '</div>';
    overlay.innerHTML = html;
    document.body.appendChild(overlay);
}

function updateTaskDays(taskId, dayIndex, checked) {
    var task = taskSchedule.find(function(t) { return t.id === taskId; });
    if (!task) return;
    if (checked && !task.days.includes(dayIndex)) { task.days.push(dayIndex); task.days.sort(); }
    else if (!checked) { task.days = task.days.filter(function(d) { return d !== dayIndex; }); }
    saveTasks();
}

function resetDefaultTasks() {
    if (!confirm('Barcha vazifalarni standart holatga qaytarishni tasdiqlaysizmi?')) return;
    taskSchedule = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    taskHistory = [];
    saveTasks(); saveTaskHistory();
    renderAIScheduler('aiSchedulerContainer');
    schedulerToast('🔄', 'Standart vazifalar tiklandi!');
}

function scrollToTask(taskId) {
    var el = document.querySelector('.task-item[data-task-id="' + taskId + '"]');
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.background = 'var(--surface-2)';
        el.style.borderColor = 'var(--gold)';
        setTimeout(function() { el.style.background = ''; el.style.borderColor = ''; }, 2000);
    }
}

/* ---------- Notification System ---------- */
function checkTaskReminders() {
    var pending = getPendingReminders();
    if (pending.length > 0) {
        var task = pending[0];
        var lastReminder = localStorage.getItem('yolchi_last_reminder');
        var now = Date.now();
        if (!lastReminder || (now - parseInt(lastReminder)) > 5 * 60 * 1000) {
            schedulerToast('🔔', task.title + ' — ' + task.time);
            localStorage.setItem('yolchi_last_reminder', now);
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('YO\'LCHI AI — Eslatma', { body: task.title + ' — ' + task.time });
            }
        }
    }
    var lastRender = localStorage.getItem('yolchi_scheduler_render');
    var now = Date.now();
    if (!lastRender || (now - parseInt(lastRender)) > 60 * 1000) {
        var container = document.getElementById('aiSchedulerContainer');
        if (container && container.offsetParent !== null) { renderAIScheduler('aiSchedulerContainer'); }
        localStorage.setItem('yolchi_scheduler_render', now);
        if (typeof updateHomeSchedulerWidget === 'function') updateHomeSchedulerWidget();
    }
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
}

/* ---------- Initialize ---------- */
var schedulerInitialized = false;

function initAIScheduler(containerId) {
    if (schedulerInitialized) { renderAIScheduler(containerId); return; }
    schedulerInitialized = true;
    renderAIScheduler(containerId);
    requestNotificationPermission();
    setInterval(checkTaskReminders, 30000);
    setTimeout(checkTaskReminders, 3000);
    if (typeof updateHomeSchedulerWidget === 'function') updateHomeSchedulerWidget();
}

window.initScheduler = initAIScheduler;
window.renderScheduler = renderAIScheduler;
window.checkReminders = checkTaskReminders;
window.getNextTask = getNextTask;
window.getTodayStats = getTodayStats;
