let currentRoutine = [];
let examRoutine = [];

document.addEventListener("DOMContentLoaded", () => {
    checkExistingUser();
    requestNotificationPermission();
    
    setInterval(updateSmartClock, 1000);
    updateSmartClock();
    
    fetchLiveWeather();

    if (document.getElementById("manual-form")) {
        document.getElementById("manual-form").addEventListener("submit", saveManualRoutine);
    }
    if (document.getElementById("exam-form")) {
        document.getElementById("exam-form").addEventListener("submit", saveExamRoutine);
    }
});

function updateSmartClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    document.getElementById("digital-clock").innerText = `${hours}:${minutes}:${seconds} ${ampm}`;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("live-date").innerText = now.toLocaleDateString('en-US', options);
}

function fetchLiveWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            try {
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                const data = await response.json();
                if(data && data.current_weather) {
                    const temp = data.current_weather.temperature;
                    const wind = data.current_weather.windspeed;
                    document.getElementById("weather-box").innerHTML = `
                        <div class="weather-card">
                            <span class="weather-icon">🌡️</span>
                            <div class="weather-details">
                                <span class="temp-text">${temp}°C</span>
                                <span class="wind-text">💨 ${wind} km/h</span>
                            </div>
                        </div>
                    `;
                }
            } catch (err) {
                document.getElementById("weather-box").innerHTML = "<p class='w-err'>🌤️ Offline</p>";
            }
        }, () => {
            document.getElementById("weather-box").innerHTML = "<p class='w-err'>📍 Blocked</p>";
        });
    }
}

// ⭐ ডায়নামিক এডভান্সড থিম ম্যাপিং ইঞ্জিন
function applyCourseTheme(program) {
    const body = document.body;
    
    // ১. Science গ্রপসমূহ (Emerald Accent)
    const scienceList = ["CSE", "SWE", "EEE", "Civil", "Mechanical", "Textile", "BSc Physics", "BSc Chemistry", "BSc Math", "College Science", "School Science"];
    
    // ২. Commerce গ্রপসমূহ (Amber Accent)
    const commerceList = ["BBA", "MBA", "Accounting", "Finance", "Management", "Marketing", "College Commerce", "School Commerce"];
    
    // ৩. Arts গ্রপসমূহ (Sky Blue Accent)
    const artsList = ["English", "Bangla", "LLB", "Economics", "Sociology", "Political Science", "Journalism", "College Arts", "School Arts"];

    if (scienceList.includes(program)) {
        body.setAttribute("data-theme", "cyber-emerald");
    } else if (commerceList.includes(program)) {
        body.setAttribute("data-theme", "atomic-amber");
    } else if (artsList.includes(program)) {
        body.setAttribute("data-theme", "fusion-sky");
    }
}

function showDashboard(inst, program) {
    document.getElementById("onboarding-screen").classList.add("hidden");
    document.getElementById("dashboard-screen").classList.remove("hidden");
    
    // নির্দিষ্ট রুলস মেইনটেইন করে প্রফেশনাল হেডিং ডিসপ্লে করা
    document.getElementById("display-inst-name").innerText = inst.toUpperCase();
    document.getElementById("display-program").innerText = program;
    
    applyCourseTheme(program);
    loadRoutine();
    loadExamRoutine();
}

function initializeApp() {
    const instName = document.getElementById("inst-name").value.trim();
    const programName = document.getElementById("dept-program").value;
    if (!instName) return alert("Please specify your Institution Name.");
    
    localStorage.setItem("instName", instName);
    localStorage.setItem("programName", programName);
    showDashboard(instName, programName);
}

function downloadRoutineImage() {
    const area = document.getElementById("routine-capture-area");
    area.classList.add("exporting-active");
    
    const computedBg = getComputedStyle(document.body).getPropertyValue('--bg-canvas').trim() || "#0b0f19";
    
    html2canvas(area, {
        scale: 3, 
        backgroundColor: computedBg,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imageLink = document.createElement("a");
        imageLink.download = `Routine_Canvas_${localStorage.getItem("programName")}.jpg`;
        imageLink.href = canvas.toDataURL("image/jpeg", 0.95);
        imageLink.click();
        area.classList.remove("exporting-active");
    });
}

async function saveManualRoutine(e) {
    e.preventDefault();
    const subject = document.getElementById("m-subject").value.trim();
    const code = document.getElementById("m-code").value.trim();
    const teacher = document.getElementById("m-teacher").value.trim() || "N/A";
    const room = document.getElementById("m-room").value.trim() || "N/A";
    const time = document.getElementById("m-time").value;
    const day = document.getElementById("m-day").value;

    const newClass = { id: Date.now(), subject, code, teacher, room, time, day };
    currentRoutine.push(newClass);
    localStorage.setItem("routineData", JSON.stringify(currentRoutine));
    
    await scheduleRoutineNotification(newClass);
    closeModal('manual-modal');
    document.getElementById("manual-form").reset();
    renderRoutine();
}

async function scheduleRoutineNotification(classItem) {
    try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
            const daysMap = { 'sunday': 1, 'monday': 2, 'tuesday': 3, 'wednesday': 4, 'thursday': 5, 'friday': 6, 'saturday': 7 };
            const [hours, minutes] = classItem.time.split(':').map(Number);
            await window.Capacitor.Plugins.LocalNotifications.schedule({
                notifications: [{
                    id: classItem.id,
                    title: `⏰ Lecture Starting!`,
                    body: `${classItem.subject} (${classItem.code}) is scheduled at venue: ${classItem.room}.`,
                    schedule: { on: { weekday: daysMap[classItem.day.toLowerCase()], hour: hours, minute: minutes }, repeats: true, allowWhileIdle: true },
                    sound: true
                }]
            });
        }
    } catch(e){}
}

