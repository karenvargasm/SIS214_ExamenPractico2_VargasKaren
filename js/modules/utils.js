/** Funciones auxiliares compartidas entre módulos. */

const HTML_ESCAPES = Object.freeze({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
});

/** Escapa texto antes de insertarlo como HTML (evita inyección de marcado). */
export const escapeHtml = (value) =>
  String(value ?? '').replace(/[&<>"']/g, (character) => HTML_ESCAPES[character]);

/** Minúsculas y sin tildes, para que "programacion" encuentre "Programación". */
export const normalizeText = (value) =>
  String(value ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
