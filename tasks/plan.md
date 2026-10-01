# Plan: ecommerce real + conexión API ↔ web ↔ dashboard (FPTecnologi-HUB)

## Overview
Convertir `web-fptecnologi` de catálogo hardcodeado (`content.ts`/`catalog.ts`, carrito solo `localStorage`) a ecommerce real contra la API central, manteniendo el sistema de `DESIGN.md` (home `app/page.tsx` como referencia, `PageHero`, `SectionBadge` + título dos tonos, `MoreInfoButton`, tarjetas home, fondos claros alternados). Alcance excluido a pedido: Catálogos (Drive) y QUAMTU. El cotizador nuevo se mantiene; se trae la info útil de la landing "cotiza tu tiempo" como secciones CMS, no como clon.

## Arquitectura (decisiones)
- `marcaId` siempre server-side (`HUB_MARCA_ID` en proxies `app/api/hub/*` + `MarcaRolGuard` + tenant-guard). Nunca confiar en marcaId del cliente.
- Web lee catálogo vía proxies (`/api/hub/catalogo`) → `GET /public/productos/categorias`, con fallback a `catalog.ts` si la API cae.
- Precio fuente = API (USD sin IGV); IGV 18% + tipo de cambio se calculan con datos del servidor, no hardcodeados en cliente.
- Checkout invitado `POST /public/pedidos` con honeypot + rate-limit (mismo patrón que cotizador/boletín/chat). Snapshot de venta en `PedidoItem` (nombre/sku/precio/igv) para que la factura no cambie si el producto cambia.
- Fotos (productos, asesores, blog) vía upload a Storage con URL en DB; mientras tanto URL manual. `ChatAsesor` puede vincularse a `Usuario` (opcional) sin romper el widget.
- Permisos: modelo sigue siendo `(usuario,marca,rol)`; "páginas asignadas" = manifest del dashboard filtrado por rol + enforcement real en API (`@Roles`). No se inventa ACL por página en DB en esta fase.

## Task List

### Fase 0 — Catálogo importable + API pública comprable
- [ ] T0.1 (M): migración Prisma — `Producto`: `slug unique/marca`, `imagenes String[]`, `marca String?`, `precioAntes Decimal?`, `destacado Bool`, `moneda`; `Categoria`: `slug`, `orden`, `activo`, `portadaUrl?`; `Pedido/Item`: `numeroPedido unique/marca`, `nombre/email/celular/documento/direccion/distrito`, `subtotal/igv/envio/descuento/total`, `moneda`, `estadoPago/metodoPago`; `Item`: `nombreSnapshot/skuSnapshot/igvUnitario/subtotal`. Tenant-guard: añadir modelos nuevos con marcaId al Set.
- [ ] T0.2 (M): `GET /public/categorias` + paginación/búsqueda en `GET /public/productos` (`?q&categoria&marca&min&max&orden&page&limit`) y `GET /public/productos/slug/:slug`; mismo patrón para blog (`?q&categoria&tag`). Tests Vitest.
- [ ] T0.3 (M): `POST /public/pedidos` invitado (valida stock con decremento atómico/transacción, calcula totales server-side, crea notificación `PEDIDO`). Rate-limit + honeypot.
- [ ] T0.4 (S): script importador WooCommerce (CSV nativo) → upsert por `(marcaId,sku)`, descarga/mapea imágenes. Requiere exportación del usuario (ver Preguntas).

### Checkpoint 0
- [ ] Migraciones aplican en base vacía; tests API OK; `GET /public/productos?q=` pagina y filtra.

### Fase 1 — Web catálogo real (mismo DESIGN.md)
- [ ] T1.1 (M): proxy `app/api/hub/catalogo` + `lib/catalogo.ts` (fetch API con fallback a `catalog.ts`). `StoreCatalog`, ficha `/producto/[slug]`, `/tienda/[slug]` leen API.
- [ ] T1.2 (M): `/marcas` y `/marcas/[slug]` reales (derivan de productos, no placeholder). SEO: OG/Twitter/JSON-LD producto, `alt` reales, `next/image` donde aplique.
- [ ] T1.3 (S): moneda/IGV desde servidor (quitar tasa `3.75` fija; `CurrencyContext` consume tasa API/env).

