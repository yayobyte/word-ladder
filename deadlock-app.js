/* ══════════════════════════════════════════════════════════════════
 *  Deadlock Detection via BFS — Resource Allocation Graph (HOLT)
 *  Core Algorithm + D3.js Force-Directed Graph Visualization
 * ══════════════════════════════════════════════════════════════════ */

/* ── Preset Scenarios ──
 *  Each scenario defines:
 *    processes: array of process names
 *    resources: array of { name, instances }
 *    waits:     array of { process, resource } — process requests resource
 *    holds:     array of { process, resource } — process holds resource
 */
const PRESETS = {
    simple: {
        processes: ['P1', 'P2'],
        resources: [
            { name: 'R1', instances: 1 },
            { name: 'R2', instances: 1 }
        ],
        waits: [
            { process: 'P1', resource: 'R2' },
            { process: 'P2', resource: 'R1' }
        ],
        holds: [
            { process: 'P1', resource: 'R1' },
            { process: 'P2', resource: 'R2' }
        ]
    },
    safe: {
        processes: ['P1', 'P2', 'P3'],
        resources: [
            { name: 'R1', instances: 1 },
            { name: 'R2', instances: 1 },
            { name: 'R3', instances: 1 }
        ],
        waits: [
            { process: 'P1', resource: 'R2' }
        ],
        holds: [
            { process: 'P1', resource: 'R1' },
            { process: 'P2', resource: 'R2' },
            { process: 'P3', resource: 'R3' }
        ]
    },
    complex: {
        processes: ['P1', 'P2', 'P3', 'P4'],
        resources: [
            { name: 'R1', instances: 1 },
            { name: 'R2', instances: 1 },
            { name: 'R3', instances: 1 }
        ],
        waits: [
            { process: 'P1', resource: 'R2' },
            { process: 'P2', resource: 'R3' },
            { process: 'P3', resource: 'R1' },
            { process: 'P4', resource: 'R2' }
        ],
        holds: [
            { process: 'P1', resource: 'R1' },
            { process: 'P2', resource: 'R2' },
            { process: 'P3', resource: 'R3' }
        ]
    },
    gridlock: {
        processes: ['P1', 'P2', 'P3', 'P4', 'P5', 'P6', 'P7', 'P8'],
        resources: [
            { name: 'R1', instances: 1 }, { name: 'R2', instances: 1 },
            { name: 'R3', instances: 1 }, { name: 'R4', instances: 1 },
            { name: 'R5', instances: 1 }, { name: 'R6', instances: 1 },
            { name: 'R7', instances: 1 }
        ],
        waits: [
            { process: 'P1', resource: 'R1' },
            { process: 'P2', resource: 'R2' },
            { process: 'P3', resource: 'R3' },
            { process: 'P4', resource: 'R4' },
            { process: 'P5', resource: 'R5' },
            { process: 'P6', resource: 'R6' },
            { process: 'P7', resource: 'R1' },
            { process: 'P8', resource: 'R7' }
        ],
        holds: [
            { process: 'P2', resource: 'R1' },
            { process: 'P3', resource: 'R2' },
            { process: 'P4', resource: 'R3' },
            { process: 'P5', resource: 'R4' },
            { process: 'P6', resource: 'R5' },
            { process: 'P1', resource: 'R6' },
            { process: 'P7', resource: 'R7' }
        ]
    }
};

/* ── Current Graph State ── */
let currentGraph = null;
let activePreset = 'simple';

/* ── BFS Algorithm State ── */
let bfsSnapshots = [];
let currentVisualStep = 0;
let isPlaying = false;
let playIntervalTimer = null;
let bfsResult = null;
let calculationTimeMs = 0;

/* ── D3 Variables ── */
let svg, gWrapper, simulation, d3Tooltip;
let graphNodes = [];
let graphEdges = [];

/* ══════════════════════════════════════════════════════════════════
 *  BFS Cycle Detection on the Resource Allocation Graph
 *
 *  Strategy: Build the full directed graph (process→resource for waits,
 *  resource→process for holds), then BFS from each unvisited node to
 *  detect back-edges (cycles).
 * ══════════════════════════════════════════════════════════════════ */

