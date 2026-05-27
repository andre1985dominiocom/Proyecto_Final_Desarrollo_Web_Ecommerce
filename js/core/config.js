export const API_BASE_URL = localStorage.getItem('didistore:apiBaseUrl') || 'http://localhost:8080/didistorebackend';

export const STORAGE_KEYS = {
  token: 'didistore:token',
  user: 'didistore:user',
  cart: 'didistore:cart',
  coupon: 'didistore:coupon',
  orders: 'didistore:orders',
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

export const CATALOG_ENDPOINTS = {
  productos: '/catalog/productos',
  categorias: '/catalog/categorias'
};

export const COUPON_DISCOUNTS = {
  DIDI10: 0.1,
  DIDI15: 0.15,
  DIDI20: 0.2,
  LIQUID30: 0.3
};

export function buildApiUrl(path = '') {
  if (!path) return API_BASE_URL;
  const normalizedBase = API_BASE_URL.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
