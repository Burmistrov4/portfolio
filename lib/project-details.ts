/**
 * Contenido editorial y curación técnica de los proyectos y certificados.
 *
 * Fuente: repositorios reales de Lorenzo (INCES-LMS-PROJECT, LogisticaBackend,
 * TechLoan, Adrialga) y diagramas de arquitectura en SVG.
 */

export interface StackNote {
  tech: string
  note: string
}

export interface ProjectDetail {
  key: string
  featured: boolean
  legacy?: boolean
  year: string
  role: string
  tagline: string
  problem: string
  features: string[]
  stackNotes: StackNote[]
  contribution: string
  evidence: string[]
  diagramPath?: string
  /** Tecnologías a mostrar cuando la base de datos no las tiene cargadas. */
  fallbackTech: string[]
}

export const PROJECT_DETAILS: ProjectDetail[] = [
  {
    key: 'inces-lms',
    featured: true,
    year: '2026 — en curso',
    role: 'Desarrollo full-stack · equipo de 4 estudiantes · proyecto académico (IUTEPI)',
    tagline: 'Plataforma de gestión académica para el INCES La Isabelica',
    problem:
      'El Centro de Formación Socialista Nacional de Soldadura "Rafael Urdaneta" gestiona inscripciones, cupos, cuadrante de horarios, asistencia y calificaciones con planillas y herramientas genéricas que no se adaptan a sus reglas. La información se dispersa y cada proceso depende de trabajo manual.',
    features: [
      'Autenticación con roles y sesiones gestionadas con JWT.',
      'Modelo de datos académico: participantes, cursos, cuadrante, asistencia y calificaciones.',
      'API documentada con contrato OpenAPI 3.1 generado desde los esquemas de validación.',
      'Almacenamiento de archivos en la nube con URLs prefirmadas.',
      'Migraciones SQL versionadas y suites de pruebas de frontend, backend y base de datos.',
    ],
    stackNotes: [
      { tech: 'Flutter / Dart', note: 'una sola base de código para web y móvil, pensando en el acceso desde el aula.' },
      { tech: 'Node.js + Fastify + Zod', note: 'validación de entrada tipada en el borde de la API: los datos inválidos no llegan a la base.' },
      { tech: 'Supabase / PostgreSQL', note: 'reglas de negocio en la base con RLS y triggers, no solo en el código de la aplicación.' },
      { tech: 'Cloudflare R2', note: 'archivos servidos con URLs prefirmadas para no exponer credenciales en el cliente.' },
      { tech: 'OpenAPI 3.1', note: 'el contrato se genera desde el mismo esquema que valida: documentación y código no se desincronizan.' },
    ],
    contribution:
      'Formo parte del equipo de desarrollo (cuatro estudiantes con tutoría académica). Trabajé en el diseño del modelo de datos, la API con validación por esquemas, la integración de autenticación y almacenamiento, y en las pruebas automatizadas.',
    evidence: [
      'Repositorio con README de estado, migraciones versionadas y suites de pruebas.',
      'Contrato OpenAPI 3.1 versionado junto al código.',
    ],
    diagramPath: '/diagrams/inces-lms.svg',
    fallbackTech: ['Flutter', 'Dart', 'Node.js', 'Fastify', 'Zod', 'Supabase', 'PostgreSQL', 'Cloudflare R2', 'OpenAPI'],
  },
  {
    key: 'vzla-cargo-hub',
    featured: true,
    year: '2026',
    role: 'Desarrollo full-stack · proyecto independiente',
    tagline: 'Cotizador de envíos marítimos y aéreos, desplegado y en uso',
    problem:
      'Cotizar un envío internacional obliga a cruzar peso, volumen y las reglas particulares de cada courier. Hacerlo a mano es lento y produce errores de precio que se descubren cuando el paquete ya salió.',
    features: [
      'Cálculo de fletes por peso y volumen con reglas configurables por courier.',
      'Registro y consulta de cotizaciones.',
      'Frontend y backend desplegados, en uso por usuarios reales.',
      'Validaciones y pruebas sobre la lógica de cálculo.',
    ],
    stackNotes: [
      { tech: 'Next.js / TypeScript', note: 'interfaz tipada de extremo a extremo: los errores de forma de datos se detectan al compilar.' },
      { tech: 'Python / FastAPI', note: 'separar el cálculo de tarifas del frontend permite probarlo y cambiarlo sin tocar la interfaz.' },
      { tech: 'Supabase', note: 'base de datos y autenticación sin administrar servidores.' },
      { tech: 'Vercel', note: 'despliegue continuo desde el repositorio.' },
    ],
    contribution:
      'Proyecto personal completo: modelo de datos, lógica de cotización, API, interfaz y despliegue.',
    evidence: [
      'Demo desplegada y en uso (enlace arriba).',
      'Lógica de cálculo separada y cubierta por pruebas.',
    ],
    diagramPath: '/diagrams/vzla-cargo-hub.svg',
    fallbackTech: ['Next.js', 'TypeScript', 'Python', 'FastAPI', 'Supabase', 'Vercel'],
  },
  {
    key: 'techloan',
    featured: true,
    year: '2026',
    role: 'Desarrollo completo · proyecto final de Programación III',
    tagline: 'Reservas y préstamos de equipos tecnológicos sin dobles reservas',
    problem:
      'En un centro de formación técnica los laboratorios y equipos se reservan de palabra o en papel: se producen dobles reservas, se pierde la trazabilidad de quién tiene cada equipo y no queda historial ante un reclamo.',
    features: [
      'Reservas por franja horaria con bloqueo de solapamientos.',
      'Préstamos y devoluciones con cambio automático de estado del equipo.',
      'Panel de indicadores, historial y registro de auditoría de cada acción.',
      'Funciona sin conexión a internet y sin dependencias externas de frontend.',
    ],
    stackNotes: [
      { tech: 'Python / Flask 3.1', note: 'framework maduro y liviano, ideal para un sistema que debe correr en una máquina modesta.' },
      { tech: 'SQLite3', note: 'base de datos en un solo archivo: el sistema se instala copiando una carpeta, con volcado opcional a MySQL.' },
      { tech: 'Jinja2 + HTML/CSS/JS', note: 'sin frameworks de frontend para que cargue rápido en redes lentas.' },
      { tech: 'scrypt + token CSRF + roles', note: 'contraseñas con derivación de clave, formularios protegidos y permisos por rol.' },
      { tech: 'Arquitectura por capas', note: 'rutas, servicios y acceso a datos separados: la lógica se prueba sin levantar el servidor.' },
    ],
    contribution:
      'Proyecto individual: modelo de datos, lógica de reservas y préstamos, seguridad, interfaz y pruebas de integración.',
    evidence: [
      'Repositorio con README detallado y capturas.',
      'Demo desplegada (enlace arriba).',
    ],
    diagramPath: '/diagrams/techloan.svg',
    fallbackTech: ['Python', 'Flask', 'SQLite3', 'Jinja2', 'scrypt', 'CSRF'],
  },
  {
    key: 'adrialga',
    featured: true,
    year: '2026',
    role: 'Desarrollo full-stack · proyecto académico · Análisis de Sistemas II',
    tagline: 'Sistema comercial integral para Ferretería Adrialga C.A. (POS, caja, inventario y tasa BCV)',
    problem:
      'Una ferretería con múltiples proveedores, variantes de productos y precios en divisas necesita controlar ventas en caja, márgenes reales, arqueos y tasa diaria del BCV sin depender de hojas de cálculo dispersas.',
    features: [
      'Punto de venta (POS) con carrito en tiempo real, cálculo dual USD/VES (tasa BCV) e IVA.',
      'Panel de control con métricas de ventas, margen bruto estimado, ticket promedio y valor de inventario.',
      'Módulos de inventario, facturas, compras, proveedores, caja con arqueo y exportación CSV / PDF.',
      'Sincronización de eventos en vivo con Socket.IO y microservicio de apoyo en Python/FastAPI.',
    ],
    stackNotes: [
      { tech: 'Flutter / Dart', note: 'interfaz única multiplataforma con fl_chart, generación de PDFs e impresión directa.' },
      { tech: 'Node.js + Express + Prisma', note: 'API transaccional con precisión decimal (decimal.js), autenticación y arqueo de caja.' },
      { tech: 'MySQL', note: 'esquema relacional estricto para productos, variantes, facturas, compras y movimientos de caja.' },
      { tech: 'Python / FastAPI', note: 'microservicio auxiliar para importación de catálogos y consulta automatizada de tasa.' },
    ],
    contribution:
      'Diseño del modelo de datos, desarrollo del frontend Flutter, endpoints Express/Prisma, lógica de caja/facturación y microservicio auxiliar.',
    evidence: [
      'Repositorio público del frontend y arquitectura backend documentada.',
      'Demo interactiva publicada en GitHub Pages (enlace arriba).',
    ],
    diagramPath: '/diagrams/adrialga.svg',
    fallbackTech: ['Flutter', 'Dart', 'Node.js', 'Express', 'Prisma', 'MySQL', 'Python', 'FastAPI', 'Socket.IO'],
  },
  {
    key: 'boletos-cine',
    featured: false,
    legacy: true,
    year: '2025',
    role: 'Práctica de fundamentos · VB.NET',
    tagline: 'Cartelera y venta de boletos con reglas de descuento',
    problem:
      'Ejercicio de fundamentos: aplicar condicionales y estructuras de control a un caso con reglas de negocio (precios por día, clasificación por edad, tipo de pago).',
    features: [
      'Selección de película, función y medio de pago.',
      'Descuentos según el día y validación por clasificación de edad.',
      'Resumen final de la compra con el detalle del cálculo.',
    ],
    stackNotes: [{ tech: 'VB.NET', note: 'ejercicio académico de lógica y manejo de eventos.' }],
    contribution: 'Ejercicio individual de curso.',
    evidence: ['Repositorio con captura de la aplicación.'],
    fallbackTech: ['VB.NET'],
  },
  {
    key: 'calculadora-vbnet',
    featured: false,
    legacy: true,
    year: '2025',
    role: 'Práctica de fundamentos · VB.NET',
    tagline: 'Calculadora de escritorio con manejo de decimales',
    problem:
      'Ejercicio de fundamentos: construir una interfaz que responda a eventos y maneje correctamente números decimales.',
    features: [
      'Operaciones aritméticas básicas con interfaz de escritorio.',
      'Manejo cuidadoso de tipos de datos para evitar errores de precisión.',
    ],
    stackNotes: [{ tech: 'VB.NET', note: 'ejercicio académico de lógica y eventos.' }],
    contribution: 'Ejercicio individual de curso.',
    evidence: ['Repositorio con captura de la aplicación.'],
    fallbackTech: ['VB.NET'],
  },
]

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Empareja el título de la base de datos con su ficha editorial. */
export function matchDetail(title: string): ProjectDetail | null {
  const t = normalize(title)
  if (t.includes('inces')) return PROJECT_DETAILS[0]
  if (t.includes('cargo')) return PROJECT_DETAILS[1]
  if (t.includes('loan') || t.includes('prestamo')) return PROJECT_DETAILS[2]
  if (t.includes('adrialga') || t.includes('ferreteria')) return PROJECT_DETAILS[3]
  if (t.includes('boleto') || t.includes('cine')) return PROJECT_DETAILS[4]
  if (t.includes('calculadora') || t.includes('calculator')) return PROJECT_DETAILS[5]
  return null
}

