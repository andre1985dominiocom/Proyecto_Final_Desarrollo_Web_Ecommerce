import { API_ENDPOINTS, STORAGE_KEYS } from '../core/config.js';
import { request } from '../core/http.js';
import { ADMIN_MOCK_DATA } from '../core/mock-data.js';
import { getJSON, setJSON } from '../core/storage.js';
import { formatCurrency, renderStateRow, showToast } from '../core/ui.js';

const root = document.querySelector('[data-admin-entity]');

if (root) {
  initEntityPage(root.dataset.adminEntity);
}

async function initEntityPage(entity) {
  const tbody = document.getElementById('admin-entity-body');
  const searchInput = document.getElementById('admin-entity-search');
  const filterSelect = document.getElementById('admin-entity-filter');
  const pagination = document.getElementById('admin-entity-pagination');
  const columnsCount = document.querySelectorAll('.admin-table thead th').length || 1;

  if (!tbody) return;

  const storage = getJSON(STORAGE_KEYS.adminData, {});
  const apiPath = API_ENDPOINTS[entity] || '';
  const pageSize = 5;

  const state = {
    rows: [],
    filtered: [],
    page: 1
  };

  const renderers = {
    products: renderProductRow,
    categories: renderCategoryRow,
    orders: renderOrderRow,
    promotions: renderPromotionRow
  };

  const rowRenderer = renderers[entity];
  const getRowId = (row) => getEntityId(entity, row);

  renderStateRow(tbody, 'Cargando información...', 'loading', columnsCount);

  const response = apiPath ? await request(`/catalog/categorias`) : { ok: false };

  if (response.ok && Array.isArray(response.data)) {
    state.rows = ensureEntityIds(entity, response.data);
  } else {
    state.rows = ensureEntityIds(entity, storage[entity] || ADMIN_MOCK_DATA[entity] || []);
    showToast('Modo local activo para esta sección del panel admin.', 'warning');
  }

  storage[entity] = state.rows;
  setJSON(STORAGE_KEYS.adminData, storage);

  const applyFilters = () => {
    const query = (searchInput?.value || '').trim().toLowerCase();
    const filter = (filterSelect?.value || '').trim().toLowerCase();

    state.filtered = state.rows.filter((row) => {
      const plain = JSON.stringify(row).toLowerCase();
      const status = String(row.status || row.estado || '').toLowerCase();
      return (!query || plain.includes(query)) && (!filter || status.includes(filter));
    });

    state.page = 1;
    renderTable();
    renderPagination();
  };

  function getPageRows() {
    const start = (state.page - 1) * pageSize;
    return state.filtered.slice(start, start + pageSize);
  }

  function renderTable() {
    if (!state.filtered.length) {
      renderStateRow(tbody, 'No hay registros para mostrar.', 'empty', columnsCount);
      return;
    }

    tbody.innerHTML = getPageRows().map((row) => rowRenderer(row)).join('');

    tbody.querySelectorAll('button[data-delete-id]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.deleteId;
        state.rows = state.rows.filter((item) => String(getRowId(item)) !== id);
        storage[entity] = state.rows;
        setJSON(STORAGE_KEYS.adminData, storage);
        applyFilters();
      });
    });
  }

  function renderPagination() {
    if (!pagination) return;

    const totalPages = Math.max(1, Math.ceil(state.filtered.length / pageSize));
    pagination.innerHTML = `
      <button class="admin-pagination__btn" data-page="prev" ${state.page === 1 ? 'disabled' : ''}>‹ Anterior</button>
      <span class="admin-pagination__status">Página ${state.page} de ${totalPages}</span>
      <button class="admin-pagination__btn" data-page="next" ${state.page === totalPages ? 'disabled' : ''}>Siguiente ›</button>
    `;

    pagination.querySelectorAll('button[data-page]').forEach((button) => {
      button.addEventListener('click', () => {
        if (button.dataset.page === 'prev' && state.page > 1) state.page -= 1;
        if (button.dataset.page === 'next' && state.page < totalPages) state.page += 1;
        renderTable();
        renderPagination();
      });
    });
  }

  searchInput?.addEventListener('input', applyFilters);
  filterSelect?.addEventListener('change', applyFilters);

  applyFilters();
}

