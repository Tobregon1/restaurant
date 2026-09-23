import { Utensils, Beer, GlassWater, Coffee, Pizza, Beef, Fish, IceCream, BarChart2, Armchair, ClipboardList, ChefHat, BadgeDollarSign, Package, Bike, Users, TrendingUp, Building, Settings, LogOut, User } from 'lucide-react';
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useAuth } from '../../contexts/AuthContext';
import { ESTADOS_PEDIDO } from '../../data/mockData';

const NEGOCIO_ICONS = { Restaurante: Utensils, Bar: Beer, Restobar: GlassWater, Cafetería: Coffee, Pizzería: Pizza, Parrilla: Beef, Sushi: Fish, Heladería: IceCream };

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: BarChart2 },
  { path: '/mesas', label: 'Mesas', icon: Armchair },
  { path: '/pedidos', label: 'Pedidos', icon: ClipboardList },
  { path: '/cocina', label: 'Cocina', icon: ChefHat },
  { path: '/menu', label: 'Menú', icon: Pizza },
  { path: '/caja', label: 'Caja', icon: BadgeDollarSign },
  { path: '/inventario', label: 'Inventario', icon: Package },
  { path: '/delivery', label: 'Delivery', icon: Bike },
  { path: '/empleados', label: 'Empleados', icon: Users },
  { path: '/reportes', label: 'Reportes', icon: TrendingUp },
];

const adminItems = [
  { path: '/negocios', label: 'Mis Negocios', icon: Building },
  { path: '/config', label: 'Configuración', icon: Settings },
];

export const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeTenant, tenantData, clearTenant } = useTenant();
  const { logout } = useAuth();

  const pendientes = tenantData.pedidos?.filter((p) => p.estado === ESTADOS_PEDIDO.PENDIENTE).length ?? 0;
  const deliveryNuevos = tenantData.delivery?.filter((d) => d.estado === 'nuevo').length ?? 0;

  const handleNav = (path) => navigate(path);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon"><Utensils size={28} /></div>
          <div>
            <div className="sidebar-logo-name">RestaurantOS</div>
            <div className="sidebar-logo-sub">Sistema de Gestión</div>
          </div>
        </div>
        {activeTenant && (
          <div
            className="tenant-badge"
            onClick={() => navigate('/negocios')}
            title="Cambiar negocio"
            style={{ '--accent': activeTenant.color || '#f59e0b' }}
          >
            <div className="tenant-badge-dot" />
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div className="tenant-badge-name" style={{ color: activeTenant.color || '#f59e0b' }}>
                {(() => { const Icon = NEGOCIO_ICONS[activeTenant.tipo] || Building; return <Icon size={14} style={{ marginRight: 4, verticalAlign: 'middle' }}/>; })()} {activeTenant.nombre}
              </div>
              <div className="tenant-badge-tipo">{activeTenant.tipo}</div>
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {activeTenant && (
          <>
            <div className="nav-section-label">Operaciones</div>
            {navItems.map((item) => {
              const badge = item.path === '/pedidos' ? pendientes : item.path === '/delivery' ? deliveryNuevos : 0;
              return (
                <div
                  key={item.path}
                  className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
                  onClick={() => handleNav(item.path)}
                >
                  <span className="nav-item-icon"><item.icon size={18} /></span>
                  {item.label}
                  {badge > 0 && <span className="nav-badge">{badge}</span>}
                </div>
              );
            })}
          </>
        )}

        <div className="nav-section-label" style={{ marginTop: 12 }}>Administración</div>
        {adminItems.map((item) => (
          <div
            key={item.path}
            className={`nav-item${location.pathname === item.path ? ' active' : ''}`}
            onClick={() => handleNav(item.path)}
          >
            <span className="nav-item-icon"><item.icon size={18} /></span>
            {item.label}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="nav-item" onClick={() => { logout(); navigate('/login'); }}>
          <span className="nav-item-icon"><LogOut size={18} /></span>
          Cerrar Sesión
        </div>
      </div>
    </aside>
  );
};

export const Topbar = () => {
  const { activeTenant } = useTenant();
  const location = useLocation();

  const titles = {
    '/dashboard': 'Dashboard', '/mesas': 'Mesas & Reservas',
    '/pedidos': 'Pedidos', '/cocina': 'Cocina (KDS)',
    '/menu': 'Menú Digital', '/caja': 'Caja',
    '/inventario': 'Inventario', '/delivery': 'Delivery',
    '/empleados': 'Empleados', '/reportes': 'Reportes',
    '/negocios': 'Gestión de Negocios', '/config': 'Configuración',
  };

  const now = new Date();
  const hora = now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  const fecha = now.toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' });

  return (
    <header className="topbar">
      <div>
        <div style={{ fontSize: 17, fontWeight: 700 }}>{titles[location.pathname] ?? 'RestaurantOS'}</div>
        {activeTenant && <div style={{ fontSize: 12, color: 'var(--text-muted)', textTransform: 'capitalize' }}>{fecha}</div>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'Outfit', color: 'var(--accent)' }}>{hora}</div>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: 'var(--accent-dim)', border: '1px solid var(--accent-glow)',
          display: 'flex', alignItems: 'center', justifyContent: 'center' }}><User size={18} /></div>
      </div>
    </header>
  );
};
