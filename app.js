let currentRoutine = [];

document.addEventListener("DOMContentLoaded", () => {
    checkExistingUser();
    if (document.getElementById("manual-form")) {
        document.getElementById("manual-form").addEventListener("submit", saveManualRoutine);
    }
});

// 🎨 All-Subject Dynamic Theme Vibe Engine (Sets backgrounds & rules based on selected course name)
function executeDynamicThemeBinding(program) {
    const body = document.body;

    // 1. Tech & Engineering (CSE, SWE, EEE, CE, ME, IPE, TE, Science)
    if (["CSE", "SWE", "EEE", "CE", "ME", "IPE", "TE", "Science"].includes(program)) {
        body.setAttribute("data-theme", "theme-tech-matrix");
        if (program === "CSE" || program === "SWE") {
            // Programming Code Cyber Core Background
            body.style.backgroundImage = "url('https://images.unsplash.com/photo-1542831371-29b0f74f9713?q=80&w=1470&auto=format&fit=crop')";
        } else {
            // Industrial Hardware Tech Electronics Grid Background
            body.style.backgroundImage = "url('https://images.unsplash.com/photo-1517420784566-f56f34e8ce4a?q=80&w=1470&auto=format&fit=crop')";
        }
    } 
    // 2. Commerce & Business Administration (BBA, Accounting, Finance, Management, Marketing, MBA, Commerce)
    else if (["BBA", "Accounting", "Finance", "Management", "Marketing", "MBA", "Commerce"].includes(program)) {
        body.setAttribute("data-theme", "theme-commerce-amber");
        // Premium Corporate Towers Executive Space Background
        body.style.backgroundImage = "url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1470&auto=format&fit=crop')";
    } 
    // 3. Arts, Law & Humanities (English, LLB, Bangla, Economics, Sociology, Political Science, Journalism, Arts)
    else if (["English", "LLB", "Bangla", "Economics", "Sociology", "Political Science", "Journalism", "Arts"].includes(program)) {
        body.setAttribute("data-theme", "theme-arts-literature");
        // Classic Gothic Academic Library Books Atmosphere Background
        body.style.backgroundImage = "url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?q=80&w=1470&auto=format&fit=crop')";
    } 
    else {
        body.setAttribute("data-theme", "theme-default");
        body.style.backgroundImage = "none";
    }
}

function showDashboard(inst, program) {
    document.getElementById("onboarding-screen").classList.add("hidden");
    document.getElementById("dashboard-screen").classList.remove("hidden");
    
    document.getElementById("display-inst-name").innerText = inst.toUpperCase();
    document.getElementById("display-program").innerText = program;

    document.getElementById("canvas-inst-title").innerText = inst.toUpperCase();
    document.getElementById("canvas-dept-title").innerText = `${program} SCHEDULE SCHEME`;
    
    executeDynamicThemeBinding(program);
    loadRoutine();
}

function initializeApp() {
    const instName = document.getElementById("inst-name").value.trim();
    const programName = document.getElementById("dept-program").value;
    if (!instName || !programName) return alert("Configuration error! Provide valid values.");
    
    localStorage.setItem("instName", instName);
    localStorage.setItem("programName", programName);
    showDashboard(instName, programName);
}

function saveManualRoutine(e) {
    e.preventDefault();
    const subject = document.getElementById("m-subject").value.trim();
    const code = document.getElementById("m-code").value.trim();
    const teacher = document.getElementById("m-teacher").value.trim() || "N/A";
    const room = document.getElementById("m-room").value.trim() || "N/A";
    const startTime = document.getElementById("m-start-time").value;
    const endTime = document.getElementById("m-end-time").value;
    const day = document.getElementById("m-day").value;

    const newClass = { id: Date.now(), subject, code, teacher, room, startTime, endTime, day };
    currentRoutine.push(newClass);
    localStorage.setItem("routineData", JSON.stringify(currentRoutine));
    
    closeModal('manual-modal');
    document.getElementById("manual-form").reset();
    renderRoutine();
}

function renderRoutine() {
    const container = document.getElementById("routine-container");
    container.innerHTML = "";
    if (currentRoutine.length === 0) {
        container.innerHTML = `<div class="empty-state-notice">Workspace empty. Insert class slots to populate the matrix.</div>`;
        return;
    }
    currentRoutine.forEach(item => {
        const card = document.createElement("div");
        card.className = "routine-card node-class";
        card.innerHTML = `
            <span class="delete-trigger" onclick="deleteNode(${item.id})">✕</span>
            <div class="card-contents">
                <h4>${item.subject}</h4>
                <p class="node-meta">${item.code} | Room: ${item.room} | Ref: ${item.teacher}</p>
                <div class="badge-day">${item.day}</div>
            </div>
            <div class="node-time-tag">⏰ ${convertTo12Hour(item.startTime)} - ${convertTo12Hour(item.endTime)}</div>`;
        container.appendChild(card);
    });
}

// 🖼️ HTML2Canvas Processing Engine for Dashboard Previews & Instant Photo Downloads
function generateRoutinePreview() {
    const area = document.getElementById("routine-capture-area");
    const previewSection = document.getElementById("preview-section");
    const previewHolder = document.getElementById("image-preview-holder");
    const downloadAnchor = document.getElementById("download-anchor");

    html2canvas(area, { 
        scale: 2.5, 
        backgroundColor: null,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgDataUrl = canvas.toDataURL("image/jpeg", 0.96);
        
        // Push Stream Data into Dashboard Preview Element Space
        previewHolder.innerHTML = `<img src="${imgDataUrl}" alt="Active Stream Render" class="rendered-preview-img" />`;
        
        // Match Link Attributes
        downloadAnchor.href = imgDataUrl;
        downloadAnchor.style.display = "block";
        downloadAnchor.download = `Routine_${localStorage.getItem("programName") || "Data"}.jpg`;
        
        // Display Hidden Module Components
        previewSection.classList.remove("hidden");
        previewSection.scrollIntoView({ behavior: 'smooth' });
    });
}

function deleteNode(id) {
    if(confirm("Remove this session node?")) {
        currentRoutine = currentRoutine.filter(x => x.id !== id);
        localStorage.setItem("routineData", JSON.stringify(currentRoutine));
        renderRoutine();
    }
}

function loadRoutine() { const s = localStorage.getItem("routineData"); if(s) { currentRoutine = JSON.parse(s); renderRoutine(); } }
function convertTo12Hour(t) { if(!t) return ""; let [h, m] = t.split(':'); let ampm = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; return `${h}:${m} ${ampm}`; }
function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }
function checkExistingUser() { const i = localStorage.getItem("instName"), p = localStorage.getItem("programName"); if(i && p) showDashboard(i, p); }
function resetApp() { if(confirm("Flush current data layout?")) { localStorage.clear(); location.reload(); } }
