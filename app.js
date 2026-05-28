let currentRoutine = [];

document.addEventListener("DOMContentLoaded", () => {
    checkExistingUser();
    requestNotificationPermission();
    setInterval(checkUpcomingClasses, 60000);

    const form = document.getElementById("manual-form");
    if (form) {
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
        alert("দয়া করে আপনার বিশ্ববিদ্যালয় অথবা কলেজের নাম লিখুন!");
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
    document.getElementById("display-program-name").innerText = `Course / Program: ${program.toUpperCase()}`;
    
    // বডি ক্লাসের আগের সব থিম মুছে ফেলা
    document.body.className = ""; 
    
    // থিম ক্যাটাগরি কনফিগারেশন ম্যাপিং
    const scienceList = ["CSE", "SWE", "EEE", "CIVIL", "MECHANICAL", "TEXTILE", "PHARMACY", "BSC-PHYSICS", "BSC-MATH"];
    const commerceList = ["BBA", "ACCOUNTING", "FINANCE", "MANAGEMENT", "MARKETING", "HRM"];
    const artsList = ["ENGLISH", "LLB", "ECONOMICS", "SOCIOLOGY", "BANGLA", "JOURNALISM", "HISTORY"];

    const selectedProg = program.toUpperCase();

    // ডিপার্টমেন্ট ক্যাটাগরি অনুসারে ডাইনামিক বডি ক্লাস পুশ
    if (scienceList.includes(selectedProg)) {
        document.body.classList.add("theme-science");
    } else if (commerceList.includes(selectedProg)) {
        document.body.classList.add("theme-commerce");
    } else if (artsList.includes(selectedProg)) {
        document.body.classList.add("theme-arts");
    } else {
        document.body.classList.add("theme-default");
    }

    loadRoutine();
}

function resetApp() {
    if (confirm("আপনি কি নিশ্চিত যে প্রোফাইল রিসেট করে নতুন কোর্স সিলেক্ট করতে চান?")) {
        localStorage.removeItem("instName");
        localStorage.removeItem("programName");
        document.getElementById("onboarding-screen").classList.remove("hidden");
        document.getElementById("dashboard-screen").classList.add("hidden");
        document.body.className = "";
    }
}

function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }

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
        routineList.innerHTML = `<p class="no-routine">কোনো ক্লাস রুটিন যুক্ত করা নেই। ওপরের বোতামটি চেপে ক্লাস অ্যাসাইন করুন।</p>`;
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
            <button onclick="deleteRoutine(${item.id})" class="btn-delete">🗑️ Remove Class</button>
        `;
        routineList.appendChild(card);
    });
}

function deleteRoutine(id) {
    if (confirm("আপনি কি নিশ্চিত ক্লাসটি ডিলিট করতে চান?")) {
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
            body: `${subject} ক্লাসটি ৪৫ মিনিটের মধ্যে শুরু হচ্ছে। রুম নম্বর: ${room}`
        });
    }
    const alarmSound = document.getElementById("alarm-sound");
    if (alarmSound) { alarmSound.play().catch(e => console.log(e)); }
}