function buildAdjacencyList(graph) {
    const adj = new Map();

    // Initialize all nodes
    graph.processes.forEach(p => adj.set(p, []));
    graph.resources.forEach(r => adj.set(r.name, []));

    // Process → Resource (waiting edges)
    graph.waits.forEach(({ process, resource }) => {
        if (adj.has(process)) {
            adj.get(process).push(resource);
        }
    });

    // Resource → Process (holding edges: resource is assigned to process)
    graph.holds.forEach(({ process, resource }) => {
        if (adj.has(resource)) {
            adj.get(resource).push(process);
        }
    });

    return adj;
}

/**
 * Run BFS-based cycle detection with snapshot recording.
 * Uses a "color" approach:
 *   WHITE = unvisited
 *   GRAY  = in current BFS frontier (in queue / being explored)
 *   BLACK = fully explored
 *
 * We record a snapshot at each step for the visualization.
 */
/**
 * Improved BFS cycle detection for directed graphs.
 * Since BFS is not natively best for directed cycle detection,
 * we use a BFS-based approach common in OS textbooks:
 * Repeatedly find nodes with no incoming edges (or no outgoing if looking for circular wait)
 * and "reduce" the graph. Nodes that cannot be reduced are part of a cycle.
 *
 * For visualization, we'll keep the "traversal" feel but use path-tracking
 * per starting node to ensure we detect a back-edge to an ancestor in the path.
 */
function isAncestor(parentMap, ancestor, descendant) {
    let curr = descendant;
    while (curr !== null) {
        if (curr === ancestor) return true;
        curr = parentMap.get(curr);
    }
    return false;
}

function runBFSCycleDetection(graph) {
    const adj = buildAdjacencyList(graph);
    const allNodes = [...graph.processes, ...graph.resources.map(r => r.name)];

    const snapshots = [];
    const color = new Map();
    const parent = new Map();

    allNodes.forEach(n => {
        color.set(n, 'WHITE');
        parent.set(n, null);
    });

    let cycleFound = false;
    let cyclePath = [];
    let totalVisited = 0;

    for (const startNode of allNodes) {
        if (color.get(startNode) !== 'WHITE' || cycleFound) continue;

        const queue = [startNode];
        color.set(startNode, 'GRAY');
        // Map to track the distance/path from the start node for THIS BFS tree
        const depth = new Map([[startNode, 0]]);

        while (queue.length > 0 && !cycleFound) {
            const current = queue.shift();
            totalVisited++;

            // Snapshot
            snapshots.push({
                current: current,
                queue: [...queue],
                colors: new Map(color),
                parent: new Map(parent),
                cycleFound: false,
                cyclePath: [],
                newNeighbors: [],
                step: snapshots.length + 1
            });

            const neighbors = adj.get(current) || [];
            for (const neighbor of neighbors) {
                if (cycleFound) break;

                if (color.get(neighbor) === 'WHITE') {
                    color.set(neighbor, 'GRAY');
                    parent.set(neighbor, current);
                    depth.set(neighbor, depth.get(current) + 1);
                    queue.push(neighbor);
                    snapshots[snapshots.length - 1].newNeighbors.push(neighbor);
                } else if (color.get(neighbor) === 'GRAY' || color.get(neighbor) === 'BLACK') {
                    // Check if it's an ancestor in the CURRENT BFS tree
                    if (isAncestor(parent, current, neighbor)) {
                        // This neighbor is a parent of current -> not a cycle in directed sense
                        // skip
                    } else if (isAncestor(parent, neighbor, current)) {
                        // Found a cycle (neighbor is an ancestor of current)
                        cycleFound = true;
                        cyclePath = reconstructCycle(parent, current, neighbor);
                        
                        snapshots.push({
                            current: current,
                            queue: [...queue],
                            colors: new Map(color),
                            parent: new Map(parent),
                            cycleFound: true,
                            cyclePath: [...cyclePath],
                            newNeighbors: [],
                            cycleTarget: neighbor,
                            step: snapshots.length + 1
                        });
                    }
                }
            }

            if (!cycleFound) {
                color.set(current, 'BLACK');
                snapshots[snapshots.length - 1].colors.set(current, 'BLACK');
            }
        }
    }

    if (!cycleFound) {
        snapshots.push({
            current: null,
            queue: [],
            colors: new Map(color),
            parent: new Map(parent),
            cycleFound: false,
            cyclePath: [],
            newNeighbors: [],
            step: snapshots.length + 1,
            completed: true
        });
    }

    return { snapshots, cycleFound, cyclePath, totalVisited };
}

