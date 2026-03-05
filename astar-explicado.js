/* ══════════════════════════════════════════
   ANNOTATED CODE BLOCK DATA
   Used to build the interactive code guide
══════════════════════════════════════════ */
const CODE_LINES = [
    { code: `<span class="kw">function</span> <span class="fn">astarRecord</span>(<span class="vr">start</span>, <span class="vr">goal</span>) {`, ann: null },
    {
        code: `  <span class="kw">const</span> <span class="vr">open</span> = <span class="kw">new</span> <span class="fn">Map</span>();  <span class="cm">// palabra → {g, f, h, camino}</span>`,
        ann: { title: '📂 Lista Abierta', text: 'Usamos un <code>Map</code> de JavaScript donde la clave es la palabra y el valor es un objeto con sus puntuaciones. Al inicio está vacía — la llenamos con la palabra inicial en la siguiente línea. La lista abierta representa la "frontera": palabras descubiertas pero aún no exploradas completamente.' }
    },
    {
        code: `  <span class="kw">const</span> <span class="vr">closed</span> = <span class="kw">new</span> <span class="fn">Map</span>(); <span class="cm">// palabras ya exploradas</span>`,
        ann: { title: '🔒 Lista Cerrada', text: 'Otro <code>Map</code> para las palabras que ya exploramos completamente. Una vez que una palabra está en <code>closed</code>, tenemos la garantía de que encontramos el camino más corto hacia ella. <strong>Jamás la revisamos de nuevo.</strong>' }
    },
    { code: ``, ann: null },
    {
        code: `  <span class="kw">const</span> <span class="vr">h0</span> = <span class="fn">hamming</span>(<span class="vr">start</span>, <span class="vr">goal</span>);`,
        ann: { title: '📐 Heurística inicial', text: 'Calculamos la distancia de Hamming entre la palabra inicial y la meta. Para <strong>GATO vs LOBO</strong>: G≠L, A≠O, T=T, O=B → <code>h=3</code> (3 letras distintas). Esta es nuestra estimación de cuánto trabajo queda.' }
    },
    {
        code: `  <span class="vr">open</span>.<span class="fn">set</span>(<span class="vr">start</span>, { <span class="prp">g</span>:<span class="nu">0</span>, <span class="prp">f</span>:<span class="vr">h0</span>, <span class="prp">h</span>:<span class="vr">h0</span>, <span class="prp">path</span>:[<span class="vr">start</span>] });`,
        ann: { title: '🚀 Inicialización', text: 'Insertamos la palabra inicial en la lista abierta. Sus valores son: <code>g=0</code> (no hemos dado ningún paso), <code>h=h0</code> (heurística inicial), <code>f=h0</code> (f=g+h=0+h0). El <code>path</code> guarda el camino recorrido hasta aquí — empezamos con solo la palabra inicial.' }
    },
    { code: ``, ann: null },
    {
        code: `  <span class="kw">while</span> (<span class="vr">open</span>.<span class="prp">size</span> > <span class="nu">0</span>) {   <span class="cm">// ← EL LOOP PRINCIPAL</span>`,
        ann: { title: '🔄 Loop principal', text: 'Seguimos iterando mientras queden nodos en la lista abierta. Si la lista se vacía sin haber encontrado la meta, significa que no existe ningún camino. Cada iteración de este loop = un nodo completamente procesado.' }
    },
    { code: ``, ann: null },
    { code: `    <span class="cm">// Buscar el nodo con menor f en la lista abierta</span>`, ann: null },
    {
        code: `    <span class="kw">let</span> <span class="vr">bestWord</span>=<span class="kw">null</span>, <span class="vr">bestData</span>=<span class="kw">null</span>;`,
        ann: { title: '🎯 Selección del mejor nodo', text: 'Aquí está el corazón de A*: siempre elegimos el nodo con el menor valor de <code>f</code>. Las siguientes líneas hacen un recorrido lineal por la lista abierta para encontrarlo. En implementaciones profesionales se usa un <em>heap binario</em> (cola de prioridad) para hacerlo en O(log n) en vez de O(n).' }
    },
    {
        code: `    <span class="kw">for</span> (<span class="kw">const</span> [<span class="vr">w</span>,<span class="vr">v</span>] <span class="kw">of</span> <span class="vr">open</span>) {`,
        ann: { title: '🔍 Iteración sobre la lista abierta', text: 'Recorremos cada entrada del Map. <code>w</code> es la palabra (clave) y <code>v</code> es su objeto de datos <code>{g, f, h, path}</code>. Buscamos cuál tiene el <code>f</code> más bajo.' }
    },
    {
        code: `      <span class="kw">if</span> (!<span class="vr">bestData</span> || <span class="vr">v</span>.<span class="prp">f</span> < <span class="vr">bestData</span>.<span class="prp">f</span>) {`,
        ann: { title: '⚖️ Comparación de f', text: 'Si aún no tenemos candidato (<code>!bestData</code>) o el actual tiene un f menor, lo seleccionamos como el mejor. En caso de empate en <code>f</code>, podríamos desempatar por <code>h</code> (preferir el nodo más cercano a la meta), aunque aquí simplificamos.' }
    },
    { code: `        <span class="vr">bestWord</span>=<span class="vr">w</span>; <span class="vr">bestData</span>=<span class="vr">v</span>;`, ann: null },
    { code: `      }`, ann: null },
    { code: `    }`, ann: null },
    { code: ``, ann: null },
    {
        code: `    <span class="vr">open</span>.<span class="fn">delete</span>(<span class="vr">bestWord</span>);`,
        ann: { title: '❌ Sacar de la lista abierta', text: 'Una vez seleccionado el mejor nodo, lo <em>sacamos</em> de la lista abierta. Ya no está "pendiente de explorar" — ahora lo vamos a procesar. Inmediatamente después lo metemos en la lista cerrada.' }
    },
    {
        code: `    <span class="vr">closed</span>.<span class="fn">set</span>(<span class="vr">bestWord</span>, <span class="vr">bestData</span>);`,
        ann: { title: '✅ Mover a lista cerrada', text: 'Lo marcamos como completamente explorado. Esto es la garantía de A*: si la heurística nunca sobreestima (es <em>admisible</em>), el primer camino que encontramos a un nodo es siempre el óptimo. La distancia de Hamming es admisible porque jamás puede estimar más pasos de los necesarios.' }
    },
    { code: ``, ann: null },
    {
        code: `    <span class="kw">if</span> (<span class="vr">bestWord</span> === <span class="vr">goal</span>) <span class="kw">return</span> { <span class="prp">path</span>:<span class="vr">bestData</span>.<span class="prp">path</span> }; <span class="cm">// 🎯 META</span>`,
        ann: { title: '🏆 ¿Llegamos a la meta?', text: 'Si el nodo que acabamos de procesar ES la palabra destino, ¡encontramos el camino óptimo! Lo retornamos inmediatamente. El <code>path</code> guardado en <code>bestData</code> contiene toda la secuencia desde el inicio hasta la meta.' }
    },
    { code: ``, ann: null },
    {
        code: `    <span class="kw">const</span> <span class="vr">nb</span> = <span class="fn">getNeighbors</span>(<span class="vr">bestWord</span>); <span class="cm">// palabras a 1 cambio</span>`,
        ann: { title: '👥 Obtener vecinos', text: 'Generamos todas las palabras que difieren en exactamente UNA letra y están en el diccionario. Por ejemplo, vecinos de GATO: BATO, CATO, DATO... GETO, GITO... GAAO, GABO... Para cada posición (4) probamos las 25 letras restantes = máx. 100 candidatos, pero solo los que estén en el diccionario son vecinos válidos.' }
    },
    {
        code: `    <span class="kw">for</span> (<span class="kw">const</span> <span class="vr">n</span> <span class="kw">of</span> <span class="vr">nb</span>) {`,
        ann: { title: '🔁 Procesar cada vecino', text: 'Para cada vecino válido evaluamos si vale la pena considerarlo. El loop puede tener 0 vecinos (palabra aislada) o varios. Típicamente una palabra tiene entre 5 y 20 vecinos en el diccionario.' }
    },
    {
        code: `      <span class="kw">if</span> (<span class="vr">closed</span>.<span class="fn">has</span>(<span class="vr">n</span>)) <span class="kw">continue</span>; <span class="cm">// ya explorado</span>`,
        ann: { title: '🚫 Saltar explorados', text: 'Si el vecino ya está en la lista cerrada, ya encontramos el camino óptimo hacia él en una iteración anterior. No tiene sentido revisarlo — <strong>saltamos directamente al siguiente vecino</strong>. Esta es una de las dos condiciones de poda de A*.' }
    },
    {
        code: `      <span class="kw">const</span> <span class="vr">ng</span> = <span class="vr">bestData</span>.<span class="prp">g</span> + <span class="nu">1</span>;   <span class="cm">// g del vecino</span>`,
        ann: { title: '📏 Calcular g del vecino', text: 'El costo de llegar al vecino es el costo del nodo actual más 1 (un paso adicional). En el Juego de Palabras todos los pasos tienen el mismo costo (1), así que g simplemente cuenta pasos. Si hubiera costos diferentes (como en mapas con terreno), aquí sumaríamos el costo real del movimiento.' }
    },
    {
        code: `      <span class="kw">const</span> <span class="vr">nh</span> = <span class="fn">hamming</span>(<span class="vr">n</span>, <span class="vr">goal</span>); <span class="cm">// h del vecino</span>`,
        ann: { title: '📐 Calcular h del vecino (heurística)', text: 'Contamos cuántas letras del vecino son distintas a la meta. Ejemplo: vecino=GALO, meta=LOBO → G≠L, A≠O, L=L, O=O → <code>h=2</code>. Esta heurística es <em>admisible</em> porque nunca sobreestima: si h=2, necesitamos al menos 2 pasos más para llegar.' }
    },
    {
        code: `      <span class="kw">const</span> <span class="vr">nf</span> = <span class="vr">ng</span> + <span class="vr">nh</span>;`,
        ann: { title: '⚡ f = g + h', text: 'La fórmula principal. <code>nf</code> es la prioridad total del vecino. Cuanto menor sea, más probable es que este vecino lleve al camino óptimo. A* usará este valor para decidir qué explorar primero en la siguiente iteración.' }
    },
    {
        code: `      <span class="kw">if</span> (!<span class="vr">open</span>.<span class="fn">has</span>(<span class="vr">n</span>) || <span class="vr">open</span>.<span class="fn">get</span>(<span class="vr">n</span>).<span class="prp">g</span> > <span class="vr">ng</span>) {`,
        ann: { title: '🔄 ¿Agregar o actualizar?', text: 'Dos casos para agregar el vecino a la lista abierta:<br><br><strong>1)</strong> <code>!open.has(n)</code>: el vecino es nuevo, nunca lo habíamos visto. Lo agregamos.<br><br><strong>2)</strong> <code>open.get(n).g > ng</code>: ya estaba en la lista abierta, pero ahora encontramos un camino más corto hacia él. Lo actualizamos con el nuevo camino mejor.' }
    },
    {
        code: `        <span class="vr">open</span>.<span class="fn">set</span>(<span class="vr">n</span>, { <span class="prp">g</span>:<span class="vr">ng</span>, <span class="prp">f</span>:<span class="vr">nf</span>, <span class="prp">h</span>:<span class="vr">nh</span>, <span class="prp">path</span>:[...<span class="vr">bestData</span>.<span class="prp">path</span>, <span class="vr">n</span>] });`,
        ann: { title: '➕ Insertar en lista abierta', text: 'Agregamos/actualizamos el vecino con: sus nuevas puntuaciones <code>g, f, h</code>, y el <strong>camino completo hasta aquí</strong> <code>[...bestData.path, n]</code> usando spread. Guardamos el camino completo en cada nodo para poder retornarlo al final sin necesidad de reconstruirlo.' }
    },
    { code: `      }`, ann: null },
    { code: `    }  <span class="cm">// fin for vecinos</span>`, ann: null },
    { code: `  }  <span class="cm">// fin while</span>`, ann: null },
    { code: ``, ann: null },
    {
        code: `  <span class="kw">return</span> { <span class="prp">failed</span>: <span class="kw">true</span> }; <span class="cm">// sin solución</span>`,
        ann: { title: '❌ Sin solución', text: 'Si el loop termina porque la lista abierta quedó vacía y nunca llegamos a la meta, significa que no existe ninguna secuencia de palabras válidas que conecte <code>start</code> con <code>goal</code>. El grafo de palabras está desconectado para ese par.' }
    },
    { code: `}`, ann: null },
];

