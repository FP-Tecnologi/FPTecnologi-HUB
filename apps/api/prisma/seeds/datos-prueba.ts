/**
 * Datos de PRUEBA para ver el dashboard con informacion realista: pedidos
 * repartidos en los ultimos 90 dias (para que el reporte de ventas y el ranking
 * de "mas vendidos" tengan serie), cotizaciones en cada etapa, leads del
 * cotizador, contactos/reclamos y suscriptores del boletin.
 *
 * Todo lleva la marca "PRUEBA" en el nombre o el correo para reconocerlo, y los
 * correos usan example.com (dominio reservado, nunca entrega correo). Todo se
 * puede borrar con `--borrar`, que ademas devuelve el stock que aqui NO se
 * desconto (los pedidos historicos se insertan directos, sin pasar por el
 * checkout).
 *
 * Uso (desde apps/api):
 *   npx tsx prisma/seeds/datos-prueba.ts            # carga los datos
 *   npx tsx prisma/seeds/datos-prueba.ts --borrar   # los quita y restaura el stock
 *
 * NO borra las tarifas de envío: son configuración real del negocio, no datos de
 * prueba. Si este script las carga con costos de ejemplo, ajustalos desde el
 * dashboard (Ecommerce -> Envíos) antes de usarlas de verdad.
 */
import { readFileSync } from 'node:fs';
import { PrismaClient } from '../../src/generated/prisma/client.js';

for (const line of readFileSync('./.env', 'utf8').split('\n')) {
  const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
  if (m && process.env[m[1]] === undefined) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
}

const prisma = new PrismaClient();
const MARCA = 'FPTecnologi';
const MARCA_PRUEBA = 'PRUEBA'; // marca en nombre/correo para poder distinguirlos
const DIAS_HISTORIA = 90;
const TASA_IGV = 0.18;

const r2 = (n: number) => Math.round(n * 100) / 100;

/** Fecha aleatoria dentro de los ultimos N dias, a una hora laboral de Lima. */
function fechaAlAzar(dias: number): Date {
  const d = new Date(Date.now() - Math.floor(Math.random() * dias) * 86_400_000);
  d.setUTCHours(13 + Math.floor(Math.random() * 9), Math.floor(Math.random() * 60), 0, 0);
  return d;
}

