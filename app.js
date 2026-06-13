let currentRoutine = [];
let examRoutine = [];

document.addEventListener("DOMContentLoaded", () => {
    checkExistingUser();
    requestNotificationPermission();
    
    // হাই-পারফরম্যান্স রিয়েল-টাইম বড় সাইজের ডিজিটাল ক্লক ট্র্যাকার ইঞ্জিন থ্রেড
    setInterval(updateSmartClockMatrix, 1000);
    updateSmartClockMatrix();
    
    // জিপিএস ট্র্যাক করে গ্লোবাল আবহাওয়া প্যারামিটার কলিং অবজেক্ট
    fetchLiveWeatherMetrics();

    if (document.getElementById("manual-form")) {
        document.getElementById("manual-form").addEventListener("submit", saveManualRoutine);
    }
    if (document.getElementById("exam-form")) {
        document.getElementById("exam-form").addEventListener("submit", saveExamRoutine);
    }
});

// ⏰ ১. বড় ক্লক অবজেক্ট এবং ক্যালেন্ডার ডে-উইক জেনারেটর ইঞ্জিন
function updateSmartClockMatrix() {
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

// 📍 ২. লাইভ লোকেশন বেসড ওয়েদার আপডেট লজিক (Open-Meteo API)
function fetchLiveWeatherMetrics() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
                const data = await res.json();
                if(data && data.current_weather) {
                    const temp = Math.round(data.current_weather.temperature);
                    const wind = data.current_weather.windspeed;
                    document.getElementById("weather-box").innerHTML = `
                        <div class="live-weather-card">
                            <span class="weather-icon-pulsar">🌤️</span>
                            <div class="weather-meta-data">
                                <span class="temp-display">${temp}°C</span>
                                <span class="wind-display">Wind: ${wind} km/h</span>
                            </div>
                        </div>`;
                }
            } catch (err) {
                document.getElementById("weather-box").innerHTML = "<p>🌤️ Weather System Offline</p>";
            }
        }, () => {
            document.getElementById("weather-box").innerHTML = "<p>📍 Location Stream Blocked</p>";
        });
    }
}

// 🎨 ৩. কোর্স বা সাবজেক্টের নাম অনুযায়ী গুগল/আনস্প্ল্যাশ সোর্স ইন্টিগ্রেটেড ডাইনামিক ব্যাকগ্রাউন্ড থিমিং ভাইব ইঞ্জিন
function injectAdaptiveCourseThemeVibe(program) {
    const body = document.body;
    
    // টেক এবং ইঞ্জিনিয়ারিং ওরিয়েন্টেড কোর্স পুল
    if (["CSE", "SWE", "EEE", "CE", "ME", "Science"].includes(program)) {
        body.setAttribute("data-theme", "theme-tech-matrix");
        if (program === "CSE" || program === "SWE") {
            // Google Source Code Programming Stack Vector Image Background
            body.style.backgroundImage = "url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1470&auto=format&fit=crop')";
        } else {
            // Hardware Circuit Processing Electronics Blue Grid Vector Background
            body.style.backgroundImage = "url('https://images.unsplash.com/photo-1517420784566-f56f34e8ce4a?q=80&w=1470&auto=format&fit=crop')";
        }
    } 
    // বিজনেস এডমিনিস্ট্রেশন ও কমার্স কোর্স পুল
    else if (["BBA", "Accounting", "Finance", "Commerce"].includes(program)) {
        body.setAttribute("data-theme", "theme-commerce-amber");
        // Corporate Glass Towers FinTech Real-Estate Background
        body.style.backgroundImage = "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1470&auto=format&fit=crop')";
    } 
    // আর্টস, লিটারেচার ও ল' কোর্স পুল
    else if (["English", "LLB", "Bangla", "Arts"].includes(program)) {
        body.setAttribute("data-theme", "theme-arts-literature");
        // Vintage Gothic Library Books Academic Architecture Background
        body.style.backgroundImage = "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1470&auto=format&fit=crop')";
    } 
    else {
        body.setAttribute("data-theme", "theme-default");
        body.style.backgroundImage = "none";
    }
}

