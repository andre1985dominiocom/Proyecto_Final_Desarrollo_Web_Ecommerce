import { API_ENDPOINTS, STORAGE_KEYS } from '../core/config.js';
import { request } from '../core/http.js';
import { getJSON, setJSON } from '../core/storage.js';
import { renderStateRow, showToast } from '../core/ui.js';

const tbody = document.getElementById('users-table-body');
const searchInput = document.getElementById('users-search-input');
const roleFilter = document.getElementById('users-role-filter');
const pagination = document.getElementById('users-pagination');
const pageSize = 6;

const state = {
  all: [],
  filtered: [],
  currentPage: 1
};

const roleLabels = {
  1: 'Administrador',
  2: 'Empleado',
  3: 'Cliente'
};

if (tbody) {
  init();
}

async function init() {
  bindEvents();
  await loadUsers();
}

function bindEvents() {
  searchInput?.addEventListener('input', applyFilters);
  roleFilter?.addEventListener('change', applyFilters);
  pagination?.addEventListener('click', onPageClick);
}

async function loadUsers() {
  renderStateRow(tbody, 'Cargando usuarios...', 'loading', 8);

  const result = await request(API_ENDPOINTS.users);

  if (result.ok && Array.isArray(result.data)) {
    state.all = result.data;
    setJSON(STORAGE_KEYS.users, result.data);
  } else {
    state.all = getJSON(STORAGE_KEYS.users, []);
    if (!state.all.length) {
      showToast('Backend no disponible. Mostrando lista local vacía.', 'warning');
    }
  }

  applyFilters();
}

function normalizeRole(user) {
  return String(user.perfilId || user.rol || '').toLowerCase();
}

function applyFilters() {
  const query = (searchInput?.value || '').trim().toLowerCase();
  const selectedRole = (roleFilter?.value || '').trim().toLowerCase();
  const roleAliases = { admin: 'administrador', empl: 'empleado', customer: 'cliente' };
  const expectedRole = roleAliases[selectedRole] || selectedRole;

  state.filtered = state.all.filter((user) => {
    const fullName = `${user.nombre || ''} ${user.apellido || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const role = normalizeRole(user);
    const roleText = roleLabels[user.perfilId] || user.rol || '';

    const matchesSearch = !query || fullName.includes(query) || email.includes(query) || String(user.documento || '').includes(query);
    const matchesRole = !selectedRole || role === selectedRole || roleText.toLowerCase().includes(expectedRole);

    return matchesSearch && matchesRole;
  });

  state.currentPage = 1;
  renderTable();
  renderPagination();
}

function getCurrentPageRows() {
  const startIndex = (state.currentPage - 1) * pageSize;
  return state.filtered.slice(startIndex, startIndex + pageSize);
}

function renderTable() {
  if (!state.filtered.length) {
    renderStateRow(tbody, 'No se encontraron usuarios para los filtros actuales.', 'empty', 8);
    return;
  }

  const rows = getCurrentPageRows().map((user) => {
    const id = user.idUsuario || user.id || '-';
    const initials = getUserInitials(user);
    const fullName = `${user.nombre || ''} ${user.apellido || ''}`.trim() || 'Sin nombre';
    const role = roleLabels[user.perfilId] || user.rol || 'Cliente';
    const stateClass = String(user.estado || '').toLowerCase() === 'activo' ? 'admin-badge--success' : 'admin-badge--warning';

    return `
      <tr>
        <td>${id}</td>
        <td>${user.email || '-'}</td>
        <td>
          <span class="admin-user-avatar">${initials}</span>
          <span>${fullName}</span>
        </td>
        <td>${user.tipoDocumento || '-'}</td>
        <td>${user.documento || '-'}</td>
        <td><span class="admin-badge admin-badge--info">${role}</span></td>
        <td><span class="admin-badge ${stateClass}">${user.estado || 'Activo'}</span></td>
        <td>
          <div class="admin-table__actions">
            <button class="admin-btn admin-btn--secondary admin-btn--small" data-action="toggle" data-id="${id}">Estado</button>
            <button class="admin-btn admin-btn--danger admin-btn--small" data-action="delete" data-id="${id}">Eliminar</button>
          </div>
        </td>
      </tr>
    `;
  });

  tbody.innerHTML = rows.join('');
  tbody.querySelectorAll('button[data-action]').forEach((button) => {
    button.addEventListener('click', handleAction);
  });
}

function getUserInitials(user) {
  const firstNameInitial = (user?.nombre || 'U').charAt(0);
  const lastNameInitial = (user?.apellido || 'N').charAt(0);
  return `${firstNameInitial}${lastNameInitial}`.toUpperCase();
}

function renderPagination() {
  if (!pagination) return;

  const totalPages = Math.max(1, Math.ceil(state.filtered.length / pageSize));

  pagination.innerHTML = `
    <button class="admin-pagination__btn" data-page="prev" ${state.currentPage === 1 ? 'disabled' : ''}>‹ Anterior</button>
    <span class="admin-pagination__status">Página ${state.currentPage} de ${totalPages}</span>
    <button class="admin-pagination__btn" data-page="next" ${state.currentPage === totalPages ? 'disabled' : ''}>Siguiente ›</button>
  `;
}

function onPageClick(event) {
  const button = event.target.closest('button[data-page]');
  if (!button) return;

  const totalPages = Math.max(1, Math.ceil(state.filtered.length / pageSize));

  if (button.dataset.page === 'prev' && state.currentPage > 1) {
    state.currentPage -= 1;
  }

  if (button.dataset.page === 'next' && state.currentPage < totalPages) {
    state.currentPage += 1;
  }

  renderTable();
  renderPagination();
}

function persistUsers() {
  setJSON(STORAGE_KEYS.users, state.all);
}

async function handleAction(event) {
  const button = event.currentTarget;
  const userId = button.dataset.id;
  const action = button.dataset.action;

  if (action === 'delete') {
    if (!window.confirm('¿Deseas eliminar este usuario?')) return;

    const result = await request(`${API_ENDPOINTS.users}?idUsuario=${encodeURIComponent(userId)}`, { method: 'DELETE' });

    if (!result.ok) {
      showToast('Backend no disponible: eliminando localmente.', 'warning');
    }

    state.all = state.all.filter((user) => String(user.idUsuario || user.id) !== String(userId));
    persistUsers();
    applyFilters();
    return;
  }

  state.all = state.all.map((user) => {
    if (String(user.idUsuario || user.id) !== String(userId)) return user;
    return {
      ...user,
      estado: String(user.estado || 'Activo').toLowerCase() === 'activo' ? 'Inactivo' : 'Activo'
    };
  });

  persistUsers();
  applyFilters();
  showToast('Estado de usuario actualizado localmente.', 'info');
}
