/* ================= AI KUNLIK VAZIFALARNI REJALASHTIRISH ================= */
/* AI Daily Task Scheduler — learns user patterns and reminds on schedule     */
/* ========================================================================= */

let taskSchedule = JSON.parse(localStorage.getItem('yolchi_tasks')) || [];
let taskHistory = JSON.parse(localStorage.getItem('yolchi_task_history')) || [];

/* ---------- Default daily tasks if none exist ---------- */
const DEFAULT_TASKS = [
    { id: 'task-1', title: '📋 Kunni rejalashtirish', time: '08:00', days: [1,2,3,4,5,6,0], active: true, desc: 'Bugungi muhim ishlarni belgilang' },
    { id: 'task-2', title: '☀️ Tonggi sport', time: '06:30', days: [1,2,3,4,5,6], active: true, desc: '30 daqiqa yengil mashq' },
    { id: 'task-3', title: '🧘 Meditatsiya', time: '07:00', days: [1,2,3,4,5,6,0], active: true, desc: '10 daqiqa nafas olish mashqi' },
    { id: 'task-4', title: '📚 O\'qish', time: '20:00', days: [1,2,3,4,5,6,0], active: true, desc: '30 daqiqa kitob o\'qish' },
    { id: 'task-5', title: '📝 Kunlik hisobot', time: '21:00', days: [1,2,3,4,5,6,0], active: true, desc: 'Kun davomida bajarilgan ishlarni yozib borish' }
];

function initTasks() {
    if (taskSchedule.length === 0) {
        taskSchedule = JSON.parse(JSON.stringify(DEFAULT_TASKS));
        saveTasks();
    }
}
initTasks();

function saveTasks() {
    localStorage.setItem('yolchi_tasks', JSON.stringify(taskSchedule));
}
function saveTaskHistory() {
    localStorage.setItem('yolchi_task_history', JSON.stringify(taskHistory));
}

/* Get today's day index (0=Sunday, 1=Monday ... 6=Saturday) */
function getDayIndex() {
    return new Date().getDay();
}

/* Get today's tasks sorted by time */
function getTodayTasks() {
    const today = getDayIndex();
    return taskSchedule
        .filter(t => t.active && t.days.includes(today))
        .sort((a, b) => a.time.localeCompare(b.time));
}

/* Get the next upcoming task */
function getNextTask() {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const todayTasks = getTodayTasks();
    
    for (const task of todayTasks) {
        const [h, m] = task.time.split(':').map(Number);
        const taskMinutes = h * 60 + m;
        if (taskMinutes > currentMinutes) {
            return task;
        }
    }
    return null; // No more tasks today
}

/* Add a new manual task */
function addManualTask(title, time, days, desc) {
    const task = {
        id: 'task-' + Date.now(),
        title: title,
        time: time,
        days: days || [1,2,3,4,5,6,0],
        active: true,
        desc: desc || '',
        manual: true
    };
    taskSchedule.push(task);
    saveTasks();
    return task;
}

/* Toggle task completion status */
function toggleTaskCompletion(taskId) {
    const today = new Date().toISOString().split('T')[0];
    const existing = taskHistory.find(h => h.taskId === taskId && h.date === today);
    if (existing) {
        existing.done = !existing.done;
    } else {
        taskHistory.push({ taskId, date: today, done: true });
    }
    saveTaskHistory();
    return existing ? existing.done : true;
}

/* Check if a task is done today */
function isTaskDone(taskId) {
    const today = new Date().toISOString().split('T')[0];
    const found = taskHistory.find(h => h.taskId === taskId && h.date === today);
    return found ? found.done : false;
}

/* Get completion stats for today */
function getTodayStats() {
    const todayTasks = getTodayTasks();
    const done = todayTasks.filter(t => isTaskDone(t.id)).length;
    return { total: todayTasks.length, done, pct: todayTasks.length > 0 ? Math.round((done / todayTasks.length) * 100) : 0 };
}

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

/* Check if a task time is due or past due */
function isTaskDue(task) {
    if (!task || !task.active) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [h, m] = task.time.split(':').map(Number);
    const taskMinutes = h * 60 + m;
    // Task is due within the last 30 minutes
    return Math.abs(currentMinutes - taskMinutes) <= 30 && !isTaskDone(task.id);
}

/* Get tasks that need reminder now */
function getPendingReminders() {
    const todayTasks = getTodayTasks();
    return todayTasks.filter(t => isTaskDue(t));
}

