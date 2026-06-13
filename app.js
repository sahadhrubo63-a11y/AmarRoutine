let classDatabase = [];
let examDatabase = [];

document.addEventListener("DOMContentLoaded", () => {
    evaluateSystemState();
    setInterval(executeAnalogWallClockEngine, 1000);
    executeAnalogWallClockEngine();
    initWizardCascadeEngine();
    autoTriggerSavedWeather(); // আগে পারমিশন দেওয়া থাকলে অটোমেটিক লোড হবে
});

// 📌 ফিল্টারিং ইঞ্জিন (HTML অপশনগ্রুপ শো/হাইড মেকানিজম)
function initWizardCascadeEngine() {
    const categorySelect = document.getElementById("setup-category");
    const courseFieldWrapper = document.getElementById("course-group-field");
    const programSelect = document.getElementById("setup-program");

    if (!categorySelect || !programSelect) return;

    categorySelect.addEventListener("change", (e) => {
        const cat = e.target.value;
        programSelect.value = "";
        
        document.querySelectorAll(".track-group").forEach(el => el.classList.add("hidden"));
        
        const activeGroup = document.querySelector(`.${cat}-group`);
        if (activeGroup) {
            activeGroup.classList.remove("hidden");
            courseFieldWrapper.classList.remove("hidden");
        } else {
            courseFieldWrapper.classList.add("hidden");
        }
    });
}

// 📌 লোকেশন ভিত্তিক আবহাওয়া ইঞ্জিন (অন-ডিমান্ড পারমিশন)
function requestLocationWeather() {
    const weatherStation = document.getElementById("live-weather-station");
    weatherStation.innerHTML = "<p>📡 Processing Geolocation Tokens...</p>";

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;
            
            // পরবর্তী অটো-লোডের জন্য লোকাল স্টোরেজে কোঅর্ডিনেট সেভ রাখুন
            localStorage.setItem("weather_lat", lat);
            localStorage.setItem("weather_lon", lon);
            
            executeWeatherFetch(lat, lon);
        }, () => {
            weatherStation.innerHTML = "<p>❌ Location access denied by client browser.</p>";
        });
    } else {
        weatherStation.innerHTML = "<p>❌ Geolocation is not supported.</p>";
    }
}

async function executeWeatherFetch(lat, lon) {
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
        const data = await res.json();
        if(data && data.current_weather) {
            document.getElementById("live-weather-station").innerHTML = `
                <div class="weather-station-wrapper">
                    <span class="station-radar-pulse">🌤️</span>
                    <div>
                        <h3>${Math.round(data.current_weather.temperature)}°C</h3>
                        <p>Location-Bound Sync Active</p>
                    </div>
                </div>`;
        }
    } catch(e) {
        document.getElementById("live-weather-station").innerHTML = "<p>🌤️ Weather Network Error</p>";
    }
}

function autoTriggerSavedWeather() {
    const savedLat = localStorage.getItem("weather_lat");
    const savedLon = localStorage.getItem("weather_lon");
    if(savedLat && savedLon) {
        executeWeatherFetch(savedLat, savedLon);
    }
}

// 📌 ড্যাশবোর্ড এক্টিভেশন
function buildSystemCore() {
    const inst = document.getElementById("setup-inst").value.trim();
    const prog = document.getElementById("setup-program").value;
    const sect = document.getElementById("setup-section").value.trim();

    if(!inst || !prog || !sect) return alert("Please fulfill all setup specifications.");

    localStorage.setItem("core_inst", inst);
    localStorage.setItem("core_prog", prog);
    localStorage.setItem("core_sect", sect);

    deployWorkspace(inst, prog, sect);
}

function deployWorkspace(inst, prog, sect) {
    document.getElementById("setup-screen").classList.add("hidden");
    document.getElementById("dashboard-screen").classList.remove("hidden");

    document.getElementById("dash-display-inst").innerText = inst.toUpperCase();
    document.getElementById("dash-display-meta").innerText = `${prog.toUpperCase()} | SECTION: ${sect.toUpperCase()}`;

    document.querySelectorAll(".target-inst-name").forEach(el => el.innerText = inst.toUpperCase());
    
    const manifests = document.querySelectorAll(".target-program-manifest");
    if(manifests[0]) manifests[0].innerText = `${prog.toUpperCase()} — CLASS ROUTINE MATRIX`;
    if(manifests[1]) manifests[1].innerText = `${prog.toUpperCase()} — EXAMINATION TIMELINE`;

    document.querySelectorAll(".target-sec-val").forEach(el => el.innerText = sect.toUpperCase());

    const cDb = localStorage.getItem("db_classes_v2");
    const eDb = localStorage.getItem("db_exams_v2");
    if(cDb) classDatabase = JSON.parse(cDb);
    if(eDb) examDatabase = JSON.parse(eDb);

    compileClassGrid();
    compileExamGrid();
}

