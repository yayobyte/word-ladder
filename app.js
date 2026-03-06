
/* ── Dictionary ── */
const DICT = new Set([
    "ABRA", "ACTO", "AGUA", "AIRE", "ALBA", "ALMA", "ALTO", "ANCA", "ANTE", "ARCO",
    "AREA", "ARMA", "ARTE", "ATAR", "AULA", "AUTO", "AVES", "BALA", "BECA", "BESO",
    "BOCA", "BODA", "BOLA", "BOLO", "BOTA", "CADA", "CAFE", "CARA", "CARO", "CASA",
    "CASO", "CELO", "CENA", "CERA", "CERO", "COLA", "COMA", "COPA", "CORO", "COSA",
    "COTA", "CUBA", "DADO", "DAMA", "DAME", "DATA", "DEDO", "DEJO", "DIOS", "DONA",
    "DOTE", "DUDA", "DUNA", "FAMA", "FARO", "FILA", "FILO", "FINO", "FOCA", "FOCO",
    "GALA", "GAMA", "GANA", "GATO", "GIRO", "GOLA", "GOMA", "GOTA", "GUIA", "HADA",
    "HALO", "HIJA", "HILO", "HORA", "HUMO", "IDEA", "ISLA", "LACA", "LAMA", "LANA",
    "LAPA", "LATA", "LAVA", "LEJA", "LEMA", "LENA", "LIRA", "LISA", "LISO", "LOBA",
    "LOBO", "LOCA", "LOCO", "LODO", "LOGO", "LONA", "LORA", "LOSA", "LOTA", "LOZA",
    "LUNA", "LUPA", "MACA", "MALO", "MANA", "MANO", "MAPA", "MARA", "MASA", "MATE",
    "MATO", "MAYO", "MESA", "MIEL", "MIMA", "MINA", "MIRA", "MISA", "MITO", "MODA",
    "MODO", "MOLA", "MONA", "MORA", "MOTA", "MOZO", "MUDA", "MULA", "MUSA", "NADA",
    "NATA", "NAVE", "NIDO", "NORA", "NOTA", "NUCA", "OCIO", "ODIO", "OLEO", "OLLA",
    "OLMO", "ONDA", "ORCA", "PAJA", "PALA", "PALO", "PAPA", "PARA", "PASA", "PASO",
    "PATA", "PATO", "PAVA", "PAVO", "PECA", "PELO", "PENA", "PERA", "PESO", "PICO",
    "PILA", "PINO", "PIPA", "PISA", "PISO", "PITA", "POCA", "POCO", "PODA", "POLO",
    "POMA", "POPA", "POSA", "POTA", "POZA", "PURO", "RACA", "RAGA", "RAJA", "RALO",
    "RANA", "RASA", "RATO", "RAYA", "RAZA", "REJA", "REMA", "ROBA", "ROCA", "ROJA",
    "ROJO", "ROLA", "RONA", "ROPA", "ROSA", "ROTA", "ROTO", "RUCA", "RUDA", "RUGA",
    "RUMA", "RUNA", "SACO", "SALA", "SANA", "SAPO", "SARA", "SECA", "SECO", "SEDA",
    "SETA", "SILO", "SIMA", "SINO", "SOCA", "SODA", "SOJA", "SOLA", "SOLO", "SOMA",
    "SOPA", "SORA", "SOTA", "SUMO", "TABA", "TACO", "TAJA", "TALA", "TALO", "TAMO",
    "TAPA", "TARA", "TASA", "TEJA", "TELA", "TEMA", "TENA", "TIRA", "TODA", "TODO",
    "TOMA", "TONA", "TORA", "TORO", "TOSA", "TOTA", "TUCA", "TUNA", "VACA", "VALE",
    "VANO", "VARA", "VASO", "VELA", "VENA", "VERA", "VETA", "VISA", "VISO", "VITA",
    "VOTO", "YATE", "YUCA", "ZONA", "ZOPA"
]);

/* ── A* Algorithm Logic with Snapshot Recording ── */

/**
 * Calculates the Hamming distance between two strings.
 * This represents the number of differing characters at corresponding positions.
 * Used as our heuristic function `h(n)`.
 */
function calculateHammingDistance(wordA, wordB) {
    let distance = 0;
    for (let i = 0; i < wordA.length; i++) {
        if (wordA[i] !== wordB[i]) {
            distance++;
        }
    }
    return distance;
}