/* ---------- AI Auto-Planning ---------- */

/* AI generates a full daily plan based on time preferences */
function aiGenerateDailyPlan(userPreferences) {
    const prefs = userPreferences || {};
    const wakeTime = prefs.wakeTime || '06:00';
    const sleepTime = prefs.sleepTime || '23:00';
    const workStart = prefs.workStart || '09:00';
    const workEnd = prefs.workEnd || '18:00';
    const hasSport = prefs.sport !== false;
    const hasReading = prefs.reading !== false;
    
    const plan = [];
    
    // Morning routine
    plan.push({ title: '⏰ Uyg\'onish', time: wakeTime, desc: 'Kunni boshlash vaqti!' });
    if (hasSport) {
        const sportTime = addMinutesToTime(wakeTime, 30);
        plan.push({ title: '🏃 Ertalabki sport', time: sportTime, desc: '30 daqiqa yengil mashq' });
    }
    plan.push({ title: '🥣 Nonushta', time: addMinutesToTime(wakeTime, 60), desc: 'Sog\'lom nonushta' });
    plan.push({ title: '🚿 Tayyorgarlik', time: addMinutesToTime(wakeTime, 90), desc: 'Kunga tayyorgarlik ko\'rish' });
    
    // Work block
    plan.push({ title: '💼 Ish boshlanishi', time: workStart, desc: 'Asosiy ish vaqtiga kirishish' });
    plan.push({ title: '☕ Tanaffus', time: addMinutesToTime(workStart, 90), desc: 'Qisqa kofe-break' });
    
    // Lunch
    const lunchTime = '12:30';
    plan.push({ title: '🍽️ Tushlik', time: lunchTime, desc: 'Dam olish va ovqatlanish' });
    
    // Afternoon
    plan.push({ title: '💻 Ishni davom ettirish', time: '14:00', desc: 'Tushdan keyingi vazifalar' });
    
    // Evening
    if (hasSport) {
        plan.push({ title: '🏋️ Kechki sport', time: '18:00', desc: '1 soatlik mashg\'ulot' });
    }
    
    plan.push({ title: '🍛 Kechki ovqat', time: '19:30', desc: 'Yengil kechki ovqat' });
    
    if (hasReading) {
        plan.push({ title: '📖 O\'qish', time: '20:30', desc: '30 daqiqa kitob' });
    }
    
    plan.push({ title: '📝 Kunlik hisobot', time: addMinutesToTime(sleepTime, -60), desc: 'Kun yakuni bo\'yicha hisobot' });
    plan.push({ title: '😴 Uyquga tayyorgarlik', time: addMinutesToTime(sleepTime, -30), desc: 'Telefon va qurilmalarni chetga qo\'yish' });
    plan.push({ title: '🌜 Uyqu', time: sleepTime, desc: 'Xayrli tun!' });
    
    return plan;
}

function addMinutesToTime(time, minutes) {
    const [h, m] = time.split(':').map(Number);
    const total = h * 60 + m + minutes;
    const newH = Math.floor(total / 60) % 24;
    const newM = total % 60;
    return String(newH).padStart(2, '0') + ':' + String(newM).padStart(2, '0');
}

/* ---------- UI Rendering ---------- */

