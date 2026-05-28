import { CATALOG_ENDPOINTS } from '../core/config.js';
import { request } from '../core/http.js';

const params = new URLSearchParams(window.location.search);
const idCategoria = params.get('idCategoria');

async function cargarProductos() {

    let endpoint = CATALOG_ENDPOINTS.productos;

    if (idCategoria) {
    endpoint += `?idCategoria=${idCategoria}`;
    }

    const response = await request(endpoint);

    console.log(response.data);

    pintarProductos(response.data);
}

function pintarProductos(productos) {

    const container = document.querySelector('.products-grid');

    container.innerHTML = productos.map(producto => `
        <div class="product-card">

        <img src="${producto.imagenPrincipal}" />

        <h3>${producto.nombreProducto}</h3>

        <p>$${producto.precio}</p>

        </div>
    `).join('');
}

cargarProductos();