/**
 * DFS-based cycle detection with snapshot recording.
 * Uses WHITE/GRAY/BLACK coloring to detect back-edges.
 */
function runDFSCycleDetection(graph) {
    const adj = buildAdjacencyList(graph);
    const allNodes = [...graph.processes, ...graph.resources.map(r => r.name)];

    const snapshots = [];
    const color = new Map();
    const parent = new Map();
    const stack = [];

    allNodes.forEach(n => {
        color.set(n, 'WHITE');
        parent.set(n, null);
    });

    let cycleFound = false;
    let cyclePath = [];
    let totalVisited = 0;

    function dfsVisit(u) {
        if (cycleFound) return;

        color.set(u, 'GRAY');
        stack.push(u);
        totalVisited++;

        // Snapshot upon entering
        snapshots.push({
            current: u,
            queue: [...stack], // Visualize stack instead of queue
            colors: new Map(color),
            parent: new Map(parent),
            cycleFound: false,
            cyclePath: [],
            newNeighbors: [],
            step: snapshots.length + 1
        });

        const neighbors = adj.get(u) || [];
        for (const v of neighbors) {
            if (cycleFound) break;

            if (color.get(v) === 'WHITE') {
                parent.set(v, u);
                snapshots[snapshots.length - 1].newNeighbors.push(v);
                dfsVisit(v);
            } else if (color.get(v) === 'GRAY') {
                cycleFound = true;
                cyclePath = reconstructCycle(parent, u, v);
                
                snapshots.push({
                    current: u,
                    queue: [...stack],
                    colors: new Map(color),
                    parent: new Map(parent),
                    cycleFound: true,
                    cyclePath: [...cyclePath],
                    newNeighbors: [],
                    cycleTarget: v,
                    step: snapshots.length + 1
                });
            }
        }

        if (!cycleFound) {
            color.set(u, 'BLACK');
            stack.pop();
            // Snapshot after exploring all neighbors (backing out)
            snapshots.push({
                current: u,
                queue: [...stack],
                colors: new Map(color),
                parent: new Map(parent),
                cycleFound: false,
                cyclePath: [],
                newNeighbors: [],
                step: snapshots.length + 1,
                leaving: true
            });
        }
    }

    for (const startNode of allNodes) {
        if (color.get(startNode) === 'WHITE' && !cycleFound) {
            dfsVisit(startNode);
        }
    }

    if (!cycleFound) {
        snapshots.push({
            current: null,
            queue: [],
            colors: new Map(color),
            parent: new Map(parent),
            cycleFound: false,
            cyclePath: [],
            newNeighbors: [],
            step: snapshots.length + 1,
            completed: true
        });
    }

    return { snapshots, cycleFound, cyclePath, totalVisited };
}

/**
 * Reconstruct cycle path from parent map.
 * When we detect neighbor is GRAY while processing current,
 * we trace back from current through parents until we reach neighbor.
 */
function reconstructCycle(parentMap, current, cycleTarget) {
    const path = [cycleTarget];
    let node = current;

    while (node !== null && node !== cycleTarget) {
        path.unshift(node);
        node = parentMap.get(node);
    }
    path.unshift(cycleTarget); // Close the cycle

    return path;
}


/* ══════════════════════════════════════════════════════════════════
 *  Preset Loading
 * ══════════════════════════════════════════════════════════════════ */
