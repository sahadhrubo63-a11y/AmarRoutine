// ==========================================
// 1. Service Worker Initialization
// ==========================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("Service Worker Registered Successfully!"))
        .catch(err => console.error("Service Worker Error:", err));
}

let currentRoutine = [];

document.addEventListener("DOMContentLoaded", () => {
    checkExistingUser();
    requestNotificationPermission();
    setInterval(checkUpcomingClasses, 60000);
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
    if (!instName || !programName) {
        alert("Please enter all required information correctly!");
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
    document.getElementById("display-program-name").innerText = `Program: ${program}`;
    document.body.className = ""; 
    document.body.classList.add(`theme-${program.toLowerCase()}`);
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

// ==========================================
// 2. Manual Entry Database Handling
// ==========================================
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
        routineList.innerHTML = `<p class="no-routine">No schedule set. Use the buttons above to add classes.</p>`;
        return;
    }

    const sortedRoutine = [...currentRoutine].sort((a, b) => a.time.localeCompare(b.time));
    sortedRoutine.forEach(item => {
        const card = document.createElement("div");
        card.className = "routine-card";
        card.innerHTML = `
            <span class="time-tag">⏰ ${convertTo12Hour(item.time)}</span>
            <h3>${item.subject} (${item.code})</h3>
            <p class="teacher">👨‍🏫 Teacher: ${item.teacher}</p>
            <p>🚪 Room No: ${item.room}</p>
            <p>📅 Day: ${item.day}</p>
            <button onclick="deleteRoutine(${item.id})" style="margin-top:10px; background:none; border:none; color:#dc3545; cursor:pointer; font-size:12px; font-weight:bold;">🗑️ Delete</button>
        `;
        routineList.appendChild(card);
    });
}

function deleteRoutine(id) {
    if (confirm("Are you sure?")) {
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

// ==========================================
// 3. GitHub Pages Safe PDF Renderer Matrix
// ==========================================
async function convertPdfToImageCanvas(file) {
    const pdfjs = window['pdfjs-dist/build/pdf'];
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    const arrayBuffer = await file.arrayBuffer();
    const typedarray = new Uint8Array(arrayBuffer);
    const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
    const page = await pdf.getPage(1); 
    const viewport = page.getViewport({ scale: 2.5 }); 
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    await page.render({ canvasContext: context, viewport: viewport }).promise;
    return canvas;
}

// ==========================================
// 4. SMART ALGORITHM UPDATE FOR COMPLEX TABLES
// ==========================================
async function processRoutineFile() {
    const fileInput = document.getElementById("routine-file");
    const sectionName = document.getElementById("filter-section").value.trim().toUpperCase();
    const statusText = document.getElementById("scan-status");

    if (!sectionName || fileInput.files.length === 0) {
        alert("Please enter section (e.g. 3D) and upload your cropped routine image!");
        return;
    }

    statusText.style.color = "#ffc107";
    statusText.innerText = "⏳ Running Intelligent Optical Scanning... Please wait.";
    
    const file = fileInput.files[0];
    let sourceToScan;

    try {
        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf')) {
            sourceToScan = await convertPdfToImageCanvas(file);
        } else {
            sourceToScan = file;
        }

        const result = await Tesseract.recognize(sourceToScan, 'eng', {
            logger: m => {
                if(m.status === 'recognizing text') {
                    statusText.innerText = `⏳ AI Scanning: ${Math.floor(m.progress * 100)}%`;
                }
            }
        });
        
        // টেসারেক্ট এর টেক্সট ক্লিনিং (ভুল ক্যারেক্টার ফিক্সিং)
        let extractedText = result.data.text.replace(/O/g, '0').replace(/I/g, '1');
        const lines = extractedText.split('\n');
        let matchedClasses = 0;

        // টাইম স্লট এবং দিন ডিটেকশনের ডিফল্ট ভ্যালু 
        let currentDay = "Saturday"; 
        // আপনার রুটিনের টাইম কলাম ইনডেক্স অনুযায়ী ম্যাপিং এরে
        const timeSlots = ["02:10", "03:20", "04:30"];

        lines.forEach(line => {
            let upperLine = line.toUpperCase();

            // দিন ট্র্যাক করার চেকিং
            if (upperLine.includes("SAT") || upperLine.includes("SHANI")) currentDay = "Saturday";
            else if (upperLine.includes("SUN") || upperLine.includes("RABI")) currentDay = "Sunday";
            else if (upperLine.includes("MON") || upperLine.includes("SOM")) currentDay = "Monday";
            else if (upperLine.includes("TUE") || upperLine.includes("MANGAL")) currentDay = "Tuesday";
            else if (upperLine.includes("WED") || upperLine.includes("BUDH")) currentDay = "Wednesday";
            else if (upperLine.includes("THU") || upperLine.includes("BR बृहस्पति")) currentDay = "Thursday";

            // ৩ডি সেকশনের ডাটা ব্লক এক্সট্রাকশন সাব-রুটিন লুপ
            if (upperLine.includes(sectionName)) {
                
                // রুম নম্বর খুঁজে বের করার লজিক (৩ ডিজিটের রুম বা LAB শব্দ)
                let roomMatch = line.match(/(LAB\s*\d*|\d{3})/i);
                let currentRoom = roomMatch ? roomMatch[0] : "See Routine Sheet";

                // রেগুলার এক্সপ্রেশন: এটি ৩ডি এর ঠিক পরের কোর্স কোড (যেমন CSE 2102 বা MATH 2103) এবং টিচার কোড আলাদা করবে
                const blockRegex = new RegExp(sectionName + '\\s+([A-Z]{3,4}\\s*\\d{4})\\s+([A-Z]{2,4})', 'g');
                let match;

                while ((match = blockRegex.exec(upperLine)) !== null) {
                    let courseCode = match[1];
                    let teacherCode = match[2];

                    // লাইনের কোন পজিশনে ৩ডি পাওয়া গেছে তার ওপর ভিত্তি করে ক্লাস টাইম নির্ধারণ
                    let matchIndex = match.index;
                    let targetTime = timeSlots[0]; // Default
                    if (matchIndex > upperLine.length * 0.6) {
                        targetTime = timeSlots[2];
                    } else if (matchIndex > upperLine.length * 0.3) {
                        targetTime = timeSlots[1];
                    }

                    const extractedClass = {
                        id: Date.now() + Math.random(),
                        subject: getSubjectNameByCode(courseCode),
                        code: courseCode,
                        teacher: teacherCode,
                        room: currentRoom,
                        time: targetTime,
                        day: currentDay
                    };

                    currentRoutine.push(extractedClass);
                    matchedClasses++;
                }
            }
        });

        if (matchedClasses > 0) {
            localStorage.setItem("routineData", JSON.stringify(currentRoutine));
            renderRoutine();
            statusText.style.color = "#28a745";
            statusText.innerText = `✅ Success! Extracted ${matchedClasses} classes for Section ${sectionName}!`;
            fileInput.value = "";
            setTimeout(() => { closeModal("upload-modal"); statusText.innerText = ""; }, 2500);
        } else {
            statusText.style.color = "#dc3545";
            statusText.innerText = `❌ Grid detection missed section "${sectionName}". Try entering manually for 100% accuracy!`;
        }

    } catch (error) {
        console.error(error);
        statusText.style.color = "#dc3545";
        statusText.innerText = "❌ Processing failure occurred during AI scanner tracking!";
    }
}

// কোর্স কোড দেখে সাবজেক্টের নাম চেনার জন্য ডিকশনারি ম্যাপিং ফাংশন
function getSubjectNameByCode(code) {
    const cleanCode = code.replace(/\s+/g, '');
    const subjects = {
        'CSE2109': 'Computer Architecture',
        'MATH2103': 'Numerical Methods',
        'CSE2101': 'Data Structures',
        'CSE2102': 'Data Structures Lab',
        'CSE2110': 'Computer Architecture Lab',
        'EEE2101': 'Electronics II'
    };
    return subjects[cleanCode] || "University Subject";
}

// ==========================================
// 5. Notification Alert Loops
// ==========================================
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
    if (alarmSound) { alarmSound.play().catch(e => console.log("Audio block: ", e)); }
}
