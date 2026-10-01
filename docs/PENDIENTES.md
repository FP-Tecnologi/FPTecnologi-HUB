# Pendientes del proyecto (para quien continúe)

> Lista consolidada al **2026-10-01** de lo que falta o quedó a medias. Es la
> lista de trabajo; el historial de lo hecho está en
> [`ESTADO-ACTUAL.md`](ESTADO-ACTUAL.md) y el plan por fases en
> [`../tasks/plan.md`](../tasks/plan.md). Ordenado por prioridad dentro de cada
> bloque. Nada de esto está empezado salvo que se indique.

## Qué ya está hecho (resumen)

Cotizador (formulario público, leads, CMS) · sección de contacto · navegación ·
boletín (captura de correos) · blog con 6 artículos de ejemplo · API de
ecommerce (catálogo público, checkout invitado, importador WooCommerce) ·
42 productos importados · **tienda real** (`/tienda`, ficha, `/marcas`) ·
**checkout** (`/checkout`, `/checkout/gracias`) · dashboard de **Pedidos** y
**Productos**. Todo en `main`, `develop` y la rama de trabajo.

---

## 1. Envío con Shalom

**Pedido del dueño:** conectar con una API de **Shalom** para que calcule o
verifique las **sedes disponibles** y el **costo del envío**, mostrarlo en el
checkout y **sumarlo al total**.

**Estado:** sin empezar. Hoy el envío es "a coordinar por WhatsApp": el checkout
ofrece *recojo en tienda* o *envío a domicilio (costo a coordinar)*, el total
**no** incluye envío y `Pedido.envio` se guarda siempre en `0`
(`apps/api/src/pedidos/pedidos.service.ts`, `crearPublico`).

**Lo primero que hay que resolver (bloqueante):**
- No se verificó que Shalom ofrezca una **API pública**. Hay que preguntarle a
  Shalom (área comercial / convenio corporativo) si existe API o servicio de
  cotización, y obtener: documentación, credenciales (token/usuario), ambiente
  de pruebas, límites de uso y costo. **No inventar** tarifas ni endpoints.
- Si no hay API: alternativa = **tabla de tarifas** propia (origen Lima → destino
  por sede/departamento, por rango de peso/volumen) cargada en el dashboard y
  actualizada a mano. El resto del diseño sirve igual.
- Datos que hay que tener por producto para cotizar: **peso y dimensiones**.
  Hoy `Producto` no los tiene (el CSV de WooCommerce trae `Peso (kg)`,
  `Longitud/Anchura/Altura (cm)`, pero el importador los ignora).

**Diseño propuesto (a validar):**
1. API: interfaz `EnvioProvider` (`cotizar({ destino, items })` → `{ sedes, costo, moneda, plazo }`) con una
   implementación `ShalomProvider` (o `TarifarioProvider` si no hay API). Credenciales **solo** en `.env`
   (nunca en el código ni en `.env.example`).
2. Endpoint público `GET /public/envios/sedes?departamento=` y `POST /public/envios/cotizar`
   (marcaId por query, honeypot/tope por IP como los demás públicos, caché corto).
3. Checkout (`apps/web-fptecnologi/src/components/tienda/CheckoutForm.tsx`): en "Entrega", al elegir envío,
   elegir departamento/provincia/distrito → sede Shalom → mostrar costo y plazo; la fila **Envío** del
   resumen pasa de "A coordinar" al monto real y el **Total lo incluye**.
4. `POST /public/pedidos`: el servidor **vuelve a cotizar** el envío (nunca confiar en el costo que mande el
   cliente), lo suma a `total` y lo guarda en `Pedido.envio`. Guardar también la sede elegida (campos nuevos
   en `Pedido`, p. ej. `envioProveedor`, `envioSedeId`, `envioSedeNombre`, `envioPlazo`) en lugar de las notas.
5. Dashboard (Ecommerce → Pedidos): mostrar sede, costo y permitir registrar el código de seguimiento.
6. IGV: decidir si el envío lleva IGV o va aparte (hoy el IGV 18 % se calcula solo sobre el subtotal).
7. Fallback: si Shalom no responde, permitir "envío a coordinar" como hoy, sin bloquear la compra.

**Preguntas abiertas para el dueño:** ¿convenio corporativo con Shalom (tarifa especial)? ¿solo Shalom o
también otros courier? ¿envío gratis sobre cierto monto? ¿recojo en tienda sigue siendo gratis? ¿cobertura
solo a sedes Shalom o también domicilio?

---

## 2. Pendientes de código (por área)

