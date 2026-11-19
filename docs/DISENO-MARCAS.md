# Diseño por marca — cuadro comparativo

Cada web pública tiene **su propio estilo, color y tipo de botón**, definido en el `DESIGN.md` de su app. Este cuadro sirve para no mezclarlos: una marca nueva se
define aquí y en su `apps/<web>/DESIGN.md`. Si cambia el estilo de una web, se actualiza su `DESIGN.md` y la fila de este cuadro.

| Marca (app) | Color de marca | Fuentes | Botón principal | Forma / rasgo | Iconos |
|---|---|---|---|---|---|
| **FPTecnologi** (`web-fptecnologi`) | Azul `#107acc` (`brand-600`) | Montserrat | Azul de marca, esquinas suaves (`rounded-lg/xl`), hover `#0b68b8` | Cuadrados de esquinas suaves; tienda con USD/PEN | lucide-react |
| **Fimav Perú** (`fimav-web`) | Rojo `#e02424` / botón `#c91f1f` + carbón `#38383c` | Poppins + Rajdhani (títulos menores) + Source Sans 3 | Rojo `bg-boton`, texto blanco | Hexágonos de esquinas redondeadas, espiral; Perú Compras destacado | lucide-react + hexágonos propios |
| **Kelqa** (`kelqa-web`) | Turquesa `#1b898f` | DM Sans + Montserrat | Turquesa, `rounded-xl`, brillo y rebote | Tarjetas que suben, títulos con brillo | lucide-react |
| **Imaninki** (`imaninki-web`) | Rojo `#d4182a` + negro + plata `#c9ccd1` | Montserrat | Rojo, `rounded-md`, mayúsculas | Negro texturizado, filetes plata/rojo, cortes diagonales | lucide-react |
| **Quamtu** (`quamtu-web`) | Azul `#238DC1` / `#385CAD`, fondo marino `#060B17` | Play + Carlito | Azul `#1B79ab`, **píldora** (`rounded-full`) | Noche, vidrio y marcos HUD; una sola luz de marca | ver su DESIGN.md |
| **Company IMC** (`imc-web`) | Azul `#2b54ac` + naranja `#ffaa07` | Poppins | **Cuadrado** (sin bordes redondeados): naranja = CTA, azul = secundario, contorno = terciario | Hexágonos y chevrones del brochure, esquinas rectas, puntos suaves; gris oscuro solo en el pie | SVG propios de trazo dentro de hexágonos |
| **Dashboard** (`admin`) | Ver su DESIGN.md | — | — | Vireo | — |

## Reglas comunes

- El contraste mínimo es AA: texto blanco largo solo sobre el tono «hondo» de cada marca; el acento claro solo sobre fondos oscuros.
- Español de Perú con **tú**. No inventar cifras, clientes ni instituciones; lo provisional se marca «de ejemplo».
- Respetar `prefers-reduced-motion` y que el contenido sea visible sin JavaScript.
- Un estilo de botón por marca: no copiar la forma de una marca en otra (por ejemplo, las píldoras de Quamtu no se usan en Company IMC).

## Fotos y logos de terceros

- Logos de marcas aliadas (HP, Dell, Lenovo, etc.): solo para marcas con las que la empresa trabaja de verdad.
- Fotos con licencia Creative Commons (ej. Wasiwatana, CC BY-SA 4.0, en Perú Compras de `imc-web`): el **crédito debe quedar visible**; preferir fotos propias.
