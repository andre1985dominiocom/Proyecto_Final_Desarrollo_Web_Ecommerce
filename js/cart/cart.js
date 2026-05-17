import { COUPON_DISCOUNTS, STORAGE_KEYS } from '../core/config.js';
import { getJSON, setJSON } from '../core/storage.js';
import { formatCurrency, showToast, toNumberFromCurrency } from '../core/ui.js';

const itemsContainer = document.getElementById('cart-items');

if (itemsContainer) {
  initCart();
}

function initCart() {
  bindActions();
  hydrateInitialCart();
  renderCart();
}

function bindActions() {
  document.getElementById('cart-clear-btn')?.addEventListener('click', () => {
    setJSON(STORAGE_KEYS.cart, []);
    renderCart();
    showToast('Carrito vaciado correctamente.', 'info');
  });

  document.getElementById('cart-coupon-btn')?.addEventListener('click', applyCoupon);
}

function hydrateInitialCart() {
  const stored = getJSON(STORAGE_KEYS.cart, null);
  if (Array.isArray(stored) && stored.length) return;

  const staticRows = Array.from(document.querySelectorAll('#cart-items .cart__item'));

  const snapshot = staticRows.map((row) => ({
    name: row.querySelector('.cart__item-name')?.textContent?.trim() || 'Producto',
    price: toNumberFromCurrency(row.querySelector('.cart__item-price')?.textContent || 0),
    quantity: Number(row.querySelector('.cart__quantity-input')?.value || 1)
  }));

  setJSON(STORAGE_KEYS.cart, snapshot);
}

function getCart() {
  return getJSON(STORAGE_KEYS.cart, []);
}

function setCart(cart) {
  setJSON(STORAGE_KEYS.cart, cart);
}

function applyCoupon() {
  const couponInput = document.getElementById('coupon');
  const couponCode = (couponInput?.value || '').trim().toUpperCase();

  if (!couponCode) {
    showToast('Ingresa un cupón para aplicar.', 'error');
    return;
  }

  if (!COUPON_DISCOUNTS[couponCode]) {
    showToast('Cupón no válido.', 'error');
    return;
  }

  localStorage.setItem(STORAGE_KEYS.coupon, couponCode);
  renderCart();
  showToast(`Cupón ${couponCode} aplicado correctamente.`, 'success');
}

function updateSummary(cart) {
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const shipping = subtotal > 0 ? 10000 : 0;
  const couponCode = localStorage.getItem(STORAGE_KEYS.coupon) || '';
  const couponDiscount = COUPON_DISCOUNTS[couponCode] || 0;
  const discount = subtotal * couponDiscount;
  const total = Math.max(subtotal + shipping - discount, 0);

  document.getElementById('cart-subtotal')?.replaceChildren(document.createTextNode(formatCurrency(subtotal)));
  document.getElementById('cart-shipping')?.replaceChildren(document.createTextNode(formatCurrency(shipping)));
  document.getElementById('cart-total')?.replaceChildren(document.createTextNode(formatCurrency(total)));
}

function renderCart() {
  const cart = getCart();
  const emptyState = document.getElementById('cart-empty');
  const layout = document.getElementById('cart-layout');

  if (!cart.length) {
    itemsContainer.innerHTML = '';
    layout?.classList.add('u-hidden');
    emptyState?.classList.remove('u-hidden');
    updateSummary([]);
    return;
  }

  layout?.classList.remove('u-hidden');
  emptyState?.classList.add('u-hidden');

  itemsContainer.innerHTML = cart.map((item, index) => `
    <div class="cart__item" data-index="${index}">
      <div class="cart__item-product">
        <div>
          <p class="cart__item-name">${item.name}</p>
          <p class="cart__item-sku">Ref: PRD-${String(index + 1).padStart(3, '0')}</p>
        </div>
      </div>
      <span class="cart__item-price">${formatCurrency(item.price)}</span>
      <div class="cart__item-quantity">
        <button class="cart__quantity-btn" type="button" data-action="decrease">-</button>
        <input type="number" class="cart__quantity-input" value="${item.quantity}" min="1" max="99">
        <button class="cart__quantity-btn" type="button" data-action="increase">+</button>
      </div>
      <span class="cart__item-subtotal">${formatCurrency(item.price * item.quantity)}</span>
      <button class="cart__item-remove" type="button" data-action="remove" aria-label="Eliminar producto">&#10005;</button>
    </div>
  `).join('');

  itemsContainer.querySelectorAll('.cart__item').forEach((row) => {
    row.querySelectorAll('button[data-action]').forEach((button) => {
      button.addEventListener('click', () => updateItem(row, button.dataset.action));
    });
    row.querySelector('.cart__quantity-input')?.addEventListener('change', () => updateItem(row, 'input'));
  });

  updateSummary(cart);
}

function updateItem(row, action) {
  const index = Number(row.dataset.index || 0);
  const cart = getCart();
  const item = cart[index];

  if (!item) return;

  if (action === 'increase') item.quantity += 1;
  if (action === 'decrease') item.quantity = Math.max(1, item.quantity - 1);
  if (action === 'input') {
    const inputValue = Number(row.querySelector('.cart__quantity-input')?.value || 1);
    item.quantity = Math.min(99, Math.max(1, inputValue));
  }
  if (action === 'remove') cart.splice(index, 1);

  setCart(cart);
  renderCart();
}