/* ══════════════════════════════════════════
   STEP-BY-STEP SIMULATION DATA
══════════════════════════════════════════ */
const DEMO_STEPS = [
    {
        open: [{ w: 'GATO', g: 0, h: 3, f: 3 }],
        closed: [],
        explain: `<strong>Inicio.</strong> Insertamos <span class="cyan">GATO</span> en la lista abierta con <code>g=0</code> (ningún paso dado), <code>h=3</code> (GATO vs LOBO: G≠L, A≠O, T≠B → 3 letras distintas), <code>f=3</code>.`
    },
    {
        open: [
            { w: 'GALO', g: 1, h: 2, f: 3 },
            { w: 'GABO', g: 1, h: 3, f: 4 },
            { w: 'GATO', g: 1, h: 2, f: 3, skip: true },
        ],
        current: 'GATO',
        closed: ['GATO'],
        explain: `Sacamos <span class="orange">GATO</span> (f=3, el menor) de la lista abierta → pasa a cerrada. Exploramos sus vecinos válidos en el diccionario. <span class="cyan">GALO</span> tiene h=2 (G≠L, A≠O → 2 diferencias), f=1+2=3. Se agregan a la lista abierta ordenados por f.`
    },
    {
        open: [
            { w: 'GALO', g: 1, h: 2, f: 3 },
            { w: 'MALO', g: 2, h: 2, f: 4 },
            { w: 'LALO', g: 2, h: 2, f: 4 },
        ],
        current: 'GALO',
        closed: ['GATO', 'GALO'],
        explain: `Sacamos <span class="orange">GALO</span> (f=3, el de menor f). Sus vecinos: <span class="cyan">MALO</span> — M≠L, A≠O → h=2, g=2, f=4. Nos acercamos a la meta.`
    },
    {
        open: [
            { w: 'MALO', g: 2, h: 2, f: 4 },
            { w: 'LALO', g: 2, h: 2, f: 4 },
            { w: 'LOLO', g: 3, h: 1, f: 4 },
        ],
        current: 'MALO',
        closed: ['GATO', 'GALO', 'MALO'],
        explain: `Expandimos <span class="orange">MALO</span>. Sus vecinos incluyen <span class="cyan">LOLO</span>: LOLO vs LOBO → <strong>h=1</strong>. Solo una letra falta cambiar. f=3+1=4. ¡Muy cerca!`
    },
    {
        open: [
            { w: 'LOLO', g: 3, h: 1, f: 4 },
            { w: 'LALO', g: 2, h: 2, f: 4 },
            { w: 'LOBO', g: 4, h: 0, f: 4 },
        ],
        current: 'LOLO',
        closed: ['GATO', 'GALO', 'MALO', 'LOLO'],
        explain: `Expandimos <span class="orange">LOLO</span> (h=1, solo falta cambiar la L central por B). Descubrimos <span class="cyan">LOBO</span>: h=0, f=4. ¡La meta está en la lista abierta!`
    },
    {
        open: [
            { w: 'LOBO', g: 4, h: 0, f: 4, path: true },
        ],
        current: 'LOBO',
        closed: ['GATO', 'GALO', 'MALO', 'LOLO', 'LOBO'],
        explain: `Sacamos <span class="orange">LOBO</span> con f=4. Verificamos: <code>bestWord === goal</code> → ¡<span class="green">TRUE!</span> Retornamos el camino: <strong>GATO → GALO → MALO → LOLO → LOBO</strong>. Solo 4 pasos. Fin del algoritmo.`
    },
    {
        open: [],
        current: null,
        closed: ['GATO', 'GALO', 'MALO', 'LOLO', 'LOBO'],
        path: ['GATO', 'GALO', 'MALO', 'LOLO', 'LOBO'],
        explain: `<span class="green">🏆 ¡Camino óptimo encontrado!</span><br><br><strong>GATO → GALO → MALO → LOLO → LOBO</strong><br><br>A* exploró solo 5 nodos. La heurística h(n) fue clave para ir directamente en la dirección correcta.`
    }
];

