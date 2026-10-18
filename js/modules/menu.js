/**
 * Menú hamburguesa responsivo + resaltado de la sección activa.
 * - click: conmuta la clase CSS is_open y muta aria-expanded (true/false).
 * - Escape, clic fuera, clic en un enlace o pasar a escritorio lo cierran.
 */
const DESKTOP_QUERY = '(min-width: 1025px)';

export function initMenu() {
  const toggleButton = document.getElementById('menu_toggle');
  const nav = document.getElementById('main_nav');
  if (!toggleButton || !nav) return;

  const desktopMedia = window.matchMedia(DESKTOP_QUERY);

  function setMenuOpen(isOpen, { returnFocus = false } = {}) {
    nav.classList.toggle('is_open', isOpen);
    toggleButton.setAttribute('aria-expanded', String(isOpen));
    toggleButton.setAttribute('aria-label', isOpen ? 'Cerrar menú' : 'Abrir menú');

    if (isOpen) nav.querySelector('a')?.focus();
    if (!isOpen && returnFocus) toggleButton.focus();
  }

  const isMenuOpen = () => toggleButton.getAttribute('aria-expanded') === 'true';

  toggleButton.addEventListener('click', () => setMenuOpen(!isMenuOpen()));

  // Delegación de eventos: un solo listener para todos los enlaces del menú
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenuOpen(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && isMenuOpen()) setMenuOpen(false, { returnFocus: true });
  });

  document.addEventListener('click', (event) => {
    const clickedOutside = !nav.contains(event.target) && !toggleButton.contains(event.target);
    if (isMenuOpen() && clickedOutside) setMenuOpen(false);
  });

  desktopMedia.addEventListener('change', (event) => {
    if (event.matches) setMenuOpen(false);
  });
}

/** Marca como activo el enlace de la sección visible en pantalla (scrollspy). */
export function initScrollSpy() {
  const links = [...document.querySelectorAll('.nav_link')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (!('IntersectionObserver' in window) || sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries
        .filter((entry) => entry.isIntersecting)
        .forEach((entry) => {
          links.forEach((link) => {
            const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('is_active', isCurrent);
            if (isCurrent) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
          });
        });
    },
    { rootMargin: '-40% 0px -55% 0px' }
  );

  sections.forEach((section) => observer.observe(section));
}
