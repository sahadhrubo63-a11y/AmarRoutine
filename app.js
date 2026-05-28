// ==========================================
// 1. Service Worker Initialization Lifecycle Management
// ==========================================
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(() => console.log("Service Worker Registered Successfully!"))
        .catch(err => console.error("Service Worker Registration Critical Failure Error:", err));
}

let currentRoutine = [];

document.addEventListener("DOMContentLoaded", () => {
    checkExistingUser();
    requestNotificationPermission();
    setInterval(checkUpcomingClasses, 60000);
});

function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission();
    }
}

function checkExistingUser() {
    const instName = localStorage.getItem("instName");
    const programName = localStorage.getItem("programName");
    if (instName && programName) {
        showDashboard(instName, programName);
    }
}

// ==========================================
// 2. Onboarding Workflow Action Handlers & Switch Theme Configurations
// ==========================================
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
    if (confirm("Are you sure you want to change your profile? Saved routine items will persist.")) {
        localStorage.removeItem("instName");
        localStorage.removeItem("programName");
        document.getElementById("onboarding-screen").classList.remove("hidden");
        document.getElementById("dashboard-screen").classList.add("hidden");
    }
}

function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }

// ==========================================
// 3. Document Local Storage Manual Object Management
// ==========================================
function saveManualRoutine(e) {
    e.preventDefault(); 
    
    const subject = document.getElementById("m-subject").value.trim();
    const code = document.getElementById("m-code").value.trim();
    const teacher = document.getElementById("m-teacher").value.trim();
    const room = document.getElementById("m-room").value.trim();
    const time = document.getElementById("m-time").value;
    const day = document.getElementById("m-day").value;

    if (!subject || !code || !time) {
        alert("Please enter Subject, Course Code, and Time!");
        return;
    }

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
    if (confirm("Are you sure you want to remove this class entry?")) {
        currentRoutine = currentRoutine.filter(item => item.id !== id);
        localStorage.setItem("routineData", JSON.stringify(currentRoutine));
        renderRoutine();
    }
}

function convertTo12Hour(timeString) {
    let [hours, minutes] = timeString.split(':');
    let ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
}

// ==========================================
// 4. Remote Dependency AI OCR & PDF Production-Safe Processing Engine
// ==========================================

// Sandbox safe PDF processor that bypasses worker thread strict CORS blocks
async function convertPdfToImageCanvas(file) {
    // Configure production library fallback directly to standard parameters
    const pdfjs = window['pdfjs-dist/build/pdf'];
    pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

    const arrayBuffer = await file.arrayBuffer();
    const typedarray = new Uint8Array(arrayBuffer);
    
    const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
    const page = await pdf.getPage(1); 
    const viewport = page.getViewport({ scale: 2.5 }); // High resolution upscale for clear OCR processing
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    
    const renderContext = {
        canvasContext: context,
        viewport: viewport
    };
    await page.render(renderContext).promise;
    return canvas;
}

async function processRoutineFile() {
    const fileInput = document.getElementById("routine-file");
    const sectionName = document.getElementById("filter-section").value.trim();
    const statusText = document.getElementById("scan-status");

    if (!sectionName || fileInput.files.length === 0) {
        alert("Please specify the target section code and upload a file!");
        return;
    }

    statusText.style.color = "#ffc107";
    statusText.innerText = "⏳ AI processing file pipeline... Please hold on.";
    
    const file = fileInput.files[0];
    let sourceToScan;

    try {
        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf')) {
            statusText.innerText = "⏳ Parsing document contents safely...";
            sourceToScan = await convertPdfToImageCanvas(file);
        } else {
            sourceToScan = file;
        }

        statusText.innerText = "⏳ Running text recognition (OCR)...";
        const result = await Tesseract.recognize(sourceToScan, 'eng', {
            logger: m => {
                if(m.status === 'recognizing text') {
                    statusText.innerText = `⏳ Scanning status: ${Math.floor(m.progress * 100)}%`;
                }
            }
        });
        
        const text = result.data.text;
        const lines = text.split('\n');
        let matchedClasses = 0;

        lines.forEach(line => {
            if (line.toLowerCase().includes(sectionName.toLowerCase())) {
                const words = line.split(/\s+/).filter(w => w.trim() !== "");
                
                if (words.length >= 2) {
                    let extractedTime = "09:00"; 
                    const timeRegex = /(\d{1,2}:\d{2})/;
                    const foundTime = line.match(timeRegex);
                    if (foundTime) {
                        extractedTime = foundTime[1].padStart(5, '0'); 
                    }

                    let extractedDay = "Sunday"; 
                    const daysArray = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                    for (let d of daysArray) {
                        if(line.toLowerCase().includes(d.toLowerCase())) { extractedDay = d; break; }
                    }

                    const extractedClass = {
                        id: Date.now() + Math.random(),
                        subject: words[0] || "Auto Subject",
                        code: words[1] || "000",
                        teacher: words[words.length - 1] || "TBA",
                        room: words[words.length - 2] || "N/A",
                        time: extractedTime,
                        day: extractedDay
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
            statusText.innerText = `✅ Successfully extracted ${matchedClasses} classes matching section "${sectionName}"!`;
            fileInput.value = "";
            document.getElementById("filter-section").value = "";
            setTimeout(() => { closeModal("upload-modal"); statusText.innerText = ""; }, 2500);
        } else {
            statusText.style.color = "#dc3545";
            statusText.innerText = `❌ No schedule data discovered for section "${sectionName}". Check document layout.`;
        }

    } catch (error) {
        console.error("Advanced OCR System Pipeline Exception:", error);
        statusText.style.color = "#dc3545";
        statusText.innerText = "❌ Processing failure occurred during AI scanner tracking!";
    }
}

// ==========================================
// 5. Native Device Schedule Matching Push Alert Loop Engine
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

            if (classMinutes - currentMinutes === 45) {
                triggerAlarm(item.subject, item.room);
            }
        }
    });
}

function triggerAlarm(subject, room) {
    if (Notification.permission === "granted") {
        new Notification("AmarRoutine Alert! ⏰", {
            body: `Your class "${subject}" starts in 45 minutes. Room: ${room}`,
            icon: "https://cdn-icons-png.flaticon.com/512/2693/2693507.png"
        });
    }

    const alarmSound = document.getElementById("alarm-sound");
    if (alarmSound) {
        alarmSound.play().then(() => {
            setTimeout(() => {
                alarmSound.pause();
                alarmSound.currentTime = 0; 
            }, 15000);
        }).catch(err => console.warn("Media playback prevented by standard rules:", err));
    }
}
