import { STORAGE_KEYS } from '../core/config.js';
import { getJSON, setJSON } from '../core/storage.js';
import { showToast, toNumberFromCurrency } from '../core/ui.js';

initPromotions();

function initPromotions() {
  bindCouponCards();
  bindPromoProducts();
}

function bindCouponCards() {
  document.querySelectorAll('.coupon-card').forEach((card) => {
    const codeElement = card.querySelector('.coupon-card__code');
    if (!codeElement) return;

    card.classList.add('coupon-card--interactive');
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const applyCoupon = () => {
      const code = codeElement.textContent.trim().toUpperCase();
      localStorage.setItem(STORAGE_KEYS.coupon, code);
      showToast(`Cupón ${code} listo para usar en el carrito.`, 'success');
    };

    card.addEventListener('click', applyCoupon);
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        applyCoupon();
      }
    });
  });
}

function bindPromoProducts() {
  document.querySelectorAll('.promo-card').forEach((card) => {
    const button = card.querySelector('.promo-card__button');
    if (!button) return;

    button.addEventListener('click', (event) => {
      event.preventDefault();

      const cart = getJSON(STORAGE_KEYS.cart, []);
      const name = card.querySelector('.promo-card__name')?.textContent?.trim() || 'Producto en oferta';
      const price = toNumberFromCurrency(card.querySelector('.promo-card__price--discounted')?.textContent || '0');

      const existing = cart.find((item) => item.name === name);
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({ name, price, quantity: 1 });
      }

      setJSON(STORAGE_KEYS.cart, cart);
      showToast(`${name} agregado al carrito desde promociones.`, 'info');
      window.location.href = '../cart/cart.html';
    });
  });
}