### Tienda / checkout / pedidos
- **Correlativo de pedido** (`FP-AAAA-XXXXXX`) es **aleatorio**, no secuencial; reintenta si choca. Pasar a un
  correlativo real por marca y año si se necesita para contabilidad.
- **Comprobante (boleta/factura), razón social y tipo de entrega** viajan en `Pedido.notas`. Moverlos a
  columnas propias (`comprobante`, `razonSocial`, `entrega`) para poder filtrarlos y facturar.
- **Pago**: no hay pasarela ni SUNAT (fuera de alcance por ahora); el pago se confirma por WhatsApp.
- ~~**Home y chat con productos fijos**~~ **Hecho 2026-10-01**: el home muestra los productos marcados como
  destacados en la API (si no hay ninguno marcado, los primeros del catálogo; sin API, los fijos) y el asistente
  virtual arma su conocimiento con `lib/chatConocimiento.ts` (ver ESTADO-ACTUAL). Falta **marcar destacados** en el
  dashboard (hoy solo se marcan al importar desde WooCommerce).
- **Fotos de productos**: se sirven desde `fptecnologi.com/wp-content/uploads` (hotlink al WordPress viejo). Si
  ese sitio se apaga se pierden. Subirlas a Storage (Supabase) y guardar la URL nueva.
- **Subida de imágenes** en el dashboard de Productos: hoy se pegan URLs.
- **Dashboard → Ecommerce → Clientes** sigue siendo un placeholder (hay que decidir qué es "cliente": compradores
  invitados agrupados por correo/documento).
- `igvUnitario` guarda ruido de coma flotante (ej. `539.8200000000001`): redondear al guardar.
- **Importador WooCommerce**: sin inventario en el CSV, crea **stock 100 de prueba**; ignora peso/dimensiones;
  "Proyectores" y "Pantallas interactivas" quedan en una sola categoría (la web tenía "Pantallas" aparte).
- Notificación de pedido nuevo: agregar enlace directo al pedido en el dashboard (`/ecommerce/pedidos?id=`).

### Asesores, equipo y seguridad (Fase 3 del plan — sin empezar)
- **T3.1** (redefinida 2026-10-01 por el dueño): las fotos de los asesores **se quedan como están por ahora**; más
  adelante cada asesor tendrá su **perfil** (`Usuario.avatarUrl`) y desde ahí gestionará su foto. Eso implica vincular
  `ChatAsesor.usuarioId?` (opcional) para que el widget tome nombre y foto del perfil. Sin empezar. Siguen los teléfonos
  provisionales `999 999 999` (`WHATSAPP_AREAS` en `content.ts`).
- ~~**T3.2**~~ **Hecho 2026-10-01**: `Team.tsx` real (lista de la marca activa, alta de miembro, quitar rol, buscar/filtrar,
  desbloqueo 2FA) y `nav-manifest.json` alineado con los `@Roles` de la API (Blogs y Web informativa → `marketing`,
  grupo Cotizador → `comercial`/`marketing`; `admin` pasa siempre). Además (misma fecha, versión final): editar rol, desactivar, invitaciones por correo y clientes de las webs.
- ~~**T3.3**~~ **Hecho 2026-10-01**: `app/api/contacto/route.ts` ya no trae la clave escrita; usa
  `LEADS_SUPABASE_URL`/`LEADS_SUPABASE_ANON_KEY` (solo servidor) y responde 503 si faltan. Se quitó la llamada muerta a
  `/cotizaciones` (exige JWT). **Clave `anon` antigua rotada (confirmado por el dueño 2026-10-01).** Falta cargar las variables `LEADS_SUPABASE_*` en el hosting.
- ~~**`sitios`**~~ **Hecho 2026-10-01**: el controller solo exigía JWT (cualquier usuario podía crear/borrar sitios de
  cualquier marca) y `remove`/`findAll`/`resolver` habrían fallado con el tenant-guard. Ahora `MarcaRolGuard` + `admin`
  para crear/borrar, todo con `marcaId` del servidor (el DTO ya no lo acepta) y el tenant-guard permite
  el lookup por `dominio` (único global) para `resolver`.
- Posible: `Cotizacion` (por servicio) y `LeadCotizador` conviven; definir si se unifican.

### Cotizador, contacto y boletín
- **Fase 4**: traer el copy útil de la landing `https://fptecnologi.com/landing-cotiza-tu-tiempo/` al CMS
  (`proceso`/`faq`/beneficios). No se pudo leer desde el entorno de desarrollo: pegar el texto o abrirla a mano.
