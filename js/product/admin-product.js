import { showToast } from '../core/ui.js';

const API_BASE = 'http://localhost:8080/didistorebackend';


    const form = document.getElementById('admin-product-form');

    document.addEventListener('DOMContentLoaded', () => {
    if (!form) return;

    form.addEventListener('submit', handleSubmit);
    cargarCategorias();
    cargarProductoSiEsEdicion();
    });

    async function handleSubmit(event) {
    event.preventDefault();

    const producto = construirProductoDesdeFormulario();

    if (!producto) {
        mostrarMensaje('Datos del formulario inválidos.', 'error');
        return;
    }

    const idProducto = obtenerIdProductoDesdeURL();
    const metodo = idProducto ? 'PUT' : 'POST';

    if (idProducto) {
        producto.idProducto = idProducto;
    }

    try {
        const response = await fetch(`${API_BASE}/admin/productos`, {
        method: metodo,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(producto)
        });

        const data = await leerRespuestaJSON(response);

        if (!response.ok) {
        throw new Error(data.message || 'No se pudo guardar el producto');
        }

        mostrarMensaje(
        data.message || (idProducto ? 'Producto actualizado correctamente' : 'Producto creado correctamente'),
        'success'
        );

        if (!idProducto) {
        form.reset();
        }

    } catch (error) {
        console.error('Error al guardar producto:', error);
        mostrarMensaje(error.message || 'Error al guardar producto', 'error');
    }
    }

    function construirProductoDesdeFormulario() {
    const nombreProducto = document.getElementById('product-name')?.value.trim() || '';
    const sku = document.getElementById('product-sku')?.value.trim() || '';
    const descripcion = document.getElementById('product-description')?.value.trim() || '';
    const precio = Number(document.getElementById('product-price')?.value || 0);
    const stock = Number(document.getElementById('product-stock')?.value || 0);
    const categoriaId = document.getElementById('product-category')?.value || '';
    const estadoFormulario = document.getElementById('product-status')?.value || 'active';
    const descuento = Number(document.getElementById('product-discount')?.value || 0);

    if (!nombreProducto || precio <= 0 || stock < 0 || !categoriaId) {
        return null;
    }

    return {
        nombreProducto,
        descripcionCorta: descripcion,
        descripcionLarga: descripcion,
        precio,
        sku,
        talla: '',
        color: '',
        categoriaId: Number(categoriaId),
        estado: mapearEstado(estadoFormulario),
        esDestacado: descuento > 0,
        stock
    };
    }

    function mapearEstado(estadoFormulario) {
    switch (estadoFormulario) {
        case 'active':
        return 'ACTIVO';
        case 'inactive':
        return 'INACTIVO';
        case 'draft':
        return 'AGOTADO';
        default:
        return 'ACTIVO';
    }
    }

    async function cargarCategorias() {
    const selectCategoria = document.getElementById('product-category');
    if (!selectCategoria) return;

    try {
        const response = await fetch(`${API_BASE}/catalog/categorias`);
        const categorias = await leerRespuestaJSON(response);

        if (!response.ok) {
        throw new Error('No se pudieron cargar las categorías');
        }

        if (!Array.isArray(categorias)) return;

        const opcionVacia = `<option value="">Selecciona una categoría</option>`;

        const opciones = categorias.map((categoria) => `
        <option value="${categoria.idCategoria}">
            ${categoria.nombreCategoria ?? 'Categoría'}
        </option>
        `).join('');

        selectCategoria.innerHTML = opcionVacia + opciones;

        const categoriaIdURL = new URLSearchParams(window.location.search).get('categoriaId');
        if (categoriaIdURL) {
        selectCategoria.value = categoriaIdURL;
        }

    } catch (error) {
        console.error('Error al cargar categorías:', error);
        mostrarMensaje('No se pudieron cargar las categorías.', 'error');
    }
    }

    async function cargarProductoSiEsEdicion() {
    const idProducto = obtenerIdProductoDesdeURL();
    if (!idProducto) return;

    try {
        const response = await fetch(`${API_BASE}/catalog/productos?idProducto=${encodeURIComponent(idProducto)}`);
        const producto = await leerRespuestaJSON(response);

        if (!response.ok) {
        throw new Error(producto.message || 'No se pudo cargar el producto');
        }

        llenarFormulario(producto);

    } catch (error) {
        console.error('Error al cargar producto:', error);
        mostrarMensaje(error.message || 'No se pudo cargar el producto para edición.', 'error');
    }
    }

    function llenarFormulario(producto) {
    setValue('idProducto', producto.idProducto);
    setValue(`url`, producto.url || '');
    setValue('nombreProducto', producto.nombreProducto);
    setValue('categoriaId', producto.categoriaId);
    setValue('precio', producto.precio);
    setValue('sku', producto.sku);
    
    const estadoSelect = document.getElementById('estado');
    if (estadoSelect) {
        estadoSelect.value = mapearEstadoFormulario(producto.estado);
    }
    }

    function mapearEstadoFormulario(estadoBackend) {
    switch (estadoBackend) {
        case 'ACTIVO':
        return 'active';
        case 'INACTIVO':
        return 'inactive';
        case 'AGOTADO':
        return 'draft';
        default:
        return 'active';
    }
    }

    function obtenerIdProductoDesdeURL() {
    const id = new URLSearchParams(window.location.search).get('idProducto');
    return id ? Number(id) : null;
    }

    function setValue(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.value = value ?? '';
    }
    }

    async function leerRespuestaJSON(response) {
    const text = await response.text();

    try {
        return text ? JSON.parse(text) : {};
    } catch {
        return {};
    }
    }

    function mostrarMensaje(mensaje, tipo = 'info') {
    console.log(`[${tipo}] ${mensaje}`);
    alert(mensaje);
    }