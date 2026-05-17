export const API_BASE_URL = localStorage.getItem('didistore:apiBaseUrl') || 'http://localhost:8080/didistorebackend';

export const STORAGE_KEYS = {
  token: 'didistore:token',
  user: 'didistore:user',
  cart: 'didistore:cart',
  users: 'didistore:users',
  adminData: 'didistore:admin-data',
  checkoutDraft: 'didistore:checkout-draft'
};

export const API_ENDPOINTS = {
  login: '/login',
  users: '/admin/usuarios',
  products: '/admin/productos',
  categories: '/admin/categorias',
  orders: '/admin/pedidos',
  promotions: '/admin/promociones',
  checkout: '/checkout'
};

export function buildApiUrl(path = '') {
  if (!path) return API_BASE_URL;
  const normalizedBase = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
