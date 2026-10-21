# Libro de Reclamaciones virtual (HUB, 3 webs) — diseño

Fecha: 2026-10-21 · Aprobado por el usuario en el chat. Alcance de esta entrega: **API + formulario de Fimav**. Después: dashboard, y las webs de FPTecnologi y Quamtu.

## Objetivo
Libro de Reclamaciones virtual completo y funcional, conforme a la normativa peruana, reutilizable por todas las marcas: cada web lo muestra con sus datos de proveedor y su estilo; la API es única (multi-marca por `marcaId`).

## Marco legal (a validar por el responsable legal de cada marca)
- Ley 29571 (Código de Protección y Defensa del Consumidor), Reglamento del Libro de Reclamaciones (DS 011-2011-PCM) modificado por DS 101-2022-PCM / Ley 31435.
- Plazo de respuesta: **15 días hábiles, improrrogables**, por correo o carta según elija el consumidor. No se puede condicionar la atención a un pago.
- Hoja con: n.° correlativo, fecha, datos del proveedor (razón social, RUC, nombre comercial, dirección), consumidor (nombres, documento, domicilio, teléfono, correo; si es menor, datos del padre/madre/apoderado), bien contratado (producto/servicio, monto reclamado, descripción, n.° de pedido o comprobante), reclamo o queja, detalle, pedido del consumidor, observaciones/respuesta del proveedor.
- Copia de la hoja al correo del consumidor; el proveedor la conserva. Acceso visible al libro desde el inicio de la web.
- La presentación del reclamo no impide acudir a Indecopi.

## API (`apps/api`, módulo `libro-reclamaciones`)
- Modelo `HojaReclamacion` (tenant: `marcaId`, entra en `TENANT_MODELS`): correlativo por marca y año (`codigo` = `LR-0001-2026`, único por marca+año), `fecha`, datos del consumidor/bien/detalle, `medioRespuesta` (CORREO|CARTA), `estado` (RECIBIDO|EN_PROCESO|RESPONDIDO), `fechaLimite` (+15 días hábiles, sábados y domingos excluidos; feriados no — límite conocido), `respuesta`, `respondidoAt`, `respondidoPor`.
- `Marca` gana `razonSocial`, `ruc`, `direccionFiscal` (opcionales) para imprimir los datos del proveedor.
- Público (sin login, `@Public`, `marcaId` por query; tope por IP + honeypot, como el cotizador):
  - `POST /public/libro-reclamaciones` → guarda, envía copia al consumidor y aviso al equipo; responde `{ ok, codigo, fecha, fechaLimite }`.
  - `GET /public/libro-reclamaciones/consulta?codigo&documento` → estado, fecha límite y respuesta (solo si el documento coincide).
  - `GET /public/libro-reclamaciones/proveedor` → razón social, RUC, nombre comercial, dirección y correo de la marca.
- Dashboard (`MarcaRolGuard`, roles admin y comercial): listar (filtro por estado/vencidos), ver, y `PATCH /:id/responder` (guarda la respuesta, marca RESPONDIDO y envía el correo al consumidor). La pantalla del dashboard es la fase siguiente.
- Correos: copia al consumidor (hoja completa), aviso al equipo, respuesta al consumidor. Un fallo de correo no impide registrar la hoja.
- La migración se escribe y se prueba con mocks; **no se aplica a la base real** sin confirmación del usuario (puerto 5432).

## Web (`apps/fimav-web`)
- `/libro-de-reclamaciones`: formulario en 3 bloques (consumidor, bien contratado, detalle y pedido) + aceptación, con menor de edad opcional, medio de respuesta y confirmación con código, fecha límite y botón de imprimir/guardar PDF. Bloque "Consulta el estado de tu reclamo". Datos del proveedor tomados de la API (con respaldo local).
- Proxies `/api/hub/libro-reclamaciones[/consulta]` con `HUB_MARCA_ID` en el servidor (mismo patrón que el cotizador).
- Acceso visible "Libro de Reclamaciones" en el pie (y en el inicio). `/legal/reclamaciones` redirige al formulario. Texto legal con el plazo correcto (15 días hábiles).
- Estilo propio de Fimav (rojo, carbón, plata; solo modo claro; accesible).

## Fuera de alcance (ahora)
Pantalla del dashboard, webs de FPTecnologi y Quamtu, PDF generado en servidor, subida de evidencias, firma digital, feriados nacionales.
