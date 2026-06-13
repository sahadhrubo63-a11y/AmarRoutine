let classDatabase = [];
let examDatabase = [];

document.addEventListener("DOMContentLoaded", () => {
    evaluateSystemState();
    setInterval(executeAnalogWallClockEngine, 1000);
    executeAnalogWallClockEngine();
    fetchAtmosphericData();
    initWizardCourseViewer();
});

// 📌 উইজার্ড ইন্টারফেসে ঢোকার সময় ইউনিভার্সিটির সব কোর্স লিস্ট প্রদর্শনের লজিক
function initWizardCourseViewer() {
    const programSelect = document.getElementById("setup-program");
    
    if (programSelect) {
        const courseViewer = document.createElement("div");
        courseViewer.id = "wizard-course-viewer";
        courseViewer.style.cssText = "margin-top: 15px; font-size: 13px; color: #1e293b; background: #f1f5f9; padding: 16px; border-radius: 14px; display: none; line-height: 1.6; border-left: 4px solid #0284c7; font-weight: 600; text-align: left; max-height: 250px; overflow-y: auto;";
        programSelect.parentNode.appendChild(courseViewer);

        programSelect.addEventListener("change", (e) => {
            const selectedValue = e.target.value;
            let coursesText = "";

            if (selectedValue === "University (Science & CSE Related)") {
                coursesText = `🏢 <strong>University Science & Engineering Courses:</strong><br>
                • B.Sc. in Computer Science & Engineering (CSE)<br>
                • B.Sc. in Software Engineering (SWE)<br>
                • B.Sc. in Electrical & Electronic Engineering (EEE)<br>
                • B.Sc. in Civil Engineering (CE)<br>
                • B.Sc. in Mechanical Engineering (ME)<br>
                • B.Sc. in Industrial & Production Engineering (IPE)<br>
                • B.Sc. in Textile Engineering (TE)<br>
                • Bachelor of Architecture (B.Arch)<br>
                • Urban & Regional Planning (URP)<br>
                • B.Sc. in Mathematics / Physics / Chemistry / Statistics<br>
                • Biochemistry & Molecular Biology / Microbiology<br>
                • Genetic Engineering & Biotechnology<br>
                • Bachelor of Pharmacy (B.Pharm)<br>
                • Environmental Science`;
            } else if (selectedValue === "University (Commerce Related)") {
                coursesText = `🏢 <strong>University Commerce & Business Courses:</strong><br>
                • Bachelor of Business Administration (BBA)<br>
                • Accounting & Information Systems (AIS)<br>
                • Finance & Banking<br>
                • Marketing<br>
                • Management Studies<br>
                • Human Resource Management (HRM)<br>
                • Management Information Systems (MIS)<br>
                • International Business (IB)<br>
                • Tourism & Hospitality Management<br>
                • Supply Chain Management<br>
                • Entrepreneurship Development`;
            } else if (selectedValue === "University (Arts & Humanities)") {
                coursesText = `🏢 <strong>University Arts, Humanities & Social Science Courses:</strong><br>
                • BA (Hons) in English Literature & Linguistics<br>
                • LL.B (Hons) / Law & Justice<br>
                • BSS/B.Sc. in Economics<br>
                • BA in Bangla Literature & Language<br>
                • Sociology / Political Science<br>
                • International Relations (IR)<br>
                • Journalism & Media Studies<br>
                • Public Administration / Anthropology<br>
                • Philosophy / History / Islamic History & Culture<br>
                • B.Sc. in Psychology<br>
                • Bachelor of Fine Arts (BFA / Charukala)<br>
                • Criminology / Development Studies`;
            } else if (selectedValue === "School/College (Science Group)") {
                coursesText = "🔬 <strong>School/College Science Subjects:</strong><br>• Physics, Chemistry, Higher Mathematics, Biology, ICT, Bangla, English Core Frameworks";
            } else if (selectedValue === "School/College (Commerce Group)") {
                coursesText = "📊 <strong>School/College Commerce Subjects:</strong><br>• Accounting, Finance & Banking, Business Organization & Management, Production Management, ICT";
            } else if (selectedValue === "School/College (Arts Group)") {
                coursesText = "🎨 <strong>School/College Arts Subjects:</strong><br>• Civics & Good Governance, History, Islamic History, Geography, Economics, Logic, Social Work";
            }

            if (coursesText) {
                courseViewer.innerHTML = coursesText;
                courseViewer.style.display = "block";
            } else {
                courseViewer.style.display = "none";
            }
        });
    }
}

