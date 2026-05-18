export const ADMIN_MOCK_DATA = {
  products: [
    { id: '001', name: 'Pijama Pantalon Mangas', category: 'Pijamas de Mujer', price: 60000, stock: 5, status: 'Bajo stock' },
    { id: '002', name: 'Bolso Rumania', category: 'Complementos', price: 96000, stock: 5, status: 'Bajo stock' },
    { id: '003', name: 'Pijama Short Sweetie', category: 'Pijamas de Mujer', price: 38000, stock: 10, status: 'Disponible' },
    { id: '004', name: 'Box organizador', category: 'Accesorios', price: 15000, stock: 10, status: 'Disponible' },
    { id: '005', name: 'Pijana Short Botones', category: 'Pijamas de Mujer', price: 100000, stock: 12, status: 'Disponible' }
  ],
  categories: [
    { id: '01', name: 'Pijamas de Mujer', description: 'Pijamas para el descanso y la comodidad', products: 27, status: 'Activa' },
    { id: '02', name: 'Accesorios', description: 'Accesorios para organizar tu vida diaria', products: 10, status: 'Activa' },
    { id: '03', name: 'Complementos', description: 'Complementos para tu estilo y comodidad', products: 5, status: 'Activa' },
  ],
  orders: [
    { id: '#1042', customer: 'Laura Gómez', date: '24/03/2026', items: '3 productos', total: 125000, status: 'Pendiente' },
    { id: '#1041', customer: 'Fernanda Soto', date: '23/03/2026', items: '1 producto', total: 89900, status: 'Enviado' },
    { id: '#1040', customer: 'Ana Torres', date: '22/03/2026', items: '4 productos', total: 210000, status: 'En proceso' },
    { id: '#1039', customer: 'Pedro López', date: '21/03/2026', items: '1 producto', total: 67500, status: 'Entregado' },
    { id: '#1038', customer: 'María Sánchez', date: '20/03/2026', items: '2 productos', total: 95000, status: 'Cancelado' }
  ],
  promotions: [
    { id: '01', name: 'Descuento de Temporada', code: 'TEMP25', discount: '25%', type: 'Porcentaje', start: '01/03/2026', end: '31/03/2026', status: 'Activa' },
    { id: '02', name: 'Envío Gratis Marzo', code: 'ENVIO0', discount: '100%', type: 'Envío gratis', start: '15/03/2026', end: '30/03/2026', status: 'Activa' },
    { id: '03', name: 'Navidad 2025', code: 'XMAS30', discount: '30%', type: 'Porcentaje', start: '20/12/2025', end: '31/12/2025', status: 'Expirada' }
  ]
};
