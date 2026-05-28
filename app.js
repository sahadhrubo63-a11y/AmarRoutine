let currentRoutine = [];

document.addEventListener("DOMContentLoaded", () => {
    checkExistingUser();
    requestNotificationPermission();
    setInterval(checkUpcomingClasses, 60000);

    // ফর্ম সাবমিট হ্যান্ডলার ফিক্স
    const form = document.getElementById("manual-form");
    if(form) {
        form.addEventListener("submit", saveManualRoutine);
    }
});

function requestNotificationPermission() {
    if ("Notification" in window) { Notification.requestPermission(); }
}

function checkExistingUser() {
    const instName = localStorage.getItem("instName");
    const programName = localStorage.getItem("programName");
    if (instName && programName) { showDashboard(instName, programName); }
}

function initializeApp() {
    const instName = document.getElementById("inst-name").value.trim();
    const programName = document.getElementById("dept-program").value;
    if (!instName) {
        alert("Please enter your University or College Name!");
        return;
    }
    localStorage.setItem("instName", instName);
    localStorage.setItem("programName", programName);
    showDashboard(instName, programName);
}

function showDashboard(inst, program) {
    document.getElementById("onboarding-screen").classList.add("hidden");
    document.getElementById("dashboard-screen").classList.remove("hidden");
    document.getElementById("display-inst-name").innerText = inst.toUpperCase();
    document.getElementById("display-program-name").innerText = `Program: ${program.toUpperCase()}`;
    
    // ব্যাকগ্রাউন্ড থিম পরিবর্তন লজিক (কোর্সের ব্যাকগ্রাউন্ড নির্ধারণ)
    document.body.className = ""; // আগের সব থিম ক্লিয়ার করা
    
    // ১. Science Background এর জন্য থিম ম্যাপিং
    const scienceCourses = ["CSE", "EEE", "CIVIL", "MECHANICAL", "TEXTILE", "PHARMACY"];
    // ২. Commerce Background এর জন্য থিম ম্যাপিং
    const commerceCourses = ["BBA", "ACCOUNTING", "FINANCE", "MANAGEMENT", "MARKETING"];
    // ৩. Arts Background এর জন্য থিম ম্যাপিং
    const artsCourses = ["ENGLISH", "LLB", "ECONOMICS", "SOCIOLOGY", "BANGLA", "JOURNALISM"];

    const progUpper = program.toUpperCase();

    if (scienceCourses.includes(progUpper)) {
        document.body.classList.add("theme-science"); // সায়েন্স হলে ডার্ক বা সায়ান-ব্লু থিম
    } else if (commerceCourses.includes(progUpper)) {
        document.body.classList.add("theme-commerce"); // কমার্স হলে প্রফেশনাল গোল্ডেন/নেভি ব্লু থিম
    } else if (artsCourses.includes(progUpper)) {
        document.body.classList.add("theme-arts"); // আর্টস হলে রিল্যাক্সিং মেরুন/পার্পল থিম
    } else {
        document.body.classList.add("theme-default");
    }

    loadRoutine();
}

function resetApp() {
    if (confirm("Are you sure you want to change your profile?")) {
        localStorage.removeItem("instName");
        localStorage.removeItem("programName");
        document.getElementById("onboarding-screen").classList.remove("hidden");
        document.getElementById("dashboard-screen").classList.add("hidden");
    }
}

function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }

// ম্যানুয়াল ডাটাবেজ হ্যান্ডলিং
function saveManualRoutine(e) {
    e.preventDefault(); 
    const subject = document.getElementById("m-subject").value.trim();
    const code = document.getElementById("m-code").value.trim();
    const teacher = document.getElementById("m-teacher").value.trim();
    const room = document.getElementById("m-room").value.trim();
    const time = document.getElementById("m-time").value;
    const day = document.getElementById("m-day").value;

    const newClass = {
        id: Date.now(),
        subject: subject,
        code: code,
        teacher: teacher || "N/A",
        room: room || "N/A",
        time: time, 
        day: day
    };

    currentRoutine.push(newClass);
    localStorage.setItem("routineData", JSON.stringify(currentRoutine));
    document.getElementById("manual-form").reset();
    closeModal("manual-modal");
    renderRoutine();
}

function loadRoutine() {
    const localData = localStorage.getItem("routineData");
    currentRoutine = localData ? JSON.parse(localData) : [];
    renderRoutine();
}

function renderRoutine() {
    const routineList = document.getElementById("routine-list");
    routineList.innerHTML = "";

    if (currentRoutine.length === 0) {
        routineList.innerHTML = `<p class="no-routine">No classes added yet. Click the button above to add your schedule!</p>`;
        return;
    }

    const sortedRoutine = [...currentRoutine].sort((a, b) => a.time.localeCompare(b.time));
    sortedRoutine.forEach(item => {
        const card = document.createElement("div");
        card.className = "routine-card";
        card.innerHTML = `
            <span class="time-tag">⏰ ${convertTo12Hour(item.time)}</span>
            <h3>${item.subject} (${item.code})</h3>
            <p>👨‍🏫 Teacher: ${item.teacher} | 🚪 Room: ${item.room}</p>
            <p>📅 Day: ${item.day}</p>
            <button onclick="deleteRoutine(${item.id})" class="btn-delete">🗑️ Remove</button>
        `;
        routineList.appendChild(card);
    });
}

function deleteRoutine(id) {
    if (confirm("Delete this class?")) {
        currentRoutine = currentRoutine.filter(item => item.id !== id);
        localStorage.setItem("routineData", JSON.stringify(currentRoutine));
        renderRoutine();
    }
}

function convertTo12Hour(timeString) {
    let [hours, minutes] = timeString.split(':');
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    return `${hours}:${minutes} ${ampm}`;
}

// নোটিফিকেশন অ্যালার্ট লুপ লজিক
function checkUpcomingClasses() {
    if (currentRoutine.length === 0) return;
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const todayName = days[now.getDay()];
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    currentRoutine.forEach(item => {
        if (item.day.toLowerCase() === todayName.toLowerCase()) {
            const [classHour, classMinute] = item.time.split(':').map(Number);
            const classMinutes = classHour * 60 + classMinute;
            if (classMinutes - currentMinutes === 45) { triggerAlarm(item.subject, item.room); }
        }
    });
}

function triggerAlarm(subject, room) {
    if (Notification.permission === "granted") {
        new Notification("Class Reminder! ⏰", {
            body: `${subject} starts in 45 mins at Room: ${room}`
        });
    }
    const alarmSound = document.getElementById("alarm-sound");
    if (alarmSound) { alarmSound.play().catch(e => console.log(e)); }
}
