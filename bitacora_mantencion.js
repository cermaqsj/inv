/**
 * CONFIGURATION
 */
const CONFIG = {
    // Shared API URL (Same as other modules)
    DEFAULT_API: 'https://script.google.com/macros/s/AKfycbw-uXGY9Thidg9nT5DYinYhQUt64NMZw9AvIBsV6pAYtT8dc-wW4rR9wTPUUB10EtmRXQ/exec',
    STORAGE_KEY: 'cermaq_inventory_url_v2',
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check local storage for saved worker name
    const savedWorker = localStorage.getItem('maint_worker_name');
    if (savedWorker) {
        document.getElementById('maint-worker').value = savedWorker;
    }
});

/**
 * API HANDLING
 */
function getApiUrl() {
    return localStorage.getItem(CONFIG.STORAGE_KEY) || CONFIG.DEFAULT_API;
}

async function sendTransaction(payload) {
    try {
        const response = await fetch(getApiUrl(), {
            method: 'POST',
            body: JSON.stringify(payload)
        });
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Transacción error:", error);
        return { status: "error", message: "Error de conexión" };
    }
}

/**
 * UI LOGIC
 */
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    let icon = 'info';
    if (type === 'success') icon = 'check_circle';
    if (type === 'error') icon = 'error';

    toast.innerHTML = `
        <span class="material-icons-round">${icon}</span>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.addEventListener('transitionend', () => toast.remove());
    }, 3000);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    const icon = document.getElementById('btn-theme-toggle').querySelector('span');
    icon.innerText = newTheme === 'dark' ? 'light_mode' : 'dark_mode';
}

/**
 * MAINTENANCE LOG LOGIC
 */
let isSubmitting = false;
let taskBatch = [];

function addTaskToBatch() {
    const taskInput = document.getElementById('maint-task');
    const taskDesc = taskInput.value.trim();

    if (taskDesc.length < 3) {
        showToast("Describe la tarea con más detalle", "error");
        taskInput.focus();
        return;
    }

    taskBatch.push(taskDesc);
    taskInput.value = "";
    renderTaskBatch();
}

function removeTaskFromBatch(index) {
    taskBatch.splice(index, 1);
    renderTaskBatch();
}

function renderTaskBatch() {
    const container = document.getElementById('maint-batch-list');
    container.innerHTML = '';

    taskBatch.forEach((task, index) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.background = 'var(--glass-bg)';
        div.style.padding = '10px 14px';
        div.style.borderRadius = '8px';
        div.style.border = '1px solid var(--glass-border)';

        div.innerHTML = `
            <span style="font-weight: 500; font-size: 0.95rem;">${task}</span>
            <button onclick="removeTaskFromBatch(${index})" style="background: none; border: none; color: var(--danger); cursor: pointer;">
                <span class="material-icons-round">remove_circle</span>
            </button>
        `;
        container.appendChild(div);
    });
}

async function submitMaintenanceLog() {
    if (isSubmitting) return;

    const workerInput = document.getElementById('maint-worker');
    const worker = workerInput.value.trim();
    const submitBtn = document.getElementById('btn-maint-submit');

    // Auto-add current input if not empty
    const currentTask = document.getElementById('maint-task').value.trim();
    if (currentTask.length >= 3) {
        taskBatch.push(currentTask);
        document.getElementById('maint-task').value = "";
        renderTaskBatch();
    }

    if (worker.length < 3) {
        showToast("Ingresa tu nombre completo", "error");
        workerInput.focus();
        return;
    }

    if (taskBatch.length === 0) {
        showToast("Agrega al menos una tarea", "error");
        return;
    }

    // Save worker name for next time
    localStorage.setItem('maint_worker_name', worker);

    isSubmitting = true;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-icons-round spin">sync</span> Enviando...';
    }

    // Payload
    const payload = {
        action: 'MAINTENANCE_LOG',
        worker: worker,
        tasks: taskBatch
    };

    try {
        const result = await sendTransaction(payload);

        if (result.status === 'success') {
            showToast("Reporte enviado exitosamente", "success");
            taskBatch = [];
            renderTaskBatch();
        } else {
            showToast("Error: " + (result.message || "Desconocido"), "error");
        }
    } catch (e) {
        showToast("Error de conexión", "error");
    } finally {
        isSubmitting = false;
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span class="material-icons-round">send</span> ENVIAR REPORTE';
        }
    }
}