/* Render the AI scheduler UI in a container */
function renderAIScheduler(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    
    const todayTasks = getTodayTasks();
    const stats = getTodayStats();
    const nextTask = getNextTask();
    const pendingReminders = getPendingReminders();
    const suggestions = aiSuggestTasks();
    const hour = new Date().getHours();
    const timeGreeting = hour < 12 ? '🌅 Xayrli tong!' : hour < 18 ? '☀️ Xayrli kun!' : '🌆 Xayrli kech!';
    
    let html = `
        <div class="ai-scheduler">
            <div class="scheduler-header">
                <div class="scheduler-greeting">${timeGreeting}</div>
                <div class="scheduler-date">${new Date().toLocaleDateString('uz-UZ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
            
            <div class="scheduler-stats">
                <div class="sched-stat">
                    <span class="sched-stat-num">${stats.done}/${stats.total}</span>
                    <span class="sched-stat-lbl">Bajarildi</span>
                </div>
                <div class="sched-stat">
                    <span class="sched-stat-num">${stats.pct}%</span>
                    <span class="sched-stat-lbl">Samaradorlik</span>
                </div>
                <div class="sched-stat">
                    <span class="sched-stat-num">${nextTask ? '🕐' : '✅'}</span>
                    <span class="sched-stat-lbl">${nextTask ? 'Keyingi vazifa' : 'Bugun tugadi'}</span>
                </div>
            </div>
            
            ${nextTask ? `
            <div class="next-task-widget" onclick="scrollToTask('${nextTask.id}')">
                <div class="next-task-label">⌛ Keyingi vazifa</div>
                <div class="next-task-title">${nextTask.title}</div>
                <div class="next-task-time">🕐 ${nextTask.time}</div>
            </div>` : todayTasks.length > 0 && stats.done === stats.total ? `
            <div class="next-task-widget done">
                <div class="next-task-label" style="font-size:24px;">🎉</div>
                <div class="next-task-title">Bugungi barcha vazifalar bajarildi!</div>
            </div>` : ''}
            
            ${pendingReminders.length > 0 ? `
            <div class="reminder-alert">
                <span class="reminder-icon">🔔</span>
                <div class="reminder-text">
                    <strong>${pendingReminders[0].title}</strong> — bajarish vaqti keldi!
                </div>
                <button class="reminder-btn" onclick="completeReminder('${pendingReminders[0].id}')">✅ Bajarildi</button>
            </div>` : ''}
            
            <div class="scheduler-section-title">📋 Bugungi vazifalar</div>
            <div class="task-list" id="taskListToday">
                ${todayTasks.length === 0 ? `
                <div class="empty-tasks">
                    <div class="eic">🎉</div>
                    <p>Bugun uchun vazifalar yo'q. Yangi vazifa qo'shing!</p>
                </div>` : todayTasks.map(t => {
                    const done = isTaskDone(t.id);
                    return `
                    <div class="task-item ${done ? 'done' : ''}" data-task-id="${t.id}">
                        <div class="task-check" onclick="toggleTask('${t.id}')">${done ? '✓' : '○'}</div>
                        <div class="task-content">
                            <div class="task-title">${t.title}</div>
                            <div class="task-time">🕐 ${t.time} ${t.desc ? '· ' + t.desc : ''}</div>
                        </div>
                        <div class="task-actions">
                            <button class="task-edit-btn" onclick="editTask('${t.id}')" title="Tahrirlash">✎</button>
                            <button class="task-del-btn" onclick="deleteTask('${t.id}')" title="O'chirish">✕</button>
                        </div>
                    </div>`;
                }).join('')}
            </div>
            
            <button class="cta-btn add-task-btn" onclick="showAddTaskForm()">➕ Yangi vazifa qo'shish</button>
            
            <div id="addTaskForm" style="display:none;margin-top:16px;">
                <input id="newTaskTitle" placeholder="Vazifa nomi" style="width:100%;padding:12px;margin-bottom:10px;border-radius:12px;border:1px solid var(--line);background:var(--surface);font-size:14px;">
                <input id="newTaskTime" type="time" style="width:100%;padding:12px;margin-bottom:10px;border-radius:12px;border:1px solid var(--line);background:var(--surface);font-size:14px;">
                <input id="newTaskDesc" placeholder="Tavsif (ixtiyoriy)" style="width:100%;padding:12px;margin-bottom:10px;border-radius:12px;border:1px solid var(--line);background:var(--surface);font-size:14px;">
                <div style="display:flex;gap:10px;">
                    <button class="cta-btn" onclick="saveNewTask()" style="flex:1;">💾 Saqlash</button>
                    <button class="cta-btn ghost" onclick="cancelAddTask()" style="flex:1;">✕ Bekor qilish</button>
                </div>
            </div>
            
            <div class="scheduler-section-title" style="margin-top:24px;">🤖 AI tavsiyalari</div>
            <p class="ai-hint">Hozirgi vaqtga asoslangan AI tavsiyalari</p>
            <div class="ai-suggestions">
                ${suggestions.slice(0, 4).map(s => `
                <div class="suggestion-card" onclick="addSuggestedTask('${s.title.replace(/'/g, "\\'")}', '${s.time}', '${s.desc.replace(/'/g, "\\'")}')">
                    <div class="sugg-icon">${s.title.split(' ')[0]}</div>
                    <div class="sugg-content">
                        <div class="sugg-title">${s.title}</div>
                        <div class="sugg-desc">${s.desc}</div>
                        <div class="sugg-time">🕐 ${s.time}</div>
                    </div>
                    <button class="sugg-add">+</button>
                </div>`).join('')}
            </div>
            
            <div class="scheduler-section-title" style="margin-top:24px;">⚙️ Vazifalarni boshqarish</div>
            <div class="manage-tasks">
                <button class="cta-btn ghost" onclick="openTaskManager()" style="margin-bottom:10px;">📋 Barcha vazifalar</button>
                <button class="cta-btn ghost" onclick="resetDefaultTasks()">🔄 Standart vazifalarni tiklash</button>
            </div>
        </div>
    `;
    
    el.innerHTML = html;
}

