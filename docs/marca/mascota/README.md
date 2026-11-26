# Fepi, la mascota de FPTecnologi

Nombre y diseño aprobados el 26/11/2026. El nombre sale de "F-P". Antes de usarlo como marca registrada, verificar disponibilidad en INDECOPI.

| Archivo | Uso |
| --- | --- |
| `fepi.svg` | Sin brazos: avatar, chat, redes, stickers |
| `fepi-brazos.svg` | Con brazos y pies, saludando: banners, bienvenida, impresos, campañas |
| `vista-previa.html` | Comparación con el logo, en fondo claro y oscuro |

## En definición

1. Cara elegida: **O1 B1 P2 C1** (ojos brillantes, boca abierta, pómulos difuminados, cejas arqueadas), sobre fondo blanco y sin monograma. Códigos en `armar-cara.html`.
2. Animación: lista en `fepi.js` (20 estados, versiones `completo` y `base`). Probarla en `animado.html`; tras cambiar el motor, correr `node armar.mjs`. Sigue el modelo de Devi (`ERP-Devmark/packages/devi`).
3. Pendiente: elegir ropa (R), brazos (A), manos (M) y pies (Z) en `armar-cuerpo.html` y pasarlos al motor (hoy usa R1 A1 M1 Z1). Sin círculos en las uniones.
4. Después: actualizar los SVG fijos.

```html
<script src="fepi.js"></script>
<fepi-mascota estado="saludo" version="completo" tamano="260" juego></fepi-mascota>
```

Los SVG de arriba y las reglas de abajo aún describen el diseño anterior.

## Reglas

- El cuerpo son los trazos del logo (`apps/web-fptecnologi/public/logo-fptecnologi-icon.svg`): no deformarlo ni cambiar sus degradados.
- Colores del cuerpo: `#2380af`, `#298396`, degradado `#22818b` → `#19477f`.
- Cara: pantalla `#16426b` → `#0a2038`; ojos y sonrisa `#7ee7f7`; monograma FP en blanco.
- A 32 px o menos la cara no se distingue: usar el logo (por ejemplo, en el favicon).