function getEntityId(entity, row) {
  if (entity === 'orders' && (row.id || row.idPedido || row.code)) return row.id || row.idPedido || row.code;
  if (entity === 'promotions' && (row.id || row.code || row.codigo)) return row.id || row.code || row.codigo;
  if (entity === 'categories' && (row.id || row.idCategoria)) return row.id || row.idCategoria;
  if (entity === 'products' && (row.idProducto || row.idProducto || row.sku)) return row.idProducto || row.idProducto || row.sku;
  return row.__localId;
}

function ensureEntityIds(entity, rows) {
  let localCounter = 0;

  return rows.map((row) => {
    const realId = getEntityId(entity, row);
    if (realId) return row;

    localCounter += 1;
    return {
      ...row,
      __localId: `local-${entity}-${Date.now()}-${localCounter}`
    };
  });
}

function statusBadge(status) {
  const value = String(status || '').toLowerCase();
  if (value.includes('activo') || value.includes('disponible') || value.includes('entregado') || value.includes('enviado')) return 'admin-badge--success';
  if (value.includes('pendiente') || value.includes('proceso') || value.includes('stock') || value.includes('expirada')) return 'admin-badge--warning';
  if (value.includes('cancelado') || value.includes('inactiva')) return 'admin-badge--danger';
  return 'admin-badge--info';
}

function renderProductRow(product) {
  const id = String(getEntityId('products', product));
  return `
    <tr>
      <td>${product.idProducto || '-'}</td>
      <td><div class="admin-product-image">Sin imagen</div></td>
      <td>${product.nombreProducto || product.nombreProducto || '-'}</td>
      <td>${product.categoriaId || product.categoriaId || '-'}</td>
      <td>${formatCurrency(product.precio || product.precio)}</td>
      <td>${product.sku || '-'}</td>
      <td>
        <span class="admin-badge ${statusBadge(product.estado)}">
          ${product.estado || '-'}
        </span>
      </td>
      <td><div class="admin-table__actions"><button class="admin-btn admin-btn--danger admin-btn--small" data-delete-id="${id}">Eliminar</button></div></td>
    </tr>
  `;
}

function renderCategoryRow(category) {
  const id = String(getEntityId('categories', category));
  return `
    <tr>
      <td>${category.idCategoria || '-'}</td>
      <td>${category.nombreCategoria || category.nombreCategoria || '-'}</td>
      <td>${category.description || category.descripcion || '-'}</td>
      <td>${category.products || category.cantidadProductos || 0}</td>
      <td><span class="admin-badge ${statusBadge(category.date || category.fechaCreacion)}">${category.date || category.fechaCreacion || '-'}</span></td>
      <td><div class="admin-table__actions"><button class="admin-btn admin-btn--danger admin-btn--small" data-delete-id="${id}">Eliminar</button></div></td>
    </tr>
  `;
}

function renderOrderRow(order) {
  const id = String(getEntityId('orders', order));
  return `
    <tr>
      <td>${order.id || order.idPedido || '-'}</td>
      <td>${order.customer || order.cliente || '-'}</td>
      <td>${order.date || order.fecha || '-'}</td>
      <td>${order.items || order.productos || '-'}</td>
      <td>${formatCurrency(order.total || order.montoTotal)}</td>
      <td><span class="admin-badge ${statusBadge(order.status || order.estado)}">${order.status || order.estado || '-'}</span></td>
      <td><div class="admin-table__actions"><button class="admin-btn admin-btn--secondary admin-btn--small">Detalle</button><button class="admin-btn admin-btn--danger admin-btn--small" data-delete-id="${id}">Quitar</button></div></td>
    </tr>
  `;
}

function renderPromotionRow(promotion) {
  const id = String(getEntityId('promotions', promotion));
  return `
    <tr>
      <td>${promotion.id || '-'}</td>
      <td>${promotion.name || promotion.nombre || '-'}</td>
      <td>${promotion.code || promotion.codigo || '-'}</td>
      <td><span class="admin-promo-discount">${promotion.discount || promotion.descuento || '-'}</span></td>
      <td>${promotion.type || promotion.tipo || '-'}</td>
      <td>${promotion.start || promotion.inicio || '-'}</td>
      <td>${promotion.end || promotion.fin || '-'}</td>
      <td><span class="admin-badge ${statusBadge(promotion.status || promotion.estado)}">${promotion.status || promotion.estado || '-'}</span></td>
      <td><div class="admin-table__actions"><button class="admin-btn admin-btn--danger admin-btn--small" data-delete-id="${id}">Eliminar</button></div></td>
    </tr>
  `;
}
