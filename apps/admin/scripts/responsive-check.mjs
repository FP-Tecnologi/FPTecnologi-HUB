/*
 * Prueba responsive del dashboard. Recorre todas las rutas del shell en
 * móvil / tablet / laptop con la API simulada (no hace falta backend ni login)
 * y falla si encuentra:
 *   - scroll horizontal de la página,
 *   - el sidebar asomando cuando debería estar cerrado (< 768px),
 *   - el drawer abierto fuera de pantalla (< 768px),
 *   - una tabla más ancha que su contenedor sin scroll propio,
 *   - elementos que sobresalen del viewport fuera de un contenedor con scroll.
 *
 * Uso (con el dev server del admin en :3000):
 *   npm i -D playwright-core && node scripts/responsive-check.mjs [baseUrl] [ruta ...]
 * Usa el Chrome/Chromium instalado en el sistema (CHROME_PATH para fijarlo).
 */
import { chromium } from 'playwright-core';
import { readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const [, , baseArg, ...onlyRoutes] = process.argv;
const BASE = baseArg || 'http://localhost:3000';
const VIEWPORTS = [
  { name: 'movil', width: 375, height: 812 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'laptop', width: 1024, height: 768 },
  { name: 'desktop', width: 1440, height: 900 },
];

const appDir = join(fileURLToPath(new URL('.', import.meta.url)), '..', 'app', '(shell)');
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (f === 'page.tsx') out.push(relative(appDir, dir).split(sep).join('/'));
  }
  return out;
}
const routes = onlyRoutes.length
  ? onlyRoutes
  : walk(appDir)
      .filter((r) => !r.includes('[')) // rutas dinámicas: sin id real no hay qué probar
      .map((r) => '/' + r);

const CHROME = process.env.CHROME_PATH || findChrome();
function findChrome() {
  const base = join(process.env.LOCALAPPDATA || '', 'ms-playwright');
  if (existsSync(base)) {
    const dirs = readdirSync(base).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse();
    for (const d of dirs) {
      const exe = join(base, d, 'chrome-win64', 'chrome.exe');
      if (existsSync(exe)) return exe;
    }
  }
  return undefined; // channel por defecto de playwright-core
}

const ok = (data) => ({ success: true, statusCode: 200, data, timestamp: new Date().toISOString() });
const MARCAS = [{ marcaId: 'm1', marca: { id: 'm1', nombre: 'Marca demo' }, rol: { id: 'r1', nombre: 'Administrador' } }];

const browser = await chromium.launch({ executablePath: CHROME, headless: true });
const problems = [];