// 🕒 অ্যানালগ ক্লক ইঞ্জিন
function executeAnalogWallClockEngine() {
    const hrHand = document.getElementById("wall-hour");
    const minHand = document.getElementById("wall-minute");
    const secHand = document.getElementById("wall-second");
    const calendarDate = document.getElementById("live-calendar-date");

    if (!hrHand || !minHand || !secHand) return;

    const now = new Date();
    const seconds = now.getSeconds();
    const minutes = now.getMinutes();
    const hours = now.getHours();

    const secDegrees = ((seconds / 60) * 360);
    const minDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6);
    const hrDegrees = ((hours % 12 / 12) * 360) + ((minutes / 60) * 30);

    secHand.style.transform = `translateX(-50%) rotate(${secDegrees}deg)`;
    minHand.style.transform = `translateX(-50%) rotate(${minDegrees}deg)`;
    hrHand.style.transform = `translateX(-50%) rotate(${hrDegrees}deg)`;

    calendarDate.innerText = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// 📊 ক্লাস রুটিন গ্রিড রেন্ডারার (এডিট এবং ডিলিট কন্ট্রোল ট্রিগার সহ)
function compileClassGrid() {
    const tbody = document.getElementById("class-matrix-body");
    tbody.innerHTML = "";

    if(classDatabase.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-matrix-fallback">No slots registered inside this routine directory.</td></tr>`;
        return;
    }

    const sortedSlots = [...new Set(classDatabase.map(x => `${x.start} - ${x.end}`))].sort();
    const cycleDays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    sortedSlots.forEach(slot => {
        const tr = document.createElement("tr");
        
        const tdTime = document.createElement("td");
        tdTime.className = "time-axis-index";
        const [st, et] = slot.split(" - ");
        tdTime.innerHTML = `<strong>${formatTwelveHour(st)}<br>to<br>${formatTwelveHour(et)}</strong>`;
        tr.appendChild(tdTime);

        cycleDays.forEach(day => {
            const tdCell = document.createElement("td");
            const nodeMatch = classDatabase.find(x => `${x.start} - ${x.end}` === slot && x.day.toLowerCase() === day.toLowerCase());

            if(nodeMatch) {
                tdCell.className = "occupied-fidelity-cell";
                const isLab = nodeMatch.type.toLowerCase() === "lab";
                
                tdCell.innerHTML = `
                    <div class="cell-matrix-wrapper">
                        <div class="cell-control-overlay">
                            <span class="cell-btn edit-btn" onclick="openClassEditModal(${nodeMatch.id})">✏️ Edit</span>
                            <span class="cell-btn purge-btn" onclick="purgeNodeEntry(${nodeMatch.id}, 'CLASS')">🗑️ Del</span>
                        </div>
                        <div class="cell-primary-title">Sub: ${nodeMatch.title}</div>
                        <div class="cell-secondary-code">Code: ${nodeMatch.code}</div>
                        <div class="cell-teacher-name">Tchr: ${nodeMatch.meta}</div>
                        <div class="cell-room-no">Room: ${nodeMatch.room}</div>
                        <div class="cell-type-pill ${isLab ? 'pill-lab' : 'pill-theory'}">${nodeMatch.type.toUpperCase()}</div>
                    </div>`;
            } else {
                tdCell.className = "barren-cell-space";
                tdCell.innerText = "—";
            }
            tr.appendChild(tdCell);
        });
        tbody.appendChild(tr);
    });
}