// 📊 ৪. আপনার দেওয়া ইমেজের মতো টাইমলাইন অনুযায়ী ক্লাসের হাই-ফিডেলিটি গ্রিড রেন্ডারিং ইঞ্জিন
function renderStructuredGridTimetable() {
    const tableBody = document.getElementById("grid-timetable-body");
    tableBody.innerHTML = "";

    if (currentRoutine.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" class="empty-notice-row">Timetable vacant. Add a manual class slot map above.</td></tr>`;
        return;
    }

    // টাইম স্লট অনুযায়ী ক্রোনোলজিক্যাল সর্টিং প্যারামিটার
    const uniqueTimeSlots = [...new Set(currentRoutine.map(item => `${item.startTime} - ${item.endTime}`))].sort();
    const weekdays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    uniqueTimeSlots.forEach(slot => {
        const tr = document.createElement("tr");
        
        // ১ম কলামে টাইমস্ট্যাম্প পুশ
        const [start, end] = slot.split(" - ");
        const tdTime = document.createElement("td");
        tdTime.className = "time-axis-cell";
        tdTime.innerHTML = `<b>${convertTo12Hour(start)}</b>`;
        tr.appendChild(tdTime);

        // সপ্তাহের প্রত্যেক দিনের লুপ চালিয়ে ডাটা ম্যাপিং
        weekdays.forEach(day => {
            const tdDay = document.createElement("td");
            const classMatch = currentRoutine.find(c => `${c.startTime} - ${c.endTime}` === slot && c.day.toLowerCase() === day.toLowerCase());

            if (classMatch) {
                tdDay.className = "occupied-class-cell";
                tdDay.innerHTML = `
                    <div class="grid-card-inner">
                        <span class="cell-delete-btn" onclick="deleteClassNode(${classMatch.id})">✕</span>
                        <div class="cell-course-code">${classMatch.code}</div>
                        <div class="cell-room-ref">${classMatch.teacher} (${classMatch.room})</div>
                        <div class="cell-type-badge">${classMatch.code.toLowerCase().includes('lab') || classMatch.subject.toLowerCase().includes('lab') ? 'LAB' : 'THEORY'}</div>
                        <div class="cell-subject-title">${classMatch.subject}</div>
                    </div>`;
            } else {
                tdDay.className = "blank-slate-cell";
                tdDay.innerText = "—";
            }
            tr.appendChild(tdDay);
        });

        tableBody.appendChild(tr);
    });
}

// 🖼️ ৫. HTML2Canvas প্রিমিয়াম গ্রিড এক্সপোর্ট জেনারেটর এবং কন্টেন্ট রিভিউ প্রিভিউ প্যানেল
function generateRoutineImagePreview() {
    const captureArea = document.getElementById("routine-capture-container");
    const previewSection = document.getElementById("preview-section");
    const previewHolder = document.getElementById("image-preview-holder");
    const downloadAnchor = document.getElementById("download-anchor");

    // এক্সপোর্টিং ফেজে রুটিনের ফন্ট এবং ব্যাকগ্রাউন্ড ভাইব স্টাইলিং এনভায়রনমেন্ট ফোর্স করা
    captureArea.classList.add("canvas-exporting-engine-active");

    html2canvas(captureArea, { 
        scale: 2.5, 
        backgroundColor: null,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const base64ImageUrl = canvas.toDataURL("image/jpeg", 0.98);
        
        // ইমেজ প্রিভিউ হোল্ডারে লাইভ সোর্স ডাটা ইনজেকশন করা
        previewHolder.innerHTML = `<img src="${base64ImageUrl}" alt="Active Stream Render" class="output-rendered-img" />`;
        
        // ডাউনলোড এঙ্করের প্যারামিটার রিফ্যাক্টরিং
        downloadAnchor.href = base64ImageUrl;
        downloadAnchor.download = `Routine_Dashboard_Manifest_${localStorage.getItem("programName") || "Academic"}.jpg`;
        
        // হিডেন ড্যাশবোর্ড প্যানেল আনহাইড করে স্ক্রল অ্যানিমেশন এক্সিকিউট করা
        captureArea.classList.remove("canvas-exporting-engine-active");
        previewSection.classList.remove("hidden");
        previewSection.scrollIntoView({ behavior: 'smooth' });
    });
}

function showDashboard(inst, program) {
    document.getElementById("onboarding-screen").classList.add("hidden");
    document.getElementById("dashboard-screen").classList.remove("hidden");
    
    document.getElementById("display-inst-name").innerText = inst.toUpperCase();
    document.getElementById("display-program").innerText = `DEPT/PROGRAM: ${program}`;

    document.getElementById("canvas-inst-title").innerText = inst.toUpperCase();
    document.getElementById("canvas-dept-title").innerText = `${program} CLASS SCHEDULE • CUSTOM BUILDER`;
    
    injectAdaptiveCourseThemeVibe(program);
    loadRoutine();
    loadExamRoutine();
}

function initializeApp() {
    const instName = document.getElementById("inst-name").value.trim();
    const programName = document.getElementById("dept-program").value;
    if (!instName || !programName) return alert("Configuration configuration missing. Please insert parameters.");
    
    localStorage.setItem("instName", instName);
    localStorage.setItem("programName", programName);
    showDashboard(instName, programName);
}

function saveManualRoutine(e) {
    e.preventDefault();
    const subject = document.getElementById("m-subject").value.trim();
    const code = document.getElementById("m-code").value.trim();
    const teacher = document.getElementById("m-teacher").value.trim() || "N/A";
    const room = document.getElementById("m-room").value.trim() || "N/A";
    const startTime = document.getElementById("m-start-time").value;
    const endTime = document.getElementById("m-end-time").value;
    const day = document.getElementById("m-day").value;

    const newClass = { id: Date.now(), subject, code, teacher, room, startTime, endTime, day };
    currentRoutine.push(newClass);
    localStorage.setItem("routineData", JSON.stringify(currentRoutine));
    
    scheduleRoutineNotification(newClass);
    closeModal('manual-modal');
    document.getElementById("manual-form").reset();
    renderStructuredGridTimetable();
}

