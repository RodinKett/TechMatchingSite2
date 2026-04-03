function formatValidatie(event) {
  const form = event.target.closest('form');
  if (!form) return;

  let valid = true;

  const inputs = form.querySelectorAll('input, textarea, select');

  inputs.forEach(input => {
    const value = input.value.trim();
    const errorEl = form.querySelector(`.error-${input.name.replace(/[^a-zA-Z0-9_-]/g, '-')}`);
    if (errorEl) errorEl.style.display = 'none';

    switch (input.type) {
      case 'text':
      case 'textarea':
        if (input.required && !value) {
          if (errorEl) { errorEl.textContent = `${input.previousElementSibling.textContent} is verplicht.`; errorEl.style.display = 'block'; }
          valid = false;
        } else if (value && input.pattern) {
          const regex = new RegExp(input.pattern);
          if (!regex.test(value)) {
            if (errorEl) { errorEl.textContent = `Ongeldige invoer voor ${input.previousElementSibling.textContent}.`; errorEl.style.display = 'block'; }
            valid = false;
          }
        }
        break;

      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (input.required && !value) {
          if (errorEl) { errorEl.textContent = 'Email is verplicht.'; errorEl.style.display = 'block'; }
          valid = false;
        } else if (value && !emailRegex.test(value)) {
          if (errorEl) { errorEl.textContent = 'Ongeldig emailformaat.'; errorEl.style.display = 'block'; }
          valid = false;
        }
        break;

      case 'password':
        if (input.required && !value) {
          if (errorEl) { errorEl.textContent = 'Wachtwoord is verplicht.'; errorEl.style.display = 'block'; }
          valid = false;
        } else if (value && input.pattern) {
          const regex = new RegExp(input.pattern);
          if (!regex.test(value)) {
            if (errorEl) { errorEl.textContent = `Ongeldig wachtwoordformaat.`; errorEl.style.display = 'block'; }
            valid = false;
          }
        }
        break;

      case 'number':
        const min = input.min ? parseFloat(input.min) : -Infinity;
        const max = input.max ? parseFloat(input.max) : Infinity;
        const numValue = parseFloat(value);
        if (input.required && (value === '' || isNaN(numValue))) {
          if (errorEl) { errorEl.textContent = `${input.previousElementSibling.textContent} is verplicht.`; errorEl.style.display = 'block'; }
          valid = false;
        } else if (numValue < min || numValue > max) {
          if (errorEl) { errorEl.textContent = `Waarde moet tussen ${min} en ${max} liggen.`; errorEl.style.display = 'block'; }
          valid = false;
        }
        break;

      case 'date':
        if (input.required && !value) {
          if (errorEl) { errorEl.textContent = `${input.previousElementSibling.textContent} is verplicht.`; errorEl.style.display = 'block'; }
          valid = false;
        }
        break;

      case 'checkbox':
        const checkboxes = form.querySelectorAll(`input[name="${input.name}"]:checked`);
        if (input.required && checkboxes.length === 0) {
          if (errorEl) { errorEl.textContent = `Selecteer minimaal één ${input.previousElementSibling.textContent.toLowerCase()}.`; errorEl.style.display = 'block'; }
          valid = false;
        }
        break;

      case 'file':
        // Optioneel: bestandstype/grootte validatie
        break;

      case 'select-one':
        if (input.required && (value === '' || value === 'beginer')) {
          if (errorEl) { errorEl.textContent = `Selecteer ${input.previousElementSibling.textContent.toLowerCase()}.`; errorEl.style.display = 'block'; }
          valid = false;
        }
        break;
    }
  });

  if (!valid) event.preventDefault();
}