/* Toggle a task's completion for today */
function toggleTask(taskId) {
    toggleTaskCompletion(taskId);
    const stats = getTodayStats();
    // Update just the task item
    const taskEl = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
    if (taskEl) {
        taskEl.classList.toggle('done');
        const check = taskEl.querySelector('.task-check');
        if (check) {
            check.textContent = isTaskDone(taskId) ? '✓' : '○';
        }
    }
    // Update stats
    const statsEl = document.querySelector('.scheduler-stats');
    if (statsEl) {
        const numEl = statsEl.querySelector('.sched-stat-num');
        if (numEl) numEl.textContent = `${stats.done}/${stats.total}`;
    }
}

/* Complete a reminder and open today's tasks */
function completeReminder(taskId) {
    toggleTaskCompletion(taskId);
    const taskEl = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
    if (taskEl) {
        taskEl.classList.add('done');
        taskEl.querySelector('.task-check').textContent = '✓';
    }
    // Re-render to remove reminder alert
    renderAIScheduler('aiSchedulerContainer');
}

/* Show add task form */
function showAddTaskForm() {
    document.getElementById('addTaskForm').style.display = 'block';
    document.getElementById('newTaskTime').value = new Date().toTimeString().slice(0, 5);
}

function cancelAddTask() {
    document.getElementById('addTaskForm').style.display = 'none';
}

function saveNewTask() {
    const title = document.getElementById('newTaskTitle').value.trim();
    const time = document.getElementById('newTaskTime').value;
    const desc = document.getElementById('newTaskDesc').value.trim();
    if (!title || !time) {
        alert("Iltimos, vazifa nomi va vaqtini kiriting!");
        return;
    }
    addManualTask(title, time, [1,2,3,4,5,6,0], desc);
    document.getElementById('newTaskTitle').value = '';
    document.getElementById('newTaskDesc').value = '';
    cancelAddTask();
    renderAIScheduler('aiSchedulerContainer');
    showToast('✅', 'Vazifa qo\'shildi!');
}

/* Add a suggested task from AI */
function addSuggestedTask(title, time, desc) {
    addManualTask(title, time, [1,2,3,4,5,6,0], desc);
    renderAIScheduler('aiSchedulerContainer');
    showToast('✅', 'AI tavsiyasi qo\'shildi!');
}

/* Delete a task */
function deleteTask(taskId) {
    if (!confirm("Bu vazifani o'chirishni tasdiqlaysizmi?")) return;
    taskSchedule = taskSchedule.filter(t => t.id !== taskId);
    saveTasks();
    renderAIScheduler('aiSchedulerContainer');
}

/* Edit a task - simplified: just re-add */
function editTask(taskId) {
    const task = taskSchedule.find(t => t.id === taskId);
    if (!task) return;
    
    // Show form pre-filled
    const form = document.getElementById('addTaskForm');
    form.style.display = 'block';
    document.getElementById('newTaskTitle').value = task.title;
    document.getElementById('newTaskTime').value = task.time;
    document.getElementById('newTaskDesc').value = task.desc || '';
    
    // Delete old task - will be replaced on save
    taskSchedule = taskSchedule.filter(t => t.id !== taskId);
    saveTasks();
}

