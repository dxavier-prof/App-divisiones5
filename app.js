// app.js — controla el flujo: navegación, renderizado de cada paso y validación

const STORAGE_KEY = "divisiones-decimales-progreso";

const state = {
  exIdx: 0,
  phase: 0, // 0 escribir, 1 mover punto, 2 dividir, 3 resultado
  model: null,
  phase0Done: false,
  phase1Done: false,
  phase1Moved: 0,
  phase2Done: false,
  phase2Ptr: 0,
  phase2Feedback: "",
  completed: new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")),
};

const el = (id) => document.getElementById(id);
const paperArea = () => el("paperArea");

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.completed]));
}

/* ============================================================
   INIT
============================================================ */
function initExercise(idx) {
  state.exIdx = idx;
  const ex = EXERCISES[idx];
  state.model = buildDivisionModel(ex.dividendStr, ex.divisorStr);
  state.phase = 0;
  state.phase0Done = false;
  state.phase1Done = false;
  state.phase1Moved = 0;
  state.phase2Done = false;
  state.phase2Ptr = 0;
  state.phase2Feedback = "";
  renderAll();
}

function renderAll() {
  renderSidebar();
  renderHeader();
  renderPhaseTabs();
  renderStage();
  renderFooter();
}

/* ============================================================
   SIDEBAR
============================================================ */
function renderSidebar() {
  const list = el("exerciseList");
  list.innerHTML = EXERCISES.map((ex, i) => {
    const label = ex.word ? `${ex.id}. Problema` : `${ex.id}. ${ex.dividendStr} ÷ ${ex.divisorStr}`;
    const done = state.completed.has(ex.id);
    const active = i === state.exIdx;
    return `<button class="exercise-item ${done ? "done" : ""} ${active ? "active" : ""}" data-idx="${i}">
      <span class="badge">${done ? "✓" : ex.id}</span>
      <span>${ex.word ? "Problema con contexto" : `${ex.dividendStr} ÷ ${ex.divisorStr}`}<small>${done ? "Completado" : "Sin resolver"}</small></span>
    </button>`;
  }).join("");
  list.querySelectorAll(".exercise-item").forEach((btn) => {
    btn.addEventListener("click", () => initExercise(Number(btn.dataset.idx)));
  });

  el("progressCount").textContent = `${state.completed.size}/${EXERCISES.length}`;
  el("progressFill").style.width = `${(state.completed.size / EXERCISES.length) * 100}%`;
}

el("resetProgressBtn").addEventListener("click", () => {
  if (confirm("¿Reiniciar todo el progreso guardado?")) {
    state.completed.clear();
    saveProgress();
    renderAll();
  }
});

/* ============================================================
   HEADER
============================================================ */
function renderHeader() {
  const ex = EXERCISES[state.exIdx];
  el("exerciseEyebrow").textContent = `Ejercicio ${ex.id}`;
  el("exerciseTitle").textContent = `${ex.dividendStr} ÷ ${ex.divisorStr}`;

  const banner = el("wordProblemBanner");
  if (ex.word) {
    banner.hidden = false;
    banner.textContent = ex.context;
  } else {
    banner.hidden = true;
  }
}

function renderPhaseTabs() {
  const doneFlags = [state.phase0Done, state.phase1Done, state.phase2Done, state.completed.has(EXERCISES[state.exIdx].id)];
  el("phaseTabs").innerHTML = PHASE_LABELS.map((label, i) => {
    const cls = i === state.phase ? "active" : doneFlags[i] ? "complete" : "";
    return `<span class="phase-tab ${cls}">${label}</span>`;
  }).join("");
}

/* ============================================================
   STAGE ROUTER
============================================================ */
function renderStage() {
  if (state.phase === 0) renderPhase0();
  else if (state.phase === 1) renderPhase1();
  else if (state.phase === 2) renderPhase2();
  else renderPhase3();
  setGuide("carmen", guideTextFor(state.phase));
}

