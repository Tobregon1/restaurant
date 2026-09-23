import { Coffee } from 'lucide-react';
// ============================================================
// MOCK DATA — RestaurantOS Multi-Tenant
// ============================================================

export const TIPOS_NEGOCIO = ['Restaurante', 'Bar', 'Restobar', 'Cafetería', 'Pizzería', 'Parrilla', 'Sushi', 'Heladería'];

export const ESTADOS_MESA = {
  LIBRE: 'libre',
  OCUPADA: 'ocupada',
  RESERVADA: 'reservada',
  SUCIA: 'sucia',
};

export const ESTADOS_PEDIDO = {
  PENDIENTE: 'pendiente',
  EN_COCINA: 'en_cocina',
  LISTO: 'listo',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado',
};

export const ESTADOS_DELIVERY = {
  NUEVO: 'nuevo',
  PREPARANDO: 'preparando',
  EN_CAMINO: 'en_camino',
  ENTREGADO: 'entregado',
  CANCELADO: 'cancelado',
};

export const ROLES_EMPLEADO = ['Mozo', 'Cocinero', 'Cajero', 'Gerente', 'Bartender', 'Delivery'];

export const METODOS_PAGO = ['Efectivo', 'Tarjeta de crédito', 'Tarjeta de débito', 'Transferencia', 'MercadoPago'];

// ── Negocios ──────────────────────────────────────────────
export const initialNegocios = [
  {
    id: 'neg-001',
    nombre: 'La Parrilla del Río',
    tipo: 'Restaurante',
    logo: null,
    color: '#f59e0b',
    direccion: 'Av. Corrientes 1234, CABA',
    telefono: '+54 11 4444-5555',
    email: 'info@laparrilla.com',
    redes: { instagram: '@laparrilla', facebook: 'LaParrilladelRio' },
    horarios: 'Lun-Dom: 12:00 - 00:00',
    zoneDelivery: 5,
    costoDelivery: 500,
    iva: 21,
    metodoPago: ['Efectivo', 'Tarjeta de crédito', 'Tarjeta de débito', 'MercadoPago'],
    activo: true,
    creadoEn: '2024-01-15',
  },
  {
    id: 'neg-002',
    nombre: 'El Rincón Bar',
    tipo: 'Bar',
    logo: null,
    color: '#8b5cf6',
    direccion: 'Thames 852, Palermo',
    telefono: '+54 11 3333-7777',
    email: 'hola@elrincon.bar',
    redes: { instagram: '@elrinconbar' },
    horarios: 'Mié-Dom: 19:00 - 04:00',
    zoneDelivery: 3,
    costoDelivery: 300,
    iva: 21,
    metodoPago: ['Efectivo', 'Tarjeta de débito', 'MercadoPago'],
    activo: true,
    creadoEn: '2024-03-20',
  },
  {
    id: 'neg-003',
    nombre: 'Noche & Fuego Restobar',
    tipo: 'Restobar',
    logo: null,
    color: '#ef4444',
    direccion: 'Honduras 4890, Palermo Hollywood',
    telefono: '+54 11 2222-9999',
    email: 'reservas@nochefuego.com',
    redes: { instagram: '@nochyfuego', facebook: 'NocheFuegoRestobar' },
    horarios: 'Jue-Sáb: 20:00 - 05:00',
    zoneDelivery: 4,
    costoDelivery: 400,
    iva: 21,
    metodoPago: ['Efectivo', 'Tarjeta de crédito', 'MercadoPago'],
    activo: true,
    creadoEn: '2024-06-01',
  },
];