for (const vp of VIEWPORTS) {
  const ctx = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
  await ctx.addInitScript(() => {
    localStorage.setItem('ax:auth:access', 'test');
    localStorage.setItem('ax:auth:refresh', 'test');
    localStorage.setItem('ax:auth:marcaId', 'm1');
    localStorage.setItem('ax:auth:user', JSON.stringify({ id: 'u1', email: 'test@local.test', nombre: 'Usuario Prueba' }));
    localStorage.setItem('ax:auth:adminmode', '1');
  });
  // cookie real: el middleware la lee en el servidor antes de que corra cualquier script
  await ctx.addCookies([{ name: 'ax_session', value: '1', url: BASE }]);
  await ctx.route(/localhost:3001/, (route) => {
    const url = route.request().url();
    if (url.includes('/usuarios/me/marcas')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok(MARCAS)) });
    if (url.includes('/usuarios/me/seguridad')) return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ok({ superAdmin: true })) });
    // el resto: error controlado (cada pantalla pinta su estado de error en vez de reventar con datos de forma incorrecta)
    route.fulfill({ status: 503, contentType: 'application/json', body: JSON.stringify({ success: false, statusCode: 503, message: 'API simulada', timestamp: '' }) });
  });

  for (const route of routes) {
    const page = await ctx.newPage();
    const errs = [];
    page.on('pageerror', (e) => errs.push(String(e.message).slice(0, 120)));
    try {
      await page.goto(BASE + route, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForSelector('.ax-layout', { timeout: 60000 });
      await page.waitForTimeout(700);

      const res = await page.evaluate(() => {
        const vw = innerWidth;
        const inScroller = (el) => {
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const o = getComputedStyle(p).overflowX;
            if (o === 'auto' || o === 'scroll' || o === 'hidden' || o === 'clip') return true;
          }
          return false;
        };
        const hidden = (el) => {
          const cs = getComputedStyle(el);
          return cs.display === 'none' || cs.visibility === 'hidden' || el.getClientRects().length === 0;
        };
        const sb = document.querySelector('.ax-sidebar');
        const sbRect = sb?.getBoundingClientRect();
        const offenders = [];
        for (const el of document.querySelectorAll('.ax-main *')) {
          const r = el.getBoundingClientRect();
          if (r.width && r.right > vw + 1 && !inScroller(el) && !hidden(el)) {
            offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).split(' ')[0]}`);
            if (offenders.length >= 3) break;
          }
        }
        const tables = [...document.querySelectorAll('.ax-main table')]
          .filter((t) => !hidden(t))
          .filter((t) => {
            const wrap = t.parentElement;
            const wr = wrap.getBoundingClientRect();
            const tr = t.getBoundingClientRect();
            return tr.width > wr.width + 1 && !inScroller(t);
          })
          .map((t) => String(t.className).split(' ')[0] || 'table');
        // tarjetas del contenido pegadas al borde de la zona de contenido (gutter pisado)
        const main = document.querySelector('.ax-main').getBoundingClientRect();
        const flush = [...document.querySelectorAll('.ax-main .ax-card')]
          .filter((c) => !hidden(c) && !c.parentElement.closest('.ax-card') && !inScroller(c))
          .filter((c) => {
            const r = c.getBoundingClientRect();
            return r.width > 0 && (r.left < main.left + 8 || r.right > main.right - 8);
          }).length;

        // tabla sintética ancha dentro de una tarjeta con padding inline (el caso que fallaba)
        const cols = 14;
        const probe = document.createElement('section');
        probe.className = 'ax-card';
        probe.style.padding = '16px';
        probe.innerHTML = '<div class="ax-table-wrap"><table class="ax-table"><thead><tr>' +
          Array.from({ length: cols }, (_, i) => `<th class="ax-table__th">Columna ${i + 1}</th>`).join('') +
          '</tr></thead><tbody><tr>' +
          Array.from({ length: cols }, () => '<td class="ax-table__td">Texto bastante largo de ejemplo</td>').join('') +
          '</tr></tbody></table></div>';
        document.querySelector('.ax-main').appendChild(probe);
        const pr = probe.getBoundingClientRect();
        const wrap = probe.querySelector('.ax-table-wrap');
        const mainNow = document.querySelector('.ax-main').getBoundingClientRect();
        const probeBad = [];
        if (pr.left < mainNow.left + 8 || pr.right > mainNow.right - 8) probeBad.push('pegada al borde');
        if (!(wrap.scrollWidth > wrap.clientWidth)) probeBad.push('no scrollea');
        if (document.documentElement.scrollWidth - vw > 1) probeBad.push('ensancha la página');
        probe.remove();

        return {
          flush,
          probeBad,
          docOverflow: document.documentElement.scrollWidth - vw,
          sidebarRight: sbRect ? Math.round(sbRect.right) : null,
          sidebarLeft: sbRect ? Math.round(sbRect.left) : null,
          offenders,
          tables,
          nTables: document.querySelectorAll('.ax-main table').length,
        };
      });

      const issues = [];
      if (res.docOverflow > 1) issues.push(`scroll horizontal +${res.docOverflow}px`);
      if (vp.width < 768 && res.sidebarRight > 0) issues.push(`sidebar cerrado asoma (right=${res.sidebarRight})`);
      if (res.offenders.length) issues.push(`sobresale: ${res.offenders.join(', ')}`);
      if (res.flush) issues.push(`${res.flush} tarjeta(s) pegadas al borde del contenido`);
      if (res.probeBad.length) issues.push(`tabla ancha en tarjeta: ${res.probeBad.join(', ')}`);
      if (res.tables.length) issues.push(`tabla sin scroll: ${res.tables.join(', ')}`);
      if (errs.length) issues.push(`error JS: ${errs[0]}`);

      // drawer abierto: debe quedar dentro de la pantalla
      if (vp.width < 768) {
        await page.locator('.ax-header button[aria-label="Toggle menu"]').first().click();
        await page.waitForTimeout(450);
        const d = await page.evaluate(() => {
          const r = document.querySelector('.ax-sidebar').getBoundingClientRect();
          return { left: Math.round(r.left), right: Math.round(r.right), vw: innerWidth };
        });
        if (d.left < 0 || d.right > d.vw) issues.push(`drawer abierto fuera de pantalla (${d.left}..${d.right})`);
      }

      if (issues.length) problems.push({ vp: vp.name, route, issues });
      process.stdout.write(`${issues.length ? 'x' : '.'}`);
    } catch (e) {
      problems.push({ vp: vp.name, route, issues: [`no cargó: ${String(e.message).split('\n')[0]}`] });
      process.stdout.write('E');
    }
    await page.close();
  }
  await ctx.close();
}
await browser.close();

console.log(`\n\n${routes.length} rutas x ${VIEWPORTS.length} tamaños`);
if (!problems.length) {
  console.log('OK: sin problemas responsive.');
} else {
  for (const p of problems) console.log(`[${p.vp}] ${p.route}\n   - ${p.issues.join('\n   - ')}`);
  console.log(`\n${problems.length} combinaciones con problemas.`);
  process.exitCode = 1;
}
