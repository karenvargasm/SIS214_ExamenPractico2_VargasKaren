/**
 * Punto de entrada de la aplicación (módulo ES6).
 * Cada funcionalidad vive en su propio módulo dentro de js/modules/.
 */
import { initTheme } from './modules/theme.js';
import { initMenu, initScrollSpy } from './modules/menu.js';
import { initProjects } from './modules/projects.js';
import { initContactForm } from './modules/contact.js';
import { initGithub } from './modules/github.js';
import { setCurrentYear, initAccordion, initCopyEmail } from './modules/ui.js';

initTheme();
initMenu();
initScrollSpy();
initProjects();
initContactForm();
initGithub();
initAccordion();
initCopyEmail();
setCurrentYear();
