import { Utensils } from 'lucide-react';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { ToastProvider } from './contexts/ToastContext';
import { Sidebar, Topbar } from './components/Layout/Layout';

import Login from './pages/Login';
import PublicMenu from './pages/PublicMenu';
import GestionNegocios from './pages/GestionNegocios';
import Dashboard from './pages/Dashboard';
import Reservas from './pages/Reservas';
import Mesas from './pages/Mesas';
import Pedidos from './pages/Pedidos';
import Cocina from './pages/Cocina';
import Menu from './pages/Menu';
import Caja from './pages/Caja';
import Inventario from './pages/Inventario';
import Empleados from './pages/Empleados';
import Clientes from './pages/Clientes';
import Proveedores from './pages/Proveedores';
import Delivery from './pages/Delivery';
import Reportes from './pages/Reportes';
import ConfigNegocio from './pages/ConfigNegocio';
import { hasPermission, getFallbackRoute } from './utils/permissions';

import './styles/index.css';

const ProtectedLayout = ({ children, path }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  if (!hasPermission(user.rol, path)) {
    return <Navigate to={getFallbackRoute(user.rol)} replace />;
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        {children}
      </div>
    </div>
  );
};

const AppRoutes = () => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}><Utensils size={48} /></div>
        <div className="loading-spinner" style={{ margin: '0 auto' }} />
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/m/:tenantId" element={<PublicMenu />} />
      <Route path="/login" element={user ? <Navigate to={getFallbackRoute(user.rol)} replace /> : <Login />} />
      <Route path="/" element={<Navigate to={user ? getFallbackRoute(user.rol) : '/login'} replace />} />

      <Route path="/negocios" element={<ProtectedLayout path="/negocios"><GestionNegocios /></ProtectedLayout>} />
      <Route path="/dashboard" element={<ProtectedLayout path="/dashboard"><Dashboard /></ProtectedLayout>} />
      <Route path="/reservas" element={<ProtectedLayout path="/reservas"><Reservas /></ProtectedLayout>} />
      <Route path="/mesas" element={<ProtectedLayout path="/mesas"><Mesas /></ProtectedLayout>} />
      <Route path="/pedidos" element={<ProtectedLayout path="/pedidos"><Pedidos /></ProtectedLayout>} />
      <Route path="/cocina" element={<ProtectedLayout path="/cocina"><Cocina /></ProtectedLayout>} />
      <Route path="/menu" element={<ProtectedLayout path="/menu"><Menu /></ProtectedLayout>} />
      <Route path="/caja" element={<ProtectedLayout path="/caja"><Caja /></ProtectedLayout>} />
      <Route path="/inventario" element={<ProtectedLayout path="/inventario"><Inventario /></ProtectedLayout>} />
      <Route path="/empleados" element={<ProtectedLayout path="/empleados"><Empleados /></ProtectedLayout>} />
      <Route path="/clientes" element={<ProtectedLayout path="/clientes"><Clientes /></ProtectedLayout>} />
      <Route path="/proveedores" element={<ProtectedLayout path="/proveedores"><Proveedores /></ProtectedLayout>} />
      <Route path="/delivery" element={<ProtectedLayout path="/delivery"><Delivery /></ProtectedLayout>} />
      <Route path="/reportes" element={<ProtectedLayout path="/reportes"><Reportes /></ProtectedLayout>} />
      <Route path="/config" element={<ProtectedLayout path="/config"><ConfigNegocio /></ProtectedLayout>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TenantProvider>
          <ToastProvider>
            <AppRoutes />
          </ToastProvider>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