// 📝 এক্সাম রুটিন গ্রিড রেন্ডারার
function compileExamGrid() {
    const tbody = document.getElementById("exam-matrix-body");
    tbody.innerHTML = "";

    if(examDatabase.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-matrix-fallback">No exams registered inside this matrix.</td></tr>`;
        return;
    }

    const sortedTimes = [...new Set(examDatabase.map(x => x.start))].sort();
    const cycleDays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    sortedTimes.forEach(time => {
        const tr = document.createElement("tr");
        
        const tdTime = document.createElement("td");
        tdTime.className = "time-axis-index exam-time-head";
        tdTime.innerHTML = `<strong>${formatTwelveHour(time)}</strong>`;
        tr.appendChild(tdTime);

        cycleDays.forEach(day => {
            const tdCell = document.createElement("td");
            const nodeMatch = examDatabase.find(x => x.start === time && x.day.toLowerCase() === day.toLowerCase());

            if(nodeMatch) {
                tdCell.className = "occupied-fidelity-cell exam-box-cell";
                tdCell.innerHTML = `
                    <div class="cell-matrix-wrapper">
                        <div class="cell-control-overlay">
                            <span class="cell-btn edit-btn" onclick="openExamEditModal(${nodeMatch.id})">✏️ Edit</span>
                            <span class="cell-btn purge-btn" onclick="purgeNodeEntry(${nodeMatch.id}, 'EXAM')">🗑️ Del</span>
                        </div>
                        <div class="exam-cell-subject">${nodeMatch.title}</div>
                        <div class="exam-cell-time">⏰ ${formatTwelveHour(nodeMatch.start)}</div>
                        <div class="exam-cell-day-pill">${nodeMatch.day}</div>
                    </div>`;
            } else {
                tdCell.className = "barren-cell-space exam-barren";
                tdCell.innerText = "—";
            }
            tr.appendChild(tdCell);
        });
        tbody.appendChild(tr);
    });
}

// ✏️ এডিট মোড ওপেনিং লজিক (ক্লাস)
function openClassEditModal(id) {
    const match = classDatabase.find(x => x.id === id);
    if(!match) return;

    document.getElementById("c-edit-id").value = match.id;
    document.getElementById("c-title").value = match.title;
    document.getElementById("c-code").value = match.code;
    document.getElementById("c-meta").value = match.meta;
    document.getElementById("c-type").value = match.type;
    document.getElementById("c-room").value = match.room;
    document.getElementById("c-start").value = match.start;
    document.getElementById("c-end").value = match.end;
    document.getElementById("c-day").value = match.day;

    document.getElementById("class-modal-title").innerText = "🔧 Update Class Specifications";
    document.getElementById("class-submit-btn").innerText = "Save Data Metrics";
    toggleModal('class-modal', true);
}

// ✏️ এডিট মোড ওপেনিং লজিক (এক্সাম)
function openExamEditModal(id) {
    const match = examDatabase.find(x => x.id === id);
    if(!match) return;

    document.getElementById("e-edit-id").value = match.id;
    document.getElementById("e-title").value = match.title;
    document.getElementById("e-day").value = match.day;
    document.getElementById("e-start").value = match.start;

    document.getElementById("exam-modal-title").innerText = "🔧 Update Examination Matrix";
    document.getElementById("exam-submit-btn").innerText = "Save Data Metrics";
    toggleModal('exam-modal', true);
}

// 💾 ক্লাস ফর্ম সাবমিশন ইন্টারসেপ্টর (Add ও Edit উভয়ই হ্যান্ডেল করে)
function commitClassFormHandler(e) {
    e.preventDefault();
    const editId = document.getElementById("c-edit-id").value;
    
    const itemData = {
        title: document.getElementById("c-title").value.trim(),
        code: document.getElementById("c-code").value.trim(),
        meta: document.getElementById("c-meta").value.trim(),
        type: document.getElementById("c-type").value,
        room: document.getElementById("c-room").value.trim(),
        start: document.getElementById("c-start").value,
        end: document.getElementById("c-end").value,
        day: document.getElementById("c-day").value
    };

    if(editId) {
        // Edit Mode
        const index = classDatabase.findIndex(x => x.id == editId);
        if(index !== -1) {
            classDatabase[index] = { id: Number(editId), ...itemData };
        }
    } else {
        // New Insertion Mode
        classDatabase.push({ id: Date.now(), ...itemData });
    }

    localStorage.setItem("db_classes_v2", JSON.stringify(classDatabase));
    toggleModal('class-modal', false);
    compileClassGrid();
}

// 💾 এক্সাম ফর্ম সাবমিশন ইন্টারসেপ্টর
function commitExamFormHandler(e) {
    e.preventDefault();
    const editId = document.getElementById("e-edit-id").value;

    const itemData = {
        title: document.getElementById("e-title").value.trim(),
        day: document.getElementById("e-day").value,
        start: document.getElementById("e-start").value
    };

    if(editId) {
        const index = examDatabase.findIndex(x => x.id == editId);
        if(index !== -1) {
            examDatabase[index] = { id: Number(editId), ...itemData };
        }
    } else {
        examDatabase.push({ id: Date.now() + 5, ...itemData });
    }

    localStorage.setItem("db_exams_v2", JSON.stringify(examDatabase));
    toggleModal('exam-modal', false);
    compileExamGrid();
}