async function saveExamRoutine(e) {
    e.preventDefault();
    const subject = document.getElementById("e-subject").value.trim();
    const code = document.getElementById("e-code").value.trim();
    const time = document.getElementById("e-time").value;
    const date = document.getElementById("e-date").value;

    const newExam = { id: Date.now() + 1, subject, code, time, date };
    examRoutine.push(newExam);
    localStorage.setItem("examRoutineData", JSON.stringify(examRoutine));
    
    await scheduleExamNotification(newExam);
    closeModal('exam-modal');
    document.getElementById("exam-form").reset();
    renderExamRoutine();
}

async function scheduleExamNotification(exam) {
    try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
            const [hours, minutes] = exam.time.split(':').map(Number);
            const examDate = new Date(exam.date);
            examDate.setHours(hours, minutes);
            const alertTime = new Date(examDate.getTime() - (2 * 60 * 60 * 1000)); // ২ ঘণ্টা আগে এলার্ট

            await window.Capacitor.Plugins.LocalNotifications.schedule({
                notifications: [{
                    id: exam.id,
                    title: `🚨 Upcoming Examination Alert!`,
                    body: `Your schedule for '${exam.subject}' begins at ${convertTo12Hour(exam.time)}.`,
                    schedule: { at: alertTime, allowWhileIdle: true },
                    sound: true
                }]
            });
        }
    } catch (e) {}
}

function loadRoutine() {
    const stored = localStorage.getItem("routineData");
    if (stored) { currentRoutine = JSON.parse(stored); renderRoutine(); }
}

function loadExamRoutine() {
    const stored = localStorage.getItem("examRoutineData");
    if (stored) { examRoutine = JSON.parse(stored); renderExamRoutine(); }
}

function renderRoutine() {
    const container = document.getElementById("routine-container");
    container.innerHTML = "";
    if (currentRoutine.length === 0) return;

    const div = document.createElement("div");
    div.innerHTML = `<h2 class="section-title">📅 Academic Schedule</h2>`;
    
    currentRoutine.forEach(item => {
        const card = document.createElement("div");
        card.className = "routine-card style-class";
        card.innerHTML = `
            <span class="delete-icon" onclick="deleteClass(${item.id})">✕</span>
            <div class="card-body">
                <h3>${item.subject}</h3>
                <span class="sub-code">${item.code}</span>
                <div class="meta-info">
                    <span>👨‍🏫 Instructor: <b>${item.teacher}</b></span>
                    <span>🚪 Room/Lab: <b>${item.room}</b></span>
                    <span>🗓️ Day: <b>${item.day}</b></span>
                </div>
            </div>
            <div class="card-time-tag">⏰ ${convertTo12Hour(item.time)}</div>
        `;
        div.appendChild(card);
    });
    container.appendChild(div);
}

function renderExamRoutine() {
    const container = document.getElementById("exam-container");
    container.innerHTML = "";
    if (examRoutine.length === 0) return;

    const div = document.createElement("div");
    div.innerHTML = `<h2 class="section-title title-exam-accent">📝 Examination Timeline</h2>`;
    
    examRoutine.forEach(item => {
        const card = document.createElement("div");
        card.className = "routine-card style-exam";
        card.innerHTML = `
            <span class="delete-icon" onclick="deleteExam(${item.id})">✕</span>
            <div class="card-body">
                <h3>${item.subject}</h3>
                <span class="sub-code exam-code-badge">${item.code}</span>
                <div class="meta-info">
                    <span style="color:#f59e0b">📅 Date: <b>${item.date}</b></span>
                </div>
            </div>
            <div class="card-time-tag exam-time-tag">⏰ ${convertTo12Hour(item.time)}</div>
        `;
        div.appendChild(card);
    });
    container.appendChild(div);
}

async function deleteClass(id) {
    if (confirm("Remove this entry?")) {
        try { if(window.Capacitor) await window.Capacitor.Plugins.LocalNotifications.cancel({ notifications: [{ id }] }); } catch(e){}
        currentRoutine = currentRoutine.filter(item => item.id !== id);
        localStorage.setItem("routineData", JSON.stringify(currentRoutine));
        renderRoutine();
    }
}

async function deleteExam(id) {
    if (confirm("Remove this exam timeline?")) {
        try { if(window.Capacitor) await window.Capacitor.Plugins.LocalNotifications.cancel({ notifications: [{ id }] }); } catch(e){}
        examRoutine = examRoutine.filter(item => item.id !== id);
        localStorage.setItem("examRoutineData", JSON.stringify(examRoutine));
        renderExamRoutine();
    }
}

function convertTo12Hour(timeString) {
    let [hours, minutes] = timeString.split(':');
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }

function requestNotificationPermission() {
    try { if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) { window.Capacitor.Plugins.LocalNotifications.requestPermissions(); } } catch (e) {}
}

function resetApp() {
    if (confirm("Wipe workspace clean? All configurations will be lost.")) {
        try { if(window.Capacitor) window.Capacitor.Plugins.LocalNotifications.clear(); } catch(e){}
        localStorage.clear();
        location.reload();
    }
}
