import { API_ENDPOINTS, COUPON_DISCOUNTS, STORAGE_KEYS } from '../core/config.js';
import { request } from '../core/http.js';
import { getJSON, setJSON } from '../core/storage.js';
import { formatCurrency, setButtonLoading, showToast } from '../core/ui.js';

const form = document.getElementById('checkout-form');

if (form) {
  initCheckout();
}

function initCheckout() {
  hydrateSummary();
  hydrateFormDraft();
  bindPaymentToggles();
  bindCardFormatters();
  form.addEventListener('input', persistDraft);
  form.addEventListener('submit', submitCheckout);
}

function hydrateSummary() {
  const cart = getJSON(STORAGE_KEYS.cart, []);
  const list = document.getElementById('checkout-summary-items');

  if (!Array.isArray(cart) || !cart.length) return;

  const subtotal = cart.reduce((acc, item) => acc + (item.price || 0) * (item.quantity || 1), 0);
  const shipping = subtotal > 0 ? 10000 : 0;
  const couponCode = localStorage.getItem(STORAGE_KEYS.coupon) || '';
  const couponDiscount = COUPON_DISCOUNTS[couponCode] || 0;
  const discount = subtotal * couponDiscount;
  const total = subtotal + shipping - discount;

  if (list) {
    list.innerHTML = cart.map((item) => `
      <li class="checkout__summary-item">
        <span class="checkout__summary-item-name">${item.name}</span>
        <span class="checkout__summary-item-qty">x${item.quantity}</span>
        <span class="checkout__summary-item-price">${formatCurrency((item.price || 0) * (item.quantity || 1))}</span>
      </li>
    `).join('');
  }

  document.getElementById('checkout-summary-subtotal')?.replaceChildren(document.createTextNode(formatCurrency(subtotal)));
  document.getElementById('checkout-summary-shipping')?.replaceChildren(document.createTextNode(formatCurrency(shipping)));
  document.getElementById('checkout-summary-discount')?.replaceChildren(document.createTextNode(`-${formatCurrency(discount)}`));
  document.getElementById('checkout-summary-total')?.replaceChildren(document.createTextNode(formatCurrency(total)));
}

function bindPaymentToggles() {
  const radios = document.querySelectorAll('input[name="payment-method"]');
  const cardFields = document.getElementById('card-fields');

  const update = () => {
    const selected = document.querySelector('input[name="payment-method"]:checked')?.value;
    cardFields?.classList.toggle('u-hidden', selected !== 'credit-card');
  };

  radios.forEach((radio) => radio.addEventListener('change', update));
  update();
}

function bindCardFormatters() {
  const cardNumber = document.getElementById('card-number');
  const cardExpiry = document.getElementById('card-expiry');

  cardNumber?.addEventListener('input', () => {
    cardNumber.value = cardNumber.value.replace(/\D/g, '').slice(0, 16);
  });

  cardNumber?.addEventListener('blur', () => {
    cardNumber.value = formatCardNumber(cardNumber.value);
  });

  cardExpiry?.addEventListener('input', () => {
    const cleaned = cardExpiry.value.replace(/\D/g, '').slice(0, 4);
    cardExpiry.value = cleaned.length > 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2)}` : cleaned;
  });
}

function formatCardNumber(rawValue = '') {
  return rawValue.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
}

function persistDraft() {
  const payload = Object.fromEntries(new FormData(form).entries());
  setJSON(STORAGE_KEYS.checkoutDraft, payload);
}

function hydrateFormDraft() {
  const draft = getJSON(STORAGE_KEYS.checkoutDraft, null);
  if (!draft) return;

  Object.entries(draft).forEach(([name, value]) => {
    const input = form.elements.namedItem(name);
    if (!input) return;

    if (input instanceof RadioNodeList) {
      Array.from(input).forEach((radio) => {
        radio.checked = radio.value === value;
      });
      return;
    }

    if (input.type === 'checkbox') {
      input.checked = value === 'on' || value === true || value === 'true';
      return;
    }

    input.value = value;
  });
}

async function submitCheckout(event) {
  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  const payload = Object.fromEntries(new FormData(form).entries());
  payload['doc-type'] = normalizeDocumentType(payload['doc-type']);
  payload.items = getJSON(STORAGE_KEYS.cart, []);

  setButtonLoading(submitButton, true, 'Confirmando...');

  const result = await request(API_ENDPOINTS.checkout, {
    method: 'POST',
    body: payload
  });

  if (!result.ok) {
    const localOrders = getJSON(STORAGE_KEYS.orders, []);
    localOrders.push({ id: `LOCAL-${Date.now()}`, ...payload, status: 'Pendiente' });
    setJSON(STORAGE_KEYS.orders, localOrders);
    showToast('Backend no disponible: pedido guardado localmente.', 'warning');
  } else {
    showToast('Pedido confirmado correctamente.', 'success');
  }

  localStorage.removeItem(STORAGE_KEYS.cart);
  localStorage.removeItem(STORAGE_KEYS.checkoutDraft);
  setButtonLoading(submitButton, false);

  setTimeout(() => {
    window.location.href = './confirmation.html';
  }, 1200);
}

function normalizeDocumentType(value) {
  const map = { cc: 'CC', foreign_id: 'CE', passport: 'PP', card_id: 'TI' };
  return map[value] || value;
}
