const API_URL = "http://localhost:8080/didistorebackend/admin/usuarios";

document.addEventListener("DOMContentLoaded", () => {
    console.log("Archivo users.js cargado correctamente");

    const tableBody = document.getElementById("users-table-body");

    if (!tableBody) {
        console.error("No se encontró el tbody con id users-table-body");
        return;
    }

    listarUsuarios();
});

async function listarUsuarios() {
    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const usuarios = await response.json();
        console.log("Usuarios recibidos:", usuarios);

        const tableBody = document.getElementById("users-table-body");
        tableBody.innerHTML = "";

        if (!usuarios || usuarios.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8">No hay usuarios registrados</td>
                </tr>
            `;
            return;
        }

        usuarios.forEach(usuario => {
            const nombreCompleto = `${usuario.nombre ?? ""} ${usuario.apellido ?? ""}`.trim();
            const iniciales = obtenerIniciales(usuario.nombre, usuario.apellido);

            tableBody.innerHTML += `
                <tr>
                    <td>${usuario.idUsuario ?? ""}</td>
                    <td><span class="admin-user-avatar">${iniciales}</span></td>
                    <td>${nombreCompleto}</td>
                    <td>${usuario.email ?? ""}</td>
                    <td>${usuario.documento ?? ""}</td>
                    <td>${obtenerRol(usuario.perfilId)}</td>
                    <td>${usuario.estado ?? ""}</td>
                    <td>
                        <div class="admin-table__actions">
                            <button class="admin-btn admin-btn--danger admin-btn--small" onclick="eliminarUsuario(${usuario.idUsuario})">
                                Eliminar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });

    } catch (error) {
        console.error("Error al listar usuarios:", error);
    }
}

async function guardarUsuario(event) {
    event.preventDefault();

    const usuario = {
        nombre: document.getElementById("nombre").value.trim(),
        apellido: document.getElementById("apellido").value.trim(),
        email: document.getElementById("email").value.trim(),
        contrasena: document.getElementById("contrasena").value.trim(),
        documento: document.getElementById("documento").value.trim(),
        tipoDocumento: document.getElementById("tipoDocumento").value,
        perfilId: parseInt(document.getElementById("perfilId").value),
        estado: document.getElementById("estado").value,
        emailVerificado: document.getElementById("emailVerificado").value === "true",
    };

    console.log("Usuario a enviar:", usuario);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const data = await response.json();
        console.log("Respuesta del backend:", data);

        alert("Usuario registrado correctamente");

        document.getElementById("user-form").reset();
        listarUsuarios();

    } catch (error) {
        console.error("Error al guardar usuario:", error);
        alert("No se pudo registrar el usuario");
    }
}

function obtenerIniciales(nombre, apellido) {
    const inicialNombre = nombre ? nombre.charAt(0).toUpperCase() : "";
    const inicialApellido = apellido ? apellido.charAt(0).toUpperCase() : "";
    return inicialNombre + inicialApellido;
}

function obtenerRol(perfilId) {
    switch (perfilId) {
        case 1:
            return "Administrador";
        case 2:
            return "Empleado";
        case 3:
            return "Cliente";
        default:
            return "Sin rol";
    }
}

async function eliminarUsuario(idUsuario) {
    const confirmar = confirm("¿Seguro que deseas eliminar este usuario?");

    if (!confirmar) {
        return;
    }

    try {
        const response = await fetch(`${API_URL}?idUsuario=${idUsuario}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        listarUsuarios();

    } catch (error) {
        console.error("Error al eliminar usuario:", error);
    }
}

window.eliminarUsuario = eliminarUsuario;