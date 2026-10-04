// Input Elements
const nameInput = document.getElementById('cv-name');
const roleInput = document.getElementById('cv-role');
const emailInput = document.getElementById('cv-email');
const phoneInput = document.getElementById('cv-phone');
const summaryInput = document.getElementById('cv-summary');
const skillsInput = document.getElementById('cv-skills');
const experienceInput = document.getElementById('cv-experience');
const templateSelect = document.getElementById('cv-template');

// Preview Elements
const pName = document.getElementById('p-name');
const pRole = document.getElementById('p-role');
const pEmail = document.getElementById('p-email');
const pPhone = document.getElementById('p-phone');
const pSummary = document.getElementById('p-summary');
const pSkills = document.getElementById('p-skills');
const pExperience = document.getElementById('p-experience');

const form = document.getElementById('cv-form');
const saveBtn = document.getElementById('save-btn');
const aiBtn = document.getElementById('ai-generate-btn');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const historyTableBody = document.getElementById('history-table-body');

// Live Typing Bindings
nameInput.addEventListener('input', e => pName.textContent = e.target.value || 'Your Full Name');
roleInput.addEventListener('input', e => pRole.textContent = e.target.value || 'Professional Title');
emailInput.addEventListener('input', e => pEmail.textContent = e.target.value || 'name@example.com');
phoneInput.addEventListener('input', e => pPhone.textContent = e.target.value || '+92 300 1234567');
summaryInput.addEventListener('input', e => pSummary.textContent = e.target.value || 'Summary...');
experienceInput.addEventListener('input', e => pExperience.textContent = e.target.value || 'Experience...');

skillsInput.addEventListener('input', e => {
    const arr = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    pSkills.innerHTML = arr.length ? '' : '<span class="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md">HTML</span>';
    arr.forEach(s => pSkills.innerHTML += `<span class="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded-md font-medium">${s}</span>`);
});

// Template Switcher Style
templateSelect.addEventListener('change', e => {
    const val = e.target.value;
    if(val === 'executive') {
        pRole.className = "text-lg font-serif font-bold text-slate-800";
    } else if(val === 'minimal') {
        pRole.className = "text-lg font-mono text-cyan-600";
    } else {
        pRole.className = "text-lg font-semibold text-emerald-600";
    }
});

// Smart Local AI Summary Generator (Bina API key ke crash hue)
aiBtn.addEventListener('click', () => {
    const role = roleInput.value || 'Professional';
    aiBtn.textContent = '✨ Generating...';
    setTimeout(() => {
        summaryInput.value = `Motivated and results-oriented ${role} with strong expertise in modern web solutions, clean code architecture, and high-impact digital workflows.`;
        pSummary.textContent = summaryInput.value;
        aiBtn.textContent = '✨ AI Generate';
    }, 600);
});

// Save to Browser LocalStorage (Backend Logic)
form.addEventListener('submit', (e) => {
    e.preventDefault();
    saveBtn.textContent = 'Saving locally...';

    const newResume = {
        id: Date.now(),
        full_name: nameInput.value,
        role: roleInput.value,
        email: emailInput.value,
        phone: phoneInput.value,
        template: templateSelect.value,
        summary: summaryInput.value,
        skills: skillsInput.value,
        experience: experienceInput.value,
        created_at: new Date().toLocaleString()
    };

    // Get existing data from LocalStorage or empty array
    let resumes = JSON.parse(localStorage.getItem('resucraft_resumes')) || [];
    resumes.unshift(newResume); // Naya resume sabse upar add ho ga

    // Save back to LocalStorage
    localStorage.setItem('resucraft_resumes', JSON.stringify(resumes));

    alert('Resume successfully saved to local browser storage!');
    saveBtn.textContent = 'Save to Cloud 🚀';
    loadHistory();
});

// Load History from LocalStorage into Table
function loadHistory() {
    const resumes = JSON.parse(localStorage.getItem('resucraft_resumes')) || [];
    historyTableBody.innerHTML = '';

    if(resumes.length === 0) {
        historyTableBody.innerHTML = `<tr><td colspan="4" class="px-4 py-4 text-center text-slate-500">No saved resumes yet.</td></tr>`;
        return;
    }

    resumes.forEach((row) => {
        historyTableBody.innerHTML += `
            <tr class="hover:bg-slate-950/50">
                <td class="px-4 py-3 font-medium text-white">${row.full_name}</td>
                <td class="px-4 py-3 text-emerald-400">${row.role}</td>
                <td class="px-4 py-3"><span class="px-2 py-1 bg-slate-800 text-xs rounded">${row.template}</span></td>
                <td class="px-4 py-3">
                    <button onclick="loadResume(${row.id})" class="text-cyan-400 hover:underline text-xs mr-2">Load</button>
                    <button onclick="deleteResume(${row.id})" class="text-red-400 hover:underline text-xs">Delete</button>
                </td>
            </tr>
        `;
    });
}

// Load saved resume back to form
window.loadResume = function(id) {
    const resumes = JSON.parse(localStorage.getItem('resucraft_resumes')) || [];
    const item = resumes.find(r => r.id === id);
    if(item) {
        nameInput.value = item.full_name;
        roleInput.value = item.role;
        emailInput.value = item.email;
        phoneInput.value = item.phone;
        templateSelect.value = item.template;
        summaryInput.value = item.summary;
        skillsInput.value = item.skills;
        experienceInput.value = item.experience;

        // Trigger input events to update preview
        nameInput.dispatchEvent(new Event('input'));
        roleInput.dispatchEvent(new Event('input'));
        emailInput.dispatchEvent(new Event('input'));
        phoneInput.dispatchEvent(new Event('input'));
        summaryInput.dispatchEvent(new Event('input'));
        skillsInput.dispatchEvent(new Event('input'));
        templateSelect.dispatchEvent(new Event('change'));
        experienceInput.dispatchEvent(new Event('input'));
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
};

// Delete resume from history
window.deleteResume = function(id) {
    let resumes = JSON.parse(localStorage.getItem('resucraft_resumes')) || [];
    resumes = resumes.filter(r => r.id !== id);
    localStorage.setItem('resucraft_resumes', JSON.stringify(resumes));
    loadHistory();
};

// PDF Download using html2pdf
downloadPdfBtn.addEventListener('click', () => {
    const element = document.getElementById('cv-preview-sheet');
    const opt = {
        margin:       0.5,
        filename:     `${(nameInput.value || 'my-resume').toLowerCase().replace(/\s+/g, '-')}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    html2pdf().from(element).set(opt).save();
});

// Initial load on page open
loadHistory();