/* ══════════════════════════════════════════
   UI LOGIC & RENDERING
══════════════════════════════════════════ */
let activeLineIdx = null;
let demoIdx = 0;

function buildCodeBlock() {
    const container = document.getElementById('codeBlock');
    if (!container) return;

    const pre = document.createElement('pre');
    CODE_LINES.forEach((item, i) => {
        const line = document.createElement('div');
        line.className = 'code-line';
        line.id = 'cl-' + i;

        if (item.ann) {
            line.style.cursor = 'pointer';
            line.onclick = () => toggleAnnotation(i);
        }

        const ln = document.createElement('div');
        ln.className = 'ln';
        ln.textContent = item.code.trim() ? String(i + 1) : '';

        const ct = document.createElement('div');
        ct.className = 'code-text';
        ct.innerHTML = item.code || '&nbsp;';

        line.appendChild(ln);
        line.appendChild(ct);
        pre.appendChild(line);

        if (item.ann) {
            const box = document.createElement('div');
            box.className = 'annotation-box';
            box.id = 'ann-' + i;
            box.innerHTML = `<div class="ann-title">${item.ann.title}</div><div>${item.ann.text}</div>`;
            pre.appendChild(box);
        }
    });
    container.appendChild(pre);
}

function toggleAnnotation(i) {
    const box = document.getElementById('ann-' + i);
    const line = document.getElementById('cl-' + i);
    if (!box) return;

    const isOpen = box.classList.contains('show');

    // Close all existing annotations
    document.querySelectorAll('.annotation-box.show').forEach(b => b.classList.remove('show'));
    document.querySelectorAll('.code-line.active').forEach(l => l.classList.remove('active'));

    if (!isOpen) {
        box.classList.add('show');
        line.classList.add('active');
        box.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function renderDemo() {
    const step = DEMO_STEPS[demoIdx];
    const openNodesWrap = document.getElementById('demoOpenNodes');
    const closedNodesWrap = document.getElementById('demoClosedNodes');

    if (!openNodesWrap || !closedNodesWrap) return;

    openNodesWrap.innerHTML = '';
    closedNodesWrap.innerHTML = '';

    if (step.open.length === 0) {
        openNodesWrap.innerHTML = '<span style="font-family:\'IBM Plex Mono\',monospace;font-size:0.65rem;color:var(--muted)">Vacía</span>';
    } else {
        step.open.forEach(n => {
            const chip = document.createElement('div');
            const isCur = n.w === step.current;
            const isPath = n.path;
            chip.className = 'nchip ' + (isCur ? 'n-current' : isPath ? 'n-path' : 'n-open');
            chip.textContent = n.w;

            const sc = document.createElement('div');
            sc.className = 'nscore';
            sc.textContent = 'f=' + n.f + ' g=' + n.g + ' h=' + n.h;

            chip.appendChild(sc);
            openNodesWrap.appendChild(chip);
        });
    }

    if (step.closed.length === 0) {
        closedNodesWrap.innerHTML = '<span style="font-family:\'IBM Plex Mono\',monospace;font-size:0.65rem;color:var(--muted)">Vacía</span>';
    } else {
        step.closed.forEach(w => {
            const chip = document.createElement('div');
            const onPath = step.path && step.path.includes(w);
            chip.className = 'nchip ' + (onPath ? 'n-path' : 'n-closed');
            chip.textContent = w;
            closedNodesWrap.appendChild(chip);
        });
    }

    document.getElementById('demoExplain').innerHTML = step.explain;
    document.getElementById('demoStepLbl').textContent = 'Paso ' + (demoIdx + 1) + ' / ' + DEMO_STEPS.length;
    document.getElementById('demoPrev').disabled = demoIdx === 0;
    document.getElementById('demoNext').disabled = demoIdx === DEMO_STEPS.length - 1;
}

function demoStep(dir) {
    demoIdx = Math.max(0, Math.min(DEMO_STEPS.length - 1, demoIdx + dir));
    renderDemo();
}

/* ── Initialization ── */
document.addEventListener('DOMContentLoaded', () => {
    buildCodeBlock();
    renderDemo();
});