// ── Mesas ──────────────────────────────────────────────────
export const initialMesas = {
  'neg-001': [
    { id: 'm1', numero: 1, capacidad: 2, estado: ESTADOS_MESA.LIBRE, zona: 'Salón' },
    { id: 'm2', numero: 2, capacidad: 4, estado: ESTADOS_MESA.OCUPADA, zona: 'Salón' },
    { id: 'm3', numero: 3, capacidad: 4, estado: ESTADOS_MESA.RESERVADA, zona: 'Salón' },
    { id: 'm4', numero: 4, capacidad: 6, estado: ESTADOS_MESA.LIBRE, zona: 'Terraza' },
    { id: 'm5', numero: 5, capacidad: 2, estado: ESTADOS_MESA.SUCIA, zona: 'Terraza' },
    { id: 'm6', numero: 6, capacidad: 8, estado: ESTADOS_MESA.LIBRE, zona: 'Salón VIP' },
    { id: 'm7', numero: 7, capacidad: 4, estado: ESTADOS_MESA.OCUPADA, zona: 'Salón' },
    { id: 'm8', numero: 8, capacidad: 4, estado: ESTADOS_MESA.LIBRE, zona: 'Terraza' },
  ],
  'neg-002': [
    { id: 'm1', numero: 1, capacidad: 4, estado: ESTADOS_MESA.LIBRE, zona: 'Interior' },
    { id: 'm2', numero: 2, capacidad: 4, estado: ESTADOS_MESA.OCUPADA, zona: 'Interior' },
    { id: 'm3', numero: 3, capacidad: 6, estado: ESTADOS_MESA.LIBRE, zona: 'Barra' },
    { id: 'm4', numero: 4, capacidad: 2, estado: ESTADOS_MESA.LIBRE, zona: 'Exterior' },
  ],
  'neg-003': [
    { id: 'm1', numero: 1, capacidad: 4, estado: ESTADOS_MESA.OCUPADA, zona: 'Planta Baja' },
    { id: 'm2', numero: 2, capacidad: 6, estado: ESTADOS_MESA.LIBRE, zona: 'Planta Alta' },
    { id: 'm3', numero: 3, capacidad: 8, estado: ESTADOS_MESA.RESERVADA, zona: 'VIP' },
    { id: 'm4', numero: 4, capacidad: 4, estado: ESTADOS_MESA.LIBRE, zona: 'Terraza' },
    { id: 'm5', numero: 5, capacidad: 2, estado: ESTADOS_MESA.LIBRE, zona: 'Barra' },
  ],
};

// ── Reservas ───────────────────────────────────────────────
export const initialReservas = {
  'neg-001': [
    { id: 'r1', nombre: 'García Familia', telefono: '11-1234-5678', fecha: '2026-09-23', hora: '20:00', personas: 4, mesa: 'm3', notas: 'Cumpleaños' },
    { id: 'r2', nombre: 'López Juan', telefono: '11-8765-4321', fecha: '2026-09-23', hora: '21:30', personas: 2, mesa: null, notas: '' },
  ],
  'neg-002': [],
  'neg-003': [
    { id: 'r1', nombre: 'Rodríguez & Co.', telefono: '11-5555-1234', fecha: '2026-09-23', hora: '22:00', personas: 8, mesa: 'm3', notas: 'Celebración empresa' },
  ],
};

// ── Categorías de Menú ─────────────────────────────────────
export const initialCategorias = {
  'neg-001': [
    { id: 'cat1', nombre: 'Entradas', icono: 'Salad', orden: 1 },
    { id: 'cat2', nombre: 'Carnes', icono: 'Beef', orden: 2 },
    { id: 'cat3', nombre: 'Pastas', icono: 'UtensilsCrossed', orden: 3 },
    { id: 'cat4', nombre: 'Postres', icono: 'Coffee', orden: 4 },
    { id: 'cat5', nombre: 'Bebidas', icono: 'CupSoda', orden: 5 },
  ],
  'neg-002': [
    { id: 'cat1', nombre: 'Cervezas', icono: 'Beer', orden: 1 },
    { id: 'cat2', nombre: 'Cocktails', icono: 'Martini', orden: 2 },
    { id: 'cat3', nombre: 'Shots', icono: 'GlassWater', orden: 3 },
    { id: 'cat4', nombre: 'Picadas', icono: 'Cheese', orden: 4 },
  ],
  'neg-003': [
    { id: 'cat1', nombre: 'Entradas', icono: 'Salad', orden: 1 },
    { id: 'cat2', nombre: 'Principales', icono: 'Utensils', orden: 2 },
    { id: 'cat3', nombre: 'Cocktails', icono: 'Martini', orden: 3 },
    { id: 'cat4', nombre: 'Postres', icono: 'Coffee', orden: 4 },
  ],
};