function guideTextFor(phase) {
  const ex = EXERCISES[state.exIdx];
  if (phase === 0) return "Escribo el dividendo y el divisor en su casilla de valor posicional. Toca cada casilla y escribe la cifra correcta.";
  if (phase === 1) return "Ahora muevo el punto decimal una posición a la derecha, tanto en el dividendo como en el divisor.";
  if (phase === 2) return "¡A dividir! Sigo el mismo procedimiento que con números naturales. Cuando termine las unidades del dividendo, coloco el punto en el cociente.";
  return ex.word ? "¡Resuelto! Así respondo el problema con la unidad correcta." : "¡Perfecto! Esa es la respuesta.";
}

/* ============================================================
   PHASE 0 — Escribir dividendo y divisor
============================================================ */
function renderPhase0() {
  const { dividendStr, divisorStr } = state.model.original;
  const dv = digitsOf(dividendStr);
  const ds = digitsOf(divisorStr);

  paperArea().innerHTML = `
    <p class="step-instruction">① Escribe el <b>dividendo</b> y el <b>divisor</b> en las casillas de valor posicional. Usa el problema de arriba como guía.</p>
    <div class="pv-section">
      ${numberBlockHTML("Dividendo", dv, { editable: true, tag: "dividend" })}
      <div style="height:18px"></div>
      ${numberBlockHTML("Divisor", ds, { editable: true, tag: "divisor" })}
    </div>
    <p class="feedback-line" id="phase0Feedback"></p>
  `;
}

function numberBlockHTML(title, { intDigits, decDigits }, opts) {
  const { ints, decs } = placeLabels(intDigits.length, decDigits.length);
  const headerCells = [
    ...ints.map((l) => headCell(l)),
    decDigits.length ? `<span class="pv-dot"></span>` : "",
    ...decs.map((l) => headCell(l)),
  ].join("");

  const rowCells = [
    ...intDigits.map((d, i) => cellHTML(d, opts, `${opts.tag}-int-${i}`)),
    decDigits.length ? `<span class="pv-dot">.</span>` : "",
    ...decDigits.map((d, i) => cellHTML(d, opts, `${opts.tag}-dec-${i}`)),
  ].join("");

  return `<div class="numgrid-wrap">
    <span style="font-size:12px;font-weight:800;color:var(--ink-soft);text-transform:uppercase;letter-spacing:.05em">${title}</span>
    <div class="numgrid-header">${headerCells}</div>
    <div class="numgrid-row">${rowCells}</div>
  </div>`;
}

function headCell(label) {
  const bg = LABEL_COLORS[label] || "#E4E1F7";
  return `<span class="pv-head" style="background:${bg}">${label}</span>`;
}

function cellHTML(expectedDigit, opts, id) {
  if (!opts.editable) {
    return `<span class="pv-cell">${expectedDigit}</span>`;
  }
  return `<span class="pv-cell input" data-expect="${expectedDigit}" data-id="${id}">
    <input type="text" inputmode="numeric" maxlength="1" autocomplete="off" data-id="${id}" />
  </span>`;
}

function checkPhase0() {
  const cells = paperArea().querySelectorAll(".pv-cell.input");
  let allCorrect = true;
  cells.forEach((cell) => {
    const input = cell.querySelector("input");
    const val = (input.value || "").trim();
    const expected = cell.dataset.expect;
    cell.classList.remove("correct", "incorrect");
    if (val === expected) {
      cell.classList.add("correct");
    } else {
      cell.classList.add("incorrect");
      allCorrect = false;
    }
  });
  const fb = el("phase0Feedback");
  if (allCorrect) {
    fb.textContent = "¡Todas las cifras están en su lugar! ✅";
    fb.className = "feedback-line ok";
    state.phase0Done = true;
  } else {
    fb.textContent = "Revisa las casillas en rojo: ¿está cada cifra en la columna correcta?";
    fb.className = "feedback-line error";
    state.phase0Done = false;
  }
  renderFooter();
  renderPhaseTabs();
}

