# Plan — CRM comercial, tickets para Quamtu y Kelqa, y web de Kelqa (2026-10-27)

Pedido: (1) CRM para el equipo comercial (prospectos, empresas, oportunidades por marca y comercial, actividades,
etapas, historial y reportes de ventas) sin duplicar los leads del cotizador, las cotizaciones ni los contactos web;
(2) tickets de clientes para **Quamtu** y **Kelqa** como fptecnologi.com/tickets, que lleguen al correo designado de
cada marca y al módulo Tickets del dashboard, visible solo para los roles autorizados y respetando la marca.

Decisiones del usuario (2026-10-27):
- Kelqa: **crear su web en el HUB** (`apps/kelqa-web`, como Fimav/Quamtu, con repo espejo).
- CRM: **automático y enlazado** — cada solicitud nueva crea o reutiliza el prospecto y abre una oportunidad enlazada
  al registro original; las bandejas actuales (Leads, Cotizaciones, Contactos) siguen igual.
- Tickets de Quamtu y Kelqa: **solo rol Admin** de esa marca.

## Lo que ya existe (y se reutiliza)

- **Tickets** (`apps/api/src/tickets`, modelo `Ticket` + `TicketMensaje`): ya es multi-marca. Formulario público
  `POST /public/tickets?marcaId`, seguimiento y respuesta del cliente, evidencias privadas por marca, bandeja
  `Web → Tickets` (`WebTickets.tsx`, roles admin/comercial), avisos por correo a los usuarios admin/comercial de la
  marca. Falta: correo **designado** por marca, enlace de seguimiento a la web **de cada marca** (hoy siempre
  fptecnologi.com), roles por marca y que Quamtu/Kelqa vean el módulo en el menú.
- **Leads** (`LeadCotizador`), **Cotizaciones** (`Cotizacion`), **Contactos web** (`ContactoWeb`), **Presupuestos**:
  cada uno con su bandeja y estado propio. El CRM no los copia: los **enlaza** (`origen` + `origenId`).

## Fase 1 — Tickets por marca (Quamtu y Kelqa)

API
- `Marca.correoTickets` (nuevo, opcional; editable en Administración → Marcas). Cada ticket nuevo y cada respuesta
  del cliente avisa a ese correo (si falta, a `contactoEmail`), además de las notificaciones internas.
- Enlace de seguimiento al dominio principal de la marca (primer `Sitio`), con `WEB_PUBLICA_URL` de respaldo.
- Roles por marca: FPTecnologi `admin` + `comercial` (como hoy); Quamtu y Kelqa solo `admin`. Mismo mapa en la API
  (guard + avisos) y en el menú del dashboard (`rolesPorMarca` en el manifiesto).

Dashboard
- `web.tickets` visible para Quamtu y Kelqa (`MODULOS_POR_MARCA`), solo para su rol autorizado.
- Administración → Marcas: campo «Correo para tickets».

Webs
- Quamtu: `/tickets` y `/tickets/seguimiento` (formulario, evidencias, seguimiento y respuesta), proxies
  `/api/hub/tickets*` y `/api/hub/evidencia`, con la identidad de Quamtu. Enlace en el pie.
- Kelqa: igual, dentro de su web nueva (Fase 3).

## Fase 2 — CRM comercial

Modelos (todos con `marcaId` y en el tenant-guard)
- `CrmEmpresa`: razón social, RUC (único por marca si existe), rubro, web, teléfono, dirección, notas.
- `CrmContacto`: nombre, cargo, correo (único por marca si existe), celular, documento, empresa opcional.
- `CrmOportunidad`: número `OPP-AAAA-XXXXXX`, título, empresa/contacto, **etapa** (`NUEVO → CONTACTADO →
  PROPUESTA → NEGOCIACION → GANADO | PERDIDO`), monto estimado y moneda, probabilidad, cierre estimado,
  **comercial asignado** (usuario con rol en la marca), origen (`MANUAL | COTIZADOR | COTIZACION | CONTACTO_WEB |
  PRESUPUESTO`) + `origenId`, próxima acción y fecha, motivo de pérdida, fechas de ganado/cerrado.
- `CrmActividad`: llamada, reunión, nota, correo, WhatsApp, tarea (con vencimiento y hecho) y cambios de etapa
  automáticos; autor y fecha. Es el historial de la oportunidad.

Entrada automática (sin duplicar)
- Al crear un lead del cotizador, una cotización o un contacto web (no los reclamos): se busca el contacto por correo
  (y la empresa por RUC); si no existe se crea. Si ese contacto ya tiene una oportunidad **abierta**, se le agrega
  una actividad «Nueva solicitud desde …» con enlace; si no, se abre una oportunidad en `NUEVO` enlazada al
  registro original. Nunca rompe el formulario público (errores solo al log).
- Botón «Ver en CRM» en Leads, Cotizaciones y Contactos; en la oportunidad, «Ver solicitud original».

API (`/crm/*`, `MarcaRolGuard`, roles `admin` + `comercial`; comercial ve todo lo de su marca y filtra «mías»)
- CRUD de empresas, contactos y oportunidades; `PATCH /crm/oportunidades/:id/etapa` (registra la actividad);
  actividades; `GET /crm/agenda` (próximas acciones y tareas vencidas); `GET /crm/reportes` (embudo por etapa,
  ganado por mes, por comercial y por origen, tasa de conversión, tiempo medio de cierre).

Dashboard (sección de marca «CRM»)
- Embudo (tablero por etapas, arrastrar para mover), Oportunidades (lista con filtros: etapa, comercial, origen,
  fechas), ficha de oportunidad (datos, actividades, próxima acción, solicitud original), Empresas y contactos,
  Agenda, Reportes. Tarjetas del CRM en el dashboard de la marca. Herramienta `buscar_oportunidades` del asistente.
- Disponible en todas las marcas (se agrega a `MODULOS_POR_MARCA` de Fimav y Quamtu).

## Fase 3 — Web de Kelqa (`apps/kelqa-web`)

- Next 16 como Fimav/Quamtu (puerto 3007), CMS desde el dashboard, cabeceras de seguridad, contador de visitas,
  libro de reclamaciones, contacto y **tickets**. Repo espejo `FP-Tecnologi/kelqa-web` (lo crea el usuario).
- **Necesita del usuario**: logo, colores, textos (qué vende Kelqa, servicios/productos), datos de contacto,
  dominio y redes. Mientras tanto se arma con la marca de la base (`Marca.logo`, colores) y textos editables.

## Verificación por fase

API: tsc, tests nuevos (tenant-guard, roles por marca, entrada automática sin duplicados, reportes), build. Dashboard
y webs: tipos + build y prueba en navegador (formulario → correo/aviso → bandeja → respuesta → seguimiento; CRM:
lead del cotizador → oportunidad → etapas → reporte). Migraciones con SQL idempotente para Supabase.
