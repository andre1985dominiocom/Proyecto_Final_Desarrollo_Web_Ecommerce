import { CATALOG_ENDPOINTS, STORAGE_KEYS } from '../core/config.js';
import { request } from '../core/http.js';
import { getJSON, setJSON } from '../core/storage.js';
import { formatCurrency, showToast } from '../core/ui.js';

const productDetailSection = document.querySelector('.product-detail');

if (productDetailSection) {
  initProductDetail();
}

async function initProductDetail() {
  const idProducto = new URLSearchParams(window.location.search).get('idProducto');

  if (!idProducto) {
    showError('No se especificó un producto.');
    return;
  }

  setLoadingState(true);

  const response = await request(`${CATALOG_ENDPOINTS.productos}?idProducto=${encodeURIComponent(idProducto)}`);

  setLoadingState(false);

  if (!response.ok) {
    showError('No se pudo cargar el producto. Intente más tarde.');
    showToast('No se pudo conectar con el servidor.', 'warning');
    return;
  }

  const product = Array.isArray(response.data) ? response.data[0] : response.data;

  if (!product) {
    showError('Producto no encontrado.');
    return;
  }

  renderProduct(product);
  setupActions(product);
}

function renderProduct(product) {
  const name = product.nombreProducto || product.nombre || product.name || 'Producto';
  const price = Number(product.precio || product.price || 0);
  const originalPrice = Number(product.precioOriginal || product.originalPrice || 0);
  const discountPct = Number(product.descuento || product.discount || 0);
  const description = product.descripcion || product.description || '';
  const stock = Number(product.stock ?? 0);
  const sku = product.codigoProducto || product.codigo || product.sku || product.idProducto || product.id || '';
  const categoryName = product.nombreCategoria || product.categoria || product.category || '';
  const imageUrl = product.imagenUrl || product.imagen || product.image || '';
  const categoryId = product.idCategoria || product.categoryId || '';

  const titleEl = document.getElementById('product-detail-title');
  if (titleEl) titleEl.textContent = name;
  document.title = `${name} - DidiStore`;

  const skuEl = document.getElementById('product-detail-sku');
  if (skuEl) skuEl.textContent = sku ? `Ref: ${sku}` : '';

  const priceEl = document.getElementById('product-detail-price');
  if (priceEl) priceEl.textContent = formatCurrency(price);

  const originalPriceEl = document.getElementById('product-detail-price-original');
  if (originalPriceEl) {
    originalPriceEl.textContent = originalPrice > 0 ? formatCurrency(originalPrice) : '';
    originalPriceEl.style.display = originalPrice > 0 ? '' : 'none';
  }

  const discountEl = document.getElementById('product-detail-discount');
  if (discountEl) {
    discountEl.textContent = discountPct > 0 ? `-${discountPct}%` : '';
    discountEl.style.display = discountPct > 0 ? '' : 'none';
  }

  const descriptionEl = document.getElementById('product-detail-description');
  if (descriptionEl) descriptionEl.textContent = description;

  const tabDescriptionEl = document.getElementById('product-detail-tab-description');
  if (tabDescriptionEl) tabDescriptionEl.textContent = description;

  const stockEl = document.getElementById('product-detail-stock');
  if (stockEl) {
    if (stock > 0) {
      stockEl.textContent = `✓ En stock (${stock} unidades disponibles)`;
      stockEl.className = 'product-detail__stock product-detail__stock--available';
    } else {
      stockEl.textContent = '✗ Sin stock';
      stockEl.className = 'product-detail__stock product-detail__stock--unavailable';
    }
  }

  const categoryLink = document.getElementById('product-detail-category-link');
  if (categoryLink) {
    categoryLink.textContent = categoryName || 'Ver categoría';
    if (categoryId) {
      categoryLink.href = `../catalog/catalog.html?idCategoria=${encodeURIComponent(categoryId)}`;
    }
  }

  const breadcrumbName = document.getElementById('product-detail-breadcrumb-name');
  if (breadcrumbName) breadcrumbName.textContent = name;

  if (imageUrl) {
    const mainImage = document.getElementById('mainImage');
    if (mainImage) {
      mainImage.src = imageUrl;
      mainImage.alt = name;
    }
    const thumbnails = document.querySelectorAll('.product-detail__thumbnail');
    thumbnails.forEach((thumb) => {
      thumb.src = imageUrl;
      thumb.alt = name;
    });
  }
}

function setupActions(product) {
  const price = Number(product.precio || product.price || 0);
  const name = product.nombreProducto || product.nombre || product.name || 'Producto';
  const id = product.idProducto || product.id || product.codigo || name;
  const stock = Number(product.stock ?? 0);

  const addToCartBtn = document.querySelector('.product-detail__btn-cart');
  if (addToCartBtn) {
    if (stock === 0) {
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = 'Sin stock';
    }
    addToCartBtn.addEventListener('click', () => {
      const quantityInput = document.getElementById('product-quantity');
      const quantity = Math.max(1, Number(quantityInput?.value || 1));
      const cart = getJSON(STORAGE_KEYS.cart, []);

      const existingItem = cart.find((item) => item.id === String(id) || item.name === name);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        cart.push({ id: String(id), name, price, quantity });
      }

      setJSON(STORAGE_KEYS.cart, cart);
      showToast(`${name} agregado al carrito.`, 'success');
    });
  }
}

function setLoadingState(isLoading) {
  const titleEl = document.getElementById('product-detail-title');
  if (titleEl) {
    titleEl.textContent = isLoading ? 'Cargando producto...' : titleEl.textContent;
  }
}

function showError(message) {
  if (productDetailSection) {
    productDetailSection.innerHTML = `<p class="product-detail__error">${message}</p>`;
  }
}