function loadPreset(name) {
    activePreset = name;
    currentGraph = JSON.parse(JSON.stringify(PRESETS[name]));

    // Update button styles
    document.querySelectorAll('.preset-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.querySelector(`[data-preset="${name}"]`);
    if (activeBtn) activeBtn.classList.add('active');

    resetVisualization();
    initGraph();
    renderGraph(null);
}

/* ══════════════════════════════════════════════════════════════════
 *  D3.js Force-Directed Graph Visualization
 * ══════════════════════════════════════════════════════════════════ */
function initGraph() {
    const container = document.getElementById('graphView');
    container.innerHTML = '';

    if (!d3Tooltip) {
        d3Tooltip = d3.select("body").append("div")
            .attr("class", "d3-tooltip")
            .style("opacity", 0);
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 450;

    svg = d3.select(container).append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", [0, 0, width, height]);

    // Arrowhead markers
    const defs = svg.append("defs");

    // Wait arrow (orange, dashed)
    defs.append("marker")
        .attr("id", "arrow-wait")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 28)
        .attr("refY", 5)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("class", "arrow-wait");

    // Hold arrow (green)
    defs.append("marker")
        .attr("id", "arrow-hold")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 28)
        .attr("refY", 5)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("class", "arrow-hold");

    // Cycle arrow (red)
    defs.append("marker")
        .attr("id", "arrow-cycle")
        .attr("viewBox", "0 0 10 10")
        .attr("refX", 28)
        .attr("refY", 5)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto-start-reverse")
        .append("path")
        .attr("d", "M 0 0 L 10 5 L 0 10 z")
        .attr("class", "arrow-cycle");

    gWrapper = svg.append("g");

    // Zoom
    const zoomBehavior = d3.zoom()
        .scaleExtent([0.3, 3])
        .on("zoom", (event) => {
            gWrapper.attr("transform", event.transform);
        });

    svg.call(zoomBehavior);
    svg.call(zoomBehavior.transform, d3.zoomIdentity.translate(width / 2, height / 2).scale(1));

    // Build node & edge data from currentGraph
    buildGraphData();

    // Create force simulation
    simulation = d3.forceSimulation(graphNodes)
        .force("link", d3.forceLink(graphEdges).id(d => d.id).distance(120))
        .force("charge", d3.forceManyBody().strength(-400))
        .force("center", d3.forceCenter(0, 0))
        .force("collision", d3.forceCollide().radius(35))
        .on("tick", ticked);
}

function buildGraphData() {
    graphNodes = [];
    graphEdges = [];

    if (!currentGraph) return;

    // Add process nodes
    currentGraph.processes.forEach(p => {
        graphNodes.push({ id: p, type: 'process', state: 'default' });
    });

    // Add resource nodes
    currentGraph.resources.forEach(r => {
        graphNodes.push({ id: r.name, type: 'resource', instances: r.instances, state: 'default' });
    });

    // Wait edges (process → resource)
    currentGraph.waits.forEach(({ process, resource }) => {
        graphEdges.push({ source: process, target: resource, type: 'wait' });
    });

    // Hold edges (resource → process)
    currentGraph.holds.forEach(({ process, resource }) => {
        graphEdges.push({ source: resource, target: process, type: 'hold' });
    });
}

function ticked() {
    // Update edges
    gWrapper.selectAll(".graph-edge")
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    // Update nodes
    gWrapper.selectAll(".graph-node")
        .attr("transform", d => `translate(${d.x},${d.y})`);
}

