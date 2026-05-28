// --- ১. গ্লোবাল ভেরিয়েবল এবং স্টেট ম্যানেজমেন্ট ---
let currentRoutine = [];
let alarmTimer = null;

// অ্যাপ লোড হওয়ার পর ইনিশিয়াল চেক
document.addEventListener("DOMContentLoaded", () => {
    checkExistingUser();
    requestNotificationPermission();
    // প্রতি মিনিটে ব্যাকগ্রাউন্ড অ্যালার্ম চেকার চালু করা
    setInterval(checkUpcomingClasses, 60000);
});

// নোটিফিকেশন পারমিশন চাওয়া
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission();
    }
}

// পুরাতন ইউজারের ডাটা চেক করা
function checkExistingUser() {
    const instName = localStorage.getItem("instName");
    const programName = localStorage.getItem("programName");
    
    if (instName && programName) {
        showDashboard(instName, programName);
    }
}

// --- ২. অনবোর্ডিং এবং ডাইনামিক UI থিমিং ---
function initializeApp() {
    const instName = document.getElementById("inst-name").value.trim();
    const programName = document.getElementById("dept-program").value;

    if (!instName || !programName) {
        alert("দয়া করে সব তথ্য সঠিকভাবে দিন!");
        return;
    }

    localStorage.setItem("instName", instName);
    localStorage.setItem("programName", programName);

    showDashboard(instName, programName);
}

function showDashboard(inst, program) {
    document.getElementById("onboarding-screen").classList.add("hidden");
    document.getElementById("dashboard-screen").classList.remove("hidden");

    // ব্যানারে টেক্সট সেট করা
    document.getElementById("display-inst-name").innerText = inst;
    document.getElementById("display-program-name").innerText = `Program: ${program}`;

    // ডাইনামিক থিম অ্যাপ্লাই করা
    document.body.className = ""; // আগের সব ক্লাস রিমুভ
    document.body.classList.add(`theme-${program.toLowerCase()}`);

    loadRoutine();
}

function resetApp() {
    if (confirm("আপনি কি তথ্য পরিবর্তন করতে চান? আপনার বর্তমান রুটিন মুছে যাবে না।")) {
        localStorage.removeItem("instName");
        localStorage.removeItem("programName");
        document.getElementById("onboarding-screen").classList.remove("hidden");
        document.getElementById("dashboard-screen").classList.add("hidden");
    }
}

// --- ৩. মোডাল কন্ট্রোল ---
function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }

