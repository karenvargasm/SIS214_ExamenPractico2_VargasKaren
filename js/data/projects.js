/**
 * Datos de los proyectos académicos.
 * El arreglo y cada objeto se congelan con Object.freeze: la interfaz solo lee
 * estos datos y nunca los muta; los filtros siempre generan arreglos nuevos.
 */
const rawProjects = [
  {
    id: 'merceria',
    title: 'Portal Web Mercería Express',
    category: 'Desarrollo Web',
    summary: 'Interfaz web para presentar productos y servicios con diseño responsivo.',
    details: [
      'Desarrollo de una interfaz web para presentar productos y servicios',
      'Diseño de páginas de inicio, catálogo, categorías y productos',
      'Aplicación de HTML5, CSS3 y JavaScript',
      'Implementación de diseño responsivo',
      'Trabajo colaborativo mediante control de versiones'
    ],
    tags: ['HTML5', 'CSS3', 'JavaScript', 'Git']
  },
  {
    id: 'kanbas',
    title: 'Sistema de gestión de tareas Kanbas',
    category: 'Análisis y Diseño',
    summary: 'Análisis y diseño de un sistema de gestión de tareas tipo kanban.',
    details: [
      'Modelado de entidades como Usuario, Tarea, Estado, Sprint y Comentario',
      'Diseño de la estructura funcional del sistema',
      'Aplicación de conceptos de análisis y diseño de sistemas'
    ],
    tags: ['Modelado', 'Kanban', 'Sprint']
  },
  {
    id: 'programacion',
    title: 'Proyectos de programación',
    category: 'Programación',
    summary: 'Ejercicios y aplicaciones académicas con distintas estructuras de datos.',
    details: [
      'Programación en Java y C++',
      'Uso de funciones, estructuras de control, ciclos y recursividad',
      'Implementación de estructuras de datos',
      'Desarrollo de algoritmos para resolución de problemas'
    ],
    tags: ['Java', 'C++', 'Estructuras de datos', 'Recursividad']
  },
  {
    id: 'inmuebles',
    title: 'Base de datos para gestión de inmuebles',
    category: 'Bases de Datos',
    summary: 'Diseño de una base de datos relacional para gestión de inmuebles.',
    details: [
      'Modelado de una base de datos para la gestión de inmuebles y usuarios',
      'Utilización de PostgreSQL y SQL',
      'Diseño de tablas, relaciones y restricciones',
      'Aplicación de conceptos de normalización y organización de datos'
    ],
    tags: ['PostgreSQL', 'SQL', 'Normalización']
  },
  {
    id: 'redes',
    title: 'Proyecto de redes con Cisco Packet Tracer',
    category: 'Redes',
    summary: 'Configuración y simulación de una red con varios servicios activos.',
    details: [
      'Configuración de VLAN',
      'Configuración básica de dispositivos de red',
      'Implementación y comprobación de conectividad',
      'Configuración de servicios como DNS, HTTP, FTP y correo electrónico',
      'Uso de Cisco Packet Tracer'
    ],
    tags: ['Cisco Packet Tracer', 'VLAN', 'DNS', 'HTTP', 'FTP']
  },
  {
    id: 'flutter',
    title: 'Aplicaciones con Flutter',
    category: 'Desarrollo Móvil',
    summary: 'Interfaces y aplicaciones móviles construidas con Flutter.',
    details: [
      'Creación de interfaces utilizando Flutter',
      'Implementación de componentes y estructuras básicas de aplicaciones',
      'Trabajo con Visual Studio Code'
    ],
    tags: ['Flutter', 'Dart', 'Visual Studio Code']
  }
];

export const projects = Object.freeze(
  rawProjects.map((project) =>
    Object.freeze({
      ...project,
      details: Object.freeze([...project.details]),
      tags: Object.freeze([...project.tags])
    })
  )
);
