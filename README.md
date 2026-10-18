# CV Interactivo - Karen Grissel Vargas Medrano

Landing page interactiva de CV / portafolio profesional. Segunda evaluación
práctica de **Tecnologías Web I (SIS-214)**, Unidad II: Desarrollo de
Interfaces Dinámicas con JavaScript. Universidad Católica Boliviana
"San Pablo".

- **Producción (GitHub Pages):** <https://karenvargasm.github.io/SIS214_ExamenPractico2_VargasKaren/>
- **Repositorio:** <https://github.com/karenvargasm/SIS214_ExamenPractico2_VargasKaren>

> La entrega del Examen 1 (CV multipágina) queda marcada con el tag
> `v1.0-examen1`. Este examen evoluciona el mismo proyecto.

> El repositorio existente se renombró para cumplir la nomenclatura del
> Examen 2, conservando su historial y sus commits. Los cambios de esta copia
> local todavía no se han publicado. GitHub Pages ya está activo en la URL de
> producción indicada, pero su última publicación todavía no incluye estos
> cambios locales.

## Tecnologías utilizadas

| Capa | Tecnología |
| --- | --- |
| Estructura | HTML5 semántico + WAI-ARIA |
| Estilos | CSS3: Flexbox, Grid, custom properties, Media Queries (Mobile-First) |
| Lógica | JavaScript ES6+ con módulos nativos (`import` / `export`) |
| Datos externos | API REST pública de GitHub mediante Fetch API |
| Persistencia | `localStorage` (tema) y `sessionStorage` (caché de la API) |
| Versionado y despliegue | Git, GitHub y GitHub Pages |

No usa frameworks ni dependencias: todo es HTML, CSS y JS nativos.

## Arquitectura de la solución

```
Cv-interactivo-Vargas/
├── index.html                # Landing de una sola página (todas las secciones)
├── css/
│   ├── base.css              # Tokens (:root), reset universal, tipografía, accesibilidad
│   ├── layout.css            # Cabecera, navegación, rejillas y breakpoints (Mobile-First)
│   └── components.css        # Botones, tarjetas, formularios, acordeón, modal, estados de la API
├── js/
│   ├── main.js               # Punto de entrada: inicializa los módulos
│   ├── data/
│   │   └── projects.js       # Datos de proyectos (inmutables con Object.freeze)
│   └── modules/
│       ├── theme.js          # Tema claro/oscuro + localStorage (JSON.stringify/parse)
│       ├── menu.js           # Menú hamburguesa (aria-expanded) + sección activa
│       ├── projects.js       # Buscador/filtro en tiempo real (.filter().map())
│       ├── contact.js        # Formulario con validación nativa y preventDefault()
│       ├── github.js         # Fetch API async/await, loading/success/error
│       ├── ui.js             # Acordeón accesible, copiar correo, año del pie
│       └── utils.js          # escapeHtml() y normalizeText()
├── assets/images/
└── README.md
```

> Los archivos multipágina y de soporte del Examen 1 se conservan en el árbol
> local, pero la landing del Examen 2 se sirve desde `index.html` y no los
> carga ni enlaza.

### Decisiones de diseño

- **Una sola página:** al ser una *landing page*, cada apartado es una
  `<section>` con ancla (`#perfil`, `#proyectos`, `#contacto`...) y la
  navegación hace scroll suave a cada una.
- **Semántica sin "divitis":** el `index.html` de entrada usa `header`, `nav`,
  `main`, `section`, `article`, `aside`, `footer`, `figure`, `dl`, `meter` y
  `dialog`; no contiene ningún `<div>`.
- **Flexbox vs Grid:** Flexbox para alineaciones de una dimensión (cabecera,
  menú, chips, botones, pie); Grid para esquemas de dos dimensiones (hero,
  perfil, rejillas de habilidades, proyectos, repositorios y contacto).
- **Mobile-First:** los estilos base son para móvil (< 768px). Se amplían con
  `@media (min-width: 768px)` (tablet: 768px a 1024px) y
  `@media (min-width: 1025px)` (escritorio: > 1024px).
- **Nomenclatura:** variables CSS en `kebab-case` (`--primary-color`), clases e
  ids en `snake_case` (`.project_card`, `#contact_form`), JavaScript en
  `camelCase` y constantes en `UPPER_SNAKE_CASE`.

## Las 5 funcionalidades JavaScript

| # | Funcionalidad | Archivo | Cómo funciona |
| --- | --- | --- | --- |
| 1 | Conmutador de tema | `theme.js` | Alterna `data-theme` en `<html>`; guarda `{theme, savedAt}` con `JSON.stringify()` en `localStorage` y lo restaura con `JSON.parse()` al recargar. Si no hay preferencia usa la del sistema. |
| 2 | Menú hamburguesa | `menu.js` | `click` conmuta la clase `is_open` y muta `aria-expanded` y `aria-label`. También cierra con Escape, clic fuera o clic en un enlace. |
| 3 | Buscador / filtro | `projects.js` | Evento `input` + chips de categoría. Los datos están congelados y se procesan con `projects.filter().filter().map()` sin mutarlos. Ignora tildes y mayúsculas. |
| 4 | Formulario de contacto | `contact.js` | `submit` interceptado con `event.preventDefault()`. Validación nativa (Constraint Validation API: `required`, `minlength`, `type=email`, `pattern`) en tiempo real con `input` y mensajes de error/éxito por campo. Es una demostración frontend; no envía datos a un servidor. |
| 5 | Módulo asíncrono REST | `github.js` | `fetch` + `async/await` en `try...catch...finally`. Evalúa `response.ok` y gestiona 200, 400, 403/429, 404, 500, 502/503, timeout y fallo de red. Muestra estados *cargando*, *éxito* y *error* (con botón Reintentar). |

Para probar el estado de error del módulo 5, escribe un usuario inexistente
en la sección **Repositorios en GitHub** (devuelve 404).

## Accesibilidad (WAI-ARIA / WCAG)

- Enlace "Saltar al contenido principal" y foco de teclado visible.
- `aria-expanded` + `aria-controls` en el menú y el acordeón; `aria-pressed` en
  el tema y los filtros; `aria-current` en la sección activa.
- `aria-label` en navegaciones, medidores (`<meter>`) y botones de icono.
- `role="search"`, `role="status"`, `role="alert"`, `aria-live`, `aria-busy` y
  `aria-invalid` / `aria-describedby` en formularios y estados dinámicos.
- Modal nativo `<dialog>` (foco atrapado y cierre con Escape).
- Contraste verificado en ambos temas y respeto de `prefers-reduced-motion`.

## Cómo ejecutarlo localmente

Los módulos ES6 requieren un servidor HTTP (no funcionan abriendo el archivo
con `file://`).

```bash
git clone https://github.com/karenvargasm/SIS214_ExamenPractico2_VargasKaren.git
cd SIS214_ExamenPractico2_VargasKaren
python3 -m http.server 8000
```

Luego abre <http://localhost:8000>. Alternativa: extensión *Live Server* de
VS Code.

## Despliegue en GitHub Pages

El repositorio público ya tiene el nombre exigido y GitHub Pages está
configurado desde la rama `main`, carpeta raíz (`/`). Cuando los cambios locales
estén listos para publicar, súbelos a `main`; luego verifica la actualización en
la URL de producción indicada arriba.

## Control de versiones

Se usan commits pequeños y atómicos con mensajes descriptivos siguiendo
*Conventional Commits* (`feat:`, `fix:`, `refactor:`, `docs:`, `style:`,
`chore:`).

## Autora

Karen Grissel Vargas Medrano · Ingeniería de Sistemas · UCB "San Pablo"
