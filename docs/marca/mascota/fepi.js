// Motor de Fepi, la mascota de FPTecnologi. Sin dependencias: es la unica fuente del dibujo animado.
// Uso: cargar este archivo y poner <fepi-mascota estado="saludo" version="completo" tamano="260" juego></fepi-mascota>
// Desde codigo: Fepi.montar(el, opciones) o Fepi.pose(version, estado) para un SVG fijo.
(() => {
  const TINTA = "#0a2038", AZUL = "#19477f", CELESTE = "#7ee7f7", TURQUESA = "#2fa9c4", ROSA = "#ff8fa0";

  // Trazos del logo (rombos laterales = ropa; centro = cuerpo)
  const ROMBO_IZQ = "M170.96,358.39c-5.51,0-10.69-2.25-14.58-6.34h0L6.05,194.38c-3.89-4.08-6.05-9.52-6.05-15.29s2.15-11.21,6.05-15.29L156.38,6.13c7.79-8.17,21.38-8.17,29.16,0l150.34,157.67c3.89,4.08,6.05,9.52,6.05,15.29s-2.15,11.21-6.05,15.29l-150.34,157.67c-3.89,4.08-9.07,6.34-14.58,6.34ZM170.96,5.56c-4.04,0-7.83,1.65-10.69,4.65L9.94,167.88c-2.86,3-4.43,6.97-4.43,11.21s1.58,8.21,4.43,11.21l150.34,157.67c5.71,5.99,15.66,5.99,21.38,0l150.34-157.67c2.86-3,4.43-6.97,4.43-11.21s-1.58-8.21-4.43-11.21L181.65,10.21c-2.86-3-6.65-4.65-10.69-4.65Z";
  const ROMBO_DER = "M252.65,359.65c-5.28,0-10.56-2.1-14.58-6.32L87.74,195.66c-3.89-4.08-6.04-9.52-6.04-15.29s2.15-11.21,6.04-15.29L238.07,7.4c8.06-8.44,21.13-8.43,29.17,0l150.34,157.67c3.89,4.08,6.04,9.52,6.04,15.29s-2.15,11.21-6.04,15.29l-150.34,157.67c-4.02,4.22-9.31,6.32-14.59,6.32ZM252.66,6.84c-4.04,0-7.84,1.65-10.69,4.65L91.63,169.16c-2.86,3-4.43,6.97-4.43,11.21s1.57,8.21,4.43,11.21l150.34,157.67c5.71,5.98,15.66,5.99,21.38,0l150.34-157.67c5.9-6.18,5.9-16.24,0-22.42L263.35,11.49c-2.86-3-6.65-4.65-10.69-4.65Z";
  const ARO_ABAJO = "M200.99,6.99L47.84,167.61c-6.2,6.5-6.2,17.05,0,23.55l153.15,160.62c6.2,6.5,16.25,6.5,22.45,0l153.15-160.62c6.2-6.5,6.2-17.05,0-23.55L223.44,6.99c-6.2-6.5-16.25-6.5-22.45,0ZM92.74,167.61l108.25-113.53c6.2-6.5,16.25-6.5,22.45,0l108.25,113.53c6.2,6.5,6.2,17.05,0,23.55l-111.45,116.89c-4.43,4.65-11.61,4.65-16.04,0l-111.45-116.89c-6.2-6.5-6.2-17.05,0-23.55Z";
  const ARO_ARRIBA = "M376.59,167.61L223.44,6.99c-6.2-6.5-16.25-6.5-22.45,0L47.84,167.61c-6.2,6.5-6.2,17.05,0,23.55l11.23,11.77L204.19,50.72c4.43-4.65,11.61-4.65,16.04,0l145.13,152.21,11.23-11.77c6.2-6.5,6.2-17.05,0-23.55Z";
  const HUECO = "M92.74,167.61l108.25-113.53c6.2-6.5,16.25-6.5,22.45,0l108.25,113.53c6.2,6.5,6.2,17.05,0,23.55l-111.45,116.89c-4.43,4.65-11.61,4.65-16.04,0l-111.45-116.89c-6.2-6.5-6.2-17.05,0-23.55Z";

  const VERSIONES = { base: "Sin brazos", completo: "Con brazos y pies" };
  const LIENZO = { base: [-45, -80, 515, 495], completo: [-140, -90, 704, 590] };

  // Manos: [x, y, giro, forma]. Las de reposo cuelgan a los lados.
  const REPOSO_I = [-48, 264, 195, "abierta"], REPOSO_D = [472, 264, 165, "abierta"];
  // boca: [ancho medio, curva superior, curva inferior, y]. Superior = inferior dibuja una linea.
  const SONRISA = [30, 10, 48, 210], LINEA = [25, 22, 22, 212], PEQUE = [17, 6, 28, 212], O = [13, -18, 36, 217],
    PUCHERO = [22, -20, -20, 232], RECTA = [20, 0, 0, 224], GRANDE = [35, 10, 58, 206];
  // cejas: [alto izq, giro izq, alto der, giro der]. Giro positivo baja la punta interior.
  const base = { ojos: ["normal", "normal"], boca: SONRISA, cejas: [0, 0, 0, 0], manoI: REPOSO_I, manoD: REPOSO_D, mira: [0, 0], giro: 0, caida: 0, pomulo: 1, rapidez: 1 };
  const E = (nombre, cat, d, extra) => ({ ...base, nombre, cat, d, ...extra });

  const ESTADOS = {
    reposo: E("Reposo", "Base", "Respira, parpadea, mira alrededor y mueve las cejas.", { vivo: 1 }),
    saludo: E("Saludo", "Base", "Saluda con la mano.", { ojos: ["feliz", "feliz"], cejas: [-6, -4, -6, -4], manoD: [482, 92, 12, "abierta"], onda: { D: [14, 0, 9, 14] }, giro: -3 }),
    senalando: E("Señalando", "Base", "Señala hacia un lado.", { manoD: [498, 168, 90, "punta"], mira: [8, 0], cejas: [-3, 0, -8, -6], onda: { D: [6, 0, 5, 0] }, giro: 2 }),
    hablando: E("Hablando", "Base", "La boca se abre con la voz y gesticula.", { habla: 1, manoD: [478, 150, 40, "abierta"], onda: { D: [6, 9, 4.5, 6] }, cejas: [-3, 0, -3, 0] }),
    feliz: E("Feliz", "Ánimo", "Saltitos con las manos arriba.", { ojos: ["feliz", "feliz"], boca: GRANDE, cejas: [-9, -6, -9, -6], manoI: [-55, 82, 348, "abierta"], manoD: [480, 82, 12, "abierta"], onda: { I: [8, 5, 9, 10], D: [8, 5, 9, 10] }, salto: { cada: 1.2, v: 290 }, pomulo: 1.6 }),
    guino: E("Guiño", "Ánimo", "Guiña un ojo con la cabeza ladeada.", { ojos: ["normal", "feliz"], boca: GRANDE, cejas: [-8, -6, 4, 4], manoD: [478, 118, 14, "pulgar"], giro: 7, brinco: 180 }),
    ojosCerrados: E("Ojos cerrados", "Ánimo", "Disfruta con los ojos cerrados y una sonrisa.", { ojos: ["cerrado", "cerrado"], boca: LINEA, cejas: [-7, -8, -7, -8], manoI: [-30, 290, 200, "abierta"], manoD: [454, 290, 160, "abierta"], balanceo: [4, 2], pomulo: 1.5 }),
    amor: E("Amor", "Ánimo", "Ojos de corazón que laten.", { ojos: ["corazon", "corazon"], boca: GRANDE, cejas: [-10, -10, -10, -10], manoI: [170, 288, 70, "abierta"], manoD: [254, 288, 290, "abierta"], frente: "ID", fx: "corazones", salto: { cada: 1.7, v: 180 }, pomulo: 1.9 }),
    sorpresa: E("Sorpresa", "Ánimo", "Ojos grandes, boca en O y un brinco.", { ojos: ["grande", "grande"], boca: O, cejas: [-18, -8, -18, -8], manoI: [-72, 150, 305, "abierta"], manoD: [496, 150, 55, "abierta"], fx: "exclamacion", brinco: 380, giro: -4 }),
    triste: E("Triste", "Ánimo", "Cejas caídas y una lágrima.", { ojos: ["triste", "triste"], boca: PUCHERO, cejas: [4, -22, 4, -22], manoI: [-18, 300, 188, "abierta"], manoD: [442, 300, 172, "abierta"], mira: [0, 6], caida: 14, fx: "lagrima", pomulo: 0.5, rapidez: 0.55 }),
    mareado: E("Mareado", "Ánimo", "Espirales en los ojos y estrellas.", { ojos: ["espiral", "espiral"], boca: [18, -6, 16, 222], cejas: [-6, -14, 4, 14], balanceo: [11, 6], onda: { I: [12, 12, 7, 20], D: [12, -12, 7, 20] }, fx: "mareo" }),
    pensando: E("Pensando", "IA", "Mira arriba con la mano en la barbilla.", { boca: [14, 6, 6, 224], cejas: [4, 6, -16, -10], manoD: [260, 270, 292, "punta"], frente: "D", mira: [8, -9], giro: 6, fx: "chispa", onda: { D: [3, 2, 3, 0] } }),
    escribiendo: E("Escribiendo", "IA", "Lee de lado a lado y teclea.", { boca: PEQUE, cejas: [3, 6, 3, 6], manoI: [122, 322, 150, "abierta"], manoD: [302, 322, 210, "abierta"], frente: "ID", mira: [0, 8], barrido: [8, 3], tecleo: 1, fx: "puntos" }),
    buscando: E("Buscando", "IA", "Barre con la mirada y usa la lupa.", { ojos: ["grande", "grande"], boca: [14, 8, 14, 220], cejas: [-5, 8, -15, -8], manoI: [128, 106, 62, "abierta"], frente: "I", barrido: [10, 2.2], fx: "lupa" }),
    cargando: E("Cargando", "Sistema", "Anillo que gira y cuerpo que se mece.", { boca: LINEA, balanceo: [4, 3], fx: "anillo" }),
    exito: E("Éxito", "Sistema", "Salta, pulgar arriba, check y chispas.", { ojos: ["feliz", "feliz"], boca: GRANDE, cejas: [-10, -6, -10, -6], manoI: [-55, 82, 348, "abierta"], manoD: [482, 88, 10, "pulgar"], salto: { cada: 1.8, v: 420 }, fx: "check", pomulo: 1.5 }),
    error: E("Error", "Sistema", "Niega con la cabeza.", { ojos: ["plano", "plano"], boca: PUCHERO, cejas: [2, 18, 2, 18], sacude: 1, caida: 8, fx: "equis", pomulo: 0.4 }),
    alerta: E("Alerta", "Sistema", "Ojos grandes, mano en alto y aviso.", { ojos: ["grande", "grande"], boca: [14, -8, 22, 220], cejas: [-14, -12, -14, -12], manoI: [-58, 90, 348, "abierta"], onda: { I: [9, 0, 12, 12] }, fx: "aviso", brinco: 170 }),
    tapandose: E("Tapándose los ojos", "Sistema", "Para cuando alguien escribe una contraseña.", { ojos: ["cerrado", "cerrado"], boca: PEQUE, cejas: [-14, -6, -14, -6], manoI: [166, 166, 52, "abierta"], manoD: [258, 166, 308, "abierta"], frente: "ID" }),
    durmiendo: E("Durmiendo", "Sistema", "Respira lento y salen las zetas.", { ojos: ["cerrado", "cerrado"], boca: [10, -4, 16, 224], cejas: [5, -6, 5, -6], manoI: [-20, 302, 190, "abierta"], manoD: [444, 302, 170, "abierta"], giro: -8, caida: 12, fx: "zzz", rapidez: 0.4, pomulo: 0.8 }),
  };

  const n = (v) => Math.round(v * 100) / 100;
  const linea = (d, c, w, extra = "") => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
  const elipse = (x, y, a, b, f, o = 1) => `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(a)}" ry="${n(b)}" fill="${f}" opacity="${n(o)}"/>`;
  const en = (x, y, e, s, giro = 0) => `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(giro)}) scale(${n(e)})">${s}</g>`;
  const CORAZON = "M0 14C-22 -2 -12 -20 0 -8C12 -20 22 -2 0 14Z";
  const CHISPA = "M0 -14Q2.5 -2.5 14 0Q2.5 2.5 0 14Q-2.5 2.5 -14 0Q-2.5 -2.5 0 -14Z";

  function ojo(tipo, x, y, sy, t) {
    if (tipo === "feliz") return linea(`M${x - 19} 172Q${x} 142 ${x + 19} 172`, TINTA, 10);
    if (tipo === "cerrado" || (sy < 0.18 && tipo !== "corazon" && tipo !== "espiral" && tipo !== "plano")) return linea(`M${x - 19} 160Q${x} 182 ${x + 19} 160`, TINTA, 9);
    if (tipo === "plano") return linea(`M${x - 17} 166H${x + 17}`, TINTA, 10);
    if (tipo === "corazon") return en(x, y + 2, 1.55 + 0.18 * Math.max(0, Math.sin(t * 7)), `<path d="${CORAZON}" fill="#f0486a"/><circle cx="-7" cy="-7" r="3.5" fill="#fff"/>`);
    if (tipo === "espiral") return en(x, y, 2.3, linea("M0 0A2 2 0 0 1 4 0A4 4 0 0 1 -4 0A6 6 0 0 1 8 0A8 8 0 0 1 -8 0", TINTA, 2.6), t * 360);
    const k = tipo === "grande" ? 1.16 : tipo === "triste" ? 0.92 : 1;
    // Ojo elegido (O1): brillante con reflejo celeste
    return `<g transform="translate(${n(x)} ${n(y)}) scale(${k} ${n(k * sy)})">${elipse(0, 0, 21, 28, TINTA)}<path d="M-15 8Q0 32 15 8Q0 18 -15 8Z" fill="${TURQUESA}"/><circle cx="7" cy="-13" r="8.5" fill="#fff"/><circle cx="-7" cy="6" r="4" fill="#fff"/>${tipo === "triste" ? '<circle cx="9" cy="10" r="3" fill="#fff"/>' : ""}</g>`;
  }

  function mano(forma, x, y, giro, lado) {
    const dedos = forma === "punta" ? "M0 -10V-48" : forma === "pulgar" ? "M-9 -10L-8 -42" : "M-15 -10L-24 -35M1 -15V-44M16 -9L25 -33M-17 8L-34 0";
    const grosor = forma === "abierta" ? 15 : 17;
    const capa = (c, m) => `<circle r="${24 + m / 2}" cy="2" fill="${c}"/>${linea(dedos, c, grosor + m)}`;
    const nudillos = forma === "abierta" ? "" : linea("M3 0H18M3 12H16", TINTA, 3.5);
    return `<g transform="translate(${n(x)} ${n(y)}) rotate(${n(giro)}) scale(${lado} 1)">${capa(TINTA, 10)}${capa("#fff", 0)}${nudillos}</g>`;
  }

  const ZAPATO = `<path d="M174 418C158 412 112 426 112 447C112 455 119 458 128 458H177C188 458 190 449 189 440C188 430 183 421 174 418Z" fill="${AZUL}"/><path d="M113 448H189C189 455 185 458 177 458H128C119 458 114 455 113 448Z" fill="${CELESTE}"/>${linea("M143 428L156 438M155 423L168 433", "#fff", 4)}`;

  const efectos = {
    corazones: (t) => [0, 1, 2].map((i) => { const p = (t * 0.55 + i / 3) % 1; return `<g opacity="${n(1 - p)}">${en(330 + i * 38 + Math.sin(p * 7) * 10, 70 - p * 130, 0.9 + p * 0.6, `<path d="${CORAZON}" fill="${ROSA}"/>`)}</g>`; }).join(""),
    exclamacion: (t) => en(372, 8, 1 + 0.08 * Math.sin(t * 12), linea("M0 -34V2", TURQUESA, 15) + `<circle cy="28" r="8.5" fill="${TURQUESA}"/>`, 12),
    lagrima: (t) => { const p = (t * 0.5) % 1; return `<g opacity="${n(Math.min(1, (1 - p) * 2))}">${en(262, 196 + p * 70, 1.6, `<path d="M0 -9Q8 2 0 7Q-8 2 0 -9Z" fill="${TURQUESA}"/>`)}</g>`; },
    mareo: (t) => [0, 1, 2].map((i) => { const a = t * 3.4 + (i * Math.PI * 2) / 3; return en(212 + Math.cos(a) * 105, -22 + Math.sin(a) * 24, 1 + Math.sin(a) * 0.25, `<path d="${CHISPA}" fill="#f5b72f"/>`, a * 40); }).join(""),
    chispa: (t) => en(375, 5, 2 + 0.3 * Math.sin(t * 4), `<path d="${CHISPA}" fill="${TURQUESA}"/>`, t * 90) + en(412, 48, 1, `<path d="${CHISPA}" fill="${CELESTE}"/>`, -t * 120),
    puntos: (t) => `<rect x="316" y="-36" width="112" height="52" rx="26" fill="${TINTA}"/>` + [0, 1, 2].map((i) => `<circle cx="${346 + i * 26}" cy="${n(-10 - 9 * Math.max(0, Math.sin(t * 7 - i * 0.9)))}" r="8" fill="${CELESTE}"/>`).join(""),
    lupa: (t) => en(366 + Math.sin(t * 2.2) * 42, 262 + Math.cos(t * 4.4) * 14, 1, linea("M24 24L52 52", TINTA, 17) + `<circle r="33" fill="${CELESTE}" fill-opacity=".3" stroke="${TINTA}" stroke-width="10"/>` + linea("M-18 -6Q-14 -18 -2 -20", "#fff", 5)),
    anillo: (t) => en(380, 6, 1, `<circle r="30" fill="none" stroke="#cfe2ec" stroke-width="11"/><circle r="30" fill="none" stroke="${TURQUESA}" stroke-width="11" stroke-linecap="round" stroke-dasharray="62 190"/>`, t * 300),
    check: (t) => { const p = (t % 1.8) / 1.8; return en(384, -8, Math.min(1, p * 6 + 0.4), `<circle r="36" fill="#1fb57a"/>` + linea("M-17 1L-4 14L19 -12", "#fff", 10, `stroke-dasharray="60" stroke-dashoffset="${n(Math.max(0, 60 - p * 220))}"`)) + [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * 6.283; return `<g opacity="${n(1 - p)}">${en(212 + Math.cos(a) * (190 + p * 90), 170 + Math.sin(a) * (170 + p * 70), 0.8, `<path d="${CHISPA}" fill="${i % 2 ? TURQUESA : "#f5b72f"}"/>`)}</g>`; }).join(""); },
    equis: (t) => en(378, 4, 1 + 0.07 * Math.sin(t * 14), `<circle r="34" fill="#d9364f"/>` + linea("M-12 -12L12 12M12 -12L-12 12", "#fff", 10)),
    aviso: (t) => en(382, 6, 1.1, `<path d="M0 -36L38 30H-38Z" fill="#f5b72f" stroke="#f5b72f" stroke-width="12" stroke-linejoin="round"/>` + linea("M0 -13V6", TINTA, 9) + `<circle cy="21" r="5.5" fill="${TINTA}"/>`, Math.sin(t * 6) * 9),
    zzz: (t) => [0, 1, 2].map((i) => { const p = (t * 0.32 + i / 3) % 1; return `<g opacity="${n(Math.sin(p * Math.PI))}">${en(330 + p * 95, 55 - p * 120, 0.7 + p * 1.1, linea("M-11 -12H11L-11 12H11", TURQUESA, 5.5))}</g>`; }).join(""),
  };

  let instancias = 0;

  class Motor {
    constructor(version = "completo", { semilla = 7 } = {}) {
      this.version = VERSIONES[version] ? version : "completo";
      this.id = "fepi" + ++instancias;
      this.semilla = semilla;
      this.t = 0;
      this.v = {}; // valores con inercia: [valor, velocidad]
      this.y = 0; this.vy = 0; this.sq = 0; this.sqv = 0;
      this.parpadeo = 2.2; this.gesto = 4; this.vistazo = [0, 0]; this.ceja = 0;
      this.objetivo = null; this.voz = null;
      this.setEstado("reposo");
    }
    azar() { this.semilla = (this.semilla * 16807) % 2147483647; return this.semilla / 2147483647; }
    setEstado(nombre) {
      if (!ESTADOS[nombre]) nombre = "reposo";
      if (this.nombre === nombre) return;
      this.nombre = nombre;
      this.e = ESTADOS[nombre];
      this.desde = this.t;
      this.proximoSalto = this.t + 0.15;
      this.sqv += 1.4;
      if (this.e.brinco) this.vy = this.e.brinco;
    }
    /** Punto del lienzo hacia donde mirar (null = mirada propia del estado). */
    mirar(x, y) { this.objetivo = x == null ? null : [x, y]; }
    resorte(clave, meta, dt, k = 170, d = 21) {
      const r = this.v[clave] || (this.v[clave] = [meta, 0]);
      r[1] += (k * (meta - r[0]) - d * r[1]) * dt;
      r[0] += r[1] * dt;
      return r[0];
    }
    paso(dt) {
      this.t += dt;
      const e = this.e, t = this.t;

      // Saltos y rebote
      if (e.salto && t > this.proximoSalto && this.y <= 0) { this.vy = e.salto.v; this.sqv += 1.2; this.proximoSalto = t + e.salto.cada; }
      if (this.y > 0 || this.vy > 0) {
        this.vy -= 1500 * dt;
        this.y += this.vy * dt;
        if (this.y <= 0) { this.sqv += Math.min(2.2, -this.vy / 220); this.y = 0; this.vy = 0; }
      }
      this.sqv += (-230 * this.sq - 15 * this.sqv) * dt;
      this.sq += this.sqv * dt;

      // Parpadeo, vistazos y juego de cejas
      this.parpadeo -= dt;
      if (this.parpadeo < -0.15) this.parpadeo = this.azar() < 0.2 ? 0.2 : 2 + this.azar() * 3;
      this.gesto -= dt;
      if (this.gesto <= 0) {
        this.gesto = 1.6 + this.azar() * 2.6;
        this.vistazo = this.azar() < 0.45 ? [0, 0] : [(this.azar() - 0.5) * 16, (this.azar() - 0.5) * 9];
        this.ceja = e.vivo && this.azar() < 0.55 ? (this.azar() < 0.5 ? 1 : 2) : 0;
        this.cejaDesde = t;
      }

      let [mx, my] = e.vivo ? this.vistazo : e.mira;
      if (e.barrido) mx += Math.sin(t * e.barrido[1]) * e.barrido[0];
      if (this.objetivo) {
        mx = Math.max(-11, Math.min(11, (this.objetivo[0] - 212) / 28));
        my = Math.max(-9, Math.min(9, (this.objetivo[1] - 165) / 28));
      }
      this.resorte("mx", mx, dt, 120, 18);
      this.resorte("my", my, dt, 120, 18);

      // Cejas: en reposo suben las dos (1) o solo una (2)
      let [ci, gi, cd, gd] = e.cejas;
      const golpe = t - (this.cejaDesde || 0) < 0.7;
      if (this.ceja && golpe) { cd -= 12; gd -= 6; if (this.ceja === 1) { ci -= 12; gi -= 6; } }
      if (e.habla) { const a = this.voz ?? 0; ci -= a * 5; cd -= a * 5; }
      [ci, gi, cd, gd].forEach((v, i) => this.resorte("c" + i, v, dt, 260, 20));

      const boca = [...e.boca];
      if (e.habla) boca[2] = boca[1] + 6 + (this.voz ?? Math.max(0, 0.55 + 0.45 * Math.sin(t * 13) * Math.sin(t * 5.3))) * 38;
      boca.forEach((v, i) => this.resorte("b" + i, v, dt, 300, 26));

      for (const lado of ["I", "D"]) {
        let [x, y, giro] = e["mano" + lado];
        const o = e.onda?.[lado];
        if (o) { const s = Math.sin(t * o[2]); x += s * o[0]; y += s * o[1]; giro += s * o[3]; }
        if (e.tecleo) y += Math.max(0, Math.sin(t * 14 + (lado === "I" ? 0 : Math.PI))) * -16;
        this.resorte("x" + lado, x, dt, 110, 14);
        this.resorte("y" + lado, y, dt, 110, 14);
        this.resorte("g" + lado, giro, dt, 130, 17);
      }

      const r = e.rapidez;
      let dx = 0, giro = e.giro;
      if (e.balanceo) { giro += Math.sin(t * e.balanceo[1]) * e.balanceo[0]; dx += Math.sin(t * e.balanceo[1]) * e.balanceo[0]; }
      if (e.sacude) { const dur = (t - this.desde) % 2.2; if (dur < 1) dx += Math.sin(dur * 26) * 16 * (1 - dur); }
      this.resorte("dx", dx, dt, 300, 24);
      this.resorte("giro", giro, dt, 90, 13);
      this.resorte("caida", e.caida + Math.sin(t * 2.3 * r) * 5, dt, 60, 13);
      this.resorte("pomulo", e.pomulo, dt);
      this.resorte("ropa", -this.vy * 0.016 + this.sq * 22, dt, 90, 8);
    }

    svg({ ancho, sombra = true, titulo, decorativo = false } = {}) {
      const e = this.e, t = this.t - this.desde, v = (k) => this.v[k]?.[0] ?? 0;
      const completo = this.version === "completo";
      const dx = v("dx"), dy = v("caida") - this.y, giro = v("giro"), sq = Math.max(-0.14, Math.min(0.14, this.sq * 0.35));
      const pivY = 357;
      const cuerpoT = `translate(${n(212 + dx)} ${n(pivY + dy)}) rotate(${n(giro)}) scale(${n(1 + sq)} ${n(1 - sq)}) translate(-212 -${pivY})`;
      // Misma transformacion aplicada a un punto (hombros y caderas)
      const punto = (x, y) => {
        const a = (giro * Math.PI) / 180, px = (x - 212) * (1 + sq), py = (y - pivY) * (1 - sq);
        return [212 + dx + px * Math.cos(a) - py * Math.sin(a), pivY + dy + px * Math.sin(a) + py * Math.cos(a)];
      };
      const id = this.id;

      const ropa = `<g transform="translate(0 ${n(v("ropa"))})"><path d="${ROMBO_IZQ}" fill="#2380af"/><path d="${ROMBO_DER}" fill="#298396"/></g>`;
      const cuerpo = `<path d="${HUECO}" fill="#fff"/><path d="${ARO_ABAJO}" fill="url(#${id}a)"/><path d="${ARO_ARRIBA}" fill="url(#${id}b)"/><path d="${HUECO}" fill="url(#${id}c)" transform="translate(212.2 179.4) scale(.91) translate(-212.2 -179.4)"/>`;

      // Cara elegida: ojos O1, boca B1, pomulos P2, cejas C1
      const sy = this.parpadeo < 0 ? Math.min(1, Math.abs(this.parpadeo + 0.075) / 0.075) : 1;
      const caidaOjo = (tipo) => (tipo === "triste" ? 4 : 0);
      const ojos = [178, 246].map((x, i) => ojo(e.ojos[i], x + v("mx"), 164 + v("my") + caidaOjo(e.ojos[i]), sy, t)).join("");
      const ceja = (i) => `<g transform="translate(0 ${n(v("c" + i))}) rotate(${n(v("c" + (i + 1)))} 175 121)">${linea("M160 126Q174 114 190 122", TINTA, 7)}</g>`;
      const cejas = ceja(0) + `<g transform="translate(424 0) scale(-1 1)">${ceja(2)}</g>`;
      const p = v("pomulo");
      const pomulo = (x) => elipse(x, 198, 18, 12, ROSA, 0.18 * p) + elipse(x, 198, 12, 8, ROSA, 0.28 * p) + elipse(x, 198, 6, 4, ROSA, Math.min(1, 0.35 * p));
      const [w, arriba, abajo, by] = [0, 1, 2, 3].map((i) => v("b" + i));
      const dBoca = `M${n(212 - w)} ${n(by)}C${n(212 - w * 0.5)} ${n(by + arriba)} ${n(212 + w * 0.5)} ${n(by + arriba)} ${n(212 + w)} ${n(by)}C${n(212 + w * 0.7)} ${n(by + abajo)} ${n(212 - w * 0.7)} ${n(by + abajo)} ${n(212 - w)} ${n(by)}Z`;
      const fondo = by + abajo * 0.75;
      const lengua = abajo - arriba > 20 ? `<g clip-path="url(#${id}k)"><path d="M${n(212 - w * 0.65)} ${n(fondo)}Q212 ${n(fondo - 20)} ${n(212 + w * 0.65)} ${n(fondo)}V${n(fondo + 12)}H${n(212 - w * 0.65)}Z" fill="#ff7d8f"/></g>` : "";
      const boca = `<clipPath id="${id}k"><path d="${dBoca}"/></clipPath><path d="${dBoca}" fill="#5a1630"/>${lengua}${linea(dBoca, TINTA, Math.abs(abajo - arriba) < 4 ? 8 : 5.5)}`;
      const cara = pomulo(148) + pomulo(276) + cejas + ojos + boca;

      let piernas = "", detras = "", delante = "";
      if (completo) {
        const alto = this.y;
        for (const [hx, tx, color, espejo] of [[180, 163, AZUL, ""], [244, 261, AZUL, "translate(424 0) scale(-1 1)"]]) {
          const [x0, y0] = punto(hx, 305);
          const x1 = tx, y1 = 428 - alto * 0.8;
          const dobla = (tx < 212 ? -1 : 1) * (12 + Math.max(0, dy) * 1.4);
          piernas += linea(`M${n(x0)} ${n(y0)}Q${n((x0 + x1) / 2 + dobla)} ${n((y0 + y1) / 2)} ${x1} ${n(y1)}`, color, 21) + `<g transform="translate(0 ${n(-alto * 0.8)})"><g transform="${espejo}">${ZAPATO}</g></g>`;
        }
        for (const [lado, sx, signo] of [["I", 70, -1], ["D", 354, 1]]) {
          const forma = e["mano" + lado][3];
          const [x0, y0] = punto(sx, 190);
          const x = v("x" + lado) + dx, y = v("y" + lado) + dy, g = v("g" + lado), a = (g * Math.PI) / 180;
          const mx = x - Math.sin(a) * 22, my = y + Math.cos(a) * 22; // muñeca
          // Delante del cuerpo el codo queda pegado; detras, el brazo se abre hacia afuera
          const cruza = e.frente?.includes(lado);
          const c1x = x0 + signo * (cruza ? 28 : 70), c1y = y0 + (cruza ? (my < y0 - 30 ? -8 : 55) : 4), largo = cruza ? 36 : 55;
          const d = `M${n(x0)} ${n(y0)}C${n(c1x)} ${n(c1y)} ${n(mx - Math.sin(a) * largo)} ${n(my + Math.cos(a) * largo)} ${n(mx)} ${n(my)}`;
          const brazo = linea(d, AZUL, 20);
          const palma = mano(forma, x, y, g, signo < 0 ? -1 : 1);
          if (cruza) delante += brazo + palma;
          else { detras += brazo; delante += palma; }
        }
      }

      const [vx, vyb, vw, vh] = LIENZO[this.version];
      const tam = ancho ? ` width="${ancho}" height="${n((ancho * vh) / vw)}"` : "";
      const nombre = titulo || `Fepi: ${e.nombre}`;
      const acc = decorativo ? 'aria-hidden="true"' : `role="img" aria-label="${nombre}"`;
      const suelo = sombra ? elipse(212 + dx * 0.4, completo ? 466 : 400, (completo ? 135 : 120) * Math.max(0.5, 1 - this.y / 260), 9, TINTA, 0.12) : "";
      return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vx} ${vyb} ${vw} ${vh}"${tam} ${acc} style="display:block;max-width:100%;height:auto"><defs><linearGradient id="${id}a" x1="43" y1="179" x2="381" y2="179" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#22818b"/><stop offset="1" stop-color="#19477f"/></linearGradient><linearGradient id="${id}b" x1="43" y1="102" x2="381" y2="102" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#19477f"/><stop offset="1" stop-color="#22818b"/></linearGradient><linearGradient id="${id}c" x1="212" y1="60" x2="212" y2="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#e3f3f9"/></linearGradient></defs>${suelo}<g transform="${cuerpoT}">${ropa}</g>${piernas}${detras}<g transform="${cuerpoT}">${cuerpo}${cara}</g>${delante}${e.fx ? efectos[e.fx](t) : ""}</svg>`;
    }
  }

  /** SVG fijo de un estado (para imagenes, miniaturas y "reducir movimiento"). */
  function pose(version, estado, opciones = {}) {
    const m = new Motor(version);
    m.setEstado(estado);
    // Se simula un momento para que la pose llegue a su sitio, sin saltos ni parpadeo
    m.e = { ...m.e, salto: null };
    m.vy = 0;
    for (let i = 0; i < 90; i++) { m.paso(1 / 60); m.parpadeo = 2; m.ceja = 0; }
    return m.svg(opciones);
  }

  const POR_DEFECTO = { version: "completo", estado: "reposo", tamano: 260, sombra: true, juego: false, voz: null };
  const ahora = () => performance.now() / 1000;

  /** Anima a Fepi dentro de un elemento. Con `juego`, sigue el cursor y reacciona a clics. */
  function montar(el, inicial = {}) {
    let op = { ...POR_DEFECTO, ...inicial };
    let motor, raf = 0, ultimo = 0, visible = true, observador;
    const r = { reaccion: null, encima: 0, clics: [], puntero: null, movido: ahora() };
    const quieto = matchMedia("(prefers-reduced-motion: reduce)");
    const opSvg = () => ({ ancho: op.tamano, sombra: op.sombra });
    const fija = () => { el.innerHTML = pose(op.version, op.estado, opSvg()); };

    function bucle(ms) {
      raf = requestAnimationFrame(bucle);
      const t = ms / 1000;
      if (!visible || t - ultimo < 1 / 32) return;
      const dt = Math.min(1 / 15, t - ultimo || 1 / 30);
      ultimo = t;
      let estado = op.estado;
      if (r.reaccion && ahora() < r.reaccion.hasta) estado = r.reaccion.n;
      else if (op.juego && op.estado === "reposo") {
        if (r.encima) estado = ahora() - r.encima > 1.6 ? "amor" : "feliz";
        else if (ahora() - r.movido > 14) estado = "durmiendo";
      }
      motor.setEstado(estado);
      const sigue = op.juego && r.puntero && ahora() - r.movido < 4 && ["reposo", "saludo", "feliz", "sorpresa", "hablando"].includes(estado);
      if (sigue) {
        const c = el.getBoundingClientRect(), [vx, vy, vw, vh] = LIENZO[motor.version];
        motor.mirar(vx + ((r.puntero.x - c.left) / c.width) * vw, vy + ((r.puntero.y - c.top) / c.height) * vh);
      } else motor.mirar(null);
      motor.voz = op.voz;
      motor.paso(dt / 2);
      motor.paso(dt / 2);
      el.innerHTML = motor.svg(opSvg());
    }
    function arrancar() {
      cancelAnimationFrame(raf);
      if (quieto.matches) return fija();
      motor = new Motor(op.version, { semilla: 1 + Math.floor(Math.random() * 1e6) });
      motor.setEstado(op.estado);
      ultimo = 0;
      el.innerHTML = motor.svg(opSvg());
      raf = requestAnimationFrame(bucle);
    }

    const limpiar = [];
    const oir = (obj, ev, f) => { obj.addEventListener(ev, f); limpiar.push(() => obj.removeEventListener(ev, f)); };
    oir(window, "pointermove", (ev) => {
      if (!op.juego) return;
      if (motor?.nombre === "durmiendo" && op.estado === "reposo") r.reaccion = { n: "sorpresa", hasta: ahora() + 0.9 };
      r.puntero = { x: ev.clientX, y: ev.clientY };
      r.movido = ahora();
    });
    oir(el, "pointerenter", () => { if (op.juego) r.encima = ahora(); });
    oir(el, "pointerleave", () => { r.encima = 0; });
    oir(el, "pointerup", () => {
      if (!op.juego || (r.reaccion?.n === "mareado" && ahora() < r.reaccion.hasta)) return;
      const t = ahora();
      r.movido = t;
      r.clics = [...r.clics.filter((c) => t - c < 1.7), t];
      const [n_, dura] = r.clics.length >= 3 ? ["mareado", 3.2] : r.clics.length === 2 ? ["guino", 1.6] : ["sorpresa", 0.9];
      if (r.clics.length >= 3) r.clics = [];
      r.reaccion = { n: n_, hasta: t + dura };
    });
    if (typeof IntersectionObserver === "function") {
      observador = new IntersectionObserver(([x]) => { visible = !!x?.isIntersecting; });
      observador.observe(el);
    }
    quieto.addEventListener("change", arrancar);
    limpiar.push(() => quieto.removeEventListener("change", arrancar));
    arrancar();

    return {
      actualizar(nuevo) {
        const rehacer = ["version", "tamano", "sombra"].some((k) => k in nuevo && nuevo[k] !== op[k]);
        op = { ...op, ...nuevo };
        if ("estado" in nuevo) r.reaccion = null;
        if (rehacer || quieto.matches) arrancar();
      },
      destruir() { cancelAnimationFrame(raf); observador?.disconnect(); limpiar.forEach((f) => f()); },
    };
  }

  globalThis.Fepi = { ESTADOS, VERSIONES, Motor, pose, montar };

  if (globalThis.customElements && !customElements.get("fepi-mascota")) {
    customElements.define("fepi-mascota", class extends HTMLElement {
      static observedAttributes = ["version", "estado", "tamano", "juego"];
      opciones() {
        return { version: this.getAttribute("version") || "completo", estado: this.getAttribute("estado") || "reposo", tamano: Number(this.getAttribute("tamano")) || 260, juego: this.hasAttribute("juego") };
      }
      connectedCallback() { this.style.display = "inline-block"; this.control = montar(this, this.opciones()); }
      disconnectedCallback() { this.control?.destruir(); this.control = null; }
      attributeChangedCallback() { this.control?.actualizar(this.opciones()); }
    });
  }
})();
