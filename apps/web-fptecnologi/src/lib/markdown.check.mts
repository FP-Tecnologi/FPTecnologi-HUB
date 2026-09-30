// Autochequeo del conversor Markdown (incluye casos de seguridad). Correr: npx tsx src/lib/markdown.check.mts
import { markdownToHtml } from './markdown.ts';
const cases: [string,string][] = [
  ['## Hola\n\nTexto **fuerte** y *cursiva*.', '<h2>Hola</h2>\n<p>Texto <strong>fuerte</strong> y <em>cursiva</em>.</p>'],
  ['- a\n- b', '<ul><li>a</li><li>b</li></ul>'],
  ['1. x\n2. y', '<ol><li>x</li><li>y</li></ol>'],
  ['> cita', '<blockquote>cita</blockquote>'],
  ['<script>alert(1)</script>', '<p>&lt;script&gt;alert(1)&lt;/script&gt;</p>'],
  ['[x](javascript:alert(1))', '<p>[x](javascript:alert(1))</p>'],
  ['[web](/tienda)', '<p><a href="/tienda">web</a></p>'],
];
let ok=true; for (const [i,e] of cases){ const r=markdownToHtml(i); if(r!==e){ok=false; console.log('FAIL',JSON.stringify(i),'\n got',r,'\n exp',e);} } console.log(ok?'ALL OK':'FAILED');
