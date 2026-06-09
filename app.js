let currentRoutine = [];
let examRoutine = [];

document.addEventListener("DOMContentLoaded", () => {
    checkExistingUser();
    requestNotificationPermission();
    
    // ব্যাকগ্রাউন্ড মেকানিক্যাল অ্যানালগ ঘড়ি এবং ডিজিটাল ক্লক সিঙ্ক লুপ
    setInterval(synchronizeMechanicalClock, 1000);
    synchronizeMechanicalClock();
    
    fetchLiveWeather();

    if (document.getElementById("manual-form")) {
        document.getElementById("manual-form").addEventListener("submit", saveManualRoutine);
    }
    if (document.getElementById("exam-form")) {
        document.getElementById("exam-form").addEventListener("submit", saveExamRoutine);
    }
});

// ⏰ মেকানিক্যাল অ্যানালগ ক্লক এবং ডিজিটাল টাইম রিফ্রেশ ইঞ্জিন
function synchronizeMechanicalClock() {
    const now = new Date();
    
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    // কাঁটার অবস্থান হিসাব করার নিখুঁত গাণিতিক সমীকরণ (Degrees Calculation)
    const secondDegrees = ((seconds / 60) * 360);
    const minuteDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6);
    const hourDegrees = ((hours / 12) * 360) + ((minutes / 60) * 30);

    // DOM নোডে মেকানিক্যাল সুইং রেন্ডারিং
    document.getElementById("clock-second").style.transform = `rotate(${secondDegrees}deg)`;
    document.getElementById("clock-minute").style.transform = `rotate(${minuteDegrees}deg)`;
    document.getElementById("clock-hour").style.transform = `rotate(${hourDegrees}deg)`;

    // ডিজিটাল ডিসপ্লে ব্যাকআপ টেক্সট ফরম্যাটিং
    let ampm = hours >= 12 ? 'PM' : 'AM';
    let displayHours = hours % 12 || 12;
    let displayMinutes = minutes < 10 ? '0' + minutes : minutes;
    let displaySeconds = seconds < 10 ? '0' + seconds : seconds;
    displayHours = displayHours < 10 ? '0' + displayHours : displayHours;

    document.getElementById("digital-clock").innerText = `${displayHours}:${displayMinutes}:${displaySeconds} ${ampm}`;
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("live-date").innerText = now.toLocaleDateString('en-US', options);
}

// ওపెನ್ মেটিও লাইভ ক্লাউড ও ওয়েদার ট্র্যাকার
function fetchLiveWeather() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            try {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                const data = await response.json();
                if(data && data.current_weather) {
                    document.getElementById("weather-box").innerHTML = `
                        <div class="weather-hud-card">
                            <span class="hud-temp">${data.current_weather.temperature}°C</span>
                            <span class="hud-status">💨 Wind: ${data.current_weather.windspeed} km/h</span>
                        </div>`;
                }
            } catch (e) {
                document.getElementById("weather-box").innerHTML = "🌤️ Environment Normal";
            }
        }, () => {
            document.getElementById("weather-box").innerHTML = "📍 GPS Signal Off";
        });
    }
}

// 🎨 ইন্টেলিজেন্ট ডিপার্টমেন্ট থিম ইঞ্জিন (Set Specific UI Accents based on your Course Selection)
function executeDynamicThemeBinding(program) {
    const body = document.body;
    
    // ১. Science & Engineering ট্র্যাকসমূহ (যেমন: CSE হলে ম্যাট্রিক্স সাইবার গ্রিন থিম)
    const scienceTracks = [
        "CSE", "SWE", "EEE", "CE", "ME", "IPE", "TE", "Architecture", 
        "Pharmacy", "Biochemistry", "Microbiology", "BSc Physics", 
        "BSc Chemistry", "BSc Math", "Statistics", "GEB", "Environmental Science",
        "College Science", "School Science"
    ];
    
    // ২. Commerce & Business Administration ট্র্যাকসমূহ (এক্সিকিউটিভ অ্যাম্বার গোল্ড থিম)
    const commerceTracks = [
        "BBA", "Accounting", "Finance", "Marketing", "HRM", "Management", 
        "International Business", "MIS", "THM", "College Commerce", "School Commerce"
    ];
    
    // ৩. Arts, Law & Social Science ট্র্যাকসমূহ (ডিপ ভাইব্রেন্ট স্কাই ব্লু থিম)
    const artsTracks = [
        "English", "LLB", "Economics", "Bangla", "Political Science", "IR", 
        "Sociology", "Media Journalism", "Public Administration", "History", 
        "Philosophy", "Fine Arts", "College Arts", "School Arts"
    ];

    if (scienceTracks.includes(program)) {
        body.setAttribute("data-theme", "theme-cse-cyber");
    } else if (commerceTracks.includes(program)) {
        body.setAttribute("data-theme", "theme-commerce-amber");
    } else if (artsTracks.includes(program)) {
        body.setAttribute("data-theme", "theme-arts-sky");
    } else {
        body.setAttribute("data-theme", "theme-default");
    }
}

