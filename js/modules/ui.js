/** Pequeñas mejoras de interfaz: año del pie, acordeón y copiar correo. */

export function setCurrentYear() {
  const yearElement = document.getElementById('current_year');
  if (yearElement) yearElement.textContent = new Date().getFullYear();
}

/** Acordeón accesible: cada botón muta aria-expanded y muestra/oculta su panel. */
export function initAccordion() {
  const accordion = document.getElementById('areas_accordion');
  if (!accordion) return;

  // Delegación de eventos sobre la lista completa
  accordion.addEventListener('click', (event) => {
    const trigger = event.target.closest('.accordion_trigger');
    if (!trigger) return;

    const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
    trigger.setAttribute('aria-expanded', String(willOpen));
    document.getElementById(trigger.getAttribute('aria-controls')).hidden = !willOpen;
  });
}

/** Copia el correo al portapapeles y confirma con un mensaje accesible. */
export function initCopyEmail() {
  const button = document.getElementById('copy_email');
  const status = document.getElementById('copy_status');
  if (!button || !status) return;

  button.addEventListener('click', async () => {
    const email = button.dataset.email;
    try {
      await navigator.clipboard.writeText(email);
      status.textContent = `Correo copiado: ${email}`;
    } catch {
      status.textContent = `No se pudo copiar. Escríbelo manualmente: ${email}`;
    }
    window.setTimeout(() => { status.textContent = ''; }, 3000);
  });
}