// ── Ítems de Menú ──────────────────────────────────────────
export const initialMenuItems = {
  'neg-001': [
    { id: 'i1', categoriaId: 'cat1', nombre: 'Empanadas (x6)', descripcion: 'Carne cortada a cuchillo', precio: 3200, disponible: true, tiempo: 10 },
    { id: 'i2', categoriaId: 'cat1', nombre: 'Provoleta', descripcion: 'Con chimichurri y pan tostado', precio: 2800, disponible: true, tiempo: 8 },
    { id: 'i3', categoriaId: 'cat2', nombre: 'Bife de Chorizo 400g', descripcion: 'Con papas fritas o ensalada', precio: 9500, disponible: true, tiempo: 25 },
    { id: 'i4', categoriaId: 'cat2', nombre: 'Asado de Tira 500g', descripcion: 'Con chimichurri', precio: 8900, disponible: true, tiempo: 30 },
    { id: 'i5', categoriaId: 'cat2', nombre: 'Vacío a la Parrilla', descripcion: '', precio: 10200, disponible: false, tiempo: 35 },
    { id: 'i6', categoriaId: 'cat3', nombre: 'Fideos con Tuco', descripcion: 'Salsa casera', precio: 4200, disponible: true, tiempo: 15 },
    { id: 'i7', categoriaId: 'cat4', nombre: 'Flan Casero', descripcion: 'Con dulce de leche y crema', precio: 1800, disponible: true, tiempo: 5 },
    { id: 'i8', categoriaId: 'cat5', nombre: 'Agua mineral 500ml', descripcion: '', precio: 800, disponible: true, tiempo: 2 },
    { id: 'i9', categoriaId: 'cat5', nombre: 'Coca-Cola 500ml', descripcion: '', precio: 1200, disponible: true, tiempo: 2 },
    { id: 'i10', categoriaId: 'cat5', nombre: 'Vino de la casa 750ml', descripcion: 'Tinto / Blanco / Rosado', precio: 4500, disponible: true, tiempo: 3 },
  ],
  'neg-002': [
    { id: 'i1', categoriaId: 'cat1', nombre: 'Quilmes 1L', descripcion: '', precio: 2200, disponible: true, tiempo: 2 },
    { id: 'i2', categoriaId: 'cat1', nombre: 'IPA Artesanal 500ml', descripcion: 'De barril', precio: 2800, disponible: true, tiempo: 2 },
    { id: 'i3', categoriaId: 'cat2', nombre: 'Aperol Spritz', descripcion: 'Con naranja', precio: 3500, disponible: true, tiempo: 5 },
    { id: 'i4', categoriaId: 'cat2', nombre: 'Negroni', descripcion: 'Gin, Campari, vermut rosso', precio: 4200, disponible: true, tiempo: 5 },
    { id: 'i5', categoriaId: 'cat3', nombre: 'Tequila Shot', descripcion: 'Con sal y limón', precio: 2000, disponible: true, tiempo: 2 },
    { id: 'i6', categoriaId: 'cat4', nombre: 'Picada Clásica', descripcion: 'Fiambres, quesos, aceitunas, pan', precio: 6500, disponible: true, tiempo: 10 },
  ],
  'neg-003': [
    { id: 'i1', categoriaId: 'cat1', nombre: 'Tabla de quesos', descripcion: '5 variedades con mermelada', precio: 5800, disponible: true, tiempo: 10 },
    { id: 'i2', categoriaId: 'cat2', nombre: 'Salmón al horno', descripcion: 'Con puré de coliflor', precio: 12000, disponible: true, tiempo: 25 },
    { id: 'i3', categoriaId: 'cat2', nombre: 'Risotto de hongos', descripcion: 'Con parmesano y trufa', precio: 9800, disponible: true, tiempo: 20 },
    { id: 'i4', categoriaId: 'cat3', nombre: 'Mojito', descripcion: 'Con ron, menta y lima', precio: 4500, disponible: true, tiempo: 5 },
    { id: 'i5', categoriaId: 'cat3', nombre: 'Cosmopolitan', descripcion: 'Vodka, cointreau, cranberry', precio: 5000, disponible: true, tiempo: 5 },
    { id: 'i6', categoriaId: 'cat4', nombre: 'Tiramisú', descripcion: 'Con mascarpone', precio: 4200, disponible: true, tiempo: 5 },
  ],
};