/**
 * Generates all valid neighboring words (words that differ by exactly 1 character
 * and exist in our dictionary).
 */
function getNeighbors(word) {
    const neighbors = [];
    const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

    for (let i = 0; i < word.length; i++) {
        for (const char of ALPHABET) {
            if (char === word[i]) {
                continue;
            }
            const newWord = word.slice(0, i) + char + word.slice(i + 1);

            if (DICT.has(newWord)) {
                neighbors.push(newWord);
            }
        }
    }
    return neighbors;
}

/**
 * Core A* Search Algorithm, modified to record state snapshots for visualization.
 * Returns an object with the recorded snapshots and maximum open list size.
 */
function runAStarAlgorithm(startWord, goalWord) {
    const stepSnapshots = [];

    // Maps to store our exploration frontiers.
    // openList stores nodes to be evaluated: Map<word, { g, f, h, path }>
    const openList = new Map();
    // closedList stores already evaluated nodes: Map<word, { g, path }>
    const closedList = new Map();

    let maxOpenListSize = 0;

    const initialHeuristic = calculateHammingDistance(startWord, goalWord);
    openList.set(startWord, {
        g: 0,
        h: initialHeuristic,
        f: initialHeuristic,
        path: [startWord],
        parent: null
    });

    while (openList.size > 0) {
        // 1. Pick the node with the lowest 'f' score from the open list.
        // Ties are broken by choosing the node with the lowest 'h' score (closest to goal).
        let bestWord = null;
        let bestNodeData = null;

        for (const [word, nodeData] of openList) {
            if (!bestNodeData ||
                nodeData.f < bestNodeData.f ||
                (nodeData.f === bestNodeData.f && nodeData.h < bestNodeData.h)) {
                bestWord = word;
                bestNodeData = nodeData;
            }
        }

        // 2. Move the chosen node from open list to closed list.
        openList.delete(bestWord);
        closedList.set(bestWord, bestNodeData);
        maxOpenListSize = Math.max(maxOpenListSize, openList.size + closedList.size);

        // 3. Generate valid neighbors for the current node.
        const neighbors = getNeighbors(bestWord);
        const newlyDiscoveredNodes = [];
        const updatedNodes = [];

        for (const neighborWord of neighbors) {
            if (closedList.has(neighborWord)) {
                continue; // Already fully evaluated
            }

            const neighborGScore = bestNodeData.g + 1;
            const neighborHScore = calculateHammingDistance(neighborWord, goalWord);
            const neighborFScore = neighborGScore + neighborHScore;

            const existingNeighbor = openList.get(neighborWord);

            // If neighbor is not in open list OR we found a cheaper path to it...
            if (!existingNeighbor || existingNeighbor.g > neighborGScore) {
                if (existingNeighbor) {
                    updatedNodes.push(neighborWord);
                } else {
                    newlyDiscoveredNodes.push(neighborWord);
                }

                openList.set(neighborWord, {
                    g: neighborGScore,
                    h: neighborHScore,
                    f: neighborFScore,
                    path: [...bestNodeData.path, neighborWord],
                    parent: bestWord
                });
            }
        }

        // 4. Record a deep-copy snapshot of the state for the UI
        stepSnapshots.push({
            current: bestWord,
            currentData: { ...bestNodeData },
            open: new Map(Array.from(openList).map(([k, v]) => [k, { ...v, path: [...v.path] }])),
            closed: new Map(Array.from(closedList).map(([k, v]) => [k, { ...v, path: [...v.path] }])),
            newNodes: [...newlyDiscoveredNodes],
            updNodes: [...updatedNodes],
            goalFound: bestWord === goalWord,
            optimalPath: bestWord === goalWord ? [...bestNodeData.path] : null
        });

        // 5. Terminate if the goal has been successfully reached
        if (bestWord === goalWord) {
            return { snapshots: stepSnapshots, maxOpen: maxOpenListSize, failed: false };
        }
    }

    // Return failure if the open list empties without finding the goal
    return { snapshots: stepSnapshots, maxOpen: maxOpenListSize, failed: true };
}


/* ── Application State Variables ── */
let algorithmSnapshots = [];
let currentVisualStep = 0;
let isPlaying = false;
let playIntervalTimer = null;
let currentAStarResult = null;
let calculationTimeMs = 0;

