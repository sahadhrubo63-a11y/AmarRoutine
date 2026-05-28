// ==========================================
// ১. সার্ভিস ওয়ার্কার রেজিস্ট্রেশন (PWA ও ব্যাকগ্রাউন্ড নোটিফিকেশন)
// ==========================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("AmarRoutine Service Worker Registered Successfully!"))
        .catch(err => console.log("Service Worker Registration Failed:", err));
}

// ==========================================
// ২. গ্লোবাল ভেরিয়েবল এবং স্টেট ম্যানেজমেন্ট
// ==========================================
let currentRoutine = [];

// অ্যাপ লোড হওয়ার পর ইনিশিয়াল চেক
document.addEventListener("DOMContentLoaded", () => {
    checkExistingUser();
    requestNotificationPermission();
    
    // প্রতি মিনিটে ব্যাকগ্রাউন্ড অ্যালার্ম চেকার চালু করা (60000 ms = 1 minute)
    setInterval(checkUpcomingClasses, 60000);
});

// ব্রাউজারের কাছে নোটিফিকেশন পারমিশন চাওয়া
function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Notification permission granted.");
            }
        });
    }
}

// পুরাতন ইউজারের ডাটা লোকাল স্টোরেজে আছে কিনা চেক করা
function checkExistingUser() {
    const instName = localStorage.getItem("instName");
    const programName = localStorage.getItem("programName");
    
    if (instName && programName) {
        showDashboard(instName, programName);
    }
}

// ==========================================
// ৩. অনবোর্ডিং এবং ডাইনামিক UI থিমিং
// ==========================================
function initializeApp() {
    const instName = document.getElementById("inst-name").value.trim();
    const programName = document.getElementById("dept-program").value;

    if (!instName || !programName) {
        alert("দয়া করে সব তথ্য সঠিকভাবে দিন!");
        return;
    }

    // লোকাল স্টোরেজে ইউজারের প্রাথমিক প্রোফাইল সেভ
    localStorage.setItem("instName", instName);
    localStorage.setItem("programName", programName);

    showDashboard(instName, programName);
}

function showDashboard(inst, program) {
    // স্ক্রিন টগল করা
    document.getElementById("onboarding-screen").classList.add("hidden");
    document.getElementById("dashboard-screen").classList.remove("hidden");

    // ড্যাশবোর্ড ব্যানারে টেক্সট সেট করা
    document.getElementById("display-inst-name").innerText = inst;
    document.getElementById("display-program-name").innerText = `Program: ${program}`;

    // ডাইনামিক থিম অ্যাপ্লাই করা (যেমন: cse হলে theme-cse ক্লাস বডিতে অ্যাড হবে)
    document.body.className = ""; // আগের সব থিম ক্লাস রিমুভ
    document.body.classList.add(`theme-${program.toLowerCase()}`);

    // রুটিন লোড করা
    loadRoutine();
}

function resetApp() {
    if (confirm("আপনি কি তথ্য পরিবর্তন করতে চান? আপনার বর্তমান রুটিন ডাটা মুছে যাবে না।")) {
        localStorage.removeItem("instName");
        localStorage.removeItem("programName");
        document.getElementById("onboarding-screen").classList.remove("hidden");
        document.getElementById("dashboard-screen").classList.add("hidden");
    }
}

// ==========================================
// ৪. মোডাল (Pop-up) কন্ট্রোল
// ==========================================
function openModal(id) { 
    document.getElementById(id).classList.remove("hidden"); 
}

function closeModal(id) { 
    document.getElementById(id).classList.add("hidden"); 
}

// ==========================================
// ৫. ম্যানুয়াল রুটিন সেভ এবং ডিসপ্লে লজিক
// ==========================================
function saveManualRoutine(e) {
    e.preventDefault();
    
    const newClass = {
        id: Date.now(),
        subject: document.getElementById("m-subject").value.trim(),
        code: document.getElementById("m-code").value.trim(),
        teacher: document.getElementById("m-teacher").value.trim(),
        room: document.getElementById("m-room").value.trim(),
        time: document.getElementById("m-time").value, // Format: HH:MM (24-hour)
        day: document.getElementById("m-day").value
    };

    currentRoutine.push(newClass);
    localStorage.setItem("routineData", JSON.stringify(currentRoutine));
    
    // ফর্ম রিসেট ও মোডাল বন্ধ করা
    document.getElementById("manual-form").reset();
    closeModal("manual-modal");
    
    // ড্যাশবোর্ড আপডেট করা
    renderRoutine();
}