### Checkpoint 1
- [ ] Tienda/ficha/marcas pintan datos de API; build + `tsc --noEmit` OK; visual 375/1024/1920.

### Fase 2 — Checkout real
- [ ] T2.1 (L): `/checkout` (datos + envío + comprobante boleta/factura) → `POST /public/pedidos`; carrito deja de terminar en `/#contacto`. Página de gracias con número de pedido + WhatsApp.
- [ ] T2.2 (M): dashboard `/ecommerce/pedidos` real (lista/filtros/estados) + `/ecommerce/productos` CRUD (usa `GET/POST/PATCH /productos`, `PATCH /pedidos/:id/estado`). Contadores de `ResumenMarca` ya existen.

### Checkpoint 2
- [ ] Compra invitada end-to-end (web→API→dashboard) con stock descontado.

### Fase 3 — Asesores + usuarios por rol
- [ ] T3.1 (M): upload fotos (Storage) para `ChatAsesor.fotoUrl` y `Usuario.avatarUrl`; `ChatAsesores.tsx` deja de ser URL pegada. `ChatAsesor.usuarioId?` opcional.
- [ ] T3.2 (M): `Team.tsx` real (`GET /marcas/:marcaId/equipo`, `POST /roles/equipo|asignaciones`, `DELETE`, reset 2FA existente). Manifest `roles` revisado (blog visible→API 403 hoy; alinear).
- [ ] T3.3 (S): quitar `api/contacto/route.ts` legacy (credencial Supabase en código) o migrarlo al patrón hub.

### Checkpoint 3
- [ ] Crear/editar/rol/asesor con foto desde dashboard; widget muestra foto real; sin mismas fotos/números de ejemplo.

### Fase 4 — Cotizador nuevo + landing (sin clonar)
- [ ] T4.1 (S): secciones CMS `proceso`/`faq` ya existen; traer copy útil de "landing-cotiza-tu-tiempo" como defaults, manteniendo diseño nuevo. Sin cambios de estilo fuera de DESIGN.md.

### Fase 5 — Blog + pulido
- [ ] T5.1 (M): blog: upload portada, `generateMetadata` OG/Twitter/canonical + JSON-LD, `alt` con título, relacionados por etiqueta, sitemap. `BlogEditor` preview ya existe.
- [ ] T5.2 (S): chat IA con rate-limit; `CONTACT_INFO`/fotos ejemplo restantes a datos reales o marcados "de ejemplo".

### Checkpoint final
- [ ] Ecommerce + blog + chat + CMS verificados punta a punta; tests + build verdes; revisión humana.

## Riesgos
| Riesgo | Impacto | Mitigación |
|---|---|---|
| Exportación WooCommerce incompleta (sin SKU/imágenes) | Alto | Pedir CSV nativo con columnas mínimas; importar por etapas con reporte de omitidos |
| Precios manipulables desde localStorage | Alto | Totales siempre server-side (T0.3); web solo muestra |
| Sobreventa por stock | Medio | Decremento atómico + validación en transacción |
| Fotos pesadas (data-URI) | Medio | Solo URL Storage; polling `foto=1` ya evita peso |
| Divergencia visual | Medio | Checklist DESIGN.md §9 en cada página; 375/1024/1920 |

## Preguntas al usuario (responder para arrancar)
1. Exportación WordPress: ¿pasas el CSV nativo de WooCommerce (Productos → Exportar) o un XML? Mínimo: SKU, nombre, precio, stock, categoría, marca/atributo, imágenes (URLs), slug, descripción. ¿23 productos actuales o catálogo completo real?
2. Checkout: ¿invitado + WhatsApp para coordinar pago/envío en esta fase (sin pasarela ni SUNAT)? ¿Costo de envío: gratis/plano o por distrito?
3. Comprobante: ¿boleta/factura solo como dato (sin SUNAT) por ahora?
4. Asesores: ¿cuántos y por área (Ventas/Servicios/Tienda/Partners)? ¿Vinculamos cada asesor a un usuario del dashboard o solo perfiles del widget?
5. Tasa USD→PEN: ¿fija configurable en dashboard o API diaria?
