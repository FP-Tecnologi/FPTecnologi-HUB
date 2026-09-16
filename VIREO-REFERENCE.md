# Referencia: plantilla Vireo

`apps/web` nació como copia de la edición Next.js de la plantilla **Vireo**
(Envato, licencia comercial). La plantilla original completa vive **fuera
de este repo** (paquete comercial, no se commitea) — la ruta depende de la
máquina/perfil de Windows, ya cambió una vez entre sesiones:

```
C:\Users\jaime\Downloads\vireo-multipurpose-admin-and-dashboard-template-2026-08-13-11-50-09-utc\vireo\Templates\Next
```

(ruta vieja, puede no existir en otra máquina/perfil:
`C:\Users\Jaime Tarazona\Documents\GitHub\vireo`). Si ninguna de las dos
existe en la máquina donde se abre este repo, pedirle al usuario la
ubicación actual del `.zip`/carpeta de Vireo antes de asumir que no está
disponible — no es parte del repo por licencia, pero normalmente sí está
en el Descargas/Documentos de quien lo compró.

No se copió todo — solo la edición Next.js (`Templates/Next`) y el backend
NestJS que ya se venía desarrollando (`backend`). El resto de ediciones
(React, Vue, Nuxt, Laravel, Django, PHP, HTML) se quedaron ahí, no hacen
falta para este proyecto.

`apps/web-fptecnologi` (Fase 2, web pública) también toma prestado el ADN
visual de Vireo/Aurora (glassmorfismo, botones con degradé+glow) pero vía
las clases ya adaptadas en `apps/web/src/styles/components.css` — no hace
falta ir a la plantilla original para eso, solo para buscar un patrón de
pantalla/componente que todavía no se adaptó.

## Cuándo revisar la plantilla original

Antes de construir un módulo nuevo desde cero, revisar si Vireo ya trae una
pantalla/patrón parecido en `vireo/Templates/Next/src/screens/`:

| Carpeta | Contenido |
| --- | --- |
| `dashboards/` | 17 dashboards (sales, analytics, crm, ecommerce...) |
| `ecommerce/` | Catálogo, carrito, checkout, pedidos |
| `crm/` | Contactos, leads, pipeline |
| `blog/` | Listado, artículo, editor |
| `forms/` | Inputs, validación, wizards |
| `tables/` | Tablas con filtros, paginación |
| `charts/` | Gráficas ApexCharts |
| `maps/` | Leaflet |
| `auth/` | Login, registro, recuperar contraseña |
| `jobs/`, `crypto/`, `nft/`, `projects/`, `docs/`, `pages/`, `ui/`, `utilities/`, `icons/` | Otros módulos/patrones ya armados |

Componentes compartidos (shell, sidebar, topbar, cards, botones) están en
`vireo/Templates/Next/src/components/`. Tokens de diseño (colores, espaciado)
en `vireo/Templates/Next/src/styles/tokens/`.

## Cómo usarlo

1. Al empezar un módulo nuevo (ej. campañas, leads), buscar primero en la
   tabla de arriba si ya existe algo parecido.
2. Si existe: copiar la pantalla/componente desde `vireo/Templates/Next` a
   `apps/web` y adaptar datos/lógica al backend real de este proyecto (en
   Vireo los datos son mock estáticos en `src/data/demo/`).
3. Si no existe: construir nuevo siguiendo los mismos tokens `--ax-*` y
   componentes de `src/components/ui/` para mantener consistencia visual.

No modificar `vireo/` — es la fuente de referencia, no parte de este repo.
