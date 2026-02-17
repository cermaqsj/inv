/**
 * CONFIGURATION
 */
const CONFIG = {
    // Shared API URL
    DEFAULT_API: 'https://script.google.com/macros/s/AKfycbw-uXGY9Thidg9nT5DYinYhQUt64NMZw9AvIBsV6pAYtT8dc-wW4rR9wTPUUB10EtmRXQ/exec',
    STORAGE_KEY: 'cermaq_inventory_url_v2',
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // Default Tab
    switchToolTab('loan');
}

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

    // Remove after 3s
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
 * TOOL TRACKING SYSTEM
 */
let toolsCache = [];
let currentToolTab = 'loan';

function switchToolTab(tab) {
    currentToolTab = tab;

    // UI Toggles
    document.getElementById('view-tool-loan').style.display = tab === 'loan' ? 'block' : 'none';
    document.getElementById('view-tool-active').style.display = tab === 'active' ? 'block' : 'none';

    // Btn Styles
    const activeStyle = {
        bg: 'var(--primary)',
        color: '#ffffff',
        border: '2px solid var(--primary)',
        fontWeight: '800',
        opacity: '1',
        boxShadow: '0 0 10px rgba(14, 165, 233, 0.4)'
    };

    const inactiveStyle = {
        bg: '#334155',
        color: '#ffffff',
        border: '2px solid #475569',
        fontWeight: '600',
        opacity: '1',
        boxShadow: 'none'
    };

    const loanBtn = document.getElementById('tab-loan');
    const activeBtn = document.getElementById('tab-active');

    if (tab === 'loan') {
        applyStyle(loanBtn, activeStyle);
        applyStyle(activeBtn, inactiveStyle);
    } else {
        applyStyle(loanBtn, inactiveStyle);
        applyStyle(activeBtn, activeStyle);
    }

    if (tab === 'active') {
        fetchTools();
    }
}

function applyStyle(el, style) {
    el.style.background = style.bg;
    el.style.color = style.color;
    el.style.border = style.border;
    el.style.fontWeight = style.fontWeight;
    el.style.opacity = style.opacity;
    el.style.boxShadow = style.boxShadow;
}

let isToolSubmitting = false;
let batchList = [];

function addToolToBatch() {
    const toolInput = document.getElementById('tool-name');
    const toolName = toolInput.value.trim();

    if (toolName.length < 2) {
        showToast("Escribe el nombre de la herramienta", "error");
        toolInput.focus();
        return;
    }

    batchList.push(toolName);
    toolInput.value = "";
    renderBatchList();
}

function removeToolFromBatch(index) {
    batchList.splice(index, 1);
    renderBatchList();
}

function renderBatchList() {
    const container = document.getElementById('tool-batch-list');
    container.innerHTML = '';

    batchList.forEach((tool, index) => {
        const div = document.createElement('div');
        div.style.display = 'flex';
        div.style.justifyContent = 'space-between';
        div.style.alignItems = 'center';
        div.style.background = 'var(--glass-bg)';
        div.style.padding = '8px 12px';
        div.style.borderRadius = '8px';
        div.style.border = '1px solid var(--glass-border)';

        div.innerHTML = `
            <span style="font-weight: 500;">${tool}</span>
            <button onclick="removeToolFromBatch(${index})" style="background: none; border: none; color: var(--danger); cursor: pointer;">
                <span class="material-icons-round">remove_circle</span>
            </button>
        `;
        container.appendChild(div);
    });
}