/* ============================================================
   PHASE 1 — Mover el punto decimal
============================================================ */
function renderPhase1() {
  const { dividendStr, divisorStr } = state.model.original;
  const shift = state.model.shift;
  const moved = state.phase1Moved;

  const curDividend = shiftRight(dividendStr, moved);
  const curDivisor = shiftRight(divisorStr, moved);
  const dv = digitsOf(curDividend);
  const ds = digitsOf(curDivisor);

  const doneAll = moved >= shift;

  paperArea().innerHTML = `
    <p class="step-instruction">② Mueve el punto decimal <b>${shift} posición${shift > 1 ? "es" : ""} a la derecha</b> en el dividendo y el divisor.</p>
    <div class="pv-section">
      ${numberBlockHTML("Dividendo", dv, { editable: false })}
      <div style="height:14px"></div>
      ${numberBlockHTML("Divisor", ds, { editable: false })}
    </div>
    <div style="margin-top:18px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
      <button class="small-action-btn" id="movePointBtn" ${doneAll ? "disabled" : ""}>
        ⇥ Mover el punto una posición a la derecha
      </button>
      <span style="font-size:13px;color:var(--ink-soft)">${moved}/${shift} movimientos</span>
    </div>
    <p class="feedback-line ${doneAll ? "ok" : ""}" id="phase1Feedback">
      ${doneAll ? "¡Listo! Ahora la división se resuelve como entre números naturales (o decimal entre natural)." : ""}
    </p>
    <div class="word-problem-banner" style="margin-top:18px;background:#EAF5FD;border-color:#CFE8FA">
      💡 Si al mover el punto no quedan suficientes cifras, se agrega un cero al dividendo. En este ejercicio, revisa si hace falta.
    </div>
  `;

  el("movePointBtn").addEventListener("click", () => {
    if (state.phase1Moved < shift) {
      state.phase1Moved++;
      if (state.phase1Moved >= shift) state.phase1Done = true;
      renderPhase1();
      renderFooter();
      renderPhaseTabs();
    }
  });
}

