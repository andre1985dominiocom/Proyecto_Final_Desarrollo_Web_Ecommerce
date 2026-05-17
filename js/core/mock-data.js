export const ADMIN_MOCK_DATA = {
  products: [
    { id: '001', name: 'Vestido Floral', category: 'Ropa', price: 89900, stock: 5, status: 'Bajo stock' },
    { id: '002', name: 'Bolso de Cuero', category: 'Accesorios', price: 125000, stock: 3, status: 'Bajo stock' },
    { id: '003', name: 'Zapatos Tacón', category: 'Calzado', price: 210000, stock: 2, status: 'Bajo stock' },
    { id: '004', name: 'Cinturón Marrón', category: 'Accesorios', price: 45000, stock: 18, status: 'Disponible' },
    { id: '005', name: 'Camiseta Blanca', category: 'Ropa', price: 35000, stock: 42, status: 'Disponible' }
  ],
  categories: [
    { id: '01', name: 'Ropa', description: 'Prendas de vestir para mujer y hombre', products: 85, status: 'Activa' },
    { id: '02', name: 'Calzado', description: 'Zapatos, sandalias y botas', products: 64, status: 'Activa' },
    { id: '03', name: 'Accesorios', description: 'Cinturones, gorros, bufandas y más', products: 42, status: 'Activa' },
    { id: '04', name: 'Bolsos', description: 'Bolsos, carteras y mochilas', products: 38, status: 'Activa' },
    { id: '05', name: 'Joyería', description: 'Collares, aretes y pulseras', products: 18, status: 'Inactiva' }
  ],
  orders: [
    { id: '#1042', customer: 'Laura Gómez', date: '24/03/2026', items: '3 productos', total: 125000, status: 'Pendiente' },
    { id: '#1041', customer: 'Carlos Ruiz', date: '23/03/2026', items: '1 producto', total: 89900, status: 'Enviado' },
    { id: '#1040', customer: 'Ana Torres', date: '22/03/2026', items: '4 productos', total: 210000, status: 'En proceso' },
    { id: '#1039', customer: 'Pedro López', date: '21/03/2026', items: '2 productos', total: 67500, status: 'Entregado' },
    { id: '#1038', customer: 'María Sánchez', date: '20/03/2026', items: '2 productos', total: 95000, status: 'Cancelado' }
  ],
  promotions: [
    { id: '01', name: 'Descuento de Temporada', code: 'TEMP25', discount: '25%', type: 'Porcentaje', start: '01/03/2026', end: '31/03/2026', status: 'Activa' },
    { id: '02', name: 'Envío Gratis Marzo', code: 'ENVIO0', discount: '100%', type: 'Envío gratis', start: '15/03/2026', end: '30/03/2026', status: 'Activa' },
    { id: '03', name: 'Navidad 2025', code: 'XMAS30', discount: '30%', type: 'Porcentaje', start: '20/12/2025', end: '31/12/2025', status: 'Expirada' }
  ]
};