// 🗑️ নির্দিষ্ট একক নোড ডিলিট ইঞ্জিন
function purgeNodeEntry(id, prefix) {
    if(confirm(`Are you sure you want to remove this specific subject item slot?`)) {
        if(prefix === "CLASS") {
            classDatabase = classDatabase.filter(x => x.id !== id);
            localStorage.setItem("db_classes_v2", JSON.stringify(classDatabase));
            compileClassGrid();
        } else {
            examDatabase = examDatabase.filter(x => x.id !== id);
            localStorage.setItem("db_exams_v2", JSON.stringify(examDatabase));
            compileExamGrid();
        }
    }
}

// ❌ পুরো রুটিন / নির্দিষ্ট ডাটা ডিলিট করার কন্ট্রোল লজিক
function clearSpecificRoutine(type) {
    if(type === 'CLASS') {
        if(confirm("💥 Remove ALL classes from the class schedule track?")) {
            classDatabase = [];
            localStorage.removeItem("db_classes_v2");
            compileClassGrid();
        }
    } else if(type === 'EXAM') {
        if(confirm("💥 Remove ALL exam tokens from the examination track?")) {
            examDatabase = [];
            localStorage.removeItem("db_exams_v2");
            compileExamGrid();
        }
    } else if(type === 'ALL') {
        if(confirm("⚠️ CRITICAL WARNING: This will completely delete all added Class and Exam details data inside the system. Proceed?")) {
            classDatabase = [];
            examDatabase = [];
            localStorage.removeItem("db_classes_v2");
            localStorage.removeItem("db_exams_v2");
            compileClassGrid();
            compileExamGrid();
            alert("Matrix contents cleared successfully.");
        }
    }
}

// 📸 ইমেজ রেন্ডারিং ও এক্সপোর্ট ইঞ্জিন
function processFidelitySnapshot(frameId, fileNamePrefix) {
    const canvasNode = document.getElementById(frameId);
    const livePreviewBox = document.getElementById("live-preview-box");
    const viewportHolder = document.getElementById("preview-viewport-holder");

    canvasNode.classList.add("export-engine-lock-active");

    html2canvas(canvasNode, {
        scale: 3,
        useCORS: true,
        backgroundColor: "#ffffff"
    }).then(canvas => {
        const rawBase64Uri = canvas.toDataURL("image/jpeg", 1.0);
        
        viewportHolder.innerHTML = `<img src="${rawBase64Uri}" class="rendered-frame-monitor"/>`;
        livePreviewBox.classList.remove("hidden");

        const downloadTrigger = document.createElement("a");
        downloadTrigger.href = rawBase64Uri;
        downloadTrigger.download = `${fileNamePrefix}_${localStorage.getItem("core_sect") || "Routine"}.jpg`;
        document.body.appendChild(downloadTrigger);
        downloadTrigger.click();
        document.body.removeChild(downloadTrigger);

        canvasNode.classList.remove("export-engine-lock-active");
        livePreviewBox.scrollIntoView({ behavior: 'smooth' });
    });
}

function evaluateSystemState() {
    const inst = localStorage.getItem("core_inst");
    const prog = localStorage.getItem("core_prog");
    const sect = localStorage.getItem("core_sect");
    if(inst && prog && sect) deployWorkspace(inst, prog, sect);
}

function purgeSystemKernel() {
    if(confirm("Flush all architecture setup configs and reload to wizard?")) {
        localStorage.clear();
        location.reload();
    }
}

function formatTwelveHour(timeStr) {
    if(!timeStr) return "00:00";
    let [h, m] = timeStr.split(':');
    const meridian = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${h}:${m} ${meridian}`;
}

function toggleModal(id, status) {
    const el = document.getElementById(id);
    if(status) {
        el.classList.remove("hidden");
    } else {
        el.classList.add("hidden");
        // মোডাল ক্লোজ করার সময় আইডি ফর্ম ও রিসেট টাইটেল ক্লিয়ার করুন
        if(id === 'class-modal') {
            document.getElementById("class-form").reset();
            document.getElementById("c-edit-id").value = "";
            document.getElementById("class-modal-title").innerText = "Append Class Entry";
            document.getElementById("class-submit-btn").innerText = "Commit Class Slot";
        } else if(id === 'exam-modal') {
            document.getElementById("exam-form").reset();
            document.getElementById("e-edit-id").value = "";
            document.getElementById("exam-modal-title").innerText = "Append Examination Entry";
            document.getElementById("exam-submit-btn").innerText = "Commit Exam Slot";
        }
    }
}