function saveExamRoutine(e) {
    e.preventDefault();
    const subject = document.getElementById("e-subject").value.trim();
    const code = document.getElementById("e-code").value.trim();
    const time = document.getElementById("e-time").value;
    const date = document.getElementById("e-date").value;

    const newExam = { id: Date.now() + 1, subject, code, time, date };
    examRoutine.push(newExam);
    localStorage.setItem("examRoutineData", JSON.stringify(examRoutine));
    
    scheduleExamNotification(newExam);
    closeModal('exam-modal');
    document.getElementById("exam-form").reset();
    renderExamRoutine();
}

function renderExamRoutine() {
    const container = document.getElementById("exam-render-area");
    container.innerHTML = "";
    if (examRoutine.length === 0) return;

    const wrapper = document.createElement("div");
    wrapper.innerHTML = `<h3 class="exam-section-header">📝 Upcoming Assessment Schedule Matrix</h3>`;
    
    examRoutine.forEach(item => {
        const card = document.createElement("div");
        card.className = "exam-strip-node";
        card.innerHTML = `
            <span class="cell-delete-btn" onclick="deleteExamNode(${item.id})">✕</span>
            <div>
                <h4>${item.subject} (${item.code})</h4>
                <p>Target Date: ${item.date}</p>
            </div>
            <div class="exam-badge-time">⏰ ${convertTo12Hour(item.time)}</div>`;
        wrapper.appendChild(card);
    });
    container.appendChild(wrapper);
}

async function scheduleRoutineNotification(item) {
    try {
        if (window.Capacitor && window.Capacitor.Plugins.LocalNotifications) {
            const daysMap = { 'sunday': 1, 'monday': 2, 'tuesday': 3, 'wednesday': 4, 'thursday': 5, 'friday': 6, 'saturday': 7 };
            const [hours, minutes] = item.startTime.split(':').map(Number);
            await window.Capacitor.Plugins.LocalNotifications.schedule({
                notifications: [{
                    id: item.id,
                    title: `⏰ Class Alert!`,
                    body: `${item.subject} inside Room ${item.room} is starting.`,
                    schedule: { on: { weekday: daysMap[item.day.toLowerCase()], hour: hours, minute: minutes }, repeats: true, allowWhileIdle: true },
                    sound: true
                }]
            });
        }
    } catch(e){}
}

async function scheduleExamNotification(exam) {
    try {
        if (window.Capacitor && window.Capacitor.Plugins.LocalNotifications) {
            const [hours, minutes] = exam.time.split(':').map(Number);
            const examDate = new Date(exam.date);
            examDate.setHours(hours, minutes);
            const alertTime = new Date(examDate.getTime() - (2 * 60 * 60 * 1000)); // ২ ঘণ্টা আগে এলার্ট

            await window.Capacitor.Plugins.LocalNotifications.schedule({
                notifications: [{
                    id: exam.id,
                    title: `🚨 Upcoming Examination Alert!`,
                    body: `${exam.subject} (${exam.code}) exam is starting soon at ${convertTo12Hour(exam.time)}.`,
                    schedule: { at: alertTime, allowWhileIdle: true },
                    sound: true
                }]
            });
        }
    } catch (e) {}
}

function deleteClassNode(id) {
    if(confirm("Purge this class session layout?")) {
        try { if(window.Capacitor) window.Capacitor.Plugins.LocalNotifications.cancel({ notifications: [{ id }] }); } catch(e){}
        currentRoutine = currentRoutine.filter(x => x.id !== id);
        localStorage.setItem("routineData", JSON.stringify(currentRoutine));
        renderStructuredGridTimetable();
    }
}

function deleteExamNode(id) {
    if(confirm("Remove this exam timeline?")) {
        try { if(window.Capacitor) window.Capacitor.Plugins.LocalNotifications.cancel({ notifications: [{ id }] }); } catch(e){}
        examRoutine = examRoutine.filter(x => x.id !== id);
        localStorage.setItem("examRoutineData", JSON.stringify(examRoutine));
        renderExamRoutine();
    }
}

async function requestNotificationPermission() { try { if (window.Capacitor && window.Capacitor.Plugins.LocalNotifications) { await window.Capacitor.Plugins.LocalNotifications.requestPermissions(); } } catch (e) {} }
function loadRoutine() { const s = localStorage.getItem("routineData"); if(s) { currentRoutine = JSON.parse(s); renderStructuredGridTimetable(); } else { renderStructuredGridTimetable(); } }
function loadExamRoutine() { const s = localStorage.getItem("examRoutineData"); if(s) { examRoutine = JSON.parse(s); renderExamRoutine(); } }
function convertTo12Hour(t) { if(!t) return ""; let [h, m] = t.split(':'); let ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${m} ${ampm}`; }
function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }
function checkExistingUser() { const i = localStorage.getItem("instName"), p = localStorage.getItem("programName"); if(i && p) showDashboard(i, p); }
function resetApp() { if(confirm("Flush localized database systems?")) { localStorage.clear(); location.reload(); } }