/* ── D3 Tree Variables ── */
let svg, gNode, gLink, zoomBehavior, treeLayout, d3Tooltip;
const svgWidth = 800; // Will be responsive
const svgHeight = 400;

/* ── DOM Helper Functions ── */
function loadPreset(startStr, endStr) {
    document.getElementById('startWord').value = startStr;
    document.getElementById('endWord').value = endStr;
    resetVisualization();
}

function getPlaybackSpeedMs() {
    const sliderValue = +document.getElementById('speedSlider').value;
    return Math.round(800 - (sliderValue - 1) * 74);
}

function updateStepCounterDisplay(current, total) {
    document.getElementById('stepCtr').textContent = current + ' / ' + total;
}

function updateExplanationText(text) {
    document.getElementById('explainTxt').textContent = text;
}

function setPathBadgeStatus(type, text) {
    const badgeElement = document.getElementById('pathBadge');
    badgeElement.className = 'result-badge badge-' + type;
    badgeElement.textContent = text;
}

/* ── UI Rendering: Open List ── */
function renderOpenList(snapshot) {
    const container = document.getElementById('openList');
    document.getElementById('openCount').textContent = snapshot.open.size;

    if (!snapshot.open.size) {
        container.innerHTML = `<div class="empty-msg" data-i18n="MSG_EMPTY">${t('MSG_EMPTY')}</div>`;
        return;
    }

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'nodes-wrap';

    // Sort items primarily by 'f' score for display
    const sortedNodes = [...snapshot.open.entries()].sort((a, b) => a[1].f - b[1].f);

    sortedNodes.forEach(([word, nodeData], index) => {
        const chip = document.createElement('div');
        chip.className = 'node-chip node-open';
        if (index === 0) {
            chip.className += ' node-best-f';
        }

        chip.textContent = word;

        if (snapshot.newNodes.includes(word) && index !== 0) {
            chip.style.boxShadow = '0 0 8px rgba(34,197,94,0.6)'; // Highlight new
        }
        if (snapshot.updNodes.includes(word) && index !== 0) {
            chip.style.boxShadow = '0 0 8px rgba(255,214,0,0.5)'; // Highlight updated
        }

        const scoreTag = document.createElement('div');
        scoreTag.className = 'node-score';
        scoreTag.textContent = `f=${nodeData.f}`;

        chip.appendChild(scoreTag);
        wrapper.appendChild(chip);
    });

    container.appendChild(wrapper);
}

/* ── UI Rendering: Closed List ── */
function renderClosedList(snapshot) {
    const container = document.getElementById('closedList');
    document.getElementById('closedCount').textContent = snapshot.closed.size;

    if (!snapshot.closed.size) {
        container.innerHTML = `<div class="empty-msg" data-i18n="MSG_EMPTY">${t('MSG_EMPTY')}</div>`;
        return;
    }

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'nodes-wrap';

    [...snapshot.closed.entries()].forEach(([word, nodeData]) => {
        const isOnOptimalPath = snapshot.optimalPath && snapshot.optimalPath.includes(word);
        const isCurrentlyEvaluated = word === snapshot.current;

        const chip = document.createElement('div');
        chip.className = 'node-chip ';

        if (isCurrentlyEvaluated) {
            chip.className += 'node-current';
        } else if (isOnOptimalPath) {
            chip.className += 'node-path';
        } else {
            chip.className += 'node-closed';
        }

        chip.textContent = word;

        const scoreTag = document.createElement('div');
        scoreTag.className = 'node-score';
        scoreTag.textContent = `g=${nodeData.g}`;

        chip.appendChild(scoreTag);
        wrapper.appendChild(chip);
    });

    container.appendChild(wrapper);
}