// ── Pedidos ────────────────────────────────────────────────
export const initialPedidos = {
  'neg-001': [
    {
      id: 'ped-001',
      mesaId: 'm2',
      mesaNumero: 2,
      estado: ESTADOS_PEDIDO.EN_COCINA,
      items: [
        { itemId: 'i1', nombre: 'Empanadas (x6)', cantidad: 2, precio: 3200, notas: '' },
        { itemId: 'i3', nombre: 'Bife de Chorizo 400g', cantidad: 1, precio: 9500, notas: 'Término medio' },
        { itemId: 'i9', nombre: 'Coca-Cola 500ml', cantidad: 2, precio: 1200, notas: '' },
      ],
      mozo: 'Carlos Ruiz',
      creadoEn: new Date(Date.now() - 20 * 60000).toISOString(),
      total: 18300,
    },
    {
      id: 'ped-002',
      mesaId: 'm7',
      mesaNumero: 7,
      estado: ESTADOS_PEDIDO.PENDIENTE,
      items: [
        { itemId: 'i2', nombre: 'Provoleta', cantidad: 1, precio: 2800, notas: '' },
        { itemId: 'i10', nombre: 'Vino de la casa 750ml', cantidad: 1, precio: 4500, notas: 'Tinto' },
      ],
      mozo: 'Ana Gómez',
      creadoEn: new Date(Date.now() - 5 * 60000).toISOString(),
      total: 7300,
    },
  ],
  'neg-002': [],
  'neg-003': [
    {
      id: 'ped-001',
      mesaId: 'm1',
      mesaNumero: 1,
      estado: ESTADOS_PEDIDO.LISTO,
      items: [
        { itemId: 'i1', nombre: 'Tabla de quesos', cantidad: 1, precio: 5800, notas: '' },
        { itemId: 'i4', nombre: 'Mojito', cantidad: 2, precio: 4500, notas: '' },
      ],
      mozo: 'Sofía Torres',
      creadoEn: new Date(Date.now() - 35 * 60000).toISOString(),
      total: 14800,
    },
  ],
};

// ── Inventario ─────────────────────────────────────────────
export const initialInventario = {
  'neg-001': [
    { id: 'inv1', nombre: 'Carne vacuna (kg)', cantidad: 45, unidad: 'kg', minimo: 10, categoria: 'Proteínas', costo: 3200 },
    { id: 'inv2', nombre: 'Harina 000 (kg)', cantidad: 30, unidad: 'kg', minimo: 5, categoria: 'Secos', costo: 180 },
    { id: 'inv3', nombre: 'Aceite girasol (lt)', cantidad: 12, unidad: 'lt', minimo: 5, categoria: 'Secos', costo: 1200 },
    { id: 'inv4', nombre: 'Tomate triturado (lata)', cantidad: 3, unidad: 'unid', minimo: 10, categoria: 'Conservas', costo: 450 },
    { id: 'inv5', nombre: 'Papas (kg)', cantidad: 25, unidad: 'kg', minimo: 8, categoria: 'Verduras', costo: 380 },
    { id: 'inv6', nombre: 'Coca-Cola 500ml', cantidad: 48, unidad: 'unid', minimo: 24, categoria: 'Bebidas', costo: 650 },
    { id: 'inv7', nombre: 'Vino Malbec (botella)', cantidad: 8, unidad: 'unid', minimo: 12, categoria: 'Bebidas', costo: 2100 },
  ],
  'neg-002': [
    { id: 'inv1', nombre: 'Cerveza Quilmes 1L', cantidad: 60, unidad: 'unid', minimo: 24, categoria: 'Bebidas', costo: 1200 },
    { id: 'inv2', nombre: 'Gin Beefeater (750ml)', cantidad: 4, unidad: 'unid', minimo: 6, categoria: 'Destilados', costo: 8500 },
    { id: 'inv3', nombre: 'Ron Havana 7 (750ml)', cantidad: 5, unidad: 'unid', minimo: 3, categoria: 'Destilados', costo: 9200 },
    { id: 'inv4', nombre: 'Limones (kg)', cantidad: 3, unidad: 'kg', minimo: 5, categoria: 'Frutas', costo: 600 },
  ],
  'neg-003': [
    { id: 'inv1', nombre: 'Salmón (kg)', cantidad: 8, unidad: 'kg', minimo: 5, categoria: 'Proteínas', costo: 9500 },
    { id: 'inv2', nombre: 'Arroz arborio (kg)', cantidad: 10, unidad: 'kg', minimo: 3, categoria: 'Secos', costo: 1800 },
    { id: 'inv3', nombre: 'Hongos frescos (kg)', cantidad: 2, unidad: 'kg', minimo: 3, categoria: 'Verduras', costo: 4200 },
  ],
};

