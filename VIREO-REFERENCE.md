# Referencia: plantilla Vireo

`apps/web` nació como copia de la edición Next.js de la plantilla **Vireo**
(Envato, licencia comercial). La plantilla original completa sigue en:

```
C:\Users\Jaime Tarazona\Documents\GitHub\vireo
```

No se copió todo — solo la edición Next.js (`Templates/Next`) y el backend
NestJS que ya se venía desarrollando (`backend`). El resto de ediciones
(React, Vue, Nuxt, Laravel, Django, PHP, HTML) se quedaron ahí, no hacen
falta para este proyecto.

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