/* ── UI Rendering: Activity Log / Tree ── */
function initTreeGraph() {
    const container = document.getElementById('treeView');
    container.innerHTML = '';

    // Create tooltip if it doesn't exist
    if (!d3Tooltip) {
        d3Tooltip = d3.select("body").append("div")
            .attr("class", "d3-tooltip")
            .style("opacity", 0);
    }

    // Default dimensions, will center based on these but zoom allows panning
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 400;

    svg = d3.select(container).append("svg")
        .attr("class", "tree-svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", [0, 0, width, height]);

    const gWrapper = svg.append("g");

    gLink = gWrapper.append("g")
        .attr("fill", "none")
        .attr("stroke", "var(--border)")
        .attr("stroke-opacity", 0.7)
        .attr("stroke-width", 1.5);

    gNode = gWrapper.append("g")
        .attr("cursor", "pointer")
        .attr("pointer-events", "all");

    // Standard D3 zoom
    zoomBehavior = d3.zoom()
        .scaleExtent([0.1, 4])
        .on("zoom", (event) => {
            gWrapper.attr("transform", event.transform);
        });

    svg.call(zoomBehavior);
    // Initial transform to center top
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(width / 2, 40).scale(1));

    // Define tree layout
    // nodeSize instead of size allows the tree to grow dynamically without squishing
    treeLayout = d3.tree().nodeSize([45, 60]);
}

