const toastRootId = 'app-toast-root';

function getToastRoot() {
  let toastRoot = document.getElementById(toastRootId);
  if (!toastRoot) {
    toastRoot = document.createElement('div');
    toastRoot.id = toastRootId;
    toastRoot.className = 'app-toast-root';
    document.body.appendChild(toastRoot);
  }
  return toastRoot;
}

export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `app-toast app-toast--${type}`;
  toast.textContent = message;
  getToastRoot().appendChild(toast);

  setTimeout(() => toast.classList.add('is-visible'), 10);
  setTimeout(() => {
    toast.classList.remove('is-visible');
    setTimeout(() => toast.remove(), 220);
  }, 3200);
}

export function setButtonLoading(button, isLoading, loadingText = 'Procesando...') {
  if (!button) return;

  if (isLoading) {
    button.dataset.originalText = button.textContent;
    button.textContent = loadingText;
    button.disabled = true;
    button.classList.add('is-loading');
    return;
  }

  button.textContent = button.dataset.originalText || button.textContent;
  button.disabled = false;
  button.classList.remove('is-loading');
}

export function renderStateRow(tbody, message, type = 'empty', colSpan = 1) {
  if (!tbody) return;
  tbody.innerHTML = `<tr><td colspan="${colSpan}" class="ui-state-cell"><span class="ui-state ui-state--${type}">${message}</span></td></tr>`;
}

export function formatCurrency(value) {
  const amount = Number(value) || 0;
  return amount.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
}

export function toNumberFromCurrency(rawValue = '') {
  const cleaned = String(rawValue).replace(/[^0-9.-]/g, '');
  const parsed = Number(cleaned);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function setInputError(input, hasError) {
  if (!input) return;
  input.classList.toggle('is-invalid', Boolean(hasError));
}