function renderGraph(snapshot) {
    if (!gWrapper) return;

    // Remove old elements
    gWrapper.selectAll(".graph-edge").remove();
    gWrapper.selectAll(".graph-node").remove();

    // Determine cycle edges for highlighting
    let cycleEdgeSet = new Set();
    if (snapshot && snapshot.cycleFound && snapshot.cyclePath.length > 0) {
        for (let i = 0; i < snapshot.cyclePath.length - 1; i++) {
            cycleEdgeSet.add(snapshot.cyclePath[i] + '->' + snapshot.cyclePath[i + 1]);
        }
    }

    // Draw edges
    const edges = gWrapper.selectAll(".graph-edge")
        .data(graphEdges)
        .enter().append("line")
        .attr("class", d => {
            const edgeId = (typeof d.source === 'object' ? d.source.id : d.source) + '->' +
                           (typeof d.target === 'object' ? d.target.id : d.target);
            if (cycleEdgeSet.has(edgeId)) return "graph-edge edge-cycle";
            return d.type === 'wait' ? "graph-edge edge-wait" : "graph-edge edge-hold";
        })
        .attr("marker-end", d => {
            const edgeId = (typeof d.source === 'object' ? d.source.id : d.source) + '->' +
                           (typeof d.target === 'object' ? d.target.id : d.target);
            if (cycleEdgeSet.has(edgeId)) return "url(#arrow-cycle)";
            return d.type === 'wait' ? "url(#arrow-wait)" : "url(#arrow-hold)";
        });

    // Apply snapshot state to nodes
    if (snapshot) {
        graphNodes.forEach(n => {
            const color = snapshot.colors.get(n.id);
            if (snapshot.cycleFound && snapshot.cyclePath.includes(n.id)) {
                n.state = 'cycle';
            } else if (n.id === snapshot.current) {
                n.state = 'visiting';
            } else if (color === 'BLACK') {
                n.state = 'visited';
            } else if (color === 'GRAY') {
                n.state = 'visiting-queue';
            } else {
                n.state = 'default';
            }
        });
    } else {
        graphNodes.forEach(n => n.state = 'default');
    }

    // Draw nodes
    const nodeGroups = gWrapper.selectAll(".graph-node")
        .data(graphNodes)
        .enter().append("g")
        .attr("class", d => {
            let cls = "graph-node ";
            if (d.type === 'process') cls += "graph-node-process";
            else cls += "graph-node-resource";

            // State classes
            if (d.state === 'cycle') cls += " graph-node-cycle";
            else if (d.state === 'visiting') cls += " graph-node-visiting";
            else if (d.state === 'visited') cls += " graph-node-visited";

            return cls;
        })
        .attr("transform", d => `translate(${d.x || 0},${d.y || 0})`)
        .call(d3.drag()
            .on("start", dragStarted)
            .on("drag", dragged)
            .on("end", dragEnded));

    // Process = circle
    nodeGroups.filter(d => d.type === 'process')
        .append("circle")
        .attr("r", 22);

    // Resource = rectangle
    nodeGroups.filter(d => d.type === 'resource')
        .append("rect")
        .attr("x", -22)
        .attr("y", -18)
        .attr("width", 44)
        .attr("height", 36)
        .attr("rx", 4)
        .attr("ry", 4);

    // Instance dots inside resources
    nodeGroups.filter(d => d.type === 'resource').each(function(d) {
        const inst = d.instances || 1;
        const spacing = 8;
        const startX = -(inst - 1) * spacing / 2;
        for (let i = 0; i < inst; i++) {
            d3.select(this).append("circle")
                .attr("class", "resource-dot")
                .attr("cx", startX + i * spacing)
                .attr("cy", 10)
                .attr("r", 2.5);
        }
    });

    // Labels
    nodeGroups.append("text")
        .attr("dy", d => d.type === 'resource' ? "-0.1em" : "0.35em")
        .text(d => d.id);

    // Tooltips
    nodeGroups.on("mouseover", (event, d) => {
        if (!d3Tooltip) return;
        const typeLabel = d.type === 'process' ? 'Proceso' : 'Recurso';
        const stateLabel = d.state === 'cycle' ? '🔴 En ciclo (deadlock)' :
                          d.state === 'visiting' ? '🟠 Exploración actual' :
                          d.state === 'visited' ? '🟣 Visitado' : '⚪ Sin explorar';
        d3Tooltip.transition().duration(200).style("opacity", 1);
        d3Tooltip.html(`<b>${d.id}</b>${typeLabel}<br/>${stateLabel}`)
            .style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 15) + "px");
    })
    .on("mousemove", (event) => {
        if (!d3Tooltip) return;
        d3Tooltip.style("left", (event.pageX + 15) + "px")
            .style("top", (event.pageY - 15) + "px");
    })
    .on("mouseout", () => {
        if (!d3Tooltip) return;
        d3Tooltip.transition().duration(200).style("opacity", 0);
    });

    // Restart simulation gently
    if (simulation) {
        simulation.alpha(0.1).restart();
    }
}

