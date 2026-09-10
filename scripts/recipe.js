document.addEventListener('DOMContentLoaded', () => {
    initServingsScaler();
    initIngredientsChecklist();
    initInstructionsToggle();
    initCompactTimer();
    initPrintButton();
});

function initServingsScaler() {
    const scaleSelect = document.getElementById('servingScale');
    const servingsDisplay = document.getElementById('servings');
    const amountElements = document.querySelectorAll('.amount');

    if (!amountElements.length || !scaleSelect) return;

    const baseServings = servingsDisplay ? parseFloat(servingsDisplay.textContent) || 4 : 4;

    const originalData = Array.from(amountElements).map(el => {
        return parseAmount(el.textContent.trim());
    });

    scaleSelect.addEventListener('change', (e) => {
        const scale = parseFloat(e.target.value) || 1;

        if (servingsDisplay) {
            servingsDisplay.textContent = Math.round(baseServings * scale);
        }

        amountElements.forEach((el, index) => {
            const data = originalData[index];
            if (!data.hasNumber) {
                el.textContent = data.raw;
                return;
            }

            if (data.isCompound) {
                const scaledParts = data.parts.map(p => {
                    const scaled = formatNumber(p.val * scale);
                    return `${scaled}${p.unit}`;
                });
                el.textContent = scaledParts.join('/');
            } else {
                const scaled = formatNumber(data.val * scale);
                el.textContent = `${scaled}${data.unit}`;
            }
        });
    });
}

function parseAmount(text) {
    if (!text || text.toLowerCase().includes('gusto') || text.toLowerCase().includes('opcional')) {
        return { hasNumber: false, raw: text };
    }

    if (text.includes('/')) {
        const parts = text.split('/');
        if (parts.every(p => /\d/.test(p))) {
            return {
                hasNumber: true,
                isCompound: true,
                parts: parts.map(p => parseSingle(p.trim()))
            };
        }
    }

    const parsed = parseSingle(text);
    return {
        hasNumber: !isNaN(parsed.val),
        isCompound: false,
        val: parsed.val,
        unit: parsed.unit,
        raw: text
    };
}

function parseSingle(str) {
    if (/^\s*(\d+)\/(\d+)/.test(str)) {
        const match = str.match(/^\s*(\d+)\/(\d+)\s*(.*)$/);
        const val = parseFloat(match[1]) / parseFloat(match[2]);
        return { val, unit: match[3] || '' };
    }

    const normalized = str.replace('½', '0.5').replace('¼', '0.25').replace('¾', '0.75');
    const numMatch = normalized.match(/[\d.]+/);
    if (!numMatch) {
        return { val: NaN, unit: str };
    }

    const val = parseFloat(numMatch[0]);
    const unit = normalized.replace(numMatch[0], '').trim();
    return { val, unit };
}

function formatNumber(num) {
    if (isNaN(num)) return '';
    const rounded = Math.round(num * 100) / 100;
    return String(rounded);
}

function initIngredientsChecklist() {
    const items = document.querySelectorAll('.ingredients-list li');
    items.forEach(li => {
        let checkbox = li.querySelector('.ingredient-checkbox');
        if (!checkbox) {
            checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.className = 'ingredient-checkbox';
            const firstChild = li.firstElementChild;
            if (firstChild) {
                li.insertBefore(checkbox, firstChild);
            } else {
                li.prepend(checkbox);
            }
        }

        li.addEventListener('click', (e) => {
            if (e.target.tagName.toLowerCase() === 'a') return;
            if (e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
            }
            li.classList.toggle('checked', checkbox.checked);
        });

        checkbox.addEventListener('change', () => {
            li.classList.toggle('checked', checkbox.checked);
        });
    });
}

function initInstructionsToggle() {
    document.querySelectorAll('.instructions-list li').forEach(item => {
        item.addEventListener('click', (e) => {
            if (e.target.closest('details') && e.target.tagName.toLowerCase() === 'summary') return;
            item.classList.toggle('completed');
        });
    });
}

function initCompactTimer() {
    const timerWrap = document.querySelector('.timer-inline');
    if (!timerWrap) return;

    const display = timerWrap.querySelector('.timer-display');
    const startBtn = timerWrap.querySelector('.timer-start-btn');
    const resetBtn = timerWrap.querySelector('.timer-reset-btn');

    const defaultSeconds = parseInt(timerWrap.getAttribute('data-seconds'), 10) || 300;
    let remaining = defaultSeconds;
    let interval = null;
    let isRunning = false;

    function render() {
        const m = Math.floor(remaining / 60);
        const s = remaining % 60;
        display.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }

    function stop() {
        isRunning = false;
        clearInterval(interval);
        startBtn.innerHTML = '<i class="fa-solid fa-play"></i> Iniciar';
    }

    function start() {
        if (remaining <= 0) remaining = defaultSeconds;
        isRunning = true;
        startBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pausar';
        interval = setInterval(() => {
            if (remaining > 0) {
                remaining--;
                render();
                if (remaining === 0) {
                    stop();
                    try {
                        const ctx = new (window.AudioContext || window.webkitAudioContext)();
                        const osc = ctx.createOscillator();
                        osc.frequency.value = 880;
                        osc.connect(ctx.destination);
                        osc.start();
                        osc.stop(ctx.currentTime + 0.8);
                    } catch (e) { }
                    alert('Tiempo cumplido');
                }
            } else {
                stop();
            }
        }, 1000);
    }

    startBtn.addEventListener('click', () => {
        if (isRunning) stop();
        else start();
    });

    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            stop();
            remaining = defaultSeconds;
            render();
        });
    }

    render();
}

function initPrintButton() {
    const printBtn = document.getElementById('printRecipeBtn');
    if (printBtn) {
        printBtn.addEventListener('click', () => window.print());
    }
}