function renderTreeGraph(snapshot) {
    if (!svg) initTreeGraph();

    // 1. Build flat array of nodes for d3.stratify
    const allNodes = new Map();

    // Add all closed nodes
    for (const [word, data] of snapshot.closed.entries()) {
        allNodes.set(word, { id: word, parent: data.parent, state: 'closed', f: data.f, g: data.g, h: data.h });
    }
    // Add all open nodes
    for (const [word, data] of snapshot.open.entries()) {
        // If a word is somehow in both (shouldn't happen in standard A*), closed takes precedence
        if (!allNodes.has(word)) {
            allNodes.set(word, { id: word, parent: data.parent, state: 'open', f: data.f, g: data.g, h: data.h });
        }
    }

    // Ensure Root has no parent
    const startWord = snapshot.open.size > 0 ? (snapshot.open.has(snapshot.open.keys().next().value) ? snapshot.open.values().next().value.path[0] : snapshot.closed.values().next().value.path[0]) : null;
    if (allNodes.has(startWord)) {
        allNodes.get(startWord).parent = "";
    }


    // Add special states (Path, Current)
    if (snapshot.optimalPath) {
        snapshot.optimalPath.forEach(word => {
            if (allNodes.has(word)) allNodes.get(word).state = 'path';
        });
    } else if (snapshot.current && allNodes.has(snapshot.current)) {
        allNodes.get(snapshot.current).state = 'current';
    }

    const flatData = Array.from(allNodes.values());

    // Defensive check: If no data, clear and return
    if (flatData.length === 0) return;

    // 2. Stratify the data
    const stratify = d3.stratify()
        .id(d => d.id)
        .parentId(d => d.parent);

    let root;
    try {
        root = stratify(flatData);
    } catch (e) {
        console.warn("Could not stratify data (broken hierarchy)", e);
        return;
    }

    // 3. Apply Tree Layout
    treeLayout(root);

    const nodes = root.descendants();
    const links = root.links();

    // 4. Update UI - Links
    const link = gLink.selectAll(".link")
        .data(links, d => d.target.id);

    const linkEnter = link.enter().append("path")
        .attr("class", "link")
        .attr("d", d => {
            const source = d.source;
            const target = d.source; // Start at parent for animation
            return `M${source.x},${source.y} C${source.x},${(source.y + target.y) / 2} ${target.x},${(source.y + target.y) / 2} ${target.x},${target.y}`;
        });

    link.merge(linkEnter).transition().duration(250)
        .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
        );

    link.exit().remove();

    // 5. Update UI - Nodes
    const node = gNode.selectAll(".node")
        .data(nodes, d => d.id);

    const nodeEnter = node.enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.parent ? d.parent.x : d.x},${d.parent ? d.parent.y : d.y})`)
        .attr("opacity", 0);

    nodeEnter.append("circle")
        .attr("r", 15);

    nodeEnter.append("text")
        .attr("dy", "0.31em")
        .text(d => d.data.id);

    const nodeUpdate = node.merge(nodeEnter);

    // Apply state classes
    nodeUpdate.attr("class", d => "node node-" + d.data.state);

    // Add interactivity for Tooltips
    nodeUpdate.on("mouseover", (event, d) => {
        const fd = d.data;
        d3Tooltip.transition().duration(200).style("opacity", 1);
        d3Tooltip.html(`<b>${fd.id}</b>f = ${fd.f}<br/>g = ${fd.g}<br/>h = ${fd.h}`)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 15) + "px");
    })
        .on("mousemove", (event) => {
            d3Tooltip.style("left", (event.pageX + 15) + "px")
                .style("top", (event.pageY - 15) + "px");
        })
        .on("mouseout", () => {
            d3Tooltip.transition().duration(200).style("opacity", 0);
        });

    nodeUpdate.transition().duration(250)
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .attr("opacity", 1);

    node.exit().remove();

    // Zoom/pan to current node if available
    if (snapshot.current) {
        const currentDataNode = nodes.find(n => n.id === snapshot.current);
        if (currentDataNode) {
            const containerEle = document.getElementById('treeView');
            const cw = containerEle.clientWidth;
            const ch = containerEle.clientHeight;

            // Adjust to center the current node in the view
            const transform = d3.zoomIdentity
                .translate(cw / 2 - currentDataNode.x, ch / 3 - currentDataNode.y)
                .scale(1);

            svg.transition().duration(300).call(zoomBehavior.transform, transform);
        }
    }
}

/* ── UI Rendering: Optimal Path ── */
function renderOptimalPathDisplay(path) {
    const bodyElement = document.getElementById('pathBody');
    bodyElement.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'path-steps';

    path.forEach((word, index) => {
        const isStart = index === 0;
        const isEnd = index === path.length - 1;
        const stateClass = isStart ? 'ps-start' : isEnd ? 'ps-end' : 'ps-mid';

        const wordElement = document.createElement('div');
        wordElement.className = 'ps-word ' + stateClass;
        wordElement.style.animationDelay = (index * 55) + 'ms';
        wordElement.textContent = word;

        wrapper.appendChild(wordElement);

        // Add transitions between words
        if (index < path.length - 1) {
            const nextWord = path[index + 1];

            const arrowElement = document.createElement('span');
            arrowElement.className = 'ps-arrow';
            arrowElement.textContent = '→';
            wrapper.appendChild(arrowElement);

            const diffContainer = document.createElement('div');
            diffContainer.className = 'ps-diff';

            for (let j = 0; j < word.length; j++) {
                const charElement = document.createElement('div');
                const isDifferent = word[j] !== nextWord[j];

                charElement.className = 'ps-dc ' + (isDifferent ? 'ps-dc-c' : 'ps-dc-s');
                charElement.textContent = nextWord[j];
                diffContainer.appendChild(charElement);
            }

            wrapper.appendChild(diffContainer);
        }
    });

    bodyElement.appendChild(wrapper);
}

/* ── Core Visual Update Loop ── */
function applyVisualizationSnapshot(snapshotIndex) {
    const snapshot = algorithmSnapshots[snapshotIndex];
    updateStepCounterDisplay(snapshotIndex + 1, algorithmSnapshots.length);

    renderOpenList(snapshot);
    renderClosedList(snapshot);

    const nodeData = snapshot.currentData;
    // Use tree graph render instead of text logging
    renderTreeGraph(snapshot);
    updateExplanationText(t('EXP_ACTUAL', snapshot.current, nodeData.f, nodeData.g, nodeData.h, snapshot.open.size, snapshot.closed.size));

    // Handle goal state reached visually
    if (snapshot.goalFound) {
        setPathBadgeStatus('ok', t('PATH_OK'));
        renderOptimalPathDisplay(snapshot.optimalPath);

        document.getElementById('statsRow').style.display = 'flex';
        document.getElementById('sSteps').textContent = snapshot.optimalPath.length - 1;
        document.getElementById('sExplored').textContent = snapshot.closed.size;
        document.getElementById('sMaxOpen').textContent = currentAStarResult.maxOpen;
        document.getElementById('sTime').textContent = calculationTimeMs;

        stopPlayback();
        document.getElementById('stepBtn').disabled = true;
        document.getElementById('playBtn').disabled = true;
    }
}

/* ── Interactive Controls ── */
function startSolving() {
    const startParam = document.getElementById('startWord').value.trim().toUpperCase();
    const endParam = document.getElementById('endWord').value.trim().toUpperCase();

    if (startParam.length !== 4 || endParam.length !== 4) {
        setPathBadgeStatus('fail', t('ERR_LEN'));
        return;
    }
    if (startParam === endParam) {
        setPathBadgeStatus('fail', t('ERR_SAME'));
        return;
    }

    // Guarantee words are in dictionary for the run
    if (!DICT.has(startParam)) DICT.add(startParam);
    if (!DICT.has(endParam)) DICT.add(endParam);

    resetVisualization();
    setPathBadgeStatus('run', t('PATH_CALC'));
    document.getElementById('solveBtn').disabled = true;

    // Delay calculation slightly to allow UI to update
    setTimeout(() => {
        const t0 = performance.now();
        currentAStarResult = runAStarAlgorithm(startParam, endParam);
        calculationTimeMs = (performance.now() - t0).toFixed(1);

        document.getElementById('solveBtn').disabled = false;

        if (currentAStarResult.failed) {
            setPathBadgeStatus('fail', t('PATH_FAIL'));
            document.getElementById('pathBody').innerHTML = `<div class="empty-msg">${t('PATH_NO_FOUND')}</div>`;
            return;
        }

        algorithmSnapshots = currentAStarResult.snapshots;
        currentVisualStep = 0;

        document.getElementById('treeView').innerHTML = ''; // Clear SVG explicitly to recreate
        initTreeGraph(); // Re-init D3

        updateStepCounterDisplay(0, algorithmSnapshots.length);
        setPathBadgeStatus('run', t('MSG_READY', algorithmSnapshots.length));

        document.getElementById('openList').innerHTML = `<div class="empty-msg">${t('MSG_PRESS')}</div>`;

        document.getElementById('playBtn').disabled = false;
        document.getElementById('stepBtn').disabled = false;
        document.getElementById('resetBtn').disabled = false;

        updateExplanationText(t('EXP_READY', algorithmSnapshots.length, startParam, endParam));
    }, 30);
}

function advanceStepForward() {
    if (currentVisualStep >= algorithmSnapshots.length) { return; }
    applyVisualizationSnapshot(currentVisualStep++);
}

function togglePlayback() {
    if (isPlaying) {
        stopPlayback();
    } else {
        startPlayback();
    }
}

function startPlayback() {
    if (currentVisualStep >= algorithmSnapshots.length) { return; }
    isPlaying = true;
    document.getElementById('playBtn').textContent = t('BTN_PAUSE');
    processPlaybackTick();
}

function processPlaybackTick() {
    if (!isPlaying || currentVisualStep >= algorithmSnapshots.length) {
        stopPlayback();
        return;
    }
    applyVisualizationSnapshot(currentVisualStep++);
    playIntervalTimer = setTimeout(processPlaybackTick, getPlaybackSpeedMs());
}

function stopPlayback() {
    isPlaying = false;
    clearTimeout(playIntervalTimer);
    document.getElementById('playBtn').textContent = t('BTN_PLAY');
}

function resetVisualization() {
    stopPlayback();
    algorithmSnapshots = [];
    currentVisualStep = 0;
    currentAStarResult = null;

    ['openList', 'closedList'].forEach(id => {
        document.getElementById(id).innerHTML = `<div class="empty-msg" data-i18n="MSG_EMPTY">${t('MSG_EMPTY')}</div>`;
    });

    document.getElementById('openCount').textContent = '0';
    document.getElementById('closedCount').textContent = '0';

    document.getElementById('treeView').innerHTML = ''; // Remove SVG

    document.getElementById('pathBody').innerHTML = `<div class="empty-msg" data-i18n="PATH_NO_PATH">${t('PATH_NO_PATH')}</div>`;
    document.getElementById('statsRow').style.display = 'none';

    document.getElementById('playBtn').disabled = true;
    document.getElementById('playBtn').textContent = t('BTN_PLAY');
    document.getElementById('stepBtn').disabled = true;
    document.getElementById('resetBtn').disabled = true;

    setPathBadgeStatus('idle', t('PATH_WAIT'));
    updateStepCounterDisplay(0, 0);
    updateExplanationText('—');
}

/* ── Keyboard Bindings ── */
document.addEventListener('keydown', (event) => {
    // Ignore shortkeys if currently typing in inputs
    if (event.target.tagName === 'INPUT') return;

    if (event.key === 'Enter') {
        startSolving();
    }
    if (event.key === ' ') {
        event.preventDefault();
        togglePlayback();
    }
    if (event.key === 'ArrowRight') {
        advanceStepForward();
    }
});