/* ── D3 Drag Handlers ── */
function dragStarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
}

function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
}

function dragEnded(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
}


/* ══════════════════════════════════════════════════════════════════
 *  UI Rendering: Queue & Visited Panels
 * ══════════════════════════════════════════════════════════════════ */

function renderQueuePanel(snapshot) {
    const container = document.getElementById('queueList');
    const countEl = document.getElementById('queueCount');
    countEl.textContent = snapshot.queue.length;

    if (!snapshot.queue.length && !snapshot.current) {
        container.innerHTML = `<div class="empty-msg" data-i18n="MSG_EMPTY">${t('MSG_EMPTY')}</div>`;
        return;
    }

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'nodes-wrap';

    // Show current node first
    if (snapshot.current) {
        const chip = createNodeChip(snapshot.current, 'chip-current');
        wrapper.appendChild(chip);
    }

    // Show queue
    snapshot.queue.forEach(nodeId => {
        const nodeData = graphNodes.find(n => n.id === nodeId);
        const typeClass = nodeData && nodeData.type === 'resource' ? 'chip-resource' : 'chip-process';
        const chip = createNodeChip(nodeId, typeClass);
        if (snapshot.newNeighbors.includes(nodeId)) {
            chip.style.boxShadow = '0 0 10px rgba(34,197,94,0.5)';
        }
        wrapper.appendChild(chip);
    });

    container.appendChild(wrapper);
}

function renderVisitedPanel(snapshot) {
    const container = document.getElementById('visitedList');
    let visitedCount = 0;

    for (const [, color] of snapshot.colors) {
        if (color === 'BLACK') visitedCount++;
    }

    document.getElementById('visitedCount').textContent = visitedCount;

    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'nodes-wrap';

    let hasVisited = false;
    for (const [nodeId, color] of snapshot.colors) {
        if (color === 'BLACK') {
            hasVisited = true;
            const nodeData = graphNodes.find(n => n.id === nodeId);
            const typeClass = nodeData && nodeData.type === 'resource' ? 'chip-resource' : 'chip-process';
            const isCycle = snapshot.cycleFound && snapshot.cyclePath.includes(nodeId);
            const chip = createNodeChip(nodeId, `${typeClass} chip-visited${isCycle ? ' chip-cycle' : ''}`);
            wrapper.appendChild(chip);
        }
    }

    if (!hasVisited) {
        container.innerHTML = `<div class="empty-msg" data-i18n="MSG_EMPTY">${t('MSG_EMPTY')}</div>`;
        return;
    }

    container.appendChild(wrapper);
}

function createNodeChip(nodeId, extraClass) {
    const chip = document.createElement('div');
    chip.className = `node-chip ${extraClass}`;
    chip.textContent = nodeId;
    return chip;
}

/* ── UI: Result Cycle Path ── */
function renderCyclePath(cyclePath) {
    const body = document.getElementById('resultBody');
    body.innerHTML = '';

    if (!cyclePath || cyclePath.length === 0) {
        body.innerHTML = `<div class="empty-msg">${t('NO_CYCLE_MSG')}</div>`;
        return;
    }

    const label = document.createElement('div');
    label.className = 'cycle-path-label';
    label.textContent = t('CYCLE_PATH_LABEL');
    body.appendChild(label);

    const wrapper = document.createElement('div');
    wrapper.className = 'cycle-path';

    cyclePath.forEach((nodeId, index) => {
        const nodeData = graphNodes.find(n => n.id === nodeId);
        const isProcess = nodeData && nodeData.type === 'process';

        const nodeEl = document.createElement('div');
        nodeEl.className = `cp-node ${isProcess ? 'cp-process' : 'cp-resource'} cp-cycle-node`;
        nodeEl.style.animationDelay = (index * 80) + 'ms';
        nodeEl.textContent = nodeId;
        wrapper.appendChild(nodeEl);

        if (index < cyclePath.length - 1) {
            const arrow = document.createElement('span');
            arrow.className = 'cp-arrow';
            arrow.textContent = '→';
            wrapper.appendChild(arrow);
        }
    });

    body.appendChild(wrapper);
}


