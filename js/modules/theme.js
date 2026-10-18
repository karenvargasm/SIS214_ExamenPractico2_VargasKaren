/**
 * Conmutador de tema (claro / oscuro).
 * - Alterna el atributo data-theme del elemento <html>.
 * - Persiste la preferencia en localStorage serializada con JSON.stringify()
 *   y la restaura con JSON.parse() al recargar la página.
 */
const STORAGE_KEY = 'cvThemePreference';
const THEMES = Object.freeze({ light: 'light', dark: 'dark' });

/** Lee y valida la preferencia guardada. Devuelve null si no existe o es inválida. */
function readStoredTheme() {
  try {
    const rawValue = localStorage.getItem(STORAGE_KEY);
    if (rawValue === null) return null;

    const { theme } = JSON.parse(rawValue);
    return Object.values(THEMES).includes(theme) ? theme : null;
  } catch {
    // localStorage bloqueado o JSON corrupto: se usa el tema por defecto.
    return null;
  }
}

/** Guarda la preferencia como objeto serializado (tema + fecha de guardado). */
function storeTheme(theme) {
  try {
    const payload = { theme, savedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Sin almacenamiento disponible: el cambio sigue funcionando en la sesión.
  }
}

function getSystemTheme() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? THEMES.dark
    : THEMES.light;
}

function applyTheme(theme, toggleButton, toggleLabel) {
  const isDark = theme === THEMES.dark;
  document.documentElement.dataset.theme = theme;
  toggleButton.setAttribute('aria-pressed', String(isDark));
  toggleButton.setAttribute(
    'aria-label',
    `Modo ${isDark ? 'oscuro' : 'claro'}. Activar modo ${isDark ? 'claro' : 'oscuro'}`
  );
  if (toggleLabel) {
    toggleLabel.textContent = `Modo ${isDark ? 'oscuro' : 'claro'}`;
  }
}

export function initTheme() {
  const toggleButton = document.getElementById('theme_toggle');
  if (!toggleButton) return;
  const toggleLabel = document.getElementById('theme_label');

  applyTheme(readStoredTheme() ?? getSystemTheme(), toggleButton, toggleLabel);

  toggleButton.addEventListener('click', () => {
    const isDark = document.documentElement.dataset.theme === THEMES.dark;
    const nextTheme = isDark ? THEMES.light : THEMES.dark;

    applyTheme(nextTheme, toggleButton, toggleLabel);
    storeTheme(nextTheme);
  });
}