export function techOf(project: { title: string; technologies: string[] | null }): string[] {
  const fromDb = project.technologies ?? []
  if (fromDb.length > 0) return fromDb
  return matchDetail(project.title)?.fallbackTech ?? []
}

/** Texto corto para las tarjetas: la primera frase útil del resumen. */
export function shortSummary(summary: string | null): string {
  if (!summary) return ''
  const clean = summary.replace(/^[-•\s]+/, '').replace(/\s+/g, ' ').trim()
  if (clean.length <= 180) return clean
  const cut = clean.slice(0, 180)
  const lastSpace = cut.lastIndexOf(' ')
  return cut.slice(0, lastSpace > 0 ? lastSpace : 180) + '…'
}

/** Clasifica si un certificado es técnico (TI / Software) y corrige descripciones placeholder. */
export function curateCertificate(cert: {
  title: string
  description: string | null
}): { isTechnical: boolean; cleanDescription: string | null } {
  const t = normalize(cert.title)
  const isNonTech =
    t.includes('manipulacion de alimentos') ||
    t.includes('montacargas') ||
    t.includes('panaderia')

  const rawDesc = (cert.description ?? '').trim()
  let cleanDescription: string | null = rawDesc || null
  if (!rawDesc || rawDesc.toLowerCase() === 'test') {
    if (t.includes('data science')) {
      cleanDescription =
        'Aplicación de Python para análisis exploratorio, limpieza y manipulación de datos orientados a ciencia de datos.'
    } else {
      cleanDescription = null
    }
  }

  return {
    isTechnical: !isNonTech,
    cleanDescription,
  }
}
