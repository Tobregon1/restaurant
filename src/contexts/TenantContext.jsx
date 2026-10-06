import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  negociosService, mesasService, reservasService, categoriasService,
  menuItemsService, pedidosService, inventarioService, empleadosService,
  deliveryService, ventasService, clientesService, proveedoresService, initStorage,
} from '../services/api';
import {
  initialNegocios, initialMesas, initialReservas, initialCategorias,
  initialMenuItems, initialPedidos, initialInventario, initialEmpleados,
  initialDelivery, initialVentas,
} from '../data/mockData';

const TenantContext = createContext(null);

export const TenantProvider = ({ children }) => {
  const [negocios, setNegocios] = useState([]);
  const [activeTenant, setActiveTenant] = useState(null);
  const [tenantData, setTenantData] = useState({
    mesas: [], reservas: [], categorias: [], menuItems: [],
    pedidos: [], inventario: [], empleados: [], delivery: [], ventas: [], clientes: [], proveedores: [],
  });
  const [loading, setLoading] = useState(false);

  const loadNegocios = async () => {
    const data = await negociosService.getAll();
    setNegocios(data);
  };

  const loadTenantData = useCallback(async (tenantId) => {
    setLoading(true);
    const [mesas, reservas, categorias, menuItems, pedidos, inventario, empleados, delivery, ventas, clientes, proveedores] = await Promise.all([
      mesasService.getAll(tenantId),
      reservasService.getAll(tenantId),
      categoriasService.getAll(tenantId),
      menuItemsService.getAll(tenantId),
      pedidosService.getAll(tenantId),
      inventarioService.getAll(tenantId),
      empleadosService.getAll(tenantId),
      deliveryService.getAll(tenantId),
      ventasService.getAll(tenantId),
      clientesService.getAll(tenantId),
      proveedoresService.getAll(tenantId),
    ]);
    setTenantData({ mesas, reservas, categorias, menuItems, pedidos, inventario, empleados, delivery, ventas, clientes, proveedores });
    setLoading(false);
  }, []);

  // Seed localStorage on first load
  useEffect(() => {
    initStorage({
      ros_negocios: initialNegocios,
      ros_mesas: initialMesas,
      ros_reservas: initialReservas,
      ros_categorias: initialCategorias,
      ros_menu_items: initialMenuItems,
      ros_pedidos: initialPedidos,
      ros_inventario: initialInventario,
      ros_empleados: initialEmpleados,
      ros_delivery: initialDelivery,
      ros_ventas: initialVentas,
    });
    loadNegocios();
    // Restore active tenant
    const saved = localStorage.getItem('ros_tenant');
    if (saved) {
      const t = JSON.parse(saved);
      setActiveTenant(t);
      loadTenantData(t.id);
    }
  }, [loadTenantData]);

  // ── Auto-polling para Tiempo Real (Cocina/Caja/Mozos) ──
  useEffect(() => {
    if (!activeTenant) return;
    
    // Cada 10 segundos busca nuevos pedidos y estado de mesas
    const interval = setInterval(async () => {
      try {
        const [mesas, pedidos] = await Promise.all([
          mesasService.getAll(activeTenant.id),
          pedidosService.getAll(activeTenant.id)
        ]);
        setTenantData((prev) => ({
          ...prev,
          mesas,
          pedidos
        }));
      } catch (error) {
        console.error('Error sincronizando en tiempo real:', error);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [activeTenant]);

  const selectTenant = (negocio) => {
    setActiveTenant(negocio);
    localStorage.setItem('ros_tenant', JSON.stringify(negocio));
    loadTenantData(negocio.id);
  };

  const clearTenant = () => {
    setActiveTenant(null);
    localStorage.removeItem('ros_tenant');
    setTenantData({ mesas: [], reservas: [], categorias: [], menuItems: [], pedidos: [], inventario: [], empleados: [], delivery: [], ventas: [], clientes: [], proveedores: [] });
  };

  // ── Negocios CRUD ──────────────────────────────────────────
  const crearNegocio = async (data) => {
    const n = await negociosService.create(data);
    setNegocios((prev) => [...prev, n]);
    return n;
  };
  const actualizarNegocio = async (id, changes) => {
    await negociosService.update(id, changes);
    setNegocios((prev) => prev.map((n) => (n.id === id ? { ...n, ...changes } : n)));
    if (activeTenant?.id === id) {
      const updated = { ...activeTenant, ...changes };
      setActiveTenant(updated);
      localStorage.setItem('ros_tenant', JSON.stringify(updated));
    }
  };
  const eliminarNegocio = async (id) => {
    await negociosService.remove(id);
    setNegocios((prev) => prev.filter((n) => n.id !== id));
    if (activeTenant?.id === id) clearTenant();
  };

  // ── Mesas CRUD ─────────────────────────────────────────────
  const crearMesa = async (data) => {
    const m = await mesasService.create(activeTenant.id, data);
    setTenantData((prev) => ({ ...prev, mesas: [...prev.mesas, m] }));
    return m;
  };
  const actualizarMesa = async (id, changes) => {
    const updated = await mesasService.update(activeTenant.id, id, changes);
    setTenantData((prev) => ({ ...prev, mesas: prev.mesas.map((m) => (m.id === id ? updated : m)) }));
  };
  const eliminarMesa = async (id) => {
    await mesasService.remove(activeTenant.id, id);
    setTenantData((prev) => ({ ...prev, mesas: prev.mesas.filter((m) => m.id !== id) }));
  };

  // ── Reservas CRUD ──────────────────────────────────────────
  const crearReserva = async (data) => {
    const r = await reservasService.create(activeTenant.id, data);
    setTenantData((prev) => ({ ...prev, reservas: [...prev.reservas, r] }));
    return r;
  };
  const actualizarReserva = async (id, changes) => {
    const updated = await reservasService.update(activeTenant.id, id, changes);
    setTenantData((prev) => ({ ...prev, reservas: prev.reservas.map((r) => (r.id === id ? updated : r)) }));
  };
  const eliminarReserva = async (id) => {
    await reservasService.remove(activeTenant.id, id);
    setTenantData((prev) => ({ ...prev, reservas: prev.reservas.filter((r) => r.id !== id) }));
  };

  // ── Menú CRUD ──────────────────────────────────────────────
  const crearCategoria = async (data) => {
    const c = await categoriasService.create(activeTenant.id, data);
    setTenantData((prev) => ({ ...prev, categorias: [...prev.categorias, c] }));
    return c;
  };
  const actualizarCategoria = async (id, changes) => {
    const updated = await categoriasService.update(activeTenant.id, id, changes);
    setTenantData((prev) => ({ ...prev, categorias: prev.categorias.map((c) => (c.id === id ? updated : c)) }));
  };
  const eliminarCategoria = async (id) => {
    await categoriasService.remove(activeTenant.id, id);
    setTenantData((prev) => ({ ...prev, categorias: prev.categorias.filter((c) => c.id !== id) }));
  };
  const crearMenuItem = async (data) => {
    const i = await menuItemsService.create(activeTenant.id, data);
    setTenantData((prev) => ({ ...prev, menuItems: [...prev.menuItems, i] }));
    return i;
  };
  const actualizarMenuItem = async (id, changes) => {
    const updated = await menuItemsService.update(activeTenant.id, id, changes);
    setTenantData((prev) => ({ ...prev, menuItems: prev.menuItems.map((i) => (i.id === id ? updated : i)) }));
  };
  const eliminarMenuItem = async (id) => {
    await menuItemsService.remove(activeTenant.id, id);
    setTenantData((prev) => ({ ...prev, menuItems: prev.menuItems.filter((i) => i.id !== id) }));
  };

  // ── Pedidos CRUD ─────────────────────────────────────────
  const crearPedido = async (data) => {
    const p = await pedidosService.create(activeTenant.id, data);
    setTenantData((prev) => ({ ...prev, pedidos: [...prev.pedidos, p] }));
    return p;
  };
  const actualizarPedido = async (id, changes) => {
    const updated = await pedidosService.update(activeTenant.id, id, changes);
    setTenantData((prev) => ({ ...prev, pedidos: prev.pedidos.map((p) => (p.id === id ? updated : p)) }));
  };

  // ── Inventario CRUD ────────────────────────────────────────
  const crearInventario = async (data) => {
    const i = await inventarioService.create(activeTenant.id, data);
    setTenantData((prev) => ({ ...prev, inventario: [...prev.inventario, i] }));
    return i;
  };
  const crearInventarioBulk = async (items) => {
    await inventarioService.createBulk(activeTenant.id, items);
    // Refresh to get the actual IDs from the database
    await loadTenantData(activeTenant.id);
  };
  const actualizarInventario = async (id, changes) => {
    const updated = await inventarioService.update(activeTenant.id, id, changes);
    setTenantData((prev) => ({ ...prev, inventario: prev.inventario.map((i) => (i.id === id ? updated : i)) }));
  };
  const eliminarInventario = async (id) => {
    await inventarioService.remove(activeTenant.id, id);
    setTenantData((prev) => ({ ...prev, inventario: prev.inventario.filter((i) => i.id !== id) }));
  };

  // ── Empleados CRUD ─────────────────────────────────────────
  const crearEmpleado = async (data) => {
    const e = await empleadosService.create(activeTenant.id, data);
    setTenantData((prev) => ({ ...prev, empleados: [...prev.empleados, e] }));
    return e;
  };
  const actualizarEmpleado = async (id, changes) => {
    const updated = await empleadosService.update(activeTenant.id, id, changes);
    setTenantData((prev) => ({ ...prev, empleados: prev.empleados.map((e) => (e.id === id ? updated : e)) }));
  };
  const eliminarEmpleado = async (id) => {
    await empleadosService.remove(activeTenant.id, id);
    setTenantData((prev) => ({ ...prev, empleados: prev.empleados.filter((e) => e.id !== id) }));
  };

  // ── Delivery CRUD ──────────────────────────────────────────
  const crearDelivery = async (data) => {
    const d = await deliveryService.create(activeTenant.id, data);
    setTenantData((prev) => ({ ...prev, delivery: [...prev.delivery, d] }));
    return d;
  };
  const actualizarDelivery = async (id, changes) => {
    const updated = await deliveryService.update(activeTenant.id, id, changes);
    setTenantData((prev) => ({ ...prev, delivery: prev.delivery.map((d) => (d.id === id ? updated : d)) }));
  };

  // ── Clientes CRUD ─────────────────────────────────────────
  const crearCliente = async (data) => {
    const c = await clientesService.create(activeTenant.id, data);
    setTenantData((prev) => ({ ...prev, clientes: [...prev.clientes, c] }));
    return c;
  };
  const actualizarCliente = async (id, changes) => {
    const updated = await clientesService.update(activeTenant.id, id, changes);
    setTenantData((prev) => ({ ...prev, clientes: prev.clientes.map((c) => (c.id === id ? updated : c)) }));
  };
  const eliminarCliente = async (id) => {
    await clientesService.remove(activeTenant.id, id);
    setTenantData((prev) => ({ ...prev, clientes: prev.clientes.filter((c) => c.id !== id) }));
  };

  // ── Proveedores CRUD ──────────────────────────────────────
  const crearProveedor = async (data) => {
    const p = await proveedoresService.create(activeTenant.id, data);
    setTenantData((prev) => ({ ...prev, proveedores: [...prev.proveedores, p] }));
    return p;
  };
  const actualizarProveedor = async (id, changes) => {
    const updated = await proveedoresService.update(activeTenant.id, id, changes);
    setTenantData((prev) => ({ ...prev, proveedores: prev.proveedores.map((p) => (p.id === id ? updated : p)) }));
  };
  const eliminarProveedor = async (id) => {
    await proveedoresService.remove(activeTenant.id, id);
    setTenantData((prev) => ({ ...prev, proveedores: prev.proveedores.filter((p) => p.id !== id) }));
  };

  return (
    <TenantContext.Provider value={{
      negocios, activeTenant, tenantData, loading,
      loadNegocios, selectTenant, clearTenant,
      crearNegocio, actualizarNegocio, eliminarNegocio,
      crearMesa, actualizarMesa, eliminarMesa,
      crearReserva, actualizarReserva, eliminarReserva,
      crearCategoria, actualizarCategoria, eliminarCategoria,
      crearMenuItem, actualizarMenuItem, eliminarMenuItem,
      crearPedido, actualizarPedido,
      crearInventario, crearInventarioBulk, actualizarInventario, eliminarInventario,
      crearEmpleado, actualizarEmpleado, eliminarEmpleado,
      crearDelivery, actualizarDelivery,
      crearCliente, actualizarCliente, eliminarCliente,
      crearProveedor, actualizarProveedor, eliminarProveedor,
    }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);
