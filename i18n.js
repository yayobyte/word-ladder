/* ── i18n Dictionary & Theme Controls ── */
const i18n = {
    es: {
        APP_TITLE: "Escalera de Palabras",
        APP_SUB: "Word Ladder · Visualización A* Paso a Paso",
        APP_BADGE: "⬡ &nbsp; f(n) = g(n) + h(n) · Búsqueda Heurística Óptima",
        F_NOTE_G: "<span class=\"fg\">g</span> = pasos dados desde el inicio",
        F_NOTE_H: "<span class=\"fh\">h</span> = distancia de Hamming hasta la meta",
        F_NOTE_F: "<span class=\"ff\">f</span> = prioridad en la lista abierta (menor = mejor)",
        LBL_START: "Palabra Inicial",
        LBL_END: "Palabra Final",
        LBL_PRESETS: "Ejemplos:",
        BTN_SOLVE: "⬡ Resolver con A*",
        BTN_PLAY: "▶ Play",
        BTN_PAUSE: "⏸ Pausa",
        BTN_STEP: "Step →",
        BTN_RESET: "↺ Reset",
        LBL_SPEED: "Velocidad",
        LBL_STEP: "Paso",
        LEG_NODE: "Nodo actual",
        LEG_OPEN: "Lista Abierta — por explorar",
        LEG_CLOSED: "Lista Cerrada — explorados",
        LEG_PATH: "Camino óptimo",
        TITLE_OPEN: "⬡ Lista Abierta (Frontera)",
        TITLE_CLOSED: "⬡ Lista Cerrada (Explorados)",
        MSG_EMPTY: "Vacía",
        TITLE_TREE: "🌳 Árbol de Exploración A*",
        STAT_STEPS: "Pasos",
        STAT_CLOSED: "Cerrados",
        STAT_MAX: "Max abierta",
        PATH_TITLE: "Camino Óptimo Encontrado",
        PATH_WAIT: "Esperando",
        PATH_READY: "Listo",
        PATH_NO_PATH: "El camino aparecerá al finalizar",
        PATH_NO_FOUND: "No se encontró camino entre estas palabras.",
        PATH_CALC: "Calculando...",
        PATH_FAIL: "Sin solución",
        PATH_OK: "✓ Encontrado",
        ERR_LEN: "⚠ 4 letras requeridas",
        ERR_SAME: "⚠ Palabras distintas",
        MSG_READY: "Listo — {0} iteraciones",
        MSG_PRESS: "Presiona Step o Play para comenzar",
        EXP_READY: "Listo — {0} pasos calculados | {1} → {2}",
        EXP_ACTUAL: "Actual: {0}  |  f={1}  g={2}  h={3}  |  Abierta: {4}  Cerrada: {5}",
        TREE_EMPTY: "Los pasos del algoritmo aparecerán aquí"
    },
    en: {
        APP_TITLE: "Word Ladder",
        APP_SUB: "Word Ladder · Step by Step A* Visualization",
        APP_BADGE: "⬡ &nbsp; f(n) = g(n) + h(n) · Optimal Heuristic Search",
        F_NOTE_G: "<span class=\"fg\">g</span> = steps taken from start",
        F_NOTE_H: "<span class=\"fh\">h</span> = Hamming distance to goal",
        F_NOTE_F: "<span class=\"ff\">f</span> = priority in open list (lower = better)",
        LBL_START: "Start Word",
        LBL_END: "Target Word",
        LBL_PRESETS: "Examples:",
        BTN_SOLVE: "⬡ Solve with A*",
        BTN_PLAY: "▶ Play",
        BTN_PAUSE: "⏸ Pause",
        BTN_STEP: "Step →",
        BTN_RESET: "↺ Reset",
        LBL_SPEED: "Speed",
        LBL_STEP: "Step",
        LEG_NODE: "Current node",
        LEG_OPEN: "Open List — to explore",
        LEG_CLOSED: "Closed List — explored",
        LEG_PATH: "Optimal path",
        TITLE_OPEN: "⬡ Open List (Frontier)",
        TITLE_CLOSED: "⬡ Closed List (Explored)",
        MSG_EMPTY: "Empty",
        TITLE_TREE: "🌳 A* Exploration Tree",
        STAT_STEPS: "Steps",
        STAT_CLOSED: "Explored",
        STAT_MAX: "Max open",
        PATH_TITLE: "Optimal Path Found",
        PATH_WAIT: "Waiting",
        PATH_READY: "Ready",
        PATH_NO_PATH: "The path will appear when finished",
        PATH_NO_FOUND: "No path found between these words.",
        PATH_CALC: "Calculating...",
        PATH_FAIL: "No solution",
        PATH_OK: "✓ Found",
        ERR_LEN: "⚠ 4 letters required",
        ERR_SAME: "⚠ Words must differ",
        MSG_READY: "Ready — {0} iterations",
        MSG_PRESS: "Press Step or Play to start",
        EXP_READY: "Ready — {0} steps calculated | {1} → {2}",
        EXP_ACTUAL: "Current: {0}  |  f={1}  g={2}  h={3}  |  Open: {4}  Closed: {5}",
        TREE_EMPTY: "Algorithm steps will appear here"
    }
};

let currentLang = 'en';

function t(key, ...args) {
    let str = i18n[currentLang][key] || key;
    args.forEach((arg, i) => { str = str.replace(`{${i}}`, arg); });
    return str;
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.innerHTML = t(el.getAttribute('data-i18n'));
    });

    // Update button text if it was playing/paused
    const playBtn = document.getElementById('playBtn');
    if (typeof isPlaying !== 'undefined' && playBtn) {
        if (isPlaying) {
            playBtn.textContent = t('BTN_PAUSE');
        } else if (playBtn.textContent !== t('BTN_PLAY')) {
            playBtn.textContent = t('BTN_PLAY');
        }
    }
}

function toggleLanguage() {
    const newLang = currentLang === 'en' ? 'es' : 'en';
    document.getElementById('langToggle').textContent = newLang.toUpperCase();
    setLanguage(newLang);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    document.getElementById('themeToggle').textContent = next === 'light' ? '🌙' : '☀️';
}

// Ensure the page renders with the correct initial language
window.addEventListener('DOMContentLoaded', () => {
    // Init theme on load
    if (localStorage.getItem('theme') === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById('themeToggle').textContent = '🌙';
    }

    setLanguage(currentLang);
    document.getElementById('langToggle').textContent = currentLang === 'en' ? 'ES' : 'EN';
});
