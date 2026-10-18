/**
 * Formulario de contacto interactivo.
 * - Validación nativa de HTML5 (Constraint Validation API: validity,
 *   checkValidity, setCustomValidity) ejecutada en tiempo real con el
 *   evento `input` y al enviar con el evento `submit`.
 * - event.preventDefault() evita la recarga de la página.
 */
const ERROR_MESSAGES = Object.freeze({
  input_name: {
    valueMissing: 'El nombre es obligatorio.',
    tooShort: 'Escribe al menos 3 caracteres.'
  },
  input_email: {
    valueMissing: 'El correo es obligatorio.',
    typeMismatch: 'Ingresa un correo válido, por ejemplo nombre@dominio.com.',
    patternMismatch: 'Ingresa un correo válido, por ejemplo nombre@dominio.com.'
  },
  input_subject: {
    valueMissing: 'El asunto es obligatorio.',
    tooShort: 'El asunto es demasiado corto (mínimo 3 caracteres).'
  },
  input_message: {
    valueMissing: 'El mensaje es obligatorio.',
    tooShort: 'Agrega un poco más de información (mínimo 10 caracteres).'
  }
});

/** Devuelve el mensaje de error del primer estado inválido, o '' si el campo es válido. */
function getErrorMessage(field) {
  if (field.validity.valid) return '';

  const messages = ERROR_MESSAGES[field.id] ?? {};
  const failedState = Object.keys(messages).find((state) => field.validity[state]);
  return messages[failedState] ?? field.validationMessage;
}

/** Los espacios en blanco no cuentan como contenido: se marca como "demasiado corto". */
function applyTrimmedLengthRule(field) {
  field.setCustomValidity('');
  const trimmedLength = field.value.trim().length;

  if (field.minLength > 0 && trimmedLength > 0 && trimmedLength < field.minLength) {
    field.setCustomValidity(ERROR_MESSAGES[field.id]?.tooShort ?? 'Texto demasiado corto.');
  } else if (field.required && trimmedLength === 0) {
    field.setCustomValidity(ERROR_MESSAGES[field.id]?.valueMissing ?? 'Campo obligatorio.');
  }
}

export function initContactForm() {
  const form = document.getElementById('contact_form');
  if (!form) return;

  const fields = [...form.querySelectorAll('.field_input')];
  const statusMessage = document.getElementById('form_status');
  const messageField = document.getElementById('input_message');
  const messageCounter = document.getElementById('message_counter');

  function validateField(field) {
    applyTrimmedLengthRule(field);

    const isValid = field.checkValidity();
    const errorElement = document.getElementById(`error_${field.id.replace('input_', '')}`);
    const message = isValid ? '' : getErrorMessage(field) || field.validationMessage;

    errorElement.textContent = message;
    field.classList.toggle('is_invalid', !isValid);
    field.classList.toggle('is_valid', isValid && field.value.length > 0);
    field.setAttribute('aria-invalid', String(!isValid));
    return isValid;
  }

  function updateCounter() {
    messageCounter.textContent = `${messageField.value.length} / ${messageField.maxLength}`;
  }

  function resetFeedback() {
    fields.forEach((field) => {
      field.classList.remove('is_valid', 'is_invalid');
      field.removeAttribute('aria-invalid');
      document.getElementById(`error_${field.id.replace('input_', '')}`).textContent = '';
    });
    updateCounter();
  }

  function setStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `form_status is_${type}`;
  }

  // Validación en tiempo real mientras el usuario escribe
  fields.forEach((field) => {
    field.addEventListener('input', () => validateField(field));
    field.addEventListener('blur', () => validateField(field));
  });
  messageField.addEventListener('input', updateCounter);

  form.addEventListener('submit', (event) => {
    event.preventDefault(); // evita la recarga de la página

    const invalidFields = fields.filter((field) => !validateField(field));
    if (invalidFields.length > 0) {
      setStatus('Revisa los campos marcados antes de enviar.', 'error');
      invalidFields[0].focus();
      return;
    }

    const { nombre } = Object.fromEntries(new FormData(form));
    form.reset();
    resetFeedback();
    setStatus(
      `Formulario validado, ${nombre.trim()}. Esta demostración no envía el mensaje a un servidor.`,
      'success'
    );
  });

  updateCounter();
}