/* Open task manager - full task list for editing days */
function openTaskManager() {
    const currentScreen = document.querySelector('.screen.active');
    const managerOverlay = document.createElement('div');
    managerOverlay.className = 'task-manager-overlay';
    managerOverlay.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);z-index:1000;display:flex;align-items:center;justify-content:center;';
    
    const dayNames = ['Yakshanba', 'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba'];
    
    let html = `
        <div style="background:var(--surface);border-radius:20px;padding:24px;width:90%;max-width:400px;max-height:80vh;overflow-y:auto;position:relative;">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
                <h3 style="font-size:17px;">📋 Barcha vazifalar</h3>
                <button onclick="this.closest('.task-manager-overlay').remove()" style="background:none;border:none;font-size:20px;cursor:pointer;">✕</button>
            </div>
            ${taskSchedule.map(t => {
                const dayCheckboxes = dayNames.map((d, i) => 
                    `<label style="font-size:11px;display:flex;align-items:center;gap:2px;cursor:pointer;">
                        <input type="checkbox" class="day-cb" data-task-id="${t.id}" data-day="${i}" ${t.days.includes(i) ? 'checked' : ''} 
                            onchange="updateTaskDays('${t.id}', ${i}, this.checked)">
                        ${d.slice(0, 2)}
                    </label>`
                ).join('');
                return `
                <div style="background:var(--surface-2);border-radius:12px;padding:12px;margin-bottom:10px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                        <span style="font-weight:600;font-size:13px;">${t.title}</span>
                        <span style="font-size:12px;color:var(--ink-soft);">🕐 ${t.time}</span>
                    </div>
                    <div style="display:flex;gap:4px;flex-wrap:wrap;">
                        ${dayCheckboxes}
                    </div>
                </div>`;
            }).join('')}
        </div>
    `;
    
    managerOverlay.innerHTML = html;
    document.body.appendChild(managerOverlay);
}

/* Update which days a task is active */
function updateTaskDays(taskId, dayIndex, checked) {
    const task = taskSchedule.find(t => t.id === taskId);
    if (!task) return;
    if (checked && !task.days.includes(dayIndex)) {
        task.days.push(dayIndex);
        task.days.sort();
    } else if (!checked) {
        task.days = task.days.filter(d => d !== dayIndex);
    }
    saveTasks();
}

/* Reset to default tasks */
function resetDefaultTasks() {
    if (!confirm("Barcha vazifalarni standart holatga qaytarishni tasdiqlaysizmi? Sizning vazifalaringiz o'chib ketadi.")) return;
    taskSchedule = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    taskHistory = [];
    saveTasks();
    saveTaskHistory();
    renderAIScheduler('aiSchedulerContainer');
    showToast('🔄', 'Standart vazifalar tiklandi!');
}

/* Scroll to a specific task */
function scrollToTask(taskId) {
    const el = document.querySelector(`.task-item[data-task-id="${taskId}"]`);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.style.background = 'var(--surface-2)';
        setTimeout(() => { el.style.background = ''; }, 2000);
    }
}

/* ---------- Notification System ---------- */

/* Check for due tasks and remind (call every minute from a setInterval in the main app) */
function checkTaskReminders() {
    const pending = getPendingReminders();
    if (pending.length > 0) {
        const task = pending[0];
        // Only show reminder if not already shown in last 5 minutes
        const lastReminder = localStorage.getItem('yolchi_last_reminder');
        const now = Date.now();
        if (!lastReminder || (now - parseInt(lastReminder)) > 5 * 60 * 1000) {
            showToast('🔔', `${task.title} — ${task.time}`);
            localStorage.setItem('yolchi_last_reminder', now);
            
            // Also try browser notification if permitted
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('YO\'LCHI AI — Eslatma', {
                    body: `${task.title} — ${task.time}`,
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text y="20" font-size="20">🔔</text></svg>'
                });
            }
        }
    }
    
    // Check if we need to re-render (time-based)
    const lastRender = localStorage.getItem('yolchi_scheduler_render');
    const now = Date.now();
    if (!lastRender || (now - parseInt(lastRender)) > 60 * 1000) {
        const container = document.getElementById('aiSchedulerContainer');
        if (container && container.offsetParent !== null) {
            renderAIScheduler('aiSchedulerContainer');
        }
        localStorage.setItem('yolchi_scheduler_render', now);
        // Also update home widget
        if (typeof updateHomeSchedulerWidget === 'function') {
            updateHomeSchedulerWidget();
        }
    }
}

/* Request notification permission */
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

/* ---------- Initialize AI Scheduler ---------- */
let schedulerInitialized = false;

function initAIScheduler(containerId) {
    if (schedulerInitialized) {
        // Already initialized, just re-render
        renderAIScheduler(containerId);
        return;
    }
    schedulerInitialized = true;
    renderAIScheduler(containerId);
    requestNotificationPermission();
    
    // Check reminders every 30 seconds
    setInterval(checkTaskReminders, 30000);
    
    // Initial check
    setTimeout(checkTaskReminders, 3000);
    
    // Update home widget when scheduler is initialized
    if (typeof updateHomeSchedulerWidget === 'function') {
        updateHomeSchedulerWidget();
    }
}

/* Export functions for use in main app */
window.initScheduler = initAIScheduler;
window.renderScheduler = renderAIScheduler;
window.checkReminders = checkTaskReminders;
