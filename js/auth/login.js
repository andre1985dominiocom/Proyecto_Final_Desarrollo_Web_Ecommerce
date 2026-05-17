import { API_ENDPOINTS, STORAGE_KEYS } from '../core/config.js';
import { request } from '../core/http.js';
import { getJSON } from '../core/storage.js';
import { setSession } from '../core/session.js';
import { setButtonLoading, showToast } from '../core/ui.js';

const form = document.getElementById('login-form');

if (form) {
  form.addEventListener('submit', handleLogin);
}

function findLocalUser(email, password) {
  const users = getJSON(STORAGE_KEYS.users, []);
  return users.find((item) => item.email === email && item.contrasena === password) || null;
}

async function handleLogin(event) {
  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  const email = (document.getElementById('username')?.value || '').trim().toLowerCase();
  const contrasena = (document.getElementById('password')?.value || '').trim();

  if (!email || !contrasena) {
    showToast('Debes completar correo y contraseña.', 'error');
    return;
  }

  setButtonLoading(submitButton, true, 'Ingresando...');

  const result = await request(API_ENDPOINTS.login, {
    method: 'POST',
    body: { email, contrasena }
  });

  if (result.ok) {
    const token = result.data?.token || `mock-token-${Date.now()}`;
    setSession({ token, user: result.data?.usuario || { email } });
    showToast(result.data?.message || 'Inicio de sesión exitoso.', 'success');
    setTimeout(() => {
      window.location.href = '../../index.html';
    }, 900);
    setButtonLoading(submitButton, false);
    return;
  }

  const localUser = findLocalUser(email, contrasena);

  if (localUser) {
    setSession({ token: `local-token-${Date.now()}`, user: localUser });
    showToast('Ingreso local exitoso (modo sin backend).', 'warning');
    setTimeout(() => {
      window.location.href = '../../index.html';
    }, 900);
  } else {
    showToast(result.error || 'Credenciales inválidas.', 'error');
  }

  setButtonLoading(submitButton, false);
}