async function registerToolOut() {
    if (isToolSubmitting) return;

    const worker = document.getElementById('tool-worker').value.trim();
    const area = document.getElementById('tool-area').value.trim();
    const comment = document.getElementById('tool-comment').value.trim();
    const submitBtn = document.getElementById('btn-tool-submit');

    // Also check current input if user forgot to click add
    const currentInput = document.getElementById('tool-name').value.trim();
    if (currentInput.length >= 2) {
        batchList.push(currentInput);
        document.getElementById('tool-name').value = "";
        renderBatchList();
    }

    if (worker.length < 3) {
        showToast("El nombre del responsable es obligatorio", "error");
        return;
    }

    if (batchList.length === 0) {
        showToast("Agrega al menos una herramienta", "error");
        return;
    }

    isToolSubmitting = true;
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="material-icons-round spin">sync</span> Enviando...';
    }
    showToast(`Registrando ${batchList.length} ítems...`, "info");

    let successCount = 0;
    let errors = [];

    // Process all items in batch
    for (const tool of batchList) {
        const payload = {
            action: 'TOOL_CHECK_OUT',
            worker: worker,
            area: area,
            tool: tool,
            comment: comment
        };

        try {
            const result = await sendTransaction(payload);
            if (result.status === 'success' || result.status === 'offline') {
                successCount++;
            } else {
                errors.push(`${tool}: ${result.message || 'Error'}`);
            }
        } catch (e) {
            errors.push(`${tool}: Error de conexión`);
        }
    }

    isToolSubmitting = false;
    if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<span class="material-icons-round">output</span> REGISTRAR SALIDA';
    }

    if (successCount > 0) {
        showToast(`Registrados ${successCount} de ${batchList.length} ítems`, "success");
        // Remove successfully submitted items (complex logic to track? lets just clear all if mostly success)
        if (errors.length === 0) {
            batchList = [];
            renderBatchList();
            document.getElementById('tool-comment').value = "";
            switchToolTab('active');
        } else {
            alert(`Errores:\n${errors.join('\n')}`);
            // Keep items in list so user can retry? 
            // For simplicity, we clear list but show alert. 
            batchList = [];
            renderBatchList();
            switchToolTab('active');
        }
    } else {
        showToast("Error al registrar herramientas", "error");
    }
}

async function fetchTools() {
    const container = document.getElementById('tool-list-container');
    container.innerHTML = '<div style="text-align: center; padding: 2rem;"><span class="material-icons-round spin">sync</span> Cargando...</div>';

    try {
        const result = await sendTransaction({ action: 'GET_TOOLS' });
        toolsCache = result;
        renderToolList(toolsCache);
    } catch (e) {
        console.error(e);
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--danger);">Error al cargar historial.</div>';
    }
}

function renderToolList(rows) {
    const container = document.getElementById('tool-list-container');
    container.innerHTML = '';

    if (!rows || rows.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--text-light);">No hay registros recientes.</div>';
        return;
    }

    rows.forEach(item => {
        const div = document.createElement('div');
        div.className = 'cart-item';
        div.style.flexDirection = 'column';
        div.style.alignItems = 'flex-start';

        const isPending = item.estado === 'PENDING';
        const dateStr = new Date(item.fechaOut).toLocaleDateString() + ' ' + new Date(item.fechaOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; width: 100%; align-items: flex-start;">
                <div>
                    <h4 style="margin: 0; color: var(--primary);">${item.tool}</h4>
                    <div style="font-size: 0.85rem; color: var(--text-main); margin-top: 4px;">
                        <span class="material-icons-round" style="font-size: 14px; vertical-align: middle;">person</span> ${item.worker}
                    </div>
                    <div style="font-size: 0.8rem; color: var(--text-light);">
                        ${item.area} • ${dateStr}
                    </div>
                </div>
                <div>
                    <span class="tag ${isPending ? 'out' : 'in'}">${isPending ? 'PENDIENTE' : 'DEVUELTO'}</span>
                </div>
            </div>
            
            ${item.comment ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 5px; font-style: italic;">"${item.comment}"</div>` : ''}

            ${isPending ? `
            <button class="btn btn-secondary" onclick="returnTool('${item.id}')" style="width: 100%; margin-top: 10px; padding: 0.5rem; font-size: 0.9rem;">
                <span class="material-icons-round">assignment_return</span> MARCAR DEVOLUCIÓN
            </button>
            ` : ''}
        `;
        container.appendChild(div);
    });
}

async function returnTool(txId) {
    if (!confirm("¿Confirmar recepción de esta herramienta?")) return;

    showToast("Procesando devolución...", "info");

    try {
        const result = await sendTransaction({
            action: 'TOOL_CHECK_IN',
            id: txId
        });

        if (result.status === 'success') {
            showToast("Devolución registrada", "success");
            fetchTools(); // Refresh list
        } else {
            showToast("Error: " + result.message, "error");
        }
    } catch (e) {
        showToast("Error de conexión", "error");
    }
}
