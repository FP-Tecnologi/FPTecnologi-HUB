# Diagramas de arquitectura

Generados con [Archify](https://github.com/tt-a1i/archify) a partir del código (commit `f0801a98`). Ábrelos en un navegador.

- [`arquitectura-hub.html`](arquitectura-hub.html) — visión general: 5 webs públicas, dashboard admin, API NestJS, Supabase, correo y archivos.
- [`flujo-contenido.html`](flujo-contenido.html) — cómo llega un cambio guardado en el admin hasta la web (hasta 30 s).

Los `.fuente.json` son las descripciones de origen: para regenerar o editar un diagrama, instala Archify y pásale ese archivo (`finalize`). Cada componente cita el archivo y las líneas del código en las que se basa, así que pueden quedar desactualizados si el código cambia.
