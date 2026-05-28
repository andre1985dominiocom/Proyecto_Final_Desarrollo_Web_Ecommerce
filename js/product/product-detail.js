import { CATALOG_ENDPOINTS, STORAGE_KEYS } from '../core/config.js';
import { request } from '../core/http.js';
import { getJSON, setJSON } from '../core/storage.js';
import { formatCurrency, showToast } from '../core/ui.js';

function renderProduct(product) {

  const name = product.nombreProducto || 'Producto';

  const price = Number(product.precio || 0);

  const description =
    product.descripcionCorta || '';

  const sku =
    product.sku || product.idProducto || '';

  const categoryName =
    product.nombreCategoria || '';

  const imageUrl =
    product.imagenUrl || '';

  const categoryId =
    product.categoriaId || '';

  const stock =
    Number(product.stock ?? 0);

  // Título
  const titleEl =
    document.getElementById('product-detail-title');

  if (titleEl) {
    titleEl.textContent = name;
  }

  document.title = `${name} - DidiStore`;

  // SKU
  const skuEl =
    document.getElementById('product-detail-sku');

  if (skuEl) {
    skuEl.textContent =
      sku ? `Ref: ${sku}` : '';
  }

  // Precio
  const priceEl =
    document.getElementById('product-detail-price');

  if (priceEl) {
    priceEl.textContent =
      formatCurrency(price);
  }

  // Descripción
  const descriptionEl =
    document.getElementById('product-detail-description');

  if (descriptionEl) {
    descriptionEl.textContent = description;
  }

  const tabDescriptionEl =
    document.getElementById('product-detail-tab-description');

  if (tabDescriptionEl) {
    tabDescriptionEl.textContent = description;
  }

  // Stock
  const stockEl =
    document.getElementById('product-detail-stock');

  if (stockEl) {

    if (stock > 0) {

      stockEl.textContent =
        `✓ En stock (${stock} unidades disponibles)`;

      stockEl.className =
        'product-detail__stock product-detail__stock--available';

    } else {

      stockEl.textContent =
        '✗ Sin stock';

      stockEl.className =
        'product-detail__stock product-detail__stock--unavailable';
    }
  }

  // Categoría
  const categoryLink =
    document.getElementById('product-detail-category-link');

  if (categoryLink) {

    categoryLink.textContent =
      categoryName || 'Ver categoría';

    if (categoryId) {

      categoryLink.href =
        `../catalog/catalog.html?idCategoria=${encodeURIComponent(categoryId)}`;
    }
  }

  // Breadcrumb
  const breadcrumbName =
    document.getElementById('product-detail-breadcrumb-name');

  if (breadcrumbName) {
    breadcrumbName.textContent = name;
  }

  // Imagen
  if (imageUrl) {

    const mainImage =
      document.getElementById('mainImage');

    if (mainImage) {

      mainImage.src = imageUrl;
      mainImage.alt = name;
    }

    const thumbnails =
      document.querySelectorAll('.product-detail__thumbnail');

    thumbnails.forEach((thumb) => {

      thumb.src = imageUrl;
      thumb.alt = name;
    });
  }
}