/* ══════════════════════════════════════════════════════════════════
 *  Core Visualization Loop
 * ══════════════════════════════════════════════════════════════════ */

function applySnapshot(index) {
    const snapshot = bfsSnapshots[index];
    const algo = document.getElementById('algoSelect').value;
    updateStepCounter(index + 1, bfsSnapshots.length);

    // Update panel titles based on algorithm
    const queueTitleEl = document.querySelector('#queueList').closest('.viz-panel').querySelector('.viz-title');
    const activeKey = algo === 'bfs' ? 'TITLE_QUEUE_BFS' : 'TITLE_QUEUE_DFS';
    queueTitleEl.setAttribute('data-i18n', activeKey);
    queueTitleEl.textContent = t(activeKey);

    renderQueuePanel(snapshot);
    renderVisitedPanel(snapshot);
    renderGraph(snapshot);

    if (snapshot.current) {
        updateExplanation(t('EXP_ACTUAL', snapshot.current, snapshot.queue.length, countVisited(snapshot)));
    }

    if (snapshot.cycleFound) {
        setResultBadge('deadlock', t('RESULT_DEADLOCK'));
        renderCyclePath(snapshot.cyclePath);
        updateExplanation(t('EXP_CYCLE', snapshot.cyclePath.join(' → ')));

        document.getElementById('statsRow').style.display = 'flex';
        document.getElementById('sSteps').textContent = snapshot.step;
        document.getElementById('sVisited').textContent = countVisited(snapshot);
        document.getElementById('sCycleLen').textContent = snapshot.cyclePath.length - 1;
        document.getElementById('sTime').textContent = calculationTimeMs;

        stopPlayback();
        document.getElementById('stepBtn').disabled = true;
        document.getElementById('playBtn').disabled = true;
    } else if (snapshot.completed) {
        setResultBadge('safe', t('RESULT_SAFE'));
        renderCyclePath(null);

        document.getElementById('statsRow').style.display = 'flex';
        document.getElementById('sSteps').textContent = snapshot.step;
        document.getElementById('sVisited').textContent = countVisited(snapshot);
        document.getElementById('sCycleLen').textContent = '0';
        document.getElementById('sTime').textContent = calculationTimeMs;

        stopPlayback();
        document.getElementById('stepBtn').disabled = true;
        document.getElementById('playBtn').disabled = true;
    }
}

function countVisited(snapshot) {
    let count = 0;
    for (const c of snapshot.colors.values()) {
        if (c === 'BLACK' || c === 'GRAY') count++;
    }
    return count;
}


/* ══════════════════════════════════════════════════════════════════
 *  DOM Helper Functions
 * ══════════════════════════════════════════════════════════════════ */

function updateStepCounter(current, total) {
    document.getElementById('stepCtr').textContent = current + ' / ' + total;
}

function updateExplanation(text) {
    document.getElementById('explainTxt').textContent = text;
}

function setResultBadge(type, text) {
    const badge = document.getElementById('resultBadge');
    badge.className = 'result-badge badge-' + type;
    badge.textContent = text;
}

function getPlaybackSpeedMs() {
    const val = +document.getElementById('speedSlider').value;
    return Math.round(1000 - (val - 1) * 95);
}


/* ══════════════════════════════════════════════════════════════════
 *  Interactive Controls
 * ══════════════════════════════════════════════════════════════════ */

