let classDatabase = [];
let examDatabase = [];

document.addEventListener("DOMContentLoaded", () => {
    evaluateSystemState();
    // অ্যানালগ ঘড়ির মেকানিজম সচল করার কোর লুপ থ্রেড
    setInterval(executeAnalogWallClockEngine, 1000);
    executeAnalogWallClockEngine();
    fetchAtmosphericData();
});

// 🕒 ১. সার্কেল টাইপ ক্লাসিক অ্যানালগ ওয়াল ক্লক মেকানিজম
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

    // ডিগ্রিতে কনভার্ট করার গাণিতিক সমীকরণ
    const secDegrees = ((seconds / 60) * 360);
    const minDegrees = ((minutes / 60) * 360) + ((seconds / 60) * 6);
    const hrDegrees = ((hours % 12 / 12) * 360) + ((minutes / 60) * 30);

    secHand.style.transform = `translateX(-50%) rotate(${secDegrees}deg)`;
    minHand.style.transform = `translateX(-50%) rotate(${minDegrees}deg)`;
    hrHand.style.transform = `translateX(-50%) rotate(${hrDegrees}deg)`;

    calendarDate.innerText = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// 📍 ২. লাইভ লোকেশন আবহাওয়া ট্র্যাকিং
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
                document.getElementById("live-weather-station").innerHTML = "<p>🌤️ Weather System Terminated</p>";
            }
        }, () => {
            document.getElementById("live-weather-station").innerHTML = "<p>📍 Geolocation Inaccessible</p>";
        });
    }
}

