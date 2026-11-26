export type Locale = 'es' | 'en'

export const COPY = {
  es: {
    nav: {
      projects: 'Proyectos',
      stack: 'Stack',
      certificates: 'Certificados',
      contact: 'Contacto',
      downloadCv: 'Descargar CV',
      mode3d: '3D',
      mode2d: '2D',
      toggle3dTitle: 'Alternar entre estación 3D interactiva y vista rápida 2D',
    },
    hero: {
      availability: 'Disponible para trabajar · Flor Amarillo, Valencia, Carabobo',
      subtitle: 'Estudiante de Análisis de Sistemas (5.º semestre) — desarrollo full-stack y soporte TI',
      pitch:
        'Construyo software que resuelve problemas concretos y lo entrego funcionando: una plataforma de gestión académica para el INCES La Isabelica, un cotizador de envíos marítimos y aéreos desplegado y en uso, y un sistema de reservas de equipos. Trabajo con Python, TypeScript, Flutter y SQL, y desde 2021 hago soporte técnico de hardware y software.',
      ctaProjects: 'Ver proyectos',
      ctaCv: 'Descargar CV (PDF)',
      stats: {
        projects: 'proyectos con código y demo',
        certificates: 'certificados técnicos verificables',
        supportSince: 'en soporte técnico desde',
        semester: 'semestre de Análisis de Sistemas',
      },
      sceneControls: {
        dragHint: 'ARRASTRA FUERA: ORBITAR · RUEDA: ZOOM · BORDE TAPA: ABRIR/CERRAR · CLIC OBJETOS MESA',
        zoomMonitor: 'Enfocar laptop',
        resetCamera: 'Centrar Laptop',
        switch2d: 'Vista 2D',
      },
    },
    about: {
      eyebrow: 'Sobre mí',
      title: 'Análisis de Sistemas, software y soporte',
      p1: 'Soy estudiante de 5.º semestre de Análisis de Sistemas en el IUTEPI (Valencia, Carabobo). Empecé en tecnología por el lado del hardware: desde 2021 hago diagnóstico, mantenimiento y ensamblaje de equipos de forma independiente, y de ahí pasé al desarrollo de software.',
      p2: 'Hoy construyo aplicaciones completas: modelo los datos, escribo la API, armo la interfaz y la despliego. Actualmente desarrollo en equipo un sistema de gestión académica para el CFS Nacional de Soldadura "Rafael Urdaneta" del INCES La Isabelica, con tutoría académica.',
      p3: 'Busco mi primera oportunidad formal en desarrollo de software, análisis de sistemas o soporte TI. Tengo disponibilidad inmediata, presencial en Valencia o en remoto.',
      howTitle: 'Cómo trabajo',
      howItems: [
        'Entiendo el problema antes de escribir código: modelo los datos y las reglas del negocio primero.',
        'Entrego funcionando: cada proyecto tiene demo, arquitectura documentada o repositorio verificable.',
        'Pruebo lo que construyo (unitarias, integración y base de datos) y documento las decisiones técnicas.',
        'Trabajo en equipo y con tutoría: colaboro con tres compañeros y una tutora en el desarrollo de un sistema académico real.',
      ],
    },
    stack: {
      eyebrow: 'Stack',
      title: 'Con qué trabajo',
      description:
        'Tecnologías que uso en proyectos reales, no listas de cursos: cada una aparece en al menos uno de los proyectos de abajo.',
    },
    projects: {
      eyebrow: 'Proyectos',
      title: 'Lo que he construido',
      description:
        'Cada tarjeta abre la ficha completa con diagrama de arquitectura, decisiones técnicas, mi aporte y evidencia. Filtra por tecnología si buscas algo concreto.',
      all: 'Todos',
      featured: 'Destacado',
      empty: 'No hay proyectos con esa tecnología.',
      onlyFeatured: 'Solo destacados',
      showAll: 'Ver todos',
    },
    certificates: {
      eyebrow: 'Formación',
      title: 'Certificados y cursos',
      view: 'Ver certificado',
      onlyTech: 'Solo área TI',
      showAll: 'Ver todos',
    },
    contact: {
      eyebrow: 'Contacto',
      title: 'Hablemos',
      heading: '¿Buscas alguien para tu equipo?',
      description:
        'Estoy disponible de inmediato para desarrollo de software, análisis de sistemas o soporte técnico, en Valencia o en remoto. Escríbeme y te respondo el mismo día.',
      locationLabel: 'Ubicación',
      phoneLabel: 'Teléfono',
      modalityLabel: 'Modalidad',
      modalityValue: 'Presencial, híbrido o remoto',
    },
  },
  en: {
    nav: {
      projects: 'Projects',
      stack: 'Stack',
      certificates: 'Certificates',
      contact: 'Contact',
      downloadCv: 'Download CV',
      mode3d: '3D',
      mode2d: '2D',
      toggle3dTitle: 'Switch between interactive 3D workstation and fast 2D view',
    },
    hero: {
      availability: 'Available for hire · Valencia, Venezuela (Remote / On-site)',
      subtitle: 'Systems Analysis Student (5th Semester) — Full-Stack Development & IT Support',
      pitch:
        'I build software that solves real operational problems and ship it to production: an academic management platform for INCES La Isabelica, a deployed sea/air freight quoting platform in active use, and an offline-capable equipment booking system. I work with Python, TypeScript, Flutter, and SQL, backed by independent hardware & IT support since 2021.',
      ctaProjects: 'View projects',
      ctaCv: 'Download CV (PDF)',
      stats: {
        projects: 'projects with code & demo',
        certificates: 'verifiable certificates',
        supportSince: 'in IT & hardware support since',
        semester: 'semester in Systems Analysis',
      },
      sceneControls: {
        dragHint: 'DRAG OUTSIDE: ORBIT · WHEEL: ZOOM · LID EDGE: OPEN/CLOSE · CLICK DESK PROPS',
        zoomMonitor: 'Focus laptop',
        resetCamera: 'Center Laptop',
        switch2d: '2D View',
      },
    },
    about: {
      eyebrow: 'About me',
      title: 'Systems Analysis, Software & IT Support',
      p1: 'I am a 5th-semester Systems Analysis student at IUTEPI (Valencia, Venezuela). I started in tech through hardware: since 2021 I have handled PC/laptop diagnostics, repair, and assembly independently before expanding into full-stack software engineering.',
      p2: 'Today I build end-to-end systems: data modeling, typed APIs, responsive interfaces, and cloud deployment. I am currently working in a 4-student team with academic supervision on an academic management LMS for the INCES La Isabelica National Welding Center.',
      p3: 'I am seeking my first formal opportunity in software development, systems analysis, or IT support — immediately available remotely or on-site.',
      howTitle: 'How I work',
      howItems: [
        'Model the domain and business rules before writing application code.',
        'Ship working software: every flagship project includes live demos, repos, or documented architecture.',
        'Test across layers (unit, integration, database) and document technical trade-offs.',
        'Collaborate effectively in teams with versioned migrations and clear API contracts.',
      ],
    },
    stack: {
      eyebrow: 'Stack',
      title: 'Technologies I use',
      description:
        'Tools used in real production and engineering projects — every technology listed appears in at least one project below.',
    },
    projects: {
      eyebrow: 'Projects',
      title: 'What I have built',
      description:
        'Open any project for the full engineering case study: problem, system architecture diagram, stack trade-offs, and evidence.',
      all: 'All',
      featured: 'Featured',
      empty: 'No projects match that technology filter.',
      onlyFeatured: 'Featured only',
      showAll: 'Show all',
    },
    certificates: {
      eyebrow: 'Education',
      title: 'Certificates & Courses',
      view: 'View certificate',
      onlyTech: 'IT only',
      showAll: 'Show all',
    },
    contact: {
      eyebrow: 'Contact',
      title: "Let's talk",
      heading: 'Looking for a dedicated engineer for your team?',
      description:
        'Immediately available for software development, systems analysis, or IT support roles — remote or on-site. Send me an email and I will reply the same day.',
      locationLabel: 'Location',
      phoneLabel: 'Phone',
      modalityLabel: 'Availability',
      modalityValue: 'Remote, hybrid, or on-site',
    },
  },
} as const
