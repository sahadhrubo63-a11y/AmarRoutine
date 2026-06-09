let currentRoutine = [];
let examRoutine = [];

document.addEventListener("DOMContentLoaded", () => {
    checkExistingUser();
    requestNotificationPermission();
    
    // লাইভ ক্লক ইঞ্জিন শুরু
    setInterval(updateSmartClock, 1000);
    updateSmartClock();
    
    // লাইভ লোকেশন ও ওয়েদার আপডেট
    fetchLiveWeather();

    if (document.getElementById("manual-form")) {
        document.getElementById("manual-form").addEventListener("submit", saveManualRoutine);
    }
    if (document.getElementById("exam-form")) {
        document.getElementById("exam-form").addEventListener("submit", saveExamRoutine);
    }
});

// ১. স্মার্ট ডিজিটাল ক্লক ও ডে-উইক ক্যালকুলেটর
function updateSmartClock() {
    const now = new Date();
    
    // টাইম ফরম্যাটিং
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    
    document.getElementById("digital-clock").innerText = `${hours}:${minutes}:${seconds} ${ampm}`;

    // ডেট ও উইক নেম ক্যালকুলেশন
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById("live-date").innerText = now.toLocaleDateString('en-US', options);
}

// ২. লোকেশন ট্র্যাক করে লাইভ ওয়েদার আপডেট (Open-Meteo Open-Source API)
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
                            <span style="font-size:20px;">🌡️</span> <b>${temp}°C</b> <br>
                            <span style="font-size:12px; color:#a1a1aa;">💨 Wind: ${wind} km/h</span>
                        </div>
                    `;
                }
            } catch (err) {
                document.getElementById("weather-box").innerHTML = "<p>🌤️ Weather offline</p>";
            }
        }, () => {
            document.getElementById("weather-box").innerHTML = "<p>📍 Location blocked</p>";
        });
    }
}

// ৩. এক্সাম রুটিন ডাটা সেভ এবং নোটিফিকেশন ইঞ্জিন
async function saveExamRoutine(e) {
    e.preventDefault();
    const subject = document.getElementById("e-subject").value.trim();
    const code = document.getElementById("e-code").value.trim();
    const time = document.getElementById("e-time").value;
    const date = document.getElementById("e-date").value;

    const newExam = {
        id: Date.now() + 1,
        subject,
        code,
        time,
        date
    };

    examRoutine.push(newExam);
    localStorage.setItem("examRoutineData", JSON.stringify(examRoutine));
    
    // এক্সামের জন্য কাস্টম নোটিফিকেশন শিডিউল করা
    await scheduleExamNotification(newExam);

    closeModal('exam-modal');
    document.getElementById("exam-form").reset();
    renderExamRoutine();
}

// ৪. থিম ফলো করে রুটিনকে চমৎকার ইমেজে রূপান্তর ও ডাউনলোড করা
function downloadRoutineImage() {
    const area = document.getElementById("routine-capture-area");
    
    // ডাউনলোডের আগে সুন্দর লুক দেওয়ার জন্য একটি কাস্টম প্রিমিয়াম স্টাইল যোগ করা
    area.classList.add("exporting-active");
    
    html2canvas(area, {
        scale: 2, // ইমেজ কোয়ালিটি HD করার জন্য
        backgroundColor: "#1e293b", // থিম ব্যাকগ্রাউন্ড কালার
        useCORS: true
    }).then(canvas => {
        const imageLink = document.createElement("a");
        imageLink.download = "AmarRoutine_Dashboard.jpg";
        imageLink.href = canvas.toDataURL("image/jpeg", 0.9);
        imageLink.click();
        
        area.classList.remove("exporting-active");
    });
}

// ৫. এক্সাম নোটিফিকেশন ইঞ্জিন
async function scheduleExamNotification(exam) {
    try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
            const { LocalNotifications } = window.Capacitor.Plugins;
            const [hours, minutes] = exam.time.split(':').map(Number);
            const examDate = new Date(exam.date);
            examDate.setHours(hours);
            examDate.setMinutes(minutes);
            
            // পরীক্ষার ঠিক ২ ঘণ্টা আগে রিমাইন্ডার ট্রিগার করবে
            const alertTime = new Date(examDate.getTime() - (2 * 60 * 60 * 1000));

            await LocalNotifications.schedule({
                notifications: [
                    {
                        id: exam.id,
                        title: `🚨 পরীক্ষার অ্যালার্ট!`,
                        body: `আজ আপনার '${exam.subject} (${exam.code})' পরীক্ষাটি ${convertTo12Hour(exam.time)} এ শুরু হবে। প্রস্তুতি নিন!`,
                        schedule: { at: alertTime, allowWhileIdle: true },
                        sound: true,
                        vibrate: true
                    }
                ]
            });
        }
    } catch (e) { console.log(e); }
}

// বাকী গ্লোবাল ফাংশনসমূহ এবং রেন্ডারিং ও ক্লিয়ারিং লজিক
async function requestNotificationPermission() {
    try {
        if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.LocalNotifications) {
            await window.Capacitor.Plugins.LocalNotifications.requestPermissions();
        }
    } catch (e) {}
}

function checkExistingUser() {
    const instName = localStorage.getItem("instName");
    const programName = localStorage.getItem("programName");
    if (instName && programName) { showDashboard(instName, programName); }
}

function initializeApp() {
    const instName = document.getElementById("inst-name").value.trim();
    const programName = document.getElementById("dept-program").value;
    if (!instName) return alert("প্রতিস্থানের নাম দিন!");
    localStorage.setItem("instName", instName);
    localStorage.setItem("programName", programName);
    showDashboard(instName, programName);
}

function showDashboard(inst, program) {
    document.getElementById("onboarding-screen").classList.add("hidden");
    document.getElementById("dashboard-screen").classList.remove("hidden");
    document.getElementById("display-inst-name").innerText = inst.toUpperCase();
    document.getElementById("display-program").innerText = program;
    loadRoutine();
    loadExamRoutine();
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
                    title: `⏰ ক্লাসের সময় হয়েছে!`,
                    body: `${classItem.subject} ক্লাসটি রুম ${classItem.room}-এ শুরু হচ্ছে।`,
                    schedule: { on: { weekday: daysMap[classItem.day.toLowerCase()], hour: hours, minute: minutes }, repeats: true, allowWhileIdle: true },
                    sound: true
                }]
            });
        }
    } catch(e){}
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
    div.innerHTML = `<h2 class="section-title">📅 Class Schedule</h2>`;
    
    currentRoutine.forEach(item => {
        const card = document.createElement("div");
        card.className = "routine-card style-class";
        card.innerHTML = `
            <span class="delete-icon" onclick="deleteClass(${item.id})">❌</span>
            <h3>${item.subject} (${item.code})</h3>
            <p>👨‍🏫 ${item.teacher} | 🚪 Room: ${item.room} | 🗓️ ${item.day}</p>
            <span class="time-tag">⏰ ${convertTo12Hour(item.time)}</span>
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
    div.innerHTML = `<h2 class="section-title" style="color:#f59e0b;">📝 Exam Schedule</h2>`;
    
    examRoutine.forEach(item => {
        const card = document.createElement("div");
        card.className = "routine-card style-exam";
        card.innerHTML = `
            <span class="delete-icon" onclick="deleteExam(${item.id})">❌</span>
            <h3>${item.subject} (${item.code})</h3>
            <p>📅 Date: ${item.date}</p>
            <span class="time-tag exam-time">⏰ ${convertTo12Hour(item.time)}</span>
        `;
        div.appendChild(card);
    });
    container.appendChild(div);
}

async function deleteClass(id) {
    if (confirm("ক্লাসটি ডিলিট করবেন?")) {
        try { if(window.Capacitor) await window.Capacitor.Plugins.LocalNotifications.cancel({ notifications: [{ id }] }); } catch(e){}
        currentRoutine = currentRoutine.filter(item => item.id !== id);
        localStorage.setItem("routineData", JSON.stringify(currentRoutine));
        renderRoutine();
    }
}

async function deleteExam(id) {
    if (confirm("পরীক্ষার শিডিউলটি ডিলিট করবেন?")) {
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

function resetApp() {
    if (confirm("সব ডাটা রিসেট করবেন?")) {
        try { if(window.Capacitor) window.Capacitor.Plugins.LocalNotifications.clear(); } catch(e){}
        localStorage.clear();
        location.reload();
    }
}
