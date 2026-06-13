let classDatabase = [];
let examDatabase = [];

document.addEventListener("DOMContentLoaded", () => {
    evaluateSystemState();
    // ক্রোনোগ্রাফ ওয়াচ সচল করার লাইভ ইঞ্জিন থ্রেড
    setInterval(executeChronographEngine, 1000);
    executeChronographEngine();
    fetchAtmosphericData();
});

// ⏰ ১. বড় সাইজের মেকানিক্যাল ক্লক শেপ রানিং ওয়াচ
function executeChronographEngine() {
    const clockNum = document.getElementById("big-clock-numeric");
    const clockCal = document.getElementById("big-calendar-date");
    if(!clockNum || !clockCal) return;

    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let seconds = now.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12 || 12;
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;

    clockNum.innerText = `${hours}:${minutes}:${seconds} ${ampm}`;
    clockCal.innerText = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

// 📍 ২. লাইভ লোকেশন বেসড ওয়েডার ট্র্যাকিং
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
                                <p>Atmospheric Sync Active</p>
                            </div>
                        </div>`;
                }
            } catch(e) {
                document.getElementById("live-weather-station").innerHTML = "<p>🌤️ Weather Tracking Offline</p>";
            }
        }, () => {
            document.getElementById("live-weather-station").innerHTML = "<p>📍 Location Stream Inaccessible</p>";
        });
    }
}

// 📊 ৩. ক্লাস এবং এক্সাম দুই টাইপের গ্রিড সিস্টেম জেনারেটর ইঞ্জিন
function compileGridMatrix(targetDb, tbodyId, typePrefix) {
    const tbody = document.getElementById(tbodyId);
    tbody.innerHTML = "";

    if(targetDb.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-matrix-fallback">No slots registered inside this routine category track.</td></tr>`;
        return;
    }

    const systematicallySortedTimeSlots = [...new Set(targetDb.map(x => `${x.start} - ${x.end}`))].sort();
    const cycleDays = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

    systematicallySortedTimeSlots.forEach(slot => {
        const tr = document.createElement("tr");
        
        // ১ম কলাম টাইমস্ট্যাম্প এক্সিস ম্যাপ
        const tdTime = document.createElement("td");
        tdTime.className = "time-axis-index";
        const [st, et] = slot.split(" - ");
        tdTime.innerHTML = `<strong>${formatTwelveHour(st)}<br>to<br>${formatTwelveHour(et)}</strong>`;
        tr.appendChild(tdTime);

        // সপ্তাহের ৭ দিন ট্র্যাকিং লুপ অবজেক্ট
        cycleDays.forEach(day => {
            const tdCell = document.createElement("td");
            const nodeMatch = targetDb.find(x => `${x.start} - ${x.end}` === slot && x.day.toLowerCase() === day.toLowerCase());

            if(nodeMatch) {
                tdCell.className = "occupied-fidelity-cell";
                const isLabTrack = nodeMatch.title.toLowerCase().includes("lab") || nodeMatch.code.toLowerCase().includes("lab");
                
                tdCell.innerHTML = `
                    <div class="cell-matrix-wrapper">
                        <span class="node-purge-trigger" onclick="purgeNodeEntry(${nodeMatch.id}, '${typePrefix}')">✕</span>
                        <div class="cell-primary-code">${nodeMatch.code}</div>
                        <div class="cell-secondary-instructor">${nodeMatch.meta}</div>
                        <div class="cell-type-pill ${isLabTrack ? 'pill-lab' : 'pill-theory'}">${isLabTrack ? 'LAB' : 'THEORY'}</div>
                        <div class="cell-footer-title">${nodeMatch.title}</div>
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

// 📸 ৪. সম্পূর্ণ ক্লিন মোডে আপনার স্ক্রিনশটের মতো হাই-রেজোলিউশন ইমেজ এক্সপোর্টার
function processCanvasFidelitySnapshot() {
    const canvasNode = document.getElementById("master-routine-capture-frame");
    const livePreviewBox = document.getElementById("live-preview-box");
    const viewportHolder = document.getElementById("preview-viewport-holder");

    // এক্সপোর্ট ইঞ্জিন লক অ্যাক্টিভেট (সিএসএস ক্লাসের মাধ্যমে বর্ডার বা মার্জিন ক্লিন করা হবে)
    canvasNode.classList.add("export-engine-lock-active");

    html2canvas(canvasNode, {
        scale: 3, // ক্রিস্টাল ক্লিয়ার টেক্সট কোয়ালিটির জন্য ৩ গুণ সুপার স্যাম্পলিং
        useCORS: true,
        backgroundColor: "#ffffff"
    }).then(canvas => {
        const rawBase64Uri = canvas.toDataURL("image/jpeg", 1.0);
        
        // মনিটর স্ক্রিনে ভিউ ড্রপ ডাউন করা
        viewportHolder.innerHTML = `<img src="${rawBase64Uri}" class="rendered-frame-monitor"/>`;
        livePreviewBox.classList.remove("hidden");

        // ক্লায়েন্ট সিস্টেমে ইমেজ ডাউনলোড পুশ
        const downloadTrigger = document.createElement("a");
        downloadTrigger.href = rawBase64Uri;
        downloadTrigger.download = `Academic_Routine_Manifest_${localStorage.getItem("core_sect") || "Export"}.jpg`;
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

    if(!inst || !prog || !sect) return alert("System configuration deployment blocked! Populate all parameters.");

    localStorage.setItem("core_inst", inst);
    localStorage.setItem("core_prog", prog);
    localStorage.setItem("core_sect", sect);

    deployWorkspace(inst, prog, sect);
}

function deployWorkspace(inst, prog, sect) {
    document.getElementById("setup-screen").classList.add("hidden");
    document.getElementById("dashboard-screen").classList.remove("hidden");

    // মেটা ফিল্ড ডিস্ট্রিবিউশন
    document.getElementById("dash-display-inst").innerText = inst.toUpperCase();
    document.getElementById("dash-display-meta").innerText = `${prog} | SECTION: ${sect}`;

    // এক্সপোর্ট ক্যানভাস ফ্রেমের মেটা এলিমেন্ট আপডেট
    document.querySelectorAll(".target-inst-name").forEach(el => el.innerText = inst.toUpperCase());
    document.querySelectorAll(".target-program-manifest").forEach(el => {
        if(!el.innerText.includes("EXAMINATION")) el.innerText = `${prog} CLASS ROUTINE MANIFEST`;
    });
    document.querySelectorAll(".target-sec-val").forEach(el => el.innerText = sect.toUpperCase());

    // ডাটাবেস রিকভারি অপারেশন
    const cDb = localStorage.getItem("db_classes");
    const eDb = localStorage.getItem("db_exams");
    if(cDb) classDatabase = JSON.parse(cDb);
    if(eDb) examDatabase = JSON.parse(eDb);

    // দুই টাইপের রুটিন রেন্ডারিং কলব্যাক
    compileGridMatrix(classDatabase, "class-matrix-body", "CLASS");
    compileGridMatrix(examDatabase, "exam-matrix-body", "EXAM");
}

function insertClassItem(e) {
    e.preventDefault();
    const code = document.getElementById("c-code").value.trim();
    const title = document.getElementById("c-title").value.trim();
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
    const code = document.getElementById("e-code").value.trim();
    const title = document.getElementById("e-title").value.trim();
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
    if(confirm(`Expunge targeted ${prefix} matrix segment node?`)) {
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
    if(confirm("Flush whole active localized ecosystem parameters?")) {
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
