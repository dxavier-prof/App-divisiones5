// data.js — contenido de los ejercicios y textos guía
// Los personajes reutilizan el estilo del libro de texto (Carmen y el loro / la iguana).

const CHARACTERS = {
  carmen: {
    name: "Carmen",
    avatar: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
        <circle cx='50' cy='50' r='48' fill='#FFDCC7'/>
        <path d='M12 46c0-22 17-38 38-38s38 16 38 38c0 4-10 2-12-4-4 10-46 10-52 0-2 6-12 8-12-4z' fill='#3B2A22'/>
        <circle cx='36' cy='56' r='4.5' fill='#2B2D5C'/>
        <circle cx='64' cy='56' r='4.5' fill='#2B2D5C'/>
        <path d='M40 72c4 5 16 5 20 0' stroke='#B23B4A' stroke-width='3' fill='none' stroke-linecap='round'/>
        <circle cx='27' cy='63' r='5' fill='#FF9E9E' opacity='.6'/>
        <circle cx='73' cy='63' r='5' fill='#FF9E9E' opacity='.6'/>
        <path d='M22 30c6-6 14-8 14-8' stroke='#B23B4A' stroke-width='4' fill='none' stroke-linecap='round'/>
      </svg>`),
  },
  loro: {
    name: "El loro guía",
    avatar: "data:image/svg+xml;utf8," + encodeURIComponent(`
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
        <ellipse cx='52' cy='56' rx='34' ry='36' fill='#2FB88A'/>
        <ellipse cx='40' cy='50' rx='20' ry='22' fill='#8FE3C0'/>
        <circle cx='38' cy='44' r='6' fill='#fff'/>
        <circle cx='39' cy='45' r='3' fill='#2B2D5C'/>
        <path d='M20 46c-10 2-16 8-16 8s10 6 18 2z' fill='#FFC857'/>
        <path d='M70 30c8-6 18-4 18-4s-2 10-10 14z' fill='#FF6B5B'/>
      </svg>`),
  },
};

// Cada ejercicio: dividendStr / divisorStr en formato "12.3"
// word: si es problema con contexto (usa "unit" y "context")
const EXERCISES = [
  { id: "a", dividendStr: "5.2",  divisorStr: "2.6", word: false },
  { id: "b", dividendStr: "7.2",  divisorStr: "2.4", word: false },
  { id: "c", dividendStr: "4.9",  divisorStr: "1.4", word: false },
  { id: "d", dividendStr: "5.44", divisorStr: "3.2", word: false },
  { id: "e", dividendStr: "7.68", divisorStr: "1.2", word: false },
  { id: "f", dividendStr: "23.68",divisorStr: "6.4", word: false },
  {
    id: "g",
    dividendStr: "21.45",
    divisorStr: "6.5",
    word: true,
    context: "En un supermercado se compraron $21.45 de carne. Si cada libra cuesta $6.5, ¿cuántas libras de carne se compraron?",
    unit: "libras",
    prefix: "$",
  },
];

const PHASE_LABELS = [
  "① Escribir",
  "② Mover el punto",
  "③ Dividir",
  "Resultado",
];