/* ============================================================
   PHASE 2 — Dividir
============================================================ */
function renderPhase2() {
  const { steps } = state.model;
  const ptr = state.phase2Ptr;
  const shifted = state.model.shifted;

  // Digits row of the (already shifted) dividend, for visual reference
  const dv = digitsOf(shifted.dividendStr);
  const allDigitObjs = [
    ...dv.intDigits.map((v) => ({ v, dec: false })),
    ...dv.decDigits.map((v) => ({ v, dec: true })),
  ];

  // how many raw dividend digits have been consumed so far (ignoring added zeros)
  let consumed = 0;
  for (let i = 0; i < ptr; i++) {
    const s = steps[i];
    if (s.type === "divide" && !(s.digitsUsed[0] && s.digitsUsed[0].added)) {
      consumed += s.digitsUsed.length;
    }
  }

  // insert decimal point marker after int digits if needed
  let dividendRowMarked = [];
  allDigitObjs.forEach((d, i) => {
    if (i === dv.intDigits.length && dv.decDigits.length > 0) {
      dividendRowMarked.push(`<span class="ld-point">.</span>`);
    }
    const cls = i < consumed ? "used" : i === consumed ? "active" : "";
    dividendRowMarked.push(`<span class="ld-cell ${cls}">${d.v}</span>`);
  });

  // history of resolved steps (operation cards) + quotient strip
  let historyHTML = "";
  let quotientCells = [];
  for (let i = 0; i < ptr; i++) {
    const s = steps[i];
    if (s.type === "point") {
      quotientCells.push(`<span class="q-cell point">.</span>`);
    } else if (s.type === "addZero") {
      historyHTML += `<div class="ld-line" style="color:var(--green)">+ se agrega un 0 al dividendo</div>`;
    } else if (s.type === "divide") {
      const usedStr = s.digitsUsed.map((d) => d.v).join("");
      historyHTML += `
        <div class="ld-line"><span class="op"></span><span class="val">${s.partialDividend}</span></div>
        <div class="ld-line subtract"><span class="op">−</span><span class="val">${s.product}</span></div>
        <div class="ld-line remainder"><span class="op"></span><span class="val">${s.remainder}</span></div>
      `;
      quotientCells.push(`<span class="q-cell">${s.quotientDigit}</span>`);
    }
  }

  const currentStep = steps[ptr];
  let interactiveHTML = "";
  if (!currentStep) {
    interactiveHTML = `<p class="feedback-line ok">✅ ¡División completa!</p>`;
    state.phase2Done = true;
  } else if (currentStep.type === "point") {
    interactiveHTML = `
      <p class="step-instruction" style="font-size:15px;margin-bottom:10px">Ya se usaron todas las cifras enteras del dividendo. Coloca el punto decimal en el cociente antes de seguir.</p>
      <button class="small-action-btn point-btn" id="placePointBtn">• Colocar el punto en el cociente</button>
    `;
  } else if (currentStep.type === "addZero") {
    interactiveHTML = `
      <p class="step-instruction" style="font-size:15px;margin-bottom:10px">El residuo no es cero y no quedan más cifras. Agrega un cero al dividendo para continuar.</p>
      <button class="small-action-btn zero-btn" id="addZeroBtn">0 Agregar un cero</button>
    `;
  } else if (currentStep.type === "divide") {
    const usedStr = currentStep.digitsUsed.map((d) => d.v).join("");
    interactiveHTML = `
      <p class="step-instruction" style="font-size:15px;margin-bottom:6px">
        ¿Cuántas veces cabe <b>${shifted.divisor}</b> en <b>${currentStep.partialDividend}</b>?
      </p>
      <div class="digit-input-row">
        <input type="text" inputmode="numeric" maxlength="2" id="quotientDigitInput" />
        <button class="small-action-btn" id="checkDigitBtn">Comprobar cifra</button>
      </div>
      <p class="feedback-line" id="phase2Feedback"></p>
    `;
  }

  paperArea().innerHTML = `
    <p class="step-instruction">③ Divide como con números naturales. Coloca el punto en el cociente en el momento correcto.</p>
    <div class="longdiv">
      <div class="ld-left">
        <div class="ld-dividend-row">${dividendRowMarked.join("")}</div>
        <div class="ld-work">${historyHTML}</div>
        <div style="margin-top:10px">${interactiveHTML}</div>
      </div>
      <div class="ld-right">
        <h4>Divisor</h4>
        <p style="font-family:var(--font-mono);font-weight:800;font-size:20px;margin:0 0 16px">${shifted.divisor}</p>
        <h4>Cociente</h4>
        <div class="quotient-strip">${quotientCells.join("") || '<span class="q-cell pending">?</span>'}</div>
      </div>
    </div>
  `;

  if (currentStep && currentStep.type === "point") {
    el("placePointBtn").addEventListener("click", () => {
      state.phase2Ptr++;
      renderPhase2();
      renderFooter();
      renderPhaseTabs();
    });
  } else if (currentStep && currentStep.type === "addZero") {
    el("addZeroBtn").addEventListener("click", () => {
      state.phase2Ptr++;
      renderPhase2();
      renderFooter();
      renderPhaseTabs();
    });
  } else if (currentStep && currentStep.type === "divide") {
    const input = el("quotientDigitInput");
    const btn = el("checkDigitBtn");
    const submit = () => {
      const val = Number((input.value || "").trim());
      const fb = el("phase2Feedback");
      if (val === currentStep.quotientDigit) {
        fb.textContent = `¡Correcto! ${shifted.divisor} × ${val} = ${currentStep.product}. Residuo: ${currentStep.remainder}.`;
        fb.className = "feedback-line ok";
        state.phase2Ptr++;
        setTimeout(() => {
          renderPhase2();
          renderFooter();
          renderPhaseTabs();
        }, 550);
      } else if (val > currentStep.quotientDigit) {
        fb.textContent = "Muy alto: el producto se pasaría del dividendo. Intenta con una cifra menor.";
        fb.className = "feedback-line error";
      } else {
        fb.textContent = "Puedes subir un poco más esa cifra. Inténtalo de nuevo.";
        fb.className = "feedback-line error";
      }
    };
    btn.addEventListener("click", submit);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); });
  }

  if (!currentStep) {
    renderFooter();
    renderPhaseTabs();
  }
}