// Generador pseudoaleatorio con semilla: dos corridas dan la misma data.
let semilla = 20261001;
const rnd = () => ((semilla = (semilla * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);
const rndInt = (min: number, max: number) => min + Math.floor(rnd() * (max - min + 1));
const elegir = <T>(xs: T[]): T => xs[rndInt(0, xs.length - 1)];

// ------------------------------------------------------------------ catálogos

const NOMBRES = [
  ['Ana', 'Quispe Mamani'], ['Carlos', 'Rojas Vega'], ['Lucia', 'Fernandez Salas'],
  ['Miguel', 'Torres Chavez'], ['Patricia', 'Ramos Alvarez'], ['Jorge', 'Salinas Luna'],
  ['Rosa', 'Medina Rios'], ['Diego', 'Espinoza Arias'], ['Sofia', 'Castillo Nunez'],
  ['Fernando', 'Gutierrez Paz'], ['Karla', 'Reyes Cabrera'], ['Alonso', 'Vega Miranda'],
  ['Milagros', 'Chavez Ortiz'], ['Renzo', 'Paredes Silva'], ['Gabriela', 'Loayza Mendoza'],
];
const EMPRESAS = [
  'Comercial del Sur S.A.C.', 'Clínica San Rafael', 'Distribuidora Andina E.I.R.L.',
  'Constructora Norte S.A.', 'Hotel Miraflores S.R.L.', 'Colegio Santa Clara',
  'Transportes Andinos S.A.C.', 'Bodegas El Roble S.A.C.', 'Restaurante La Barranca E.I.R.L.',
  'Municipalidad de Arequipa',
];
// Nombres del directorio de Shalom (departamentos, no ciudades): si no, no coinciden con las agencias.
const DEPARTAMENTOS = ['Lima', 'Arequipa', 'Cusco', 'La Libertad', 'Piura', 'Lambayeque'];
const METODOS_PAGO = ['YAPE', 'TRANSFERENCIA', 'PLIN', 'EFECTIVO'];
const ESTADOS_PEDIDO = ['PAGADO', 'PAGADO', 'PAGADO', 'ENVIADO', 'ENTREGADO', 'PENDIENTE', 'CANCELADO'] as const;
const CORREOS_RECLAMO = [
  'La impresora se llego sin el cable de red que segun la ficha venia incluido.',
  'El tecnico dejo el equipo sin configuración final y tube que llamarlos otra vez.',
  'Me cobraron un monto distinto al que aparecia en el portal cuando confirme el pedido.',
  'El tiempo de entrega acordado por WhatsApp fue de 2 dias y tardo mas de una semana.',
  'El producto llego con el empaque abierto y no recomendadas el cambio por el volumen.',
];

const cel = () => `9${rndInt(10_000_000, 99_999_999)}`;

/** Correo de prueba: siempre en example.com, nunca llega a una bandeja real. */
const correo = (i: number) => `prueba.${String(i).padStart(3, '0')}.${MARCA_PRUEBA.toLowerCase()}@example.com`;

// -------------------------------------------------------------------- borrado

async function borrar(marcaId: string) {
  // Primero los hijos (FK), despues los padres. Por prefijo de correo/nombre.
  const esCorreoPrueba = (e: string) => e.toLowerCase().includes('prueba');
  const esTextoPrueba = (t: string | null) => (t ?? '').toUpperCase().includes('PRUEBA');

  const pedidos = await prisma.pedido.findMany({
    where: { marcaId, email: { contains: 'prueba' } },
    select: { id: true, items: { select: { productoId: true, cantidad: true } } },
  });
  const items = pedidos.flatMap((p) => p.items);
  await prisma.pedidoItem.deleteMany({ where: { pedidoId: { in: pedidos.map((p) => p.id) } } });
  await prisma.pedido.deleteMany({ where: { id: { in: pedidos.map((p) => p.id) } } });
  // Devuelve el stock que estos pedidos Consumieron.
  for (const it of items) {
    await prisma.producto.update({ where: { id: it.productoId }, data: { stock: { increment: it.cantidad } } });
  }

  const cotizaciones = await prisma.cotizacion.findMany({
    where: { marcaId, clienteEmail: { contains: 'prueba' } }, select: { id: true },
  });
  await prisma.cotizacionEnvio.deleteMany({ where: { cotizacionId: { in: cotizaciones.map((c) => c.id) } } });
  await prisma.cotizacion.deleteMany({ where: { id: { in: cotizaciones.map((c) => c.id) } } });

  await prisma.leadCotizador.deleteMany({ where: { marcaId, email: { contains: 'prueba' } } });
  await prisma.contactoWeb.deleteMany({ where: { marcaId, email: { contains: 'prueba' } } });
  await prisma.suscriptorBoletin.deleteMany({ where: { marcaId, email: { contains: 'prueba' } } });

  // OJO: las tarifas de envío NO se borran. Son configuración real del negocio
  // (costo y plazo por departamento), no datos de prueba: borrarlas dejaría el
  // checkout sin poder cotizar. Si se cargaron con costos de ejemplo, ajustalos
  // desde el dashboard (Ecommerce → Envíos).

  console.log(`Borrados ${pedidos.length} pedidos (+${items.length} items y su stock restaurado),`);
  console.log(`  ${cotizaciones.length} cotizaciones, leads, contactos y suscriptores de prueba.`);
  console.log('  Las tarifas de envío se conservan (son configuración real, no datos de prueba).');
  void esCorreoPrueba; void esTextoPrueba;
}

// ----------------------------------------------------------------------- alta

async function main() {
  const borrarFlag = process.argv.includes('--borrar');
  const marca = await prisma.marca.findFirst({ where: { nombre: MARCA } });
  if (!marca) throw new Error(`No existe la marca ${MARCA}`);
  const marcaId = marca.id;

  if (borrarFlag) return borrar(marcaId);

  const productos = await prisma.producto.findMany({
    where: { marcaId, activo: true, stock: { gt: 0 } },
    select: { id: true, nombre: true, sku: true, precio: true },
  });
  if (productos.length < 5) throw new Error('Hacen falta productos activos con stock');
  const servicios = await prisma.servicio.findMany({ where: { marcaId, activo: true }, select: { id: true, nombre: true } });
  if (servicios.length < 3) throw new Error('Hacen falta servicios activos');

  // --- Tarifario de envío: sin esto el checkout con "Envío por Shalom" no cotiza.
  //   Son los 6 departamentos donde la marca ya tiene data (los pedidos de prueba
  //   los usan). Los costos son de ejemplo: ajústalos desde el dashboard antes de
  //   usarlos en producción. `--borrar` NO los elimina (ver la nota abajo).
  for (const d of DEPARTAMENTOS) {
    const existe = await prisma.tarifaEnvio.findFirst({ where: { marcaId, departamento: d } });
    if (existe) continue;
    await prisma.tarifaEnvio.create({
      data: {
        marcaId,
        departamento: d,
        proveedor: 'SHALOM',
        costo: d === 'Lima' ? 12 : 25 + rndInt(0, 20),
        plazoDias: d === 'Lima' ? '1-2 días' : '3-5 días',
        activo: true,
      },
    });
  }
  console.log(`Tarifas de envío: ${DEPARTAMENTOS.length} departamentos listos para el checkout`);

  // --- Pedidos históricos (el reporte de ventas los necesita con fechas).
  const N_PEDIDOS = 48;
  const repartido = (peso: number) => productos.filter((_, i) => i % productos.length === i % peso || i === 0);
  let pedidos = 0;
  for (let i = 0; i < N_PEDIDOS; i++) {
    const [nombre, apellido] = NOMBRES[i % NOMBRES.length];
    const estado = elegir([...ESTADOS_PEDIDO]);
    const esCancelado = estado === 'CANCELADO';
    // Los cancelados no pagan: el reporte los excluye de las ventas.
    const estadoPago = esCancelado ? 'PENDIENTE' : rnd() < 0.85 ? 'PAGADO' : 'POR_CONFIRMAR';
    const catalogo = repartido(6);
    const cuantos = rndInt(1, 3);
    const elegidos = Array.from({ length: cuantos }, () => elegir(catalogo));
    // Sin repetir el mismo producto en un pedido.
    const unicos = [...new Map(elegidos.map((p) => [p.id, p])).values()];

    let subtotal = 0;
    let igv = 0;
    const itemsData = unicos.map((p) => {
      const cantidad = rndInt(1, 3);
      const precioUnitario = r2(Number(p.precio));
      const igvUnitario = r2(precioUnitario * TASA_IGV);
      subtotal = r2(subtotal + precioUnitario * cantidad);
      igv = r2(igv + igvUnitario * cantidad);
      return {
        productoId: p.id,
        cantidad,
        precioUnitario,
        nombreSnapshot: p.nombre,
        skuSnapshot: p.sku,
        igvUnitario,
        subtotal: r2((precioUnitario + igvUnitario) * cantidad),
      };
    });

    const conEnvio = rnd() < 0.45;
    const envio = conEnvio ? (elegir(DEPARTAMENTOS) === 'Lima' ? 12 : 30) : 0;
    const total = r2(subtotal + igv + envio);
    const creado = fechaAlAzar(DIAS_HISTORIA);

    await prisma.pedido.create({
      data: {
        marcaId,
        numeroPedido: `FP-${creado.getFullYear()}-PR${String(i + 1).padStart(3, '0')}`,
        nombre: `${nombre} ${apellido} (${MARCA_PRUEBA})`,
        email: correo(i),
        celular: cel(),
        documento: rnd() < 0.5 ? String(rndInt(10_000_000, 99_999_999)) : `20${rndInt(100_000_000, 999_999_999)}`,
        direccion: conEnvio ? `Av. Siempre Viva ${rndInt(100, 9999)}` : null,
        distrito: conEnvio ? elegir(['Miraflores', 'San Isidro', 'Miramar', 'Ate']) : null,
        notas: 'Pedido generado para pruebas del dashboard.',
        metodoPago: elegir(METODOS_PAGO),
        estado,
        estadoPago,
        subtotal,
        igv,
        envio,
        descuento: 0,
        total,
        moneda: 'USD',
        envioProveedor: conEnvio ? 'SHALOM' : null,
        envioDepartamento: conEnvio ? (subtotal > 3000 ? 'Lima' : elegir(DEPARTAMENTOS)) : null,
        envioPlazo: conEnvio ? '2-4 días' : null,
        createdAt: creado,
        items: { create: itemsData },
      },
    });
    pedidos++;
  }
  console.log(`Pedidos historicos: ${pedidos} repartidos en los ultimos ${DIAS_HISTORIA} dias`);

  // --- Cotizaciones: una por estado para ver el embudo completo en el dashboard.
  const etapas = [
    { estado: 'PENDIENTE', n: 5, propuesta: null, monto: null },
    { estado: 'EN_REVISION', n: 4, propuesta: null, monto: null },
    { estado: 'ENVIADA', n: 6, propuesta: 'Propuesta enviada', monto: true },
    { estado: 'ACEPTADA', n: 4, propuesta: 'Propuesta aceptada', monto: true },
    { estado: 'RECHAZADA', n: 2, propuesta: 'Propuesta enviada', monto: true },
  ] as const;
  let cotizaciones = 0;
  for (const etapa of etapas) {
    for (let i = 0; i < etapa.n; i++) {
      const [nombre, apellido] = NOMBRES[(cotizaciones + 3) % NOMBRES.length];
      const servicio = elegir(servicios);
      const creada = fechaAlAzar(DIAS_HISTORIA);
      const monto = etapa.monto ? r2(1500 + rnd() * 9000) : null;
      const c = await prisma.cotizacion.create({
        data: {
          marcaId,
          numero: `COT-${creada.getFullYear()}-PR${String(cotizaciones + 1).padStart(3, '0')}`,
          servicioId: servicio.id,
          clienteNombre: `${nombre} ${apellido}`,
          clienteEmail: correo(500 + cotizaciones),
          clienteTelefono: cel(),
          clienteEmpresa: rnd() < 0.7 ? elegir(EMPRESAS) : null,
          mensaje: `Solicitud de prueba para ${servicio.nombre}. ${MARCA_PRUEBA}: datos generados, no reales.`,
          origen: elegir(['/cotizador', '/servicios', '/contacto']),
          estado: etapa.estado,
          propuesta: etapa.propuesta
            ? `${etapa.propuesta}. Alcance: implementacion, configuracion, soporte 3 meses y capacitación al equipo.`
            : null,
          monto,
          moneda: 'USD',
          validezHasta: monto ? new Date(creada.getTime() + 30 * 86_400_000) : null,
          notas: etapa.estado === 'ACEPTADA' ? 'Cerrada. Facturar y dar de alta al cliente.' : null,
          enviadaAt: ['ENVIADA', 'ACEPTADA', 'RECHAZADA'].includes(etapa.estado) ? creada : null,
          createdAt: creada,
        },
      });
      // Las enviadas dejan historial de envío (lo que muestra el detalle).
      if (['ENVIADA', 'ACEPTADA', 'RECHAZADA'].includes(etapa.estado)) {
        await prisma.cotizacionEnvio.create({
          data: {
            marcaId,
            cotizacionId: c.id,
            canal: elegir(['EMAIL', 'WHATSAPP']),
            destinatario: c.clienteEmail,
            mensaje: `Cotizacion ${c.numero} de ${servicio.nombre}.`,
            enviadoPor: 'dev@fptecnologi.com',
            createdAt: creada,
          },
        });
      }
      cotizaciones++;
    }
  }
  console.log(`Cotizaciones: ${cotizaciones} en los 5 estados del embudo`);

  // --- Leads del cotizador.
  const estadosLead = ['NUEVO', 'NUEVO', 'NUEVO', 'CONTACTADO', 'CONTACTADO', 'COTIZADO', 'GANADO', 'PERDIDO'] as const;
  const intereses = ['Ciberseguridad', 'Servidores para empresas', 'Soluciones cloud', 'Videoconferencia', 'Cableado estructurado', 'Soporte tecnico'];
  let leads = 0;
  for (let i = 0; i < 16; i++) {
    const [nombres, apellidos] = NOMBRES[i % NOMBRES.length];
    const juridica = rnd() < 0.4;
    await prisma.leadCotizador.create({
      data: {
        marcaId,
        nombres,
        apellidos,
        tipoPersona: juridica ? 'JURIDICA' : 'NATURAL',
        tipoDocumento: juridica ? 'RUC' : 'DNI',
        nroDocumento: juridica ? `20${rndInt(100_000_000, 999_999_999)}` : String(rndInt(10_000_000, 99_999_999)),
        empresa: juridica ? elegir(EMPRESAS) : null,
        email: correo(900 + i),
        celular: cel(),
        interes: elegir(intereses),
        mensaje: `Consulta de prueba (${MARCA_PRUEBA}) sobre ${elegir(intereses).toLowerCase()}.`,
        origen: elegir(['/cotizador', '/servicios/ciberseguridad', '/']),
        estado: estadosLead[i % estadosLead.length],
        createdAt: fechaAlAzar(DIAS_HISTORIA),
      },
    });
    leads++;
  }
  console.log(`Leads del cotizador: ${leads} en varios estados`);

  // --- Contactos y reclamos.
  let contactos = 0;
  for (let i = 0; i < 10; i++) {
    const [nombre, apellido] = NOMBRES[(i + 7) % NOMBRES.length];
    await prisma.contactoWeb.create({
      data: {
        marcaId,
        tipo: 'CONTACTO',
        nombre: `${nombre} ${apellido}`,
        email: correo(1200 + i),
        celular: cel(),
        empresa: rnd() < 0.6 ? elegir(EMPRESAS) : null,
        mensaje: `Consulta de prueba (${MARCA_PRUEBA}): quiero informacion de precios y stock disponible.`,
        origen: elegir(['/contacto', '/', '/tienda']),
        estado: elegir(['NUEVO', 'NUEVO', 'CONTACTADO', 'RESUELTO'] as const),
        createdAt: fechaAlAzar(DIAS_HISTORIA),
      },
    });
    contactos++;
  }
  for (let i = 0; i < 5; i++) {
    const [nombre, apellido] = NOMBRES[(i + 11) % NOMBRES.length];
    await prisma.contactoWeb.create({
      data: {
        marcaId,
        tipo: 'RECLAMO',
        nombre: `${nombre} ${apellido}`,
        email: correo(1300 + i),
        celular: cel(),
        empresa: rnd() < 0.5 ? elegir(EMPRESAS) : null,
        mensaje: `${CORREOS_RECLAMO[i]} (${MARCA_PRUEBA})`,
        origen: '/contacto',
        estado: elegir(['NUEVO', 'NUEVO', 'CONTACTADO', 'RESUELTO'] as const),
        createdAt: fechaAlAzar(DIAS_HISTORIA),
      },
    });
    contactos++;
  }
  console.log(`Contactos y reclamos: ${contactos} (5 de ellos reclamos)`);

  // --- Suscriptores del boletín.
  let suscriptores = 0;
  for (let i = 0; i < 22; i++) {
    await prisma.suscriptorBoletin.create({
      data: {
        marcaId,
        email: correo(1500 + i),
        origen: elegir(['/', '/blog', '/tienda']),
        createdAt: fechaAlAzar(DIAS_HISTORIA),
      },
    });
    suscriptores++;
  }
  console.log(`Suscriptores del boletin: ${suscriptores}`);

  console.log('\nListo. Todo lo que lleva PRUEBA en el nombre o el correo se borra con --borrar.');
}

main()
  .catch((e) => { console.error('ERROR:', e instanceof Error ? e.message : e); process.exit(1); })
  .finally(() => prisma.$disconnect());