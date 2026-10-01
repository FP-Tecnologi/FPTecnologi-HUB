-- Artículos de ejemplo para el blog (6, publicados, con portada).
--
-- Cómo usarlo: pegar y ejecutar en el SQL Editor de Supabase (o con psql).
-- Es idempotente: si el slug ya existe en la marca, no lo duplica ni lo pisa.
--
-- Marca: toma la primera cuyo nombre contenga "fptecnologi". Si tu marca se
-- llama distinto, cambia el ILIKE de la primera línea del WITH.
-- Portadas: fotos del sitio (public/images/solutions) por ruta relativa; el
-- dashboard y la web las resuelven. Se pueden reemplazar editando cada
-- artículo en Dashboard → Blogs → Lista de blogs.

WITH m AS (
  SELECT id FROM "Marca" WHERE nombre ILIKE '%fptecnologi%' ORDER BY "createdAt" LIMIT 1
)
INSERT INTO "BlogArticulo"
  ("id","marcaId","titulo","slug","resumen","contenido","portadaUrl","categoria","etiquetas","autorNombre","estado","destacado","publicadoEn","creadoPor","updatedAt")
SELECT gen_random_uuid()::text, m.id, v.titulo, v.slug, v.resumen, v.contenido, v.portada, v.categoria, v.etiquetas,
       'Equipo FPTecnologi', 'PUBLICADO', v.destacado, now() - v.hace, 'seed', now()
