import { CATALOG_ENDPOINTS } from '../core/config.js';
import { request } from '../core/http.js';
import { showToast } from '../core/ui.js';

const categoryGrid = document.querySelector('.category__grid');

if (categoryGrid) {
  initCategories();
}

async function initCategories() {
  categoryGrid.innerHTML = '<p class="category__loading">Cargando categorías...</p>';

  const response = await request(CATALOG_ENDPOINTS.categorias);

  if (!response.ok || !Array.isArray(response.data) || !response.data.length) {
    categoryGrid.innerHTML = '<p class="category__empty">No se pudieron cargar las categorías. Intente más tarde.</p>';
    if (!response.ok) {
      showToast('No se pudo conectar con el servidor.', 'warning');
    }
    return;
  }

  categoryGrid.innerHTML = response.data.map((cat) => buildCategoryCard(cat)).join('');
}

function buildCategoryCard(cat) {
  const id = cat.idCategoria || cat.id || '';
  const name = escapeHtml(cat.nombreCategoria || cat.nombre || cat.name || 'Categoría');
  const description = escapeHtml(cat.descripcion || cat.description || '');
  const count = cat.cantidadProductos || cat.productos || cat.products || '';
  const icon = cat.icono || cat.icon || '🏷️';
  const countText = count ? `${count} productos` : '';
  const url = `catalog.html?idCategoria=${encodeURIComponent(id)}`;

  return `
    <a href="${url}" class="category-card">
      <div class="category-card__icon">${escapeHtml(String(icon))}</div>
      <h3 class="category-card__name">${name}</h3>
      ${description ? `<p class="category-card__description">${description}</p>` : ''}
      ${countText ? `<p class="category-card__count">${countText}</p>` : ''}
    </a>`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
