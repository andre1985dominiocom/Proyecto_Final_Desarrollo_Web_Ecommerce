function login() {
    
    const form = document.getElementById("login-form")

    if (!form) {
        console.error("No se encontró el formulario con id login-form")
        return
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault()
        console.log("Submit interceptado correctamente")

        const email = form.username.value.trim()
        const contrasena = form.password.value.trim()

        if (!email || !contrasena) {
            alert("Debes completar todos los campos")
            return
        }

        try {
            const response = await fetch("http://localhost:8080/didistorebackend/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ email, contrasena })
            })

            const data = await response.json()
            console.log("Respuesta del backend:", data)

            if (response.ok) {
                localStorage.setItem("token", data.token)
                alert(data.message)
                window.location.href = "../../index.html"
            } else {
                alert(data.message || "Credenciales incorrectas")
            }

        } catch (error) {
            console.error("Error al iniciar sesión:", error)
            alert("No se pudo conectar con el backend")
        }
    })
}

document.addEventListener("DOMContentLoaded", login)