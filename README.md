# Cuaderno de Divisiones — Decimales (Nivel 1)

Aplicación web interactiva para practicar el algoritmo de **división de un decimal entre un decimal, hasta las décimas**, siguiendo exactamente el procedimiento de la cuadrícula de valor posicional (Centena/Decena/Unidad · décima/centésima) que se usa en el libro de texto:

1. Escribir el dividendo y el divisor en la cuadrícula.
2. Mover el punto decimal una posición a la derecha en ambos.
3. Resolver la división resultante (número natural ÷ número natural, o decimal ÷ natural).

No requiere backend, base de datos ni compilación: es HTML + CSS + JavaScript puro, así que funciona directamente en **GitHub Pages**.

## Estructura

```
index.html   → estructura de la página
style.css    → estilos (cuaderno cuadriculado, colores por valor posicional)
data.js      → ejercicios (a–g) y textos de los personajes guía
math.js      → motor matemático: construye el modelo paso a paso de cada división
app.js       → lógica de la interfaz: navegación, validación, retroalimentación
```

## Ejercicios incluidos

a. 5.2 ÷ 2.6 b. 7.2 ÷ 2.4 c. 4.9 ÷ 1.4 d. 5.44 ÷ 3.2 e. 7.68 ÷ 1.2 f. 23.68 ÷ 6.4
g. Problema con contexto: $21.45 ÷ $6.5 (libras de carne)

Puedes agregar más ejercicios editando el arreglo `EXERCISES` en `data.js` — solo necesitas indicar `dividendStr` y `divisorStr` (por ejemplo `"12.6"`), el motor calcula automáticamente todos los pasos, incluida la colocación del punto y el caso en que haga falta "agregar un cero" al dividendo.

## Cómo publicarla en GitHub Pages

1. Crea un repositorio nuevo en GitHub (o usa uno existente) y sube estos 5 archivos a la raíz (o a una carpeta, por ejemplo `docs/`).
   ```bash
   git init
   git add .
   git commit -m "Cuaderno de divisiones con decimales"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/TU-REPO.git
   git push -u origin main
   ```
2. En GitHub, entra a **Settings → Pages**.
3. En "Build and deployment", elige **Deploy from a branch**, selecciona la rama `main` y la carpeta `/ (root)` (o `/docs` si subiste los archivos ahí).
4. Guarda. En unos minutos tu app estará disponible en:
   `https://TU-USUARIO.github.io/TU-REPO/`

No necesitas Node, ni `npm install`, ni ningún paso de compilación adicional.

## Notas pedagógicas / de diseño

- El progreso de cada estudiante (ejercicios completados) se guarda en el navegador (`localStorage`), por lo que es individual por dispositivo/navegador.
- La cuadrícula de colores sigue la misma codificación del libro: rosa = Centena, amarillo = Decena, azul = Unidad, lila = décima, verde = centésima.
- El botón **💡 Pista** da una pista contextual según el paso en el que esté el estudiante.
- El algoritmo (`math.js`) es genérico: funciona para cualquier par decimal ÷ decimal, no solo para los 7 ejercicios incluidos.