function showDashboard(inst, program) {
    document.getElementById("onboarding-screen").classList.add("hidden");
    document.getElementById("dashboard-screen").classList.remove("hidden");
    
    // 'Gobindaganj' বা প্রতিষ্ঠানের নাম ক্যাপিটাল করার রুলস এবং 'Project Objective' প্রফেশনাল হেডিং রুলস মেইনটেইন করা
    document.getElementById("display-inst-name").innerText = inst.toUpperCase();
    document.getElementById("display-program").innerText = program;
    
    executeDynamicThemeBinding(program);
    loadRoutine();
    loadExamRoutine();
}

function initializeApp() {
    const instName = document.getElementById("inst-name").value.trim();
    const programName = document.getElementById("dept-program").value;
    if (!instName || !programName) return alert("Please specify both Institution name and program profile!");
    
    localStorage.setItem("instName", instName);
    localStorage.setItem("programName", programName);
    showDashboard(instName, programName);
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
    
    await dispatchNotification(newClass, "class");
    closeModal('manual-modal');
    document.getElementById("manual-form").reset();
    renderRoutine();
}

async function saveExamRoutine(e) {
    e.preventDefault();
    const subject = document.getElementById("e-subject").value.trim();
    const code = document.getElementById("e-code").value.trim();
    const time = document.getElementById("e-time").value;
    const date = document.getElementById("e-date").value;

    const newExam = { id: Date.now() + 5, subject, code, time, date };
    examRoutine.push(newExam);
    localStorage.setItem("examRoutineData", JSON.stringify(examRoutine));
    
    await dispatchNotification(newExam, "exam");
    closeModal('exam-modal');
    document.getElementById("exam-form").reset();
    renderExamRoutine();
}

async function dispatchNotification(item, type) {
    try {
        if (window.Capacitor?.Plugins?.LocalNotifications) {
            const { LocalNotifications } = window.Capacitor.Plugins;
            if(type === "class") {
                const daysMap = { 'sunday': 1, 'monday': 2, 'tuesday': 3, 'wednesday': 4, 'thursday': 5, 'friday': 6, 'saturday': 7 };
                const [hours, minutes] = item.time.split(':').map(Number);
                await LocalNotifications.schedule({
                    notifications: [{
                        id: item.id,
                        title: `⏰ Lecture Session Alert!`,
                        body: `${item.subject} (${item.code}) is scheduled at room: ${item.room}.`,
                        schedule: { on: { weekday: daysMap[item.day.toLowerCase()], hour: hours, minute: minutes }, repeats: true, allowWhileIdle: true },
                        sound: true
                    }]
                });
            } else {
                const [hours, minutes] = item.time.split(':').map(Number);
                const exDate = new Date(item.date);
                exDate.setHours(hours, minutes);
                const alertTime = new Date(exDate.getTime() - (2 * 60 * 60 * 1000)); // ২ ঘণ্টা আগে ব্যাকগ্রাউন্ড রিমাইন্ডার পুশ হবে
                await LocalNotifications.schedule({
                    notifications: [{
                        id: item.id,
                        title: `🚨 Critical Exam Reminder!`,
                        body: `Examination for '${item.subject}' starts in 2 hours.`,
                        schedule: { at: alertTime, allowWhileIdle: true },
                        sound: true
                    }]
                });
            }
        }
    } catch(err){}
}

