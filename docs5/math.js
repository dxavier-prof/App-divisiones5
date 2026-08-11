// math.js — construye el modelo paso a paso del algoritmo:
// 1) escribir dividendo/divisor  2) mover el punto  3) dividir dígito a dígito

function decimalsCount(str) {
  const i = str.indexOf(".");
  return i === -1 ? 0 : str.length - i - 1;
}

function digitsOf(str) {
  const [ip, dp = ""] = str.split(".");
  return {
    intDigits: ip.split("").map(Number),
    decDigits: dp.length ? dp.split("").map(Number) : [],
  };
}

// Mueve el punto decimal "places" posiciones a la derecha. Rellena con ceros si faltan cifras.
function shiftRight(str, places) {
  if (places === 0) return str;
  let [ip, dp = ""] = str.split(".");
  while (dp.length < places) dp += "0";
  const moved = dp.slice(0, places);
  const restDec = dp.slice(places);
  let newInt = (ip + moved).replace(/^0+(?=\d)/, "");
  return restDec.length ? `${newInt}.${restDec}` : newInt;
}

// Etiquetas de valor posicional: C D U , d c  (Centena Decena Unidad , décima centésima)
function placeLabels(intLen, decLen) {
  const intLabels = ["U", "D", "C", "UM"]; // de derecha a izquierda
  const decLabels = ["d", "c", "m"]; // de izquierda a derecha (décima, centésima, milésima)
  const ints = [];
  for (let i = 0; i < intLen; i++) ints.unshift(intLabels[i] || `10^${i}`);
  const decs = [];
  for (let i = 0; i < decLen; i++) decs.push(decLabels[i] || `10^-${i + 1}`);
  return { ints, decs };
}

const LABEL_COLORS = {
  C: "#F7A8C4", UM: "#F7A8C4",
  D: "#FFE07D",
  U: "#8FCBF2",
  d: "#C7C1F2",
  c: "#A9E8C0",
  m: "#F5C9A0",
};

/**
 * Construye el modelo completo para dividendStr ÷ divisorStr
 */
function buildDivisionModel(dividendStr, divisorStr) {
  const shift = decimalsCount(divisorStr);
  const shiftedDividendStr = shiftRight(dividendStr, shift);
  const shiftedDivisorStr = shiftRight(divisorStr, shift);
  const divisor = parseInt(shiftedDivisorStr, 10);

  const { intDigits, decDigits } = digitsOf(shiftedDividendStr);
  const steps = runLongDivision(intDigits, decDigits, divisor);

  // cociente final como string, para mostrar el resultado
  let quotientStr = "";
  steps.forEach((s) => {
    if (s.type === "point") quotientStr += ".";
    if (s.type === "divide") quotientStr += String(s.quotientDigit);
  });
  quotientStr = quotientStr.replace(/^0+(?=\d)/, "");

  return {
    original: { dividendStr, divisorStr },
    shift,
    shifted: { dividendStr: shiftedDividendStr, divisorStr: shiftedDivisorStr, divisor },
    steps,
    quotientStr,
  };
}

function runLongDivision(intDigits, decDigits, divisor) {
  const all = intDigits.map((v) => ({ v, dec: false }))
    .concat(decDigits.map((v) => ({ v, dec: true })));
  const n = all.length;
  const intLen = intDigits.length;

  const steps = [];
  let idx = 0;
  let current = 0;
  let used = [];

  while (idx < n) {
    current = current * 10 + all[idx].v;
    used.push(all[idx]);
    idx++;
    if (current >= divisor || idx >= intLen) break;
  }
  let qd = Math.floor(current / divisor);
  let rem = current - qd * divisor;
  steps.push({ type: "divide", digitsUsed: used, partialDividend: current, quotientDigit: qd, product: qd * divisor, remainder: rem });

  let pointPlaced = false;

  for (; idx < n; idx++) {
    const atBoundary = idx === intLen && !pointPlaced && decDigits.length > 0;
    if (atBoundary) {
      steps.push({ type: "point" });
      pointPlaced = true;
    }
    const d = all[idx];
    current = rem * 10 + d.v;
    qd = Math.floor(current / divisor);
    rem = current - qd * divisor;
    steps.push({ type: "divide", digitsUsed: [d], partialDividend: current, quotientDigit: qd, product: qd * divisor, remainder: rem });
  }

  if (!pointPlaced && rem !== 0) {
    steps.push({ type: "point" });
    pointPlaced = true;
  }

  let guard = 0;
  while (rem !== 0 && guard < 6) {
    steps.push({ type: "addZero" });
    current = rem * 10 + 0;
    qd = Math.floor(current / divisor);
    rem = current - qd * divisor;
    steps.push({ type: "divide", digitsUsed: [{ v: 0, added: true }], partialDividend: current, quotientDigit: qd, product: qd * divisor, remainder: rem });
    guard++;
  }

  return steps;
}