// --- ৪. ম্যানুয়াল রุตিন সেভ এবং ডিসপ্লে ---
function saveManualRoutine(e) {
    e.preventDefault();
    
    const newClass = {
        id: Date.now(),
        subject: document.getElementById("m-subject").value,
        code: document.getElementById("m-code").value,
        teacher: document.getElementById("m-teacher").value,
        room: document.getElementById("m-room").value,
        time: document.getElementById("m-time").value,
        day: document.getElementById("m-day").value
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

// রুটিন সিরিয়াল ওয়াইজ (সময় অনুযায়ী) সাজিয়ে ড্যাশবোর্ডে দেখানো
function renderRoutine() {
    const routineList = document.getElementById("routine-list");
    routineList.innerHTML = "";

    if (currentRoutine.length === 0) {
        routineList.innerHTML = `<p class="no-routine">কোনো রুটিন সেট করা নেই। উপরে বাটন চাপুন।</p>`;
        return;
    }

    // সময় অনুযায়ী সিরিয়াল করা (Sorting by Time)
    const sortedRoutine = [...currentRoutine].sort((a, b) => a.time.localeCompare(b.time));

    sortedRoutine.forEach(item => {
        const card = document.createElement("div");
        card.className = "routine-card";
        card.innerHTML = `
            <span class="time-tag">⏰ ${convertTo12Hour(item.time)}</span>
            <h3>${item.subject} (${item.code})</h3>
            <p class="teacher">👨‍🏫 শিক্ষক: ${item.teacher}</p>
            <p>🚪 রুম নম্বর: ${item.room}</p>
            <p>📅 বার: ${item.day}</p>
            <button onclick="deleteRoutine(${item.id})" style="margin-top:10px; background:none; border:none; color:#dc3545; cursor:pointer; font-size:12px; font-weight:bold; width:fit-content;">🗑️ মুছে ফেলুন</button>
        `;
        routineList.appendChild(card);
    });
}

function deleteRoutine(id) {
    currentRoutine = currentRoutine.filter(item => item.id !== id);
    localStorage.setItem("routineData", JSON.stringify(currentRoutine));
    renderRoutine();
}

function convertTo12Hour(timeString) {
    let [hours, minutes] = timeString.split(':');
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
}

// --- ৫. AI OCR (ছবি থেকে অটোমেটিক রুটিন এক্সট্রাকশন) ---
async function processRoutineFile() {
    const fileInput = document.getElementById("routine-file");
    const sectionName = document.getElementById("filter-section").value.trim();
    const statusText = document.getElementById("scan-status");

    if (!sectionName || fileInput.files.length === 0) {
        alert("দয়া করে সেকশনের নাম এবং রুটিন ছবি দুটিই প্রদান করুন!");
        return;
    }

    statusText.innerText = "⏳ ছবি স্ক্যান করা হচ্ছে (AI Processing)... অনুগ্রহ করে অপেক্ষা করুন।";
    
    const file = fileInput.files[0];
    
    try {
        // Tesseract.js দিয়ে ইমেজ থেকে টেক্সট এক্সট্রাক্ট করা
        const result = await Tesseract.recognize(file, 'eng');
        const text = result.data.text;
        
        statusText.innerText = "🔍 আপনার সেকশনের ডাটা ফিল্টার করা হচ্ছে...";
        
        // লাইন বাই লাইন টেক্সট রিড করা ও ইউজারের সেকশন ফিল্টার করা
        const lines = text.split('\n');
        let matchedClasses = 0;

        lines.forEach(line => {
            // যদি লাইনে ইউজারের সেকশন নাম থাকে
            if (line.toLowerCase().includes(sectionName.toLowerCase())) {
                // একটি রেগুলার এক্সপ্রেশন বা সাধারণ স্প্লিট লজিক দিয়ে ডাটা বের করা
                // উদাহরণ টেক্সট ফরম্যাট: "CSE101 Sec-A Sunday 09:00 AM Room-302 MR-X"
                const words = line.split(/\s+/);
                
                if (words.length >= 4) {
                    const mockClass = {
                        id: Date.now() + Math.random(),
                        subject: words[0] || "Auto Subject",
                        code: words[0] || "000",
                        teacher: words[words.length - 1] || "Unknown",
                        room: words[words.length - 2] || "N/A",
                        time: "09:00", // ডেমো টাইম (OCR এর টেক্সট প্যাটার্ন ভেদে এটি নিখুঁত করার কোড বাড়ানো যায়)
                        day: "Sunday"
                    };
                    currentRoutine.push(mockClass);
                    matchedClasses++;
                }
            }
        });

        if (matchedClasses > 0) {
            localStorage.setItem("routineData", JSON.stringify(currentRoutine));
            renderRoutine();
            statusText.innerText = `✅ সফলভাবে আপনার সেকশনের ${matchedClasses} টি ক্লাস সেভ হয়েছে!`;
            setTimeout(() => closeModal("upload-modal"), 2000);
        } else {
            statusText.innerText = "❌ আপনার সেকশনের কোনো তথ্য খুঁজে পাওয়া যায়নি। ম্যানুয়ালি ট্রাই করুন।";
        }

    } catch (error) {
        console.error(error);
        statusText.innerText = "❌ ফাইল প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
    }
}

// --- ৬. ব্যাকগ্রাউন্ড অ্যালার্ম ও নোটিফিকেশন লজিক (৪৫ মিনিট আগে ও ১৫ সেকেন্ড প্লে) ---
function checkUpcomingClasses() {
    if (currentRoutine.length === 0) return;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const todayName = days[now.getDay()];
    
    // বর্তমান সময়কে মিনিটে রূপান্তর
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    currentRoutine.forEach(item => {
        // শুধুমাত্র আজকের দিনের ক্লাস চেক করবে
        if (item.day.toLowerCase() === todayName.toLowerCase()) {
            const [classHour, classMinute] = item.time.split(':').map(Number);
            const classMinutes = classHour * 60 + classMinute;

            // যদি ক্লাস শুরু হতে ঠিক ৪৫ মিনিট বাকি থাকে
            if (classMinutes - currentMinutes === 45) {
                triggerAlarm(item.subject, item.room);
            }
        }
    });
}

function triggerAlarm(subject, room) {
    // ১. পুশ নোটিফিকেশন পাঠানো
    if (Notification.permission === "granted") {
        new Notification("AmarRoutine অ্যালার্ট! ⏰", {
            body: `৪৫ মিনিট পর আপনার "${subject}" ক্লাস শুরু হবে। রুম নম্বর: ${room}`,
            icon: "https://cdn-icons-png.flaticon.com/512/2693/2693507.png"
        });
    }

    // ২. ১৫ সেকেন্ডের জন্য অটোমেটিক অ্যালার্ম বাজানো
    const alarmSound = document.getElementById("alarm-sound");
    if (alarmSound) {
        alarmSound.play().catch(e => console.log("অডিও প্লে করতে ইউজারের ইন্টারঅ্যাকশন প্রয়োজন।"));
        
        // ঠিক ১৫ সেকেন্ড (১৫০০০ মিলি-সেকেন্ড) পর অ্যালার্ম বন্ধ করা
        setTimeout(() => {
            alarmSound.pause();
            alarmSound.currentTime = 0; // অডিওর শুরুতে ফেরত নেওয়া
            console.log("১৫ সেকেন্ড পর অ্যালার্ম স্বয়ংক্রিয়ভাবে বন্ধ হয়েছে।");
        }, 15000);
    }
}