function renderRoutine() {
    const container = document.getElementById("routine-container");
    container.innerHTML = "";
    if (currentRoutine.length === 0) {
        container.innerHTML = `<div class="empty-state-notice">Your academic list is empty. Commit new schedules using the dashboard buttons.</div>`;
        return;
    }
    currentRoutine.forEach(item => {
        const card = document.createElement("div");
        card.className = "routine-card node-class";
        card.innerHTML = `
            <span class="delete-trigger" onclick="deleteNode(${item.id}, 'class')">✕</span>
            <div class="card-contents">
                <h4>${item.subject}</h4>
                <p class="node-meta">${item.code} | Room: ${item.room} | Instructor: ${item.teacher}</p>
                <div class="badge-day">${item.day}</div>
            </div>
            <div class="node-time-tag">⏰ ${convertTo12Hour(item.time)}</div>`;
        container.appendChild(card);
    });
}

function renderExamRoutine() {
    const container = document.getElementById("exam-container");
    container.innerHTML = "";
    if (examRoutine.length === 0) return;

    const title = document.createElement("h3");
    title.className = "exam-session-title";
    title.innerText = "📝 PROJECT OBJECTIVE: EXAMINATION NODES";
    container.appendChild(title);

    examRoutine.forEach(item => {
        const card = document.createElement("div");
        card.className = "routine-card node-exam";
        card.innerHTML = `
            <span class="delete-trigger" onclick="deleteNode(${item.id}, 'exam')">✕</span>
            <div class="card-contents">
                <h4>${item.subject} (Examination)</h4>
                <p class="node-meta">${item.code} | Date Matrix: <b>${item.date}</b></p>
            </div>
            <div class="node-time-tag exam-accent-tag">⏰ ${convertTo12Hour(item.time)}</div>`;
        container.appendChild(card);
    });
}

async function deleteNode(id, type) {
    if(confirm("Confirm removal of this schedule matrix node?")) {
        try { if(window.Capacitor) await window.Capacitor.Plugins.LocalNotifications.cancel({ notifications: [{ id }] }); } catch(e){}
        if(type === 'class') {
            currentRoutine = currentRoutine.filter(x => x.id !== id);
            localStorage.setItem("routineData", JSON.stringify(currentRoutine));
            renderRoutine();
        } else {
            examRoutine = examRoutine.filter(x => x.id !== id);
            localStorage.setItem("examRoutineData", JSON.stringify(examRoutine));
            renderExamRoutine();
        }
    }
}

function downloadRoutineImage() {
    const area = document.getElementById("routine-capture-area");
    area.classList.add("canvas-export-running");
    const bg = getComputedStyle(document.body).getPropertyValue('--bg-wrapper-core').trim() || "#131a26";
    
    html2canvas(area, { scale: 3, backgroundColor: bg, useCORS: true }).then(canvas => {
        const lnk = document.createElement("a");
        lnk.download = `Routine_Manifest_${localStorage.getItem("programName")}.jpg`;
        lnk.href = canvas.toDataURL("image/jpeg", 0.98);
        lnk.click();
        area.classList.remove("canvas-export-running");
    });
}

function loadRoutine() { const s = localStorage.getItem("routineData"); if(s) { currentRoutine = JSON.parse(s); renderRoutine(); } }
function loadExamRoutine() { const s = localStorage.getItem("examRoutineData"); if(s) { examRoutine = JSON.parse(s); renderExamRoutine(); } }
function convertTo12Hour(t) { let [h, m] = t.split(':'); let ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${m} ${ampm}`; }
function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }
function checkExistingUser() { const i = localStorage.getItem("instName"), p = localStorage.getItem("programName"); if(i && p) showDashboard(i, p); }
function requestNotificationPermission() { try { window.Capacitor?.Plugins?.LocalNotifications?.requestPermissions(); } catch(e){} }
function resetApp() { if(confirm("Wipe configuration storage and clear active runtime session?")) { localStorage.clear(); location.reload(); } }
