async function processRoutineFile() {
    const fileInput = document.getElementById("routine-file");
    const sectionName = document.getElementById("filter-section").value.trim().toUpperCase();
    const statusText = document.getElementById("scan-status");
    const routineListDisplay = document.getElementById("routine-list"); // যেখানে রুটিন দেখাবেন

    if (!sectionName || fileInput.files.length === 0) {
        alert("Please enter section (e.g. 3D) and upload the routine file!");
        return;
    }

    statusText.style.color = "#ffc107";
    statusText.innerText = "⏳ Processing Master Schedule... Please wait.";
    
    const file = fileInput.files[0];
    let sourceToScan;

    try {
        if (file.type === "application/pdf" || file.name.toLowerCase().endsWith('.pdf')) {
            sourceToScan = await convertPdfToImageCanvas(file);
        } else {
            sourceToScan = file;
        }

        // Tesseract OCR Engine Call
        const result = await Tesseract.recognize(sourceToScan, 'eng');
        let extractedText = result.data.text.replace(/O/g, '0').replace(/I/g, '1');
        const lines = extractedText.split('\n');

        // দিন অনুযায়ী ক্লাস জমানোর অবজেক্ট স্ট্রাকচার
        let scheduleData = {
            "Saturday": [],
            "Sunday": [],
            "Monday": [],
            "Tuesday": [],
            "Wednesday": [],
            "Thursday": []
        };

        let currentDay = "Saturday";
        const timeSlots = ["02:10 PM - 03:20 PM", "03:20 PM - 04:30 PM", "04:30 PM - 05:40 PM"];
        let hasData = false;

        lines.forEach(line => {
            let upperLine = line.toUpperCase();

            // দিন ট্র্যাক করার লজিক
            if (upperLine.includes("SAT")) currentDay = "Saturday";
            else if (upperLine.includes("SUN")) currentDay = "Sunday";
            else if (upperLine.includes("MON")) currentDay = "Monday";
            else if (upperLine.includes("TUE")) currentDay = "Tuesday";
            else if (upperLine.includes("WED")) currentDay = "Wednesday";
            else if (upperLine.includes("THU")) currentDay = "Thursday";

            // স্পেসিফিক সেকশন (যেমন: 3D) ফিল্টার ও পার্সিং ম্যাট্রিক্স
            if (upperLine.includes(sectionName)) {
                let roomMatch = line.match(/(LAB\s*\d*|\d{3})/i);
                let currentRoom = roomMatch ? roomMatch[0] : "123";

                // Regex দিয়ে কোর্স কোড এবং টিচার কোড আলাদা করা
                const blockRegex = new RegExp(sectionName + '\\s+([A-Z]{3,4}\\s*\\d{4})\\s+([A-Z]{2,4})', 'g');
                let match;

                while ((match = blockRegex.exec(upperLine)) !== null) {
                    let courseCode = match[1];
                    let teacherCode = match[2];
                    let matchIndex = match.index;
                    
                    // টাইমিং পজিশন ডিটেকশন
                    let targetTime = timeSlots[0];
                    if (matchIndex > upperLine.length * 0.6) {
                        targetTime = timeSlots[2];
                    } else if (matchIndex > upperLine.length * 0.3) {
                        targetTime = timeSlots[1];
                    }

                    scheduleData[currentDay].push({
                        time: targetTime,
                        code: courseCode,
                        teacher: teacherCode,
                        room: currentRoom
                    });
                    hasData = true;
                }
            }
        });

        // HTML ইন্টারফেসে সুন্দর টেক্সট ফরম্যাট জেনারেট করা
        if (hasData) {
            statusText.style.color = "#28a745";
            statusText.innerText = `✅ Successfully Generated Routine for Section ${sectionName}!`;

            let htmlOutput = `<div class="generated-routine-box">`;
            htmlOutput += `<h2>Section ${sectionName} Class Routine (Spring 2026)</h2>`;

            for (let day in scheduleData) {
                htmlOutput += `<h3>${day}</h3>`;
                if (scheduleData[day].length === 0) {
                    htmlOutput += `<p class="no-class">○ Weekend / No Classes Scheduled</p>`;
                } else {
                    htmlOutput += `<ul>`;
                    // সময় অনুযায়ী ক্লাসগুলো সর্ট করে দেখানো
                    scheduleData[day].sort((a,b) => a.time.localeCompare(b.time)).forEach(cls => {
                        htmlOutput += `<li>○ <strong>${cls.time}</strong> | ${cls.code} | Teacher: ${cls.teacher} | Room: ${cls.room}</li>`;
                    });
                    htmlOutput += `</ul>`;
                }
            }
            htmlOutput += `</div>`;

            // UI-তে ডাটা পুশ করা
            routineListDisplay.innerHTML = htmlOutput;
            fileInput.value = "";
            setTimeout(() => { closeModal("upload-modal"); statusText.innerText = ""; }, 2000);

        } else {
            statusText.style.color = "#dc3545";
            statusText.innerText = `❌ No schedule data discovered for section "${sectionName}".`;
        }

    } catch (error) {
        console.error(error);
        statusText.style.color = "#dc3545";
        statusText.innerText = "❌ Processing failure during auto-generation!";
    }
}
