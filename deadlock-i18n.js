/* ── i18n Dictionary & Theme Controls for Deadlock Detection ── */
const i18n = {
    es: {
        APP_TITLE: "Detección de Interbloqueos",
        APP_SUB: "Grafos de Asignación de Recursos (HOLT)",
        APP_BADGE: "⬡   BFS/DFS · Detección de Trayectorias Cerradas en Sistemas Operativos",
        CONCEPT_TITLE: "¿Cómo funciona?",
        CONCEPT_1: "Un <b>Grafo de Asignación de Recursos (RAG)</b> modela procesos y recursos del S.O.",
        CONCEPT_2: "Los <span class='edge-wait-label'>arcos de espera</span> van del proceso al recurso que solicita.",
        CONCEPT_3: "Los <span class='edge-hold-label'>arcos de asignación</span> van del recurso al proceso que lo posee.",
        CONCEPT_4: "BFS/DFS recorre el grafo buscando <span class='cycle-label'>ciclos</span> → si encuentra uno, hay <b>deadlock</b>.",
        LBL_SCENARIO: "Escenario",
        LBL_ALGORITHM: "Algoritmo",
        LBL_PRESETS: "Escenarios:",
        PRESET_SIMPLE: "Interbloqueo Simple",
        PRESET_SAFE: "Sin Interbloqueo",
        PRESET_COMPLEX: "Interbloqueo Complejo",
        PRESET_GRIDLOCK: "Atascamiento Total (Gridlock)",
        ALG_BFS: "BFS (Anchura)",
        ALG_DFS: "DFS (Profundidad)",
        BTN_SOLVE: "⬡ Detectar",
        BTN_PLAY: "▶ Play",
        BTN_PAUSE: "⏸ Pausa",
        BTN_STEP: "Avanzar →",
        BTN_RESET: "↺ Reset",
        LBL_SPEED: "Velocidad",
        LBL_STEP: "Paso",
        LEG_PROCESS: "Proceso",
        LEG_RESOURCE: "Recurso",
        LEG_WAIT: "Espera (solicita)",
        LEG_HOLD: "Asignado (posee)",
        LEG_VISITING: "Nodo actual BFS",
        LEG_VISITED: "Visitado",
        LEG_CYCLE: "Ciclo (Interbloqueo)",
        TITLE_QUEUE: "⬡ Cola/Pila (Frontera)",
        TITLE_QUEUE_BFS: "⬡ Cola BFS (Frontera)",
        TITLE_QUEUE_DFS: "⬡ Pila DFS (Recursión)",
        TITLE_VISITED: "⬡ Visitados (Explorados)",
        TITLE_GRAPH: "🔗 Grafo de Asignación de Recursos",
        MSG_EMPTY: "Vacía",
        RESULT_TITLE: "Resultado de Detección",
        RESULT_WAIT: "Esperando",
        RESULT_CALC: "Analizando...",
        RESULT_DEADLOCK: "🔴 ¡Interbloqueo Detectado!",
        RESULT_SAFE: "🟢 Sistema Seguro",
        RESULT_NO_ANALYSIS: "El resultado aparecerá al finalizar",
        MSG_READY: "Listo — {0} iteraciones",
        MSG_PRESS: "Presiona Step o Play para comenzar",
        EXP_READY: "Listo — {0} pasos calculados",
        EXP_ACTUAL: "Actual: {0}  |  Frontera: {1}  Visitados: {2}",
        EXP_CYCLE: "¡Ciclo encontrado! {0}",
        STAT_STEPS: "Pasos",
        STAT_VISITED: "Visitados",
        STAT_CYCLE_LEN: "Nodos en ciclo",
        CYCLE_PATH_LABEL: "Trayectoria cerrada:",
        NO_CYCLE_MSG: "No se detectó trayectoria cerrada. El sistema está en estado seguro."
    },
    en: {
        APP_TITLE: "Deadlock Detection",
        APP_SUB: "Resource Allocation Graphs (HOLT)",
        APP_BADGE: "⬡   BFS/DFS · Closed Trajectory Detection in Operating Systems",
        CONCEPT_TITLE: "How does it work?",
        CONCEPT_1: "A <b>Resource Allocation Graph (RAG)</b> models OS processes and resources.",
        CONCEPT_2: "<span class='edge-wait-label'>Wait edges</span> go from a process to the resource it requests.",
        CONCEPT_3: "<span class='edge-hold-label'>Assignment edges</span> go from a resource to the process holding it.",
        CONCEPT_4: "BFS/DFS traverses the graph looking for <span class='cycle-label'>cycles</span> → if found, there's a <b>deadlock</b>.",
        LBL_SCENARIO: "Scenario",
        LBL_ALGORITHM: "Algorithm",
        LBL_PRESETS: "Scenarios:",
        PRESET_SIMPLE: "Simple Deadlock",
        PRESET_SAFE: "No Deadlock",
        PRESET_COMPLEX: "Complex Deadlock",
        PRESET_GRIDLOCK: "Gridlock (System Overload)",
        ALG_BFS: "BFS (Breadth-First)",
        ALG_DFS: "DFS (Depth-First)",
        BTN_SOLVE: "⬡ Detect",
        BTN_PLAY: "▶ Play",
        BTN_PAUSE: "⏸ Pause",
        BTN_STEP: "Step →",
        BTN_RESET: "↺ Reset",
        LBL_SPEED: "Speed",
        LBL_STEP: "Step",
        LEG_PROCESS: "Process",
        LEG_RESOURCE: "Resource",
        LEG_WAIT: "Waiting (requests)",
        LEG_HOLD: "Assigned (holds)",
        LEG_VISITING: "Current node",
        LEG_VISITED: "Visited",
        LEG_CYCLE: "Cycle (Deadlock)",
        TITLE_QUEUE: "⬡ Queue/Stack (Frontier)",
        TITLE_QUEUE_BFS: "⬡ BFS Queue (Frontier)",
        TITLE_QUEUE_DFS: "⬡ DFS Stack (Recursion)",
        TITLE_VISITED: "⬡ Visited (Explored)",
        TITLE_GRAPH: "🔗 Resource Allocation Graph",
        MSG_EMPTY: "Empty",
        RESULT_TITLE: "Detection Result",
        RESULT_WAIT: "Waiting",
        RESULT_CALC: "Analyzing...",
        RESULT_DEADLOCK: "🔴 Deadlock Detected!",
        RESULT_SAFE: "🟢 System Safe",
        RESULT_NO_ANALYSIS: "Result will appear when finished",
        MSG_READY: "Ready — {0} iterations",
        MSG_PRESS: "Press Step or Play to start",
        EXP_READY: "Ready — {0} steps calculated",
        EXP_ACTUAL: "Current: {0}  |  Frontier: {1}  Visited: {2}",
        EXP_CYCLE: "Cycle found! {0}",
        STAT_STEPS: "Steps",
        STAT_VISITED: "Visited",
        STAT_CYCLE_LEN: "Cycle nodes",
        CYCLE_PATH_LABEL: "Closed trajectory:",
        NO_CYCLE_MSG: "No closed trajectory detected. System is in a safe state."
    }
};

let currentLang = 'es';

function t(key, ...args) {
    if (!i18n[currentLang]) return key;
    let str = i18n[currentLang][key] || key;
    args.forEach((arg, i) => {
        if (str && typeof str === 'string') {
            str = str.replace(`{${i}}`, arg);
        }
    });
    return str;
}

function setLanguage(lang) {
    currentLang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => {
        el.innerHTML = t(el.getAttribute('data-i18n'));
    });

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
    localStorage.setItem('deadlock-theme', next);
    document.getElementById('themeToggle').textContent = next === 'light' ? '🌙' : '☀️';
}

window.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('deadlock-theme') === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        document.getElementById('themeToggle').textContent = '🌙';
    }
    setLanguage(currentLang);
    document.getElementById('langToggle').textContent = currentLang === 'en' ? 'ES' : 'EN';
});
