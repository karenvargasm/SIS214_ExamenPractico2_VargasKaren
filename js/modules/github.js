/**
 * Módulo asíncrono: consumo de la API REST pública de GitHub con Fetch API.
 *
 * - async/await con bloques try...catch/finally.
 * - Se evalúa response.ok y se gestionan explícitamente los códigos HTTP
 *   (200, 400, 403, 404, 500...).
 * - La interfaz refleja tres estados: cargando (loading), éxito (success)
 *   y error (error).
 */
import { escapeHtml } from './utils.js';

const API_BASE_URL = 'https://api.github.com';
const DEFAULT_USER = 'karenvargasm';
const REPOS_PER_PAGE = 6;
const REQUEST_TIMEOUT_MS = 10000;
const CACHE_TTL_MS = 10 * 60 * 1000;
// Reglas de GitHub: 1-39 caracteres alfanuméricos o guiones, sin guion al inicio/fin
const USERNAME_PATTERN = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

/** Error propio que conserva el código de estado HTTP de la respuesta. */
class HttpError extends Error {
  constructor(status) {
    super(`HTTP ${status}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

/** Traduce un código de estado HTTP a un mensaje comprensible para el usuario. */
function describeHttpStatus(status) {
  switch (status) {
    case 400:
      return 'Solicitud incorrecta (400). Revisa el nombre de usuario ingresado.';
    case 403:
    case 429:
      return `Límite de solicitudes de GitHub alcanzado (${status}). Espera unos minutos e inténtalo de nuevo.`;
    case 404:
      return 'Usuario no encontrado (404). Verifica que el nombre de usuario exista.';
    case 500:
      return 'Error interno del servidor de GitHub (500). Inténtalo más tarde.';
    case 502:
    case 503:
      return `El servicio de GitHub no está disponible (${status}). Inténtalo más tarde.`;
    default:
      return `No se pudo completar la solicitud (código ${status}).`;
  }
}

/** Convierte cualquier excepción en un mensaje para la interfaz. */
function describeError(error) {
  if (error instanceof HttpError) return describeHttpStatus(error.status);
  if (error instanceof Error && error.name === 'AbortError') {
    return 'La solicitud tardó demasiado y fue cancelada. Inténtalo de nuevo.';
  }
  if (error instanceof TypeError) return 'No se pudo conectar con GitHub. Revisa tu conexión a internet.';
  return 'Ocurrió un error inesperado al consultar GitHub.';
}

/* --- Caché de sesión (JSON.stringify / JSON.parse) para no agotar el límite de la API --- */
function readCache(username) {
  try {
    const cached = JSON.parse(sessionStorage.getItem(`githubRepos:${username.toLowerCase()}`));
    return cached && Date.now() - cached.savedAt < CACHE_TTL_MS ? cached.repos : null;
  } catch {
    return null;
  }
}

function writeCache(username, repos) {
  try {
    sessionStorage.setItem(
      `githubRepos:${username.toLowerCase()}`,
      JSON.stringify({ savedAt: Date.now(), repos })
    );
  } catch {
    // Sin sessionStorage disponible: simplemente no se guarda en caché.
  }
}

/** Solicita los repositorios públicos del usuario. Lanza HttpError si la respuesta no es 2xx. */
async function fetchRepositories(username) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const url = `${API_BASE_URL}/users/${encodeURIComponent(username)}/repos?type=owner&sort=updated&per_page=${REPOS_PER_PAGE}`;

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: controller.signal
    });

    if (response.ok) {
      return await response.json(); // 200 OK
    }
    throw new HttpError(response.status); // 400, 403, 404, 500...
  } finally {
    clearTimeout(timeoutId);
  }
}

/* --- Plantillas de los tres estados de la interfaz --------------------------------------- */
const renderLoading = (username) => `
  <p class="state_message" role="status">
    <span class="spinner" aria-hidden="true"></span>
    Cargando repositorios de ${escapeHtml(username)}…
  </p>`;

const renderError = (message) => `
  <p class="state_message state_error" role="alert">
    <strong>No se pudo cargar la información</strong>
    <span>${escapeHtml(message)}</span>
    <button class="btn btn_secondary" type="button" data-action="retry">Reintentar</button>
  </p>`;

const dateFormatter = new Intl.DateTimeFormat('es-BO', { dateStyle: 'medium' });

const renderRepoCard = (repo) => `
  <li>
    <article class="repo_card">
      <h4><a href="${escapeHtml(repo.html_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(repo.name)}</a></h4>
      <p class="repo_description">${escapeHtml(repo.description ?? 'Sin descripción.')}</p>
      <p class="repo_meta">
        <span>${escapeHtml(repo.language ?? 'Sin lenguaje')}</span>
        <span>&#9733; ${Number(repo.stargazers_count) || 0}</span>
        <span>Actualizado: ${escapeHtml(dateFormatter.format(new Date(repo.pushed_at ?? repo.updated_at)))}</span>
      </p>
    </article>
  </li>`;

function renderSuccess(username, repos) {
  if (repos.length === 0) {
    return `<p class="state_message" role="status">${escapeHtml(username)} no tiene repositorios públicos todavía.</p>`;
  }

  const owner = repos[0].owner;
  return `
    <article class="profile_card">
      <img src="${escapeHtml(owner.avatar_url)}" alt="Avatar de ${escapeHtml(owner.login)}" width="64" height="64" loading="lazy">
      <h3><a href="${escapeHtml(owner.html_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(owner.login)}</a></h3>
      <p class="profile_meta" role="status">Mostrando ${repos.length} repositorios más recientes.</p>
    </article>
    <ul class="repo_grid">${repos.map(renderRepoCard).join('')}</ul>`;
}

export function initGithub() {
  const form = document.getElementById('github_form');
  const input = document.getElementById('github_user');
  const panel = document.getElementById('github_panel');
  const section = document.getElementById('github');
  if (!form || !input || !panel) return;

  const submitButton = form.querySelector('button[type="submit"]');
  let activeRequestId = 0; // descarta respuestas obsoletas si el usuario consulta otra vez
  let hasLoadedOnce = false;

  function setPanel(state, html) {
    panel.setAttribute('aria-busy', String(state === 'loading'));
    panel.dataset.state = state;
    panel.innerHTML = html;
  }

  async function loadRepositories(rawUsername) {
    const username = rawUsername.trim();
    const requestId = ++activeRequestId;
    hasLoadedOnce = true;

    if (!USERNAME_PATTERN.test(username)) {
      setPanel('error', renderError(describeHttpStatus(400)));
      return;
    }

    setPanel('loading', renderLoading(username));
    submitButton.disabled = true;

    try {
      const repos = readCache(username) ?? (await fetchRepositories(username));
      if (requestId !== activeRequestId) return;

      writeCache(username, repos);
      setPanel('success', renderSuccess(username, repos));
    } catch (error) {
      if (requestId !== activeRequestId) return;
      setPanel('error', renderError(describeError(error)));
    } finally {
      if (requestId === activeRequestId) submitButton.disabled = false;
    }
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    loadRepositories(input.value);
  });

  // Delegación de eventos para el botón "Reintentar" que se genera dinámicamente
  panel.addEventListener('click', (event) => {
    if (event.target.closest('[data-action="retry"]')) loadRepositories(input.value);
  });

  // Carga diferida: la primera consulta se hace cuando la sección entra en pantalla
  if ('IntersectionObserver' in window && section) {
    const observer = new IntersectionObserver((entries) => {
      if (entries.some((entry) => entry.isIntersecting) && !hasLoadedOnce) {
        loadRepositories(DEFAULT_USER);
        observer.disconnect();
      }
    }, { rootMargin: '200px 0px' });
    observer.observe(section);
  } else {
    loadRepositories(DEFAULT_USER);
  }
}