FROM m,
(VALUES
(
  'Cómo elegir un servidor para tu empresa: guía en 5 pasos',
  'como-elegir-un-servidor-para-tu-empresa',
  'Qué revisar antes de comprar: carga de trabajo, crecimiento, redundancia, soporte y presupuesto total.',
  $md$Elegir un servidor no es solo comparar procesadores. Un buen punto de partida es entender qué va a correr en él y cómo va a crecer tu empresa.

## 1. Define la carga de trabajo

¿Será un servidor de archivos, de aplicaciones, de base de datos o de virtualización? Cada uso pide un equilibrio distinto entre **procesador, memoria y almacenamiento**.

## 2. Piensa en el crecimiento

Calcula cuántos usuarios y cuántos datos tendrás en los próximos años. Es más barato dejar espacio para ampliar memoria y discos que reemplazar el equipo antes de tiempo.

## 3. Prioriza la disponibilidad

Si una caída detiene tu operación, considera:

- Fuentes de poder redundantes.
- Discos en arreglo RAID.
- Respaldo en otra ubicación.

## 4. Revisa soporte y garantía

Un equipo con **garantía oficial y soporte local** reduce los tiempos de parada cuando algo falla.

## 5. Mira el costo total

El precio de compra es solo una parte: suma instalación, licencias, energía y mantenimiento.

> Si tienes dudas, un especialista puede dimensionar el servidor según tu operación, sin compromiso.

¿Quieres una recomendación a medida? [Solicita tu cotización](/cotizador).$md$,
  '/images/solutions/servidores.jpg', 'Servidores', ARRAY['servidores','infraestructura','guía'], true, interval '1 day'
),
(
  'Videovigilancia para empresas: qué debe tener un buen sistema',
  'videovigilancia-para-empresas',
  'Resolución, cobertura, almacenamiento y acceso remoto: los puntos clave para proteger tus instalaciones.',
  $md$Un sistema de videovigilancia eficaz va más allá de instalar cámaras. Se diseña según lo que necesitas proteger.

## Cobertura antes que cantidad

Más cámaras no siempre es mejor. Lo importante es cubrir **accesos, zonas críticas y puntos ciegos** con el ángulo y la resolución adecuados.

## Qué revisar al elegir

- **Resolución:** suficiente para identificar personas y placas donde lo necesites.
- **Visión nocturna:** indispensable en exteriores y almacenes.
- **Almacenamiento:** calcula los días de grabación que quieres conservar.
- **Acceso remoto:** ver las cámaras desde el celular o la computadora.

## Integración con control de accesos

Cuando la videovigilancia se conecta con **control de accesos y alarmas**, cada evento queda registrado con imagen, hora y persona.

## Mantenimiento

Revisa periódicamente el enfoque, la limpieza de los lentes y el estado del almacenamiento: una cámara que no graba no protege.

Si quieres evaluar tu local, [pide una cotización](/cotizador) y te visitamos para diseñar la solución.$md$,
  '/images/solutions/seguridad.jpg', 'Seguridad', ARRAY['videovigilancia','cámaras','seguridad'], false, interval '3 days'
),
(
  'Salas de videoconferencia: reuniones sin fricción',
  'salas-de-videoconferencia-reuniones-sin-friccion',
  'Cámara, audio y pantalla trabajando juntos: cómo equipar una sala para que la reunión empiece en segundos.',
  $md$Una buena sala de videoconferencia se nota cuando nadie tiene que pelear con los cables ni repetir "¿me escuchan?".

## Los tres elementos clave

1. **Cámara** con un campo de visión que abarque a todos los participantes.
2. **Audio** con micrófonos que capten a toda la sala y parlantes claros.
3. **Pantalla** del tamaño adecuado para el espacio.

## Compatibilidad

Elige equipos compatibles con las plataformas que ya usas, como Teams, Zoom o Google Meet, para evitar adaptadores y configuraciones complicadas.

## El detalle que más importa: el audio

Una imagen mediocre se tolera; un audio con eco o cortes **arruina la reunión**. Considera el tamaño de la sala y su acústica al elegir micrófonos.

## Un solo botón

Lo ideal es que iniciar una reunión sea tan simple como pulsar un botón en un panel de control.

¿Estás armando una sala nueva? [Cuéntanos qué necesitas](/cotizador).$md$,
  '/images/solutions/videoconferencia.jpg', 'Videoconferencia', ARRAY['videoconferencia','salas','reuniones'], false, interval '6 days'
),
(
  'Respaldo de datos: la regla 3-2-1 explicada',
  'respaldo-de-datos-la-regla-3-2-1',
  'Una práctica simple para no perder información: tres copias, dos medios distintos y una fuera de la empresa.',
  $md$La información de tu empresa es uno de sus activos más valiosos. La regla **3-2-1** es una forma sencilla de protegerla.

## ¿En qué consiste?

- **3** copias de tus datos (la original y dos respaldos).
- **2** tipos de medio distintos, por ejemplo disco local y almacenamiento en red.
- **1** copia fuera de la empresa, en la nube o en otra sede.

## Por qué funciona

Cubre los escenarios más comunes: falla de un disco, error humano, robo, incendio o ataque de ransomware.

## Errores frecuentes

- Hacer respaldos pero **nunca probar la restauración**.
- Guardar la copia en el mismo equipo que los datos originales.
- No automatizar: los respaldos manuales se olvidan.

## Define qué es crítico

No todo necesita el mismo nivel de protección. Identifica los datos sin los cuales tu operación se detiene y empieza por ellos.

Podemos ayudarte a diseñar un plan de respaldo a tu medida: [solicita una cotización](/cotizador).$md$,
  '/images/solutions/datos-empresariales.jpg', 'Datos', ARRAY['respaldo','datos','continuidad'], false, interval '9 days'
),
(
  'Migrar a la nube: por dónde empezar',
  'migrar-a-la-nube-por-donde-empezar',
  'Un enfoque ordenado para llevar aplicaciones y datos a la nube sin interrumpir tu operación.',
  $md$Migrar a la nube puede darte flexibilidad y reducir la carga de administrar infraestructura propia, pero conviene hacerlo con un plan.

## 1. Haz un inventario

Lista tus aplicaciones, servidores y datos. Identifica cuáles dependen unos de otros.

## 2. Decide qué migrar primero

Empieza por cargas **de bajo riesgo** para ganar experiencia antes de mover los sistemas críticos.

## 3. Elige el modelo adecuado

No todo tiene que ir a la nube pública. Algunas empresas combinan nube y servidores locales en un esquema **híbrido**.

## 4. Cuida la seguridad y los accesos

Define quién puede acceder a qué, activa la autenticación de dos factores y mantén respaldos.

## 5. Planifica la transición

Programa la migración fuera de horas pico y prepara un plan para volver atrás si algo no sale como esperabas.

Si quieres evaluar tu caso, [conversemos](/cotizador).$md$,
  '/images/solutions/cloud.jpg', 'Cloud', ARRAY['cloud','migración','infraestructura'], false, interval '12 days'
),
(
  'Conectividad en hoteles y restaurantes: lo que tus clientes notan',
  'conectividad-en-hoteles-y-restaurantes',
  'Wi-Fi estable, TV y sistemas de gestión conectados: la tecnología que mejora la experiencia de tus huéspedes.',
  $md$En hotelería y gastronomía, la tecnología se nota cuando falla. Un Wi-Fi lento o un sistema de pedidos caído afecta directamente la experiencia.

## Wi-Fi que cubra todo el local

Diseña la red según los espacios: habitaciones, salones, terrazas y cocina. Varios puntos de acceso bien ubicados rinden más que un solo equipo potente.

## Separa las redes

Mantén una red para **huéspedes y clientes** y otra para los **sistemas internos** (caja, reservas, cámaras).

## Sistemas de gestión

Un buen sistema de reservas y de punto de venta, conectado a una red estable, agiliza la atención y reduce errores.

## Entretenimiento y señalización

TV, pantallas informativas y audio ambiental bien integrados completan la experiencia.

## Soporte cercano

Cuando el servicio no puede detenerse, contar con **soporte técnico local** marca la diferencia.

¿Quieres renovar la tecnología de tu local? [Cotiza sin compromiso](/cotizador).$md$,
  '/images/solutions/hoteles.jpg', 'Hotelería', ARRAY['wifi','hoteles','restaurantes'], false, interval '15 days'
)
) AS v(titulo, slug, resumen, contenido, portada, categoria, etiquetas, destacado, hace)
ON CONFLICT ("marcaId","slug") DO NOTHING;