/* ============================================================
   PHASE 3 — Resultado
============================================================ */
function renderPhase3() {
  const ex = EXERCISES[state.exIdx];
  const { original, quotientStr } = state.model;
  state.completed.add(ex.id);
  saveProgress();
  renderSidebar();

  const answerLine = ex.word
    ? `Se compraron <b>${quotientStr} ${ex.unit}</b> de carne.`
    : "";

  paperArea().innerHTML = `
    <div class="result-card">
      <p class="result-equation">${original.dividendStr} <span class="op-eq">÷</span> ${original.divisorStr} <span class="op-eq">=</span> ${quotientStr}</p>
      <p class="result-sub">${ex.word ? answerLine : "R: " + original.dividendStr + " ÷ " + original.divisorStr + " = " + quotientStr}</p>
    </div>
  `;
}

/* ============================================================
   FOOTER / NAVIGATION
============================================================ */
function renderFooter() {
  const backBtn = el("backBtn");
  const nextBtn = el("nextBtn");
  backBtn.disabled = state.phase === 0;

  if (state.phase === 0) {
    nextBtn.textContent = state.phase0Done ? "Siguiente paso →" : "Verificar";
  } else if (state.phase === 1) {
    nextBtn.textContent = state.phase1Done ? "Siguiente paso →" : "Mueve el punto para continuar";
    nextBtn.disabled = !state.phase1Done;
  } else if (state.phase === 2) {
    nextBtn.textContent = state.phase2Done ? "Ver resultado →" : "Resolviendo…";
    nextBtn.disabled = !state.phase2Done;
  } else {
    const isLast = state.exIdx === EXERCISES.length - 1;
    nextBtn.textContent = isLast ? "¡Terminado! 🎉" : "Siguiente ejercicio →";
    nextBtn.disabled = false;
  }
  if (state.phase !== 1 && state.phase !== 2) nextBtn.disabled = false;
}

el("backBtn").addEventListener("click", () => {
  if (state.phase > 0) {
    state.phase--;
    renderStage();
    renderPhaseTabs();
    renderFooter();
  }
});

el("nextBtn").addEventListener("click", () => {
  if (state.phase === 0 && !state.phase0Done) {
    checkPhase0();
    return;
  }
  if (state.phase === 3) {
    const isLast = state.exIdx === EXERCISES.length - 1;
    if (!isLast) initExercise(state.exIdx + 1);
    return;
  }
  if (state.phase < 3) {
    state.phase++;
    renderStage();
    renderPhaseTabs();
    renderFooter();
  }
});

el("hintBtn").addEventListener("click", () => {
  const hints = {
    0: "Cuenta las cifras del número: la última antes del punto es la Unidad (U); la de su izquierda, la Decena (D); después del punto, la primera es la décima (d).",
    1: "El punto siempre se mueve la misma cantidad de posiciones en el dividendo y en el divisor: tantas como decimales tenga el divisor.",
    2: "Divide igual que con números naturales. En el momento en que termines de usar las cifras enteras del dividendo, coloca el punto en el cociente.",
    3: "Revisa que el resultado tenga sentido: compáralo con una división aproximada (redondeando los números).",
  };
  setGuide("loro", hints[state.phase]);
});

/* ============================================================
   GUIDE (character speech bubble)
============================================================ */
function setGuide(charKey, text) {
  const c = CHARACTERS[charKey];
  el("guideAvatar").src = c.avatar;
  el("guideAvatar").alt = c.name;
  el("guideBubble").textContent = text;
}

/* ============================================================
   BOOT
============================================================ */
initExercise(0);