// 📊 ৩. ক্লাস এবং এক্সাম ইন্টিগ্রেটেড গ্রিড রেন্ডারার
function compileGridMatrix(targetDb, tbodyId, typePrefix) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = "";

    if(targetDb.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-matrix-fallback">No slots registered inside this routine directory.</td></tr>`;
        return;
    }

    const sortedSlots = [...new Set(targetDb.map(x => `${x.start} - ${x.end}`))].sort();
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
            const nodeMatch = targetDb.find(x => `${x.start} - ${x.end}` === slot && x.day.toLowerCase() === day.toLowerCase());

            if(nodeMatch) {
                tdCell.className = "occupied-fidelity-cell";
                const isLabTrack = nodeMatch.title.toLowerCase().includes("lab") || nodeMatch.code.toLowerCase().includes("lab");
                
                tdCell.innerHTML = `
                    <div class="cell-matrix-wrapper">
                        <span class="node-purge-trigger" onclick="purgeNodeEntry(${nodeMatch.id}, '${typePrefix}')">✕</span>
                        <div class="cell-primary-title">${nodeMatch.title}</div>
                        <div class="cell-secondary-code">${nodeMatch.code}</div>
                        <div class="cell-teacher-name">${nodeMatch.meta}</div>
                        <div class="cell-type-pill ${isLabTrack ? 'pill-lab' : 'pill-theory'}">${isLabTrack ? 'LAB' : 'THEORY'}</div>
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

// 📸 ৪. সম্পূর্ণ ক্লিন মোডে শুধুমাত্র নির্দিষ্ট আইডি ব্লক ইমেজে এক্সপোর্ট করার ইঞ্জিন
function processFidelitySnapshot(frameId, fileNamePrefix) {
    const canvasNode = document.getElementById(frameId);
    const livePreviewBox = document.getElementById("live-preview-box");
    const viewportHolder = document.getElementById("preview-viewport-holder");

    // এক্সপোর্ট ইঞ্জিন কনফিগারেশন লক অন (বর্ডার এবং এক্সট্রা শ্যাডো হাইড করার জন্য)
    canvasNode.classList.add("export-engine-lock-active");

    html2canvas(canvasNode, {
        scale: 3, // সুপার ক্রিস্টাল ৩ গুণ শার্প কোয়ালিটি নিশ্চিত করার জন্য
        useCORS: true,
        backgroundColor: "#ffffff"
    }).then(canvas => {
        const rawBase64Uri = canvas.toDataURL("image/jpeg", 1.0);
        
        viewportHolder.innerHTML = `<img src="${rawBase64Uri}" class="rendered-frame-monitor"/>`;
        livePreviewBox.classList.remove("hidden");

        // ডাউনলোড কনস্ট্রাকশন ট্রিগার
        const downloadTrigger = document.createElement("a");
        downloadTrigger.href = rawBase64Uri;
        downloadTrigger.download = `${fileNamePrefix}_Manifest_${localStorage.getItem("core_sect") || "Export"}.jpg`;
        document.body.appendChild(downloadTrigger);
        downloadTrigger.click();
        document.body.removeChild(downloadTrigger);

        canvasNode.classList.remove("export-engine-lock-active");
        livePreviewBox.scrollIntoView({ behavior: 'smooth' });
    });
}

function buildSystemCore() {
    const inst = document.getElementById("setup-inst").value.trim();
    const prog = document.getElementById("setup-program").value.trim();
    const sect = document.getElementById("setup-section").value.trim();

    if(!inst || !prog || !sect) return alert("System setup initialization blocked! Fill out all fields.");

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
    
    const classManifests = document.querySelectorAll(".target-program-manifest");
    if(classManifests[0]) classManifests[0].innerText = `${prog} — CLASS ROUTINE MANIFEST`;
    if(classManifests[1]) classManifests[1].innerText = `${prog} — EXAMINATION SCHEDULE MATRIX`;

    document.querySelectorAll(".target-sec-val").forEach(el => el.innerText = sect.toUpperCase());

    const cDb = localStorage.getItem("db_classes");
    const eDb = localStorage.getItem("db_exams");
    if(cDb) classDatabase = JSON.parse(cDb);
    if(eDb) examDatabase = JSON.parse(eDb);

    compileGridMatrix(classDatabase, "class-matrix-body", "CLASS");
    compileGridMatrix(examDatabase, "exam-matrix-body", "EXAM");
}

function insertClassItem(e) {
    e.preventDefault();
    const title = document.getElementById("c-title").value;
    const code = document.getElementById("c-code").value.trim();
    const meta = document.getElementById("c-meta").value.trim();
    const start = document.getElementById("c-start").value;
    const end = document.getElementById("c-end").value;
    const day = document.getElementById("c-day").value;

    classDatabase.push({ id: Date.now(), code, title, meta, start, end, day });
    localStorage.setItem("db_classes", JSON.stringify(classDatabase));
    
    toggleModal('class-modal', false);
    document.getElementById("class-form").reset();
    compileGridMatrix(classDatabase, "class-matrix-body", "CLASS");
}

function insertExamItem(e) {
    e.preventDefault();
    const title = document.getElementById("e-title").value;
    const code = document.getElementById("e-code").value.trim();
    const room = document.getElementById("e-room").value.trim();
    const start = document.getElementById("e-start").value;
    const end = document.getElementById("e-end").value;
    const day = document.getElementById("e-day").value;

    examDatabase.push({ id: Date.now() + 1, code, title, meta: room, start, end, day });
    localStorage.setItem("db_exams", JSON.stringify(examDatabase));
    
    toggleModal('exam-modal', false);
    document.getElementById("exam-form").reset();
    compileGridMatrix(examDatabase, "exam-matrix-body", "EXAM");
}

function purgeNodeEntry(id, prefix) {
    if(confirm(`Expunge selected ${prefix} asset node from tracking map?`)) {
        if(prefix === "CLASS") {
            classDatabase = classDatabase.filter(x => x.id !== id);
            localStorage.setItem("db_classes", JSON.stringify(classDatabase));
            compileGridMatrix(classDatabase, "class-matrix-body", "CLASS");
        } else {
            examDatabase = examDatabase.filter(x => x.id !== id);
            localStorage.setItem("db_exams", JSON.stringify(examDatabase));
            compileGridMatrix(examDatabase, "exam-matrix-body", "EXAM");
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
    if(confirm("Flush whole localized storage cluster data?")) {
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