function startSolving() {
    if (!currentGraph) {
        loadPreset('simple');
    }

    const algo = document.getElementById('algoSelect').value;

    resetVisualization();
    setResultBadge('run', t('RESULT_CALC'));
    document.getElementById('solveBtn').disabled = true;

    setTimeout(() => {
        const t0 = performance.now();
        if (algo === 'bfs') {
            bfsResult = runBFSCycleDetection(currentGraph);
        } else {
            bfsResult = runDFSCycleDetection(currentGraph);
        }
        calculationTimeMs = (performance.now() - t0).toFixed(1);

        document.getElementById('solveBtn').disabled = false;

        bfsSnapshots = bfsResult.snapshots;
        currentVisualStep = 0;

        // Reinit graph
        document.getElementById('graphView').innerHTML = '';
        initGraph();

        updateStepCounter(0, bfsSnapshots.length);
        setResultBadge('run', t('MSG_READY', bfsSnapshots.length));

        document.getElementById('queueList').innerHTML =
            `<div class="empty-msg">${t('MSG_PRESS')}</div>`;

        document.getElementById('playBtn').disabled = false;
        document.getElementById('stepBtn').disabled = false;
        document.getElementById('resetBtn').disabled = false;

        updateExplanation(t('EXP_READY', bfsSnapshots.length));
    }, 30);
}

function advanceStep() {
    if (currentVisualStep >= bfsSnapshots.length) return;
    applySnapshot(currentVisualStep++);
}

function togglePlayback() {
    if (isPlaying) {
        stopPlayback();
    } else {
        startPlayback();
    }
}

function startPlayback() {
    if (currentVisualStep >= bfsSnapshots.length) return;
    isPlaying = true;
    document.getElementById('playBtn').textContent = t('BTN_PAUSE');
    processPlaybackTick();
}

function processPlaybackTick() {
    if (!isPlaying || currentVisualStep >= bfsSnapshots.length) {
        stopPlayback();
        return;
    }
    applySnapshot(currentVisualStep++);
    playIntervalTimer = setTimeout(processPlaybackTick, getPlaybackSpeedMs());
}

function stopPlayback() {
    isPlaying = false;
    clearTimeout(playIntervalTimer);
    document.getElementById('playBtn').textContent = t('BTN_PLAY');
}

function resetVisualization() {
    stopPlayback();
    bfsSnapshots = [];
    currentVisualStep = 0;
    bfsResult = null;

    ['queueList', 'visitedList'].forEach(id => {
        document.getElementById(id).innerHTML =
            `<div class="empty-msg" data-i18n="MSG_EMPTY">${t('MSG_EMPTY')}</div>`;
    });

    document.getElementById('queueCount').textContent = '0';
    document.getElementById('visitedCount').textContent = '0';

    document.getElementById('resultBody').innerHTML =
        `<div class="empty-msg" data-i18n="RESULT_NO_ANALYSIS">${t('RESULT_NO_ANALYSIS')}</div>`;
    document.getElementById('statsRow').style.display = 'none';

    document.getElementById('playBtn').disabled = true;
    document.getElementById('playBtn').textContent = t('BTN_PLAY');
    document.getElementById('stepBtn').disabled = true;
    document.getElementById('resetBtn').disabled = true;

    setResultBadge('idle', t('RESULT_WAIT'));
    updateStepCounter(0, 0);
    updateExplanation('—');

    // Reset graph node states
    if (graphNodes.length > 0) {
        graphNodes.forEach(n => n.state = 'default');
        renderGraph(null);
    }
}


/* ── Keyboard Bindings ── */
document.addEventListener('keydown', (event) => {
    if (event.target.tagName === 'INPUT') return;

    if (event.key === 'Enter') {
        startSolving();
    }
    if (event.key === ' ') {
        event.preventDefault();
        togglePlayback();
    }
    if (event.key === 'ArrowRight') {
        advanceStep();
    }
});


/* ── Initialize on Load ── */
window.addEventListener('DOMContentLoaded', () => {
    loadPreset('simple');
});
