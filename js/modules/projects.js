/**
 * Filtro dinámico de proyectos (buscador en tiempo real + categorías).
 *
 * Inmutabilidad: el arreglo `projects` está congelado y jamás se modifica.
 * Cada interacción construye un arreglo NUEVO mediante la tubería funcional
 *   projects.filter(...).filter(...).map(...)
 */
import { projects } from '../data/projects.js';
import { escapeHtml, normalizeText } from './utils.js';

const ALL_CATEGORIES = 'Todos';

const state = { query: '', category: ALL_CATEGORIES };

const getCategories = (items) => [ALL_CATEGORIES, ...new Set(items.map((item) => item.category))];

const matchesCategory = (project, category) =>
  category === ALL_CATEGORIES || project.category === category;

const matchesQuery = (project, query) => {
  const searchableText = [project.title, project.summary, project.category, ...project.tags].join(' ');
  return normalizeText(searchableText).includes(query);
};

const renderCategoryChip = (category) => `
  <li>
    <button class="chip" type="button" data-category="${escapeHtml(category)}" aria-pressed="${category === state.category}">
      ${escapeHtml(category)}
    </button>
  </li>`;

const renderProjectCard = (project) => `
  <li>
    <article class="project_card">
      <p class="project_category">${escapeHtml(project.category)}</p>
      <h3>${escapeHtml(project.title)}</h3>
      <p class="project_summary">${escapeHtml(project.summary)}</p>
      <button class="project_detail_btn" type="button" data-project-id="${escapeHtml(project.id)}" aria-haspopup="dialog">
        Ver detalle
      </button>
    </article>
  </li>`;

const buildCountMessage = (total) => {
  if (total === 0) return 'Sin resultados.';
  return total === 1 ? '1 proyecto encontrado.' : `${total} proyectos encontrados.`;
};

export function initProjects() {
  const grid = document.getElementById('projects_grid');
  const chipList = document.getElementById('category_filters');
  const form = document.getElementById('projects_form');
  const searchInput = document.getElementById('project_search');
  const countLabel = document.getElementById('projects_count');
  const emptyMessage = document.getElementById('projects_empty');
  const dialog = document.getElementById('project_dialog');
  if (!grid || !chipList || !form || !searchInput) return;

  function renderChips() {
    chipList.innerHTML = getCategories(projects).map(renderCategoryChip).join('');
  }

  function renderProjects() {
    const query = normalizeText(state.query);

    // Tubería funcional: dos filtros encadenados y un map hacia HTML
    const cards = projects
      .filter((project) => matchesCategory(project, state.category))
      .filter((project) => matchesQuery(project, query))
      .map(renderProjectCard);

    grid.innerHTML = cards.join('');
    countLabel.textContent = buildCountMessage(cards.length);
    emptyMessage.hidden = cards.length > 0;
  }

  function openDetail(projectId) {
    const project = projects.find((item) => item.id === projectId);
    if (!project || !dialog) return;

    document.getElementById('dialog_category').textContent = project.category;
    document.getElementById('dialog_title').textContent = project.title;
    document.getElementById('dialog_summary').textContent = project.summary;
    document.getElementById('dialog_details').innerHTML = project.details
      .map((detail) => `<li>${escapeHtml(detail)}</li>`)
      .join('');
    document.getElementById('dialog_tags').innerHTML = project.tags
      .map((tag) => `<li class="tag">${escapeHtml(tag)}</li>`)
      .join('');

    dialog.showModal();
  }

  // Buscador en tiempo real: se actualiza en cada pulsación (evento input)
  searchInput.addEventListener('input', () => {
    state.query = searchInput.value;
    renderProjects();
  });

  // Enter dentro del buscador no debe recargar la página
  form.addEventListener('submit', (event) => event.preventDefault());

  // Delegación de eventos para los botones de categoría
  chipList.addEventListener('click', (event) => {
    const chip = event.target.closest('button[data-category]');
    if (!chip) return;

    state.category = chip.dataset.category;
    renderChips();
    renderProjects();
  });

  // Delegación de eventos para los botones "Ver detalle"
  grid.addEventListener('click', (event) => {
    const detailButton = event.target.closest('button[data-project-id]');
    if (detailButton) openDetail(detailButton.dataset.projectId);
  });

  // Clic sobre el fondo oscuro (::backdrop) cierra el modal
  dialog?.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  renderChips();
  renderProjects();
}
