import { STORAGE_KEYS } from '../core/config.js';
import { getJSON, setJSON } from '../core/storage.js';
import { showToast, toNumberFromCurrency } from '../core/ui.js';

const catalogGrid = document.querySelector('.catalog__grid');

if (catalogGrid) {
  initCatalog();
}

function initCatalog() {
  const cards = Array.from(document.querySelectorAll('.product-card'));
  const sortSelect = document.getElementById('sort-select');
  const minPriceInput = document.getElementById('price-min');
  const maxPriceInput = document.getElementById('price-max');
  const applyPriceButton = document.querySelector('.filters__price-apply');
  const resetButton = document.querySelector('.filters__reset');
  const countCurrent = document.getElementById('catalog-count-current');
  const countTotal = document.getElementById('catalog-count-total');

  cards.forEach((card) => enrichCardData(card));
  preselectCategoryFromQuery();

  const applyFilters = () => {
    const selectedCategories = Array.from(document.querySelectorAll('input[name="category"]:checked')).map((input) => input.value);
    const selectedRating = Number(document.querySelector('input[name="rating"]:checked')?.value || 0);
    const availability = Array.from(document.querySelectorAll('input[name="availability"]:checked')).map((input) => input.value);
    const minPrice = Number(minPriceInput?.value || 0);
    const maxPrice = Number(maxPriceInput?.value || Number.MAX_SAFE_INTEGER);

    cards.forEach((card) => {
      const category = card.dataset.category;
      const rating = Number(card.dataset.rating || 0);
      const price = Number(card.dataset.price || 0);
      const isSale = card.dataset.sale === 'true';

      const categoryMatch = !selectedCategories.length || selectedCategories.includes(category);
      const ratingMatch = rating >= selectedRating;
      const priceMatch = price >= minPrice && price <= maxPrice;
      const stockMatch = !availability.includes('in-stock') || Number(card.dataset.stock || 0) > 0;
      const saleMatch = !availability.includes('on-sale') || isSale;

      card.style.display = categoryMatch && ratingMatch && priceMatch && stockMatch && saleMatch ? '' : 'none';
    });

    sortCards(cards, sortSelect?.value || 'relevance');
    updateCount(countCurrent, countTotal, cards);
  };

  sortSelect?.addEventListener('change', () => {
    sortCards(cards, sortSelect.value);
    updateCount(countCurrent, countTotal, cards);
  });

  document.querySelectorAll('.filters input').forEach((input) => input.addEventListener('change', applyFilters));
  applyPriceButton?.addEventListener('click', applyFilters);

  resetButton?.addEventListener('click', () => {
    document.querySelectorAll('.filters input').forEach((input) => {
      if (input.type === 'checkbox' || input.type === 'radio') input.checked = false;
      if (input.type === 'number') input.value = '';
    });
    sortSelect.value = 'relevance';
    applyFilters();
  });

  setupAddToCart();
  applyFilters();
}

function preselectCategoryFromQuery() {
  const categoryFromUrl = new URLSearchParams(window.location.search).get('category');
  if (!categoryFromUrl) return;
  const checkbox = document.querySelector(`input[name=\"category\"][value=\"${categoryFromUrl}\"]`);
  if (checkbox) checkbox.checked = true;
}

function enrichCardData(card) {
  const categoryText = (card.querySelector('.product-card__category')?.textContent || '').toLowerCase();
  const ratingText = card.querySelector('.product-card__rating')?.textContent || '';
  const priceText = card.querySelector('.product-card__price')?.textContent || '0';
  const saleBadge = card.querySelector('.product-card__badge--sale');

  let mappedCategory = 'hogar';
  if (categoryText.includes('pijama') || categoryText.includes('ropa')) mappedCategory = 'ropa';
  if (categoryText.includes('accesorio')) mappedCategory = 'accesorios';

  card.dataset.category = mappedCategory;
  card.dataset.rating = String((ratingText.match(/★/g) || []).length);
  card.dataset.price = String(toNumberFromCurrency(priceText));
  card.dataset.stock = '10';
  card.dataset.sale = saleBadge ? 'true' : 'false';
}

function sortCards(cards, sortBy) {
  const sorted = [...cards].sort((a, b) => {
    const priceA = Number(a.dataset.price || 0);
    const priceB = Number(b.dataset.price || 0);
    const ratingA = Number(a.dataset.rating || 0);
    const ratingB = Number(b.dataset.rating || 0);

    if (sortBy === 'price-asc') return priceA - priceB;
    if (sortBy === 'price-desc') return priceB - priceA;
    if (sortBy === 'popular') return ratingB - ratingA;
    if (sortBy === 'newest') return Number(Boolean(b.querySelector('.product-card__badge--new'))) - Number(Boolean(a.querySelector('.product-card__badge--new')));
    return 0;
  });

  sorted.forEach((card) => card.parentElement.appendChild(card));
}

function updateCount(currentElement, totalElement, cards) {
  if (!currentElement || !totalElement) return;
  const visible = cards.filter((card) => card.style.display !== 'none').length;
  currentElement.textContent = String(visible);
  totalElement.textContent = String(cards.length);
}

function setupAddToCart() {
  const buttons = document.querySelectorAll('.product-card__btn--cart');

  buttons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.product-card');
      const cart = getJSON(STORAGE_KEYS.cart, []);
      const name = card.querySelector('.product-card__name')?.textContent?.trim() || 'Producto';
      const price = Number(card.dataset.price || 0);

      const existingItem = cart.find((item) => item.name === name);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ name, price, quantity: 1 });
      }

      setJSON(STORAGE_KEYS.cart, cart);
      showToast(`${name} agregado al carrito.`, 'success');
    });
  });
}
