import { API_ENDPOINTS, STORAGE_KEYS } from '../core/config.js';
import { request } from '../core/http.js';
import { getJSON, setJSON } from '../core/storage.js';
import { setButtonLoading, setInputError, showToast } from '../core/ui.js';

const form = document.getElementById('register-form');

if (form) {
  form.addEventListener('submit', registerUser);
}

function validateRegisterData(user) {
  const errors = {};

  if (!user.nombre || user.nombre.length < 2) errors.username = 'Nombre inválido';
  if (!user.apellido || user.apellido.length < 2) errors.lastname = 'Apellido inválido';
  if (!user.tipoDocumento) errors['type-document'] = 'Selecciona tipo de documento';
  if (!user.documento || user.documento.length < 5) errors.document = 'Documento inválido';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) errors.email = 'Correo inválido';
  if (!user.contrasena || user.contrasena.length < 6) errors.password = 'Mínimo 6 caracteres';

  return errors;
}

function applyFieldErrors(errors) {
  ['username', 'lastname', 'type-document', 'document', 'email', 'password'].forEach((id) => {
    setInputError(document.getElementById(id), Boolean(errors[id]));
  });
}

function buildUserPayload() {
  return {
    nombre: document.getElementById('username')?.value.trim(),
    apellido: document.getElementById('lastname')?.value.trim(),
    tipoDocumento: document.getElementById('type-document')?.value,
    documento: document.getElementById('document')?.value.trim(),
    email: document.getElementById('email')?.value.trim().toLowerCase(),
    contrasena: document.getElementById('password')?.value.trim(),
    perfilId: 3,
    estado: 'Activo',
    emailVerificado: false
  };
}

function saveMockUser(userPayload) {
  const users = getJSON(STORAGE_KEYS.users, []);
  const duplicated = users.some((item) => item.email === userPayload.email || item.documento === userPayload.documento);

  if (duplicated) {
    return { ok: false, message: 'El usuario ya existe (mock local).' };
  }

  const nextId = users.length ? Math.max(...users.map((item) => Number(item.idUsuario) || 0)) + 1 : 1;
  users.push({ ...userPayload, idUsuario: nextId });
  setJSON(STORAGE_KEYS.users, users);
  return { ok: true };
}

async function registerUser(event) {
  event.preventDefault();

  const submitButton = form.querySelector('button[type="submit"]');
  const payload = buildUserPayload();
  const errors = validateRegisterData(payload);

  applyFieldErrors(errors);

  if (Object.keys(errors).length) {
    showToast('Revisa los campos resaltados para continuar.', 'error');
    return;
  }

  setButtonLoading(submitButton, true, 'Registrando...');

  const result = await request(API_ENDPOINTS.users, {
    method: 'POST',
    body: payload
  });

  if (result.ok) {
    showToast('Usuario registrado correctamente.', 'success');
    form.reset();
    setTimeout(() => {
      window.location.href = '../auth/login.html';
    }, 1000);
    setButtonLoading(submitButton, false);
    return;
  }

  const fallback = saveMockUser(payload);

  if (fallback.ok) {
    showToast('Backend no disponible: usuario guardado localmente para pruebas.', 'warning');
    form.reset();
    setTimeout(() => {
      window.location.href = '../auth/login.html';
    }, 1200);
  } else {
    showToast(result.error || fallback.message || 'No se pudo registrar el usuario.', 'error');
  }

  setButtonLoading(submitButton, false);
}