// 🕒 সার্কেল ক্লাসিক অ্যানালগ ওয়াল ক্লক
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

// 📍 আবহাওয়া ট্র্যাকিং
function fetchAtmosphericData() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(async (pos) => {
            try {
                const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true`);
                const data = await res.json();
                if(data && data.current_weather) {
                    document.getElementById("live-weather-station").innerHTML = `
                        <div class="weather-station-wrapper">
                            <span class="station-radar-pulse">🌤️</span>
                            <div>
                                <h3>${Math.round(data.current_weather.temperature)}°C</h3>
                                <p>Ecosystem Pulse Active</p>
                            </div>
                        </div>`;
                }
            } catch(e) {
                document.getElementById("live-weather-station").innerHTML = "<p>🌤️ Weather Blocked</p>";
            }
        }, () => {
            document.getElementById("live-weather-station").innerHTML = "<p>📍 No Location</p>";
        });
    }
}

// 📊 ক্লাস রুটিন গ্রিড রেন্ডারার
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
                        <span class="node-purge-trigger" onclick="purgeNodeEntry(${nodeMatch.id}, 'CLASS')">✕</span>
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
                        <span class="node-purge-trigger" onclick="purgeNodeEntry(${nodeMatch.id}, 'EXAM')">✕</span>
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

// 📸 ইমেজ স্ন্যাপশট জেনারেটর
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
    document.getElementById("dash-display-meta").innerText = `${prog} | SECTION: ${sect}`;

    document.querySelectorAll(".target-inst-name").forEach(el => el.innerText = inst.toUpperCase());
    
    const manifests = document.querySelectorAll(".target-program-manifest");
    if(manifests[0]) manifests[0].innerText = `${prog} — CLASS ROUTINE MATRIX`;
    if(manifests[1]) manifests[1].innerText = `${prog} — EXAMINATION TIMELINE`;

    document.querySelectorAll(".target-sec-val").forEach(el => el.innerText = sect.toUpperCase());

    const cDb = localStorage.getItem("db_classes_v2");
    const eDb = localStorage.getItem("db_exams_v2");
    if(cDb) classDatabase = JSON.parse(cDb);
    if(eDb) examDatabase = JSON.parse(eDb);

    compileClassGrid();
    compileExamGrid();
}

function insertClassItem(e) {
    e.preventDefault();
    const title = document.getElementById("c-title").value.trim();
    const code = document.getElementById("c-code").value.trim();
    const meta = document.getElementById("c-meta").value.trim();
    const type = document.getElementById("c-type").value;
    const room = document.getElementById("c-room").value.trim();
    const start = document.getElementById("c-start").value;
    const end = document.getElementById("c-end").value;
    const day = document.getElementById("c-day").value;

    classDatabase.push({ id: Date.now(), title, code, meta, type, room, start, end, day });
    localStorage.setItem("db_classes_v2", JSON.stringify(classDatabase));
    
    toggleModal('class-modal', false);
    document.getElementById("class-form").reset();
    compileClassGrid();
}

function insertExamItem(e) {
    e.preventDefault();
    const title = document.getElementById("e-title").value.trim();
    const day = document.getElementById("e-day").value;
    const start = document.getElementById("e-start").value;

    examDatabase.push({ id: Date.now() + 5, title, day, start });
    localStorage.setItem("db_exams_v2", JSON.stringify(examDatabase));
    
    toggleModal('exam-modal', false);
    document.getElementById("exam-form").reset();
    compileExamGrid();
}

function purgeNodeEntry(id, prefix) {
    if(confirm(`Remove this item from routine grid?`)) {
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

function evaluateSystemState() {
    const inst = localStorage.getItem("core_inst");
    const prog = localStorage.getItem("core_prog");
    const sect = localStorage.getItem("core_sect");
    if(inst && prog && sect) deployWorkspace(inst, prog, sect);
}

function purgeSystemKernel() {
    if(confirm("Flush all locally stored data?")) {
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
    if(status) el.classList.remove("hidden");
    else el.classList.add("hidden");
}
