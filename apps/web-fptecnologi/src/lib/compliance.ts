/* Compliance de FP Tecnologi & System: texto de fptecnologi.com/compliance-microsoft (2026-10-09). */
export type SeccionCompliance = { id: string; titulo: string; parrafos?: string[]; subsecciones?: { titulo: string; texto: string }[] };

/** Documentos descargables por defecto; se reemplazan desde el dashboard (Web informativa → Compliance). */
export const COMPLIANCE_DOCS = [
  { titulo: 'Manual de procesos (propuestas comerciales al sector público)', archivo: '/compliance/manual-propuestas-sector-publico.pdf' },
  { titulo: 'Código de conducta de proveedores 2024', archivo: '/compliance/codigo-conducta-proveedores-2024.pdf' },
];

export const COMPLIANCE: SeccionCompliance[] = [
  {
    id: 'introduccion',
    titulo: 'Introducción',
    parrafos: [
      'FP TECNOLOGI & SYSTEM SAC desarrolla los procedimientos y buenas prácticas para identificar los riesgos de cumplimiento derivados de las obligaciones legales externas e internas que la afectan, y que permiten establecer las medidas o mecanismos internos de prevención, gestión, control y respuesta frente a dichos riesgos.',
      'En otras palabras, nuestro sistema de Compliance Empresarial adopta una organización para prevenir la comisión de delitos o infracciones dentro de la empresa, por sus empleados o directivos: en cierto sentido, una auditoría continua de los procesos y procedimientos.',
    ],
  },
  {
    id: 'normas-de-conducta',
    titulo: 'Normas de conducta empresarial',
    parrafos: [
      'Las Normas de Conducta Empresarial de FP Tecnologi & System resumen los principios éticos y las prácticas empresariales que guían nuestra toma de decisiones y actividades comerciales, con orientación sobre cómo actuar en situaciones que involucren prácticas empresariales o dilemas éticos.',
    ],
    subsecciones: [
      { titulo: 'Obsequios y entretenimiento', texto: 'Promovemos el buen juicio, la discreción y la moderación al dar o recibir obsequios o atenciones. Cualquier obsequio o atención, dado o recibido, debe cumplir la ley, no violar las políticas del donante ni del receptor, y ser coherente con las leyes de la Constitución del Perú. No solicitamos obsequios, entretenimiento ni favores de ningún valor a personas o empresas con las que tenemos o podríamos tener relaciones comerciales, ni actuamos de modo que un proveedor o cliente se sienta obligado a ofrecerlos.' },
      { titulo: 'Uso de activos de la empresa', texto: 'Los empleados deben usar los activos de la empresa, como computadoras, teléfonos y vehículos, de manera responsable y solo para fines comerciales.' },
      { titulo: 'No discriminación', texto: 'Ofrecemos igualdad de oportunidades y no discriminamos por motivos de raza, religión, origen nacional, sexo, edad o discapacidad.' },
      { titulo: 'Conflictos de interés', texto: 'Los empleados deben evitar situaciones que generen o puedan generar un conflicto entre sus intereses personales y los de la empresa, por ejemplo cuando un empleado o un familiar directo tiene un interés financiero o personal en una empresa con la que hacemos negocios. Ante un posible conflicto, deben informarlo a su supervisor o a Recursos Humanos.' },
      { titulo: 'Cumplimiento de la ley', texto: 'Cumplimos todas las leyes y regulaciones aplicables en los países donde operamos y esperamos lo mismo de nuestros empleados. El incumplimiento puede resultar en acciones disciplinarias, incluyendo el despido.' },
      { titulo: 'Confidencialidad', texto: 'Los empleados deben proteger la información confidencial de la empresa: datos financieros, planes de marketing, información sobre productos y tecnología, y datos de clientes.' },
    ],
  },
  {
    id: 'denuncia',
    titulo: 'Denuncia de irregularidades',
    parrafos: ['Los empleados que tengan conocimiento de alguna violación de las Normas de Conducta Empresarial deben informarlo a su supervisor, jefe inmediato o al departamento de Recursos Humanos.'],
  },
  {
    id: 'etica',
    titulo: 'Compromiso con la ética',
    parrafos: [
      'Estamos comprometidos con los más altos estándares éticos en todas nuestras operaciones. Esperamos que nuestros empleados actúen con integridad, honestidad y responsabilidad en todo momento.',
      'Fomentamos una cultura de ética y cumplimiento, donde la integridad, la honestidad y la transparencia son valores fundamentales. Actuar con ética no solo es lo correcto, también es esencial para el éxito a largo plazo de la empresa.',
    ],
  },
  {
    id: 'anticorrupcion',
    titulo: 'Política anticorrupción',
    parrafos: [
      'Mantenemos una política de cero tolerancia hacia la corrupción. Prohibimos terminantemente el soborno a funcionarios gubernamentales y el pago de comisiones ilegales de cualquier tipo, tanto con funcionarios públicos como con personas del sector privado.',
      'Nos comprometemos a observar las normas de conducta establecidas en la Ley de Contrataciones del Estado (Ley N° 30225) y su Reglamento, así como las leyes anticorrupción y de lavado de activos aplicables en el Perú.',
    ],
    subsecciones: [
      { titulo: 'Código de conducta', texto: 'Todos los empleados deben cumplir nuestro Código de Conducta, que incluye una sección específica sobre la lucha contra la corrupción.' },
      { titulo: 'Capacitación', texto: 'Brindamos capacitación periódica sobre la política anticorrupción y las leyes aplicables, con capacitación en línea y otros recursos.' },
      { titulo: 'Debida diligencia', texto: 'Realizamos la debida diligencia de nuestros socios comerciales para asegurar que comparten nuestro compromiso con la ética y la transparencia.' },
      { titulo: 'Canales de denuncia', texto: 'Contamos con canales de denuncia confidenciales para reportar cualquier sospecha de corrupción.' },
      { titulo: 'Investigación y medidas disciplinarias', texto: 'Investigamos cualquier denuncia de corrupción y tomamos las medidas disciplinarias correspondientes, que pueden incluir el despido.' },
      { titulo: 'Responsabilidad compartida y transparencia', texto: 'Todos somos responsables de mantener los más altos estándares éticos: empleados, socios comerciales y proveedores. Publicamos información sobre nuestras políticas anticorrupción y nuestros esfuerzos para combatirla.' },
    ],
  },
  {
    id: 'integracion',
    titulo: 'Integración del cumplimiento en nuestros procesos',
    subsecciones: [
      { titulo: '1. Compromiso de la gerencia', texto: 'La alta dirección demuestra su compromiso con comunicaciones internas sobre ética y cumplimiento, participación activa en las capacitaciones, decisiones que reflejan los valores éticos y supervisión constante del programa.' },
      { titulo: '2. Evaluación de riesgos', texto: 'Análisis periódicos de los riesgos de incumplimiento en cada área, medidas preventivas para mitigarlos, monitoreo constante de las actividades y registro de cualquier evento relacionado con soborno o corrupción.' },
      { titulo: '3. Capacitación y comunicación', texto: 'Capacitaciones presenciales y en línea, difusión de información por intranet, correo y otros canales, y comunicación constante con proveedores y socios sobre las expectativas de cumplimiento.' },
      { titulo: '4. Políticas y procedimientos', texto: 'Políticas claras y actualizadas que cubren todos los aspectos del programa, accesibles para todos los empleados, revisadas periódicamente e incluyen procedimientos para reportar incumplimientos.' },
      { titulo: '5. Supervisión y responsables', texto: 'Roles y responsabilidades específicos para cada empleado, mecanismos de supervisión y control, y comunicación a todo el personal de sus responsabilidades en materia de cumplimiento.' },
      { titulo: '6. Monitoreo, revisión y reporte', texto: 'Auditorías internas y externas, revisión de métricas de cumplimiento, reportes periódicos a la Junta Directiva y al Comité de Auditoría, y medidas correctivas ante cualquier incumplimiento.' },
    ],
  },
];

const BR = String.fromCharCode(10, 10);

/** Texto por defecto en markdown ("## Título" abre sección; "**Subtítulo.** texto" resalta el inicio del párrafo). */
export const COMPLIANCE_MD = COMPLIANCE.map((c) =>
  [`## ${c.titulo}`, ...(c.parrafos ?? []), ...(c.subsecciones ?? []).map((x) => `**${x.titulo}.** ${x.texto}`)].join(BR),
).join(BR);
