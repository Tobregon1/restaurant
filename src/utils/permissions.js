export const PERMISSIONS = {
  '/dashboard': ['Gerente', 'superadmin'],
  '/mesas': ['Gerente', 'Mozo', 'Cajero', 'superadmin'],
  '/pedidos': ['Gerente', 'Mozo', 'Cajero', 'Bartender', 'superadmin'],
  '/cocina': ['Gerente', 'Cocinero', 'Bartender', 'superadmin'],
  '/menu': ['Gerente', 'Mozo', 'Cajero', 'superadmin'],
  '/caja': ['Gerente', 'Cajero', 'superadmin'],
  '/inventario': ['Gerente', 'superadmin'],
  '/empleados': ['Gerente', 'superadmin'],
  '/delivery': ['Gerente', 'Cajero', 'Delivery', 'superadmin'],
  '/reportes': ['Gerente', 'superadmin'],
  '/negocios': ['superadmin'],
  '/config': ['Gerente', 'superadmin'],
};

export const hasPermission = (rol, path) => {
  if (rol === 'superadmin') return true;
  const rolesPermitidos = PERMISSIONS[path];
  if (!rolesPermitidos) return false;
  return rolesPermitidos.includes(rol);
};

export const getFallbackRoute = (rol) => {
  if (rol === 'superadmin') return '/negocios';
  if (rol === 'Gerente') return '/dashboard';
  if (rol === 'Mozo') return '/mesas';
  if (rol === 'Cocinero' || rol === 'Bartender') return '/cocina';
  if (rol === 'Cajero') return '/caja';
  if (rol === 'Delivery') return '/delivery';
  return '/login';
};
