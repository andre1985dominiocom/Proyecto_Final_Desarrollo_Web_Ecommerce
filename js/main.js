import { getSession, clearSession } from './core/session.js';

const { token, user } = getSession();

if (token) {
  document.querySelectorAll('[data-auth-link]').forEach((link) => {
    link.textContent = user?.nombre ? `Hola, ${user.nombre}` : 'Mi cuenta';
    link.setAttribute('href', '#');
    link.dataset.logoutAction = 'true';
  });

  document.querySelectorAll('.admin-topbar__user').forEach((element) => {
    element.textContent = user?.nombre || user?.email || 'Admin';
  });
}

document.querySelectorAll('[data-logout-link], [data-logout-action="true"]').forEach((element) => {
  element.addEventListener('click', (event) => {
    event.preventDefault();
    clearSession();
    window.location.href = '/html/auth/login.html';
  });
});