- **Boletín**: solo **captura** correos. Falta **enlace de baja** (hoy el pie no lo promete) y **envío de campañas**.
- **Leads del cotizador**: asignar un lead a un comercial; sincronizar con el repo `centralizacion-leads`
  (ver `AGENTS.md`).
- Sección Contacto/home: ya pide nombre, correo, teléfono, empresa y mensaje por `/api/contacto` (ver T3.3).

### Blog y SEO (Fase 5 — sin empezar)
- Subir portada desde el dashboard (hoy URL), `generateMetadata` con OG/Twitter/canonical por artículo,
  JSON-LD `Article`, **sitemap** (`sitemap.xml`) y `robots`, programar publicación.
- ~~Chat con IA: rate limit~~ **Hecho**: 30 mensajes / 10 min por IP, en memoria (mover a Redis si hay varias instancias).
- Reemplazar datos de ejemplo por reales: `CONTACT_INFO`, fotos y teléfonos de asesores, proyectos y clientes
  (marcados "de ejemplo" en `src/lib/*.ts`).
- Verificar el texto del CTA del blog/ficha ("Visita técnica sin costo"): es un compromiso comercial que debe
  confirmar el dueño.

### Calidad / infraestructura
- **Lint de `web-fptecnologi` no corre**: `typescript-eslint` no soporta TypeScript 7 (fijar TS 6 o actualizar).
- **Rate limiting global** deshabilitado (`@nestjs/throttler` comentado): hoy cada endpoint público tiene su
  propio tope en memoria (cotizador, boletín, pedidos), que se reinicia con cada despliegue y no se comparte
  entre instancias. Si hay más de una instancia, mover a Redis/throttler.
- **Pooler de Supabase (:6543)**: `migrate deploy`/`resolve` y `$transaction` interactiva se cuelgan; ver
  `apps/api/prisma/apply-migrations.ts` y `mark-resolved.ts`.
- Ramas: se integró `claude/modest-bohr` (servicios/proyectos/clientes en BD, asistente, seguridad) y se limpiaron las ramas de leads y dependabot (2026-10-01). Solo `main` (producción) y `develop` (trabajo).
- Activar en GitHub (requiere admin): Dependabot alerts, secret scanning + push protection y branch protection
  en `main` (ver `SECURITY.md`).
- Infra externa (Cloudflare, Hostinger, Sentry): fuera del alcance de un agente de código.

---

## 3. Pendientes de datos y decisiones (no son código)

**En la base de datos (Supabase):**
- [ ] Confirmar que se aplicó el seed del blog `apps/api/prisma/seeds/blog-ejemplo.sql` (6 artículos).
- [ ] **Ajustar el stock real** de los 42 productos (hoy 100 de prueba en 33 productos).
- [ ] **Activar o corregir 7 productos inactivos**: 4 con `Publicado=-1` (`IFP7533-G -WR`, `IFP8633-G-WR`,
      `21MS00CELM`, `21MS00CDLM`), 1 con estado 2 (`T360ANH1Y24V1`) y 2 **sin precio** (`LH55QMCEBGCXGO` y el de
      SKU triple `10010730 / 10010731 / 10010732`, que conviene partir en SKUs separados).
- [ ] Confirmar que los precios del CSV están en **USD sin IGV**.
- [ ] Crear/revisar los **roles** que usa el código: `admin`, `ventas`, `marketing`, `comercial`, `asesores`.
- [ ] Revisar que los 42 productos tengan **marca** (se tomó del atributo "Marca") y foto.

**Decisiones del dueño (de `tasks/plan.md`):**
1. Envío: ver sección 1 (Shalom) — costo, convenio, envío gratis sobre un monto.
2. Comprobante: ¿boleta/factura **solo como dato** (como ahora) o emisión real con SUNAT más adelante?
3. Asesores: ¿cuántos y de qué áreas (Ventas / Servicios / Tienda / Partners)? ¿Se vinculan a un usuario del
   dashboard o solo son perfiles del widget?
4. Tipo de cambio USD→PEN: hoy es una variable de entorno (`TIPO_CAMBIO_USD_PEN`, por defecto 3.75). ¿Fija editable
   desde el dashboard o desde una API diaria?
5. Categorías: ¿"Proyectores" y "Pantallas interactivas" separadas?
6. **Textos legales** (`apps/web-fptecnologi/src/lib/legal.ts`) son un **borrador**: revisarlos con un asesor
   legal y completar razón social y RUC. Decidir si faltan páginas (política de **cookies**, **envíos y
   entregas**); hoy hay 4: privacidad, términos, cambios y devoluciones, libro de reclamaciones.
7. Nombre de la marca en productos sin marca comercial (hoy se muestra "FPTecnologi").

