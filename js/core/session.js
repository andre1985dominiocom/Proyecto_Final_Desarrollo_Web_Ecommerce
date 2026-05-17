import { STORAGE_KEYS } from './config.js';
import { getJSON, setJSON } from './storage.js';

export function setSession({ token, user }) {
  if (token) {
    localStorage.setItem(STORAGE_KEYS.token, token);
  }
  if (user) {
    setJSON(STORAGE_KEYS.user, user);
  }
}

export function clearSession() {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
}

export function getSession() {
  return {
    token: localStorage.getItem(STORAGE_KEYS.token),
    user: getJSON(STORAGE_KEYS.user, null)
  };
}
