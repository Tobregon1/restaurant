// ============================================================
// API SERVICE LAYER — RestaurantOS
// Swap API_BASE_URL with your real API endpoint when ready.
// ============================================================

const API_BASE_URL = 'http://localhost:3001/api';
const USE_MOCK = false;

// Helper for real API calls
const request = async (method, endpoint, body = null) => {
  const token = localStorage.getItem('ros_token');
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  if (!res.ok) throw new Error(`API Error ${res.status}`);
  return res.json();
};

// ── LocalStorage helpers ───────────────────────────────────
const ls = {
  get: (key, fallback) => {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  set: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
};

export const initStorage = (initialData) => {
  const keys = Object.keys(initialData);
  keys.forEach((k) => { if (ls.get(k, null) === null) ls.set(k, initialData[k]); });
};

// ── Generic CRUD factory ───────────────────────────────────
export const createService = (storageKey, apiPath) => ({
  getAll: async (tenantId) => {
    if (USE_MOCK) {
      const data = ls.get(storageKey, {});
      return data[tenantId] ?? [];
    }
    return request('GET', `${apiPath}/${tenantId}`);
  },
  create: async (tenantId, item) => {
    if (USE_MOCK) {
      const data = ls.get(storageKey, {});
      if (!data[tenantId]) data[tenantId] = [];
      const newItem = { ...item, id: `${Date.now()}` };
      data[tenantId] = [...data[tenantId], newItem];
      ls.set(storageKey, data);
      return newItem;
    }
    return request('POST', `${apiPath}/${tenantId}`, item);
  },
  update: async (tenantId, id, changes) => {
    if (USE_MOCK) {
      const data = ls.get(storageKey, {});
      data[tenantId] = (data[tenantId] ?? []).map((i) => (i.id === id ? { ...i, ...changes } : i));
      ls.set(storageKey, data);
      return changes;
    }
    return request('PUT', `${apiPath}/${tenantId}/${id}`, changes);
  },
  remove: async (tenantId, id) => {
    if (USE_MOCK) {
      const data = ls.get(storageKey, {});
      data[tenantId] = (data[tenantId] ?? []).filter((i) => i.id !== id);
      ls.set(storageKey, data);
      return { ok: true };
    }
    return request('DELETE', `${apiPath}/${tenantId}/${id}`);
  },
});

// ── Negocios service (superadmin level) ───────────────────
export const negociosService = {
  getAll: async () => {
    if (USE_MOCK) return ls.get('ros_negocios', []);
    return request('GET', '/negocios');
  },
  create: async (negocio) => {
    if (USE_MOCK) {
      const list = ls.get('ros_negocios', []);
      const newN = { ...negocio, id: `neg-${Date.now()}`, creadoEn: new Date().toISOString() };
      ls.set('ros_negocios', [...list, newN]);
      return newN;
    }
    return request('POST', '/negocios', negocio);
  },
  update: async (id, changes) => {
    if (USE_MOCK) {
      const list = ls.get('ros_negocios', []);
      const updated = list.map((n) => (n.id === id ? { ...n, ...changes } : n));
      ls.set('ros_negocios', updated);
      return changes;
    }
    return request('PUT', `/negocios/${id}`, changes);
  },
  remove: async (id) => {
    if (USE_MOCK) {
      const list = ls.get('ros_negocios', []);
      ls.set('ros_negocios', list.filter((n) => n.id !== id));
      return { ok: true };
    }
    return request('DELETE', `/negocios/${id}`);
  },
};

// ── Named services ─────────────────────────────────────────
export const mesasService = createService('ros_mesas', '/mesas');
export const reservasService = createService('ros_reservas', '/reservas');
export const categoriasService = createService('ros_categorias', '/categorias');
export const menuItemsService = createService('ros_menu_items', '/menu_items');
export const pedidosService = createService('ros_pedidos', '/pedidos');
export const inventarioService = createService('ros_inventario', '/inventario');
export const empleadosService = createService('ros_empleados', '/empleados');
export const deliveryService = createService('ros_delivery', '/delivery');
export const ventasService = createService('ros_ventas', '/ventas');