**Variables de entorno a configurar** (nunca en el repo):
- `apps/web-fptecnologi/.env.local`: `HUB_API_URL`, `HUB_MARCA_ID` (obligatorio para blog, cotizador, boletín,
  tienda y checkout), `DASHBOARD_ORIGIN`, `TIPO_CAMBIO_USD_PEN` (opcional).
- `apps/web/.env.local`: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_WEB_PUBLICA_URL`.
- Cuando se integre Shalom: sus credenciales solo en el `.env` de `apps/api`.

---

## 4. Cómo continuar

1. `git pull origin main`, instalar dependencias en `apps/api`, `apps/web` y `apps/web-fptecnologi`
   (no hay workspace raíz) y `cd apps/api && npx prisma generate`.
2. Orden sugerido: **T3.3** (seguridad) → **Envío Shalom** (primero resolver la sección 1) → **T3.1/T3.2** →
   conectar home y chat al catálogo real → **Fase 5** (SEO/blog).
3. Cada cambio: tests de la API (`npm test`), `npx tsc --noEmit` en las webs, y actualizar
   [`ESTADO-ACTUAL.md`](ESTADO-ACTUAL.md) y este archivo (tachar lo hecho).
4. Reglas del repo en [`../AGENTS.md`](../AGENTS.md): `marcaId` siempre del servidor, nunca del cliente.

### Usuarios, invitaciones y 2FA (hecho 2026-10-01; queda)
- **Asignar un miembro como asesor del chat** (`ChatAsesor`: área, WhatsApp, foto) al invitarlo o desde la tabla de Usuarios — pendiente de definir con el dueño.
- Invitación: hoy solo roles de equipo (no `cliente`). Falta cambiar de marca varios roles a la vez y auditar quién invitó a quién (`Invitacion` no guarda `invitadoPorId`).
- `POST /auth/otp/request` y `/auth/otp/verify` no exigen la contraseña; con la opción "código por correo" del login TOTP, quien tenga el correo evita la app. Evaluar atar el OTP a un paso de contraseña ya validado.
- Probar de punta a punta con un admin real: invitar → correo → aceptar → entrar → cambiar rol/desactivar/quitar (solo se verificó la página de aceptación con token inválido y los tests de servicio).


## 5. Servicios: qué falta (revisión 2026-10-01)

## 5. Servicios, proyectos y clientes en la base de datos (2026-10-01)

**Hecho (código):** los servicios (con el contenido completo de su página), los proyectos y los clientes ya viven en la
base de datos y se gestionan desde el dashboard (**Soluciones → Servicios**, **Web informativa → Proyectos** y
**→ Clientes**). La web (menú, home, `/servicios`, `/servicios/[slug]`, cotizador, `/proyectos`, Nosotros), el cotizador
y el asistente virtual los leen de la API; si la API no responde, la web usa el contenido local de respaldo.
Se agregaron 4 servicios: soporte técnico y postventa, redes y cableado estructurado, ciberseguridad y licenciamiento de software.

**Para activarlo en Supabase (hacerlo en este orden, antes de desplegar la web nueva):**
1. Aplicar la migración `apps/api/prisma/migrations/20261001200000_servicios_proyectos_clientes/migration.sql`
   (SQL Editor de Supabase o `apply-migrations.ts`; es idempotente).
2. Ejecutar `apps/api/prisma/seeds/servicios-proyectos-clientes.sql` (12 servicios, 12 proyectos, 20 clientes; idempotente,
   no pisa lo que ya editaste).
3. Desplegar API y web. (Si la web se despliega antes del seed, muestra el contenido local de respaldo.)

**A revisar por el negocio:**
- Los **4 servicios nuevos son un borrador de texto** (redactados por nosotros); ajustarlos o desactivarlos desde el dashboard.
  "Visita técnica sin costo" y los plazos son un compromiso comercial a confirmar.
- **Proyectos y clientes siguen siendo de muestra** (`esEjemplo = true`): reemplazarlos por los reales y desmarcar
  "dato de muestra" para que el asistente virtual los pueda citar. Las fotos de servicios y proyectos son de stock.
- **Servicios sin productos en la tienda**: la tienda solo tiene 5 de las 13 marcas distribuidas (ASUS, Dell, HP, LG,
  Lenovo); seguridad (ZKTeco), videoconferencia (Shure, Nureva, ScreenBeam) o ciberseguridad (Sophos) no tienen producto.
- Sin precios "desde" ni plazos por servicio (el campo "Desde (USD)" existe pero está vacío).
- Falta subir imágenes desde el dashboard (hoy se pega la URL o la ruta de la imagen).
