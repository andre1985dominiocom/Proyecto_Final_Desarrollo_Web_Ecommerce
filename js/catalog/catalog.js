import { CATALOG_ENDPOINTS, STORAGE_KEYS } from '../core/config.js';
import { request } from '../core/http.js';
import { getJSON, setJSON } from '../core/storage.js';
import { formatCurrency, showToast } from '../core/ui.js';

const catalogGrid = document.querySelector('.catalog__grid');

if (catalogGrid) {
  initCatalog();
}

async function initCatalog() {
  const sortSelect = document.getElementById('sort-select');
  const minPriceInput = document.getElementById('price-min');
  const maxPriceInput = document.getElementById('price-max');
  const applyPriceButton = document.querySelector('.filters__price-apply');
  const resetButton = document.querySelector('.filters__reset');
  const countCurrent = document.getElementById('catalog-count-current');
  const countTotal = document.getElementById('catalog-count-total');

  catalogGrid.innerHTML = '<p class="catalog__loading">Cargando productos...</p>';

  const [categoriesResponse, productsResponse] = await Promise.all([
    request(CATALOG_ENDPOINTS.categorias),
    request(CATALOG_ENDPOINTS.productos)
  ]);

  const categories = (categoriesResponse.ok && Array.isArray(categoriesResponse.data))
    ? categoriesResponse.data
    : [];

  renderCategoryFilters(categories);

  if (!productsResponse.ok || !Array.isArray(productsResponse.data)) {
    catalogGrid.innerHTML = '<p class="catalog__empty">No se pudieron cargar los productos. Intente más tarde.</p>';
    if (!productsResponse.ok) {
      showToast('No se pudo conectar con el servidor.', 'warning');
    }
    return;
  }

  const products = productsResponse.data;
  renderProducts(products, categories);
  preselectCategoryFromQuery();

  const cards = Array.from(catalogGrid.querySelectorAll('.product-card'));

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

  document.querySelector('.filters')?.addEventListener('change', applyFilters);
  applyPriceButton?.addEventListener('click', applyFilters);

  resetButton?.addEventListener('click', () => {
    document.querySelectorAll('.filters input').forEach((input) => {
      if (input.type === 'checkbox' || input.type === 'radio') input.checked = false;
      if (input.type === 'number') input.value = '';
    });
    if (sortSelect) sortSelect.value = 'relevance';
    applyFilters();
  });

  setupAddToCart(cards);
  applyFilters();
}

function renderCategoryFilters(categories) {
  const filtersList = document.getElementById('filters-category-list');
  if (!filtersList || !categories.length) return;

  filtersList.innerHTML = categories.map((cat) => {
    const id = escapeAttr(String(cat.idCategoria || cat.id || ''));
    const name = escapeHtml(cat.nombreCategoria || cat.nombre || cat.name || 'Sin nombre');
    return `
      <li class="filters__item">
        <label class="filters__label">
          <input type="checkbox" class="filters__checkbox" name="category" value="${id}"> ${name}
        </label>
      </li>`;
  }).join('');
}

function renderProducts(products, categories) {
  if (!products.length) {
    catalogGrid.innerHTML = '<p class="catalog__empty">No hay productos disponibles.</p>';
    return;
  }

  const catMap = {};
  categories.forEach((cat) => {
    const id = String(cat.idCategoria || cat.id || '');
    catMap[id] = cat.nombreCategoria || cat.nombre || cat.name || '';
  });

  catalogGrid.innerHTML = products.map((product) => buildProductCard(product, catMap)).join('');
}

function buildProductCard(product, catMap) {
  const id = product.idProducto || product.id || product.codigo || '';
  const name = product.nombreProducto || product.nombre || product.name || 'Producto';
  const price = Number(product.precio || product.price || 0);
  const stock = Number(product.stock ?? 1);
  const categoryId = String(product.idCategoria || product.categoryId || '');
  const categoryName = catMap[categoryId] || product.nombreCategoria || product.categoria || product.category || '';
  const imageUrl = product.imagenUrl || product.imagen || product.image || '';
  const isNew = Boolean(product.esNuevo || product.isNew);
  const discountPct = Number(product.descuento || product.discount || 0);
  const isSale = discountPct > 0 || Boolean(product.enOferta || product.onSale);
  const originalPrice = isSale ? Number(product.precioOriginal || product.originalPrice || 0) : 0;

  const badgeHtml = isNew
    ? '<span class="product-card__badge product-card__badge--new">Nuevo</span>'
    : isSale && discountPct > 0
      ? `<span class="product-card__badge product-card__badge--sale">-${discountPct}%</span>`
      : '';

  const imgHtml = imageUrl
    ? `<img src="${escapeAttr(imageUrl)}" alt="${escapeAttr(name)}" class="product-card__image">`
    : '';

  const priceHtml = isSale && originalPrice > 0
    ? `<span class="product-card__price">${formatCurrency(price)}</span>
       <span class="product-card__price-original">${formatCurrency(originalPrice)}</span>`
    : `<span class="product-card__price">${formatCurrency(price)}</span>`;

  const detailUrl = `../product/product-detail.html?idProducto=${encodeURIComponent(id)}`;

  return `
    <article class="product-card"
      data-id="${escapeAttr(String(id))}"
      data-category="${escapeAttr(categoryId)}"
      data-price="${price}"
      data-stock="${stock}"
      data-sale="${isSale}"
      data-rating="0">
      <a href="${detailUrl}" class="product-card__link">
        <div class="product-card__image-wrapper">
          ${imgHtml}
          <div class="product-card__image-placeholder"></div>
          ${badgeHtml}
        </div>
        <div class="product-card__body">
          <h3 class="product-card__name">${escapeHtml(name)}</h3>
          <p class="product-card__category">${escapeHtml(categoryName)}</p>
          <div class="product-card__rating"></div>
          <div class="product-card__prices">${priceHtml}</div>
        </div>
      </a>
      <div class="product-card__actions">
        <button class="product-card__btn product-card__btn--cart">Agregar al carrito</button>
        <button class="product-card__btn product-card__btn--wishlist" title="Añadir a lista de deseos">♡</button>
      </div>
    </article>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(str) {
  return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function preselectCategoryFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const idCategoria = params.get('idCategoria') || params.get('category');
  if (!idCategoria) return;
  const checkbox = document.querySelector(`input[name="category"][value="${idCategoria}"]`);
  if (checkbox) checkbox.checked = true;
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
    if (sortBy === 'newest') {
      const isNewA = Boolean(a.querySelector('.product-card__badge--new'));
      const isNewB = Boolean(b.querySelector('.product-card__badge--new'));
      if (isNewA === isNewB) return 0;
      return isNewB ? 1 : -1;
    }
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

function setupAddToCart(cards) {
  cards.forEach((card) => {
    const button = card.querySelector('.product-card__btn--cart');
    if (!button) return;
    button.addEventListener('click', () => {
      const cart = getJSON(STORAGE_KEYS.cart, []);
      const name = card.querySelector('.product-card__name')?.textContent?.trim() || 'Producto';
      const price = Number(card.dataset.price || 0);
      const id = card.dataset.id || name;

      const existingItem = cart.find((item) => item.id === id || item.name === name);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        cart.push({ id, name, price, quantity: 1 });
      }

      setJSON(STORAGE_KEYS.cart, cart);
      showToast(`${name} agregado al carrito.`, 'success');
    });
  });
}
