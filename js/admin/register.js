const API_URL = "http://localhost:8080/didistorebackend/admin/usuarios";

document.addEventListener("DOMContentLoaded", () => {
    console.log("register.js cargado correctamente");

    const form = document.getElementById("register-form");

    if (!form) {
        console.error("No se encontró el formulario con id register-form");
        return;
    }

    form.addEventListener("submit", registrarUsuario);
});

async function registrarUsuario(event) {
    event.preventDefault();

    const nombre = document.getElementById("username").value.trim();
    const apellido = document.getElementById("lastname").value.trim();
    const tipoDocumento = document.getElementById("type-document").value;
    const documento = document.getElementById("document").value.trim();
    const email = document.getElementById("email").value.trim();
    const contrasena = document.getElementById("password").value.trim();

    const usuario = {
        nombre,
        apellido,
        email,
        contrasena,
        documento,
        tipoDocumento,
        perfilId: 3,
        estado: "Activo",
        emailVerificado: false
    };

    console.log("Usuario a registrar:", usuario);

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(usuario)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "No se pudo registrar el usuario");
        }

        alert("Usuario registrado correctamente");
        document.getElementById("register-form").reset();

        window.location.href = "../auth/login.html";

    } catch (error) {
        console.error("Error al registrar usuario:", error);
        alert("No se pudo registrar el usuario");
    }
}