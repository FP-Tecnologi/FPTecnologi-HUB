// Mete el motor (fepi.js) dentro de animado.html. Correr despues de cambiar fepi.js: node armar.mjs
import { readFileSync, writeFileSync } from "node:fs";

const ruta = (f) => new URL(f, import.meta.url);
const motor = readFileSync(ruta("fepi.js"), "utf8");
const pagina = readFileSync(ruta("animado.html"), "utf8");
writeFileSync(ruta("animado.html"), pagina.replace(/<script id="motor">[\s\S]*?<\/script>/, () => `<script id="motor">\n${motor}</script>`));