// ── Empleados ──────────────────────────────────────────────
export const initialEmpleados = {
  'neg-001': [
    { id: 'emp1', nombre: 'Carlos Ruiz', rol: 'Mozo', username: 'carlos', password: '123', telefono: '11-1111-2222', activo: true, turno: 'Noche' },
    { id: 'emp2', nombre: 'Ana Gómez', rol: 'Mozo', username: 'ana', password: '123', telefono: '11-3333-4444', activo: true, turno: 'Tarde' },
    { id: 'emp3', nombre: 'Pedro Martín', rol: 'Cocinero', username: 'pedro', password: '123', telefono: '11-5555-6666', activo: true, turno: 'Noche' },
    { id: 'emp4', nombre: 'Lucía Fernández', rol: 'Cajero', username: 'lucia', password: '123', telefono: '11-7777-8888', activo: true, turno: 'Tarde' },
  ],
  'neg-002': [
    { id: 'emp1', nombre: 'Martín López', rol: 'Bartender', username: 'martin', password: '123', telefono: '11-9999-0000', activo: true, turno: 'Noche' },
    { id: 'emp2', nombre: 'Valentina Cruz', rol: 'Mozo', username: 'vale', password: '123', telefono: '11-1234-5678', activo: true, turno: 'Noche' },
  ],
  'neg-003': [
    { id: 'emp1', nombre: 'Sofía Torres', rol: 'Mozo', username: 'sofia', password: '123', telefono: '11-2345-6789', activo: true, turno: 'Noche' },
    { id: 'emp2', nombre: 'Diego Sánchez', rol: 'Cocinero', username: 'diego', password: '123', telefono: '11-3456-7890', activo: true, turno: 'Noche' },
    { id: 'emp3', nombre: 'Paula Ríos', rol: 'Gerente', username: 'paula', password: '123', telefono: '11-4567-8901', activo: true, turno: 'Noche' },
  ],
};

// ── Delivery ───────────────────────────────────────────────
export const initialDelivery = {
  'neg-001': [
    {
      id: 'del-001',
      cliente: 'Ramírez, José',
      telefono: '11-9876-5432',
      direccion: 'Av. Santa Fe 2500, Piso 3',
      items: [
        { nombre: 'Bife de Chorizo 400g', cantidad: 2, precio: 9500 },
        { nombre: 'Coca-Cola 500ml', cantidad: 2, precio: 1200 },
      ],
      estado: ESTADOS_DELIVERY.EN_CAMINO,
      total: 21900,
      creadoEn: new Date(Date.now() - 40 * 60000).toISOString(),
      repartidor: 'Juan Pérez',
    },
  ],
  'neg-002': [],
  'neg-003': [],
};

// ── Ventas (para reportes) ─────────────────────────────────
const generarVentas = () => {
  const ventas = [];
  const hoy = new Date();
  for (let i = 29; i >= 0; i--) {
    const fecha = new Date(hoy);
    fecha.setDate(hoy.getDate() - i);
    ventas.push({
      fecha: fecha.toISOString().split('T')[0],
      totalVentas: Math.floor(Math.random() * 80000) + 30000,
      cantidadTickets: Math.floor(Math.random() * 40) + 10,
      topItems: ['Bife de Chorizo', 'Empanadas', 'Vino de la casa'],
    });
  }
  return ventas;
};

export const initialVentas = {
  'neg-001': generarVentas(),
  'neg-002': generarVentas(),
  'neg-003': generarVentas(),
};

// ── Usuario Superadmin ─────────────────────────────────────
export const superAdmin = {
  id: 'sa-001',
  nombre: 'Administrador',
  username: 'admin',
  password: 'admin123',
  rol: 'superadmin',
};
