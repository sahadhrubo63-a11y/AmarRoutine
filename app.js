let classDatabase = [];
let examDatabase = [];
let selectedUserSubjects = [];

// 📚 শুধুমাত্র সাবজেক্ট ডাটা অবজেক্ট (কোর্সের অপশনগুলো সরাসরি HTML এ চলে গেছে)
const subjectRegistryMap = {
    "CSE (Computer Science)": ["Programming in C", "Data Structures", "Algorithms", "Database Systems", "Operating Systems", "Computer Networks", "Digital Logic Design"],
    "Software Engineering": ["Software Requirements", "Software Architecture", "Software Quality Assurance", "Design Patterns", "Web Engineering", "Mobile App Dev"],
    "EEE (Electrical Eng)": ["Circuit Analysis", "Electronics I", "Digital Electronics", "Electrical Machines", "Power Systems", "Signal & Systems"],
    "BBA (Management/HRM)": ["Principles of Management", "Organizational Behavior", "Human Resource Management", "Strategic Management", "Business Communication"],
    "BBA (Finance/Accounting)": ["Financial Accounting", "Corporate Finance", "Cost Accounting", "Auditing", "Taxation", "Financial Institutions"],
    "Science Group": ["Physics", "Chemistry", "Higher Mathematics", "Biology", "ICT", "Bangla", "English"],
    "Commerce Group": ["Accounting", "Finance & Banking", "Business Organization", "Production Management", "ICT", "Bangla", "English"],
    "Arts Group": ["Civics & Good Governance", "History", "Islamic History", "Geography", "Economics", "Logic", "Bangla", "English"]
};

document.addEventListener("DOMContentLoaded", () => {
    evaluateSystemState();
    setInterval(executeAnalogWallClockEngine, 1000);
    executeAnalogWallClockEngine();
    fetchAtmosphericData();
    initWizardCascadeEngine();
});

// 📌 ডাইনামিক ফিল্টারিং ইঞ্জিন (HTML অপশনগ্রুপ শো/হাইড মেকানিজম)
function initWizardCascadeEngine() {
    const categorySelect = document.getElementById("setup-category");
    const courseFieldWrapper = document.getElementById("course-group-field");
    const programSelect = document.getElementById("setup-program");
    const subjectFieldWrapper = document.getElementById("wizard-subject-select-field");
    const checkboxPool = document.getElementById("wizard-subject-checkbox-pool");

    if (!categorySelect || !programSelect) return;

    // ১. ক্যাটাগরি চেঞ্জ হলে HTML এর নির্দিষ্ট Optgroup দৃশ্যমান হবে
    categorySelect.addEventListener("change", (e) => {
        const cat = e.target.value;
        programSelect.value = ""; // ড্রপডাউন রিসেট করুন
        
        // সমস্ত optgroup আগে হাইড করুন
        document.querySelectorAll(".track-group").forEach(el => el.classList.add("hidden"));
        
        // সিলেক্ট করা ক্যাটাগরির optgroup শো করুন
        const activeGroup = document.querySelector(`.${cat}-group`);
        if (activeGroup) {
            activeGroup.classList.remove("hidden");
            courseFieldWrapper.classList.remove("hidden");
        } else {
            courseFieldWrapper.classList.add("hidden");
        }
        subjectFieldWrapper.classList.add("hidden"); 
    });

    // ২. কোর্স/গ্রুপ সিলেক্ট করলে সাবজেক্ট বক্স রেন্ডার হবে
    programSelect.addEventListener("change", (e) => {
        const selectedCourse = e.target.value;
        const subjects = subjectRegistryMap[selectedCourse] || [];

        checkboxPool.innerHTML = "";

        if (subjects.length > 0) {
            subjects.forEach(subject => {
                const label = document.createElement("label");
                label.className = "wizard-checkbox-card";
                label.innerHTML = `
                    <input type="checkbox" value="${subject}" checked class="subject-checkbox-input">
                    <span class="custom-indicator"></span>
                    <span class="subject-title-text">${subject}</span>
                `;
                checkboxPool.appendChild(label);
            });
            subjectFieldWrapper.classList.remove("hidden");
        } else {
            subjectFieldWrapper.classList.add("hidden");
        }
    });
}

// 📌 উইজার্ড থেকে ডেটা সংগ্রহ এবং ড্যাশবোর্ড অ্যাক্টিভেশন
function buildSystemCore() {
    const inst = document.getElementById("setup-inst").value.trim();
    const prog = document.getElementById("setup-program").value;
    const sect = document.getElementById("setup-section").value.trim();

    if(!inst || !prog || !sect) return alert("Please fulfill all setup specifications.");

    const checkedCheckboxes = document.querySelectorAll(".subject-checkbox-input:checked");
    const selectedSubjects = Array.from(checkedCheckboxes).map(cb => cb.value);

    if(selectedSubjects.length === 0) {
        return alert("Please select at least one subject before activating.");
    }

    localStorage.setItem("core_inst", inst);
    localStorage.setItem("core_prog", prog);
    localStorage.setItem("core_sect", sect);
    localStorage.setItem("core_selected_subjects", JSON.stringify(selectedSubjects));

    deployWorkspace(inst, prog, sect);
}

function deployWorkspace(inst, prog, sect) {
    document.getElementById("setup-screen").classList.add("hidden");
    document.getElementById("dashboard-screen").classList.remove("hidden");

    // 🎯 ড্যাশবোর্ড আইডেন্টিটি বার আপডেট (একসাথে সব ডেটা রিড করবে)
    document.getElementById("dash-display-inst").innerText = inst.toUpperCase();
    document.getElementById("dash-display-meta").innerText = `${prog.toUpperCase()} | SECTION: ${sect.toUpperCase()}`;

    // পিএনজি এক্সপোর্ট ফ্রেম মেটাডাটা সিঙ্ক
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
    injectDynamicClickTabs();
}

// 📌 কুইক-পিক মডাল ট্যাব ইনজেক্টর
function injectDynamicClickTabs() {
    const savedSubjects = localStorage.getItem("core_selected_subjects");
    if (!savedSubjects) return;

    selectedUserSubjects = JSON.parse(savedSubjects);
    
    const classContainer = document.getElementById("class-tabs-container");
    const examContainer = document.getElementById("exam-tabs-container");
    
    if (classContainer) {
        classContainer.innerHTML = "";
        selectedUserSubjects.forEach(subject => {
            const tabBtn = document.createElement("button");
            tabBtn.type = "button";
            tabBtn.className = "click-pick-tab";
            tabBtn.innerText = subject;
            tabBtn.onclick = () => { document.getElementById("c-title").value = subject; };
            classContainer.appendChild(tabBtn);
        });
    }

    if (examContainer) {
        examContainer.innerHTML = "";
        selectedUserSubjects.forEach(subject => {
            const tabBtn = document.createElement("button");
            tabBtn.type = "button";
            tabBtn.className = "click-pick-tab exam-tab-style";
            tabBtn.innerText = subject;
            tabBtn.onclick = () => { document.getElementById("e-title").value = subject; };
            examContainer.appendChild(tabBtn);
        });
    }
}

// 🕒 অ্যানালগ ক্লক কোর ইঞ্জিন
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