function loadRoutine() {
    const localData = localStorage.getItem("routineData");
    currentRoutine = localData ? JSON.parse(localData) : [];
    renderRoutine();
}

// রুটিন সময় অনুযায়ী সিরিয়াল ওয়াইজ সাজিয়ে ড্যাশবোর্ডে রেন্ডার করা
function renderRoutine() {
    const routineList = document.getElementById("routine-list");
    routineList.innerHTML = "";

    if (currentRoutine.length === 0) {
        routineList.innerHTML = `<p class="no-routine">কোনো রুটিন সেট করা নেই। উপরে বাটন চাপুন।</p>`;
        return;
    }

    // সময় অনুযায়ী ছোট থেকে বড় (Chronological Order) ক্রমানুসারে সাজানো
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
            <button onclick="deleteRoutine(${item.id})" style="margin-top:12px; background:none; border:none; color:#dc3545; cursor:pointer; font-size:12px; font-weight:bold; width:fit-content; padding:0;">🗑️ মুছে ফেলুন</button>
        `;
        routineList.appendChild(card);
    });
}

function deleteRoutine(id) {
    if (confirm("আপনি কি এই ক্লাসটি রুটিন থেকে ডিলিট করতে চান?")) {
        currentRoutine = currentRoutine.filter(item => item.id !== id);
        localStorage.setItem("routineData", JSON.stringify(currentRoutine));
        renderRoutine();
    }
}

// 24 Hour টাইম ফরম্যাটকে সুন্দর 12 Hour (AM/PM) ফরম্যাটে রূপান্তর
function convertTo12Hour(timeString) {
    let [hours, minutes] = timeString.split(':');
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // ০ টা বাজলে ১২ করা
    return `${hours}:${minutes} ${ampm}`;
}

// ==========================================
// ৬. AI OCR (ছবি থেকে নির্দিষ্ট সেকশনের রুটিন এক্সট্রাকশন)
// ==========================================
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
        // Tesseract.js লাইব্রেরি দিয়ে ইমেজ থেকে টেক্সট এক্সট্রাক্ট করা
        const result = await Tesseract.recognize(file, 'eng');
        const text = result.data.text;
        
        statusText.innerText = "🔍 আপনার সেকশনের ডাটা ফিল্টার করা হচ্ছে...";
        
        const lines = text.split('\n');
        let matchedClasses = 0;

        lines.forEach(line => {
            // যদি লাইনের ভেতরে ইউজারের ইনপুট দেওয়া নির্দিষ্ট সেকশন নাম থাকে
            if (line.toLowerCase().includes(sectionName.toLowerCase())) {
                
                // হোয়াইটস্পেস বা গ্যাপের ওপর ভিত্তি করে টেক্সটকে শব্দে ভাগ করা
                const words = line.split(/\s+/).filter(w => w.trim() !== "");
                
                if (words.length >= 4) {
                    // এক্সট্রাক্ট করা টেক্সটকে একটি অবজেক্টে রূপান্তর (সাধারণ স্ট্রাকচার অনুযায়ী)
                    const mockClass = {
                        id: Date.now() + Math.random(),
                        subject: words[0] || "Auto Subject",
                        code: words[1] || "000",
                        teacher: words[words.length - 1] || "Unknown",
                        room: words[words.length - 2] || "N/A",
                        time: "09:00", // ডিফল্ট বা এস্টিমেটেড টাইম (ছবি অনুযায়ী পার্সিং আরো নিখুঁত করা যায়)
                        day: "Sunday"  // ডিফল্ট ডে
                    };
                    
                    // ট্রাই টু গেস টাইম যদি ফরম্যাট মিলে (যেমন: 10:30)
                    const timeRegex = /\b\d{2}:\d{2}\b/;
                    const foundTime = line.match(timeRegex);
                    if (foundTime) {
                        mockClass.time = foundTime[0];
                    }

                    currentRoutine.push(mockClass);
                    matchedClasses++;
                }
            }
        });

        if (matchedClasses > 0) {
            localStorage.setItem("routineData", JSON.stringify(currentRoutine));
            renderRoutine();
            statusText.innerText = `✅ সফলভাবে আপনার সেকশনের ${matchedClasses} টি ক্লাস আলাদা করে সেভ করা হয়েছে!`;
            setTimeout(() => {
                closeModal("upload-modal");
                statusText.innerText = "";
            }, 2500);
        } else {
            statusText.innerText = "❌ আপনার সেকশনের কোনো স্পষ্ট তথ্য খুঁজে পাওয়া যায়নি। ম্যানুয়ালি ট্রাই করুন।";
        }

    } catch (error) {
        console.error(error);
        statusText.innerText = "❌ ফাইল প্রসেস করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।";
    }
}

// ==========================================
// ৭. ব্যাকগ্রাউন্ড অ্যালার্ম ও নোটিফিকেশন লজিক
// ==========================================
function checkUpcomingClasses() {
    if (currentRoutine.length === 0) return;

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const now = new Date();
    const todayName = days[now.getDay()];
    
    // বর্তমান সময়কে মিনিটে রূপান্তর (যেমন: 10:15 AM = 10*60 + 15 = 615 মিনিট)
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    currentRoutine.forEach(item => {
        // শুধুমাত্র আজকের দিনের ক্লাস ফিল্টার করবে
        if (item.day.toLowerCase() === todayName.toLowerCase()) {
            const [classHour, classMinute] = item.time.split(':').map(Number);
            const classMinutes = classHour * 60 + classMinute;

            // যদি ক্লাস শুরু হতে ঠিক ৪৫ মিনিট বাকি থাকে (classMinutes - currentMinutes === 45)
            if (classMinutes - currentMinutes === 45) {
                triggerAlarm(item.subject, item.room);
            }
        }
    });
}

function triggerAlarm(subject, room) {
    // ১. ব্রাউজারে পুশ নোটিফিকেশন পাঠানো
    if (Notification.permission === "granted") {
        new Notification("AmarRoutine ক্লাসের সময় হয়েছে! ⏰", {
            body: `৪৫ মিনিট পর আপনার "${subject}" ক্লাস শুরু হবে। রুম নম্বর: ${room}`,
            icon: "https://cdn-icons-png.flaticon.com/512/2693/2693507.png",
            tag: "class-alert",
            requireInteraction: true // ইউজার ক্লিক না করা পর্যন্ত নোটিফিকেশন থাকবে
        });
    }

    // ২. অটোমেটিক অ্যালার্ম সাউন্ড প্লে করা
    const alarmSound = document.getElementById("alarm-sound");
    if (alarmSound) {
        // ব্রাউজার পলিসির কারণে প্লে করার ট্রাই-ক্যাচ ব্লক
        alarmSound.play().then(() => {
            console.log("অ্যালার্ম বাজছে...");
            
            // ঠিক ১৫ সেকেন্ড (১৫০০০ মিলি-সেকেন্ড) পর অ্যালার্ম অটোমেটিক স্টপ করা
            setTimeout(() => {
                alarmSound.pause();
                alarmSound.currentTime = 0; // অডিওর প্লে-হেড শুরুতে নিয়ে যাওয়া
                console.log("১৫ সেকেন্ড পূর্ণ হওয়ায় অ্যালার্ম স্বয়ংক্রিয়ভাবে বন্ধ হয়েছে।");
            }, 15000);
            
        }).catch(err => {
            console.log("ইউজার ব্রাউজারে কোনো ইন্টারঅ্যাকশন (ক্লিক) না করায় অডিও প্লে হতে পারেনি:", err);
        });
    }
}
