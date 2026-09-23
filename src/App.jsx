import { Utensils } from 'lucide-react';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TenantProvider } from './contexts/TenantContext';
import { ToastProvider } from './contexts/ToastContext';
import { Sidebar, Topbar } from './components/Layout/Layout';

import Login from './pages/Login';
import GestionNegocios from './pages/GestionNegocios';
import Dashboard from './pages/Dashboard';
import Mesas from './pages/Mesas';
import Pedidos from './pages/Pedidos';
import Cocina from './pages/Cocina';
import Menu from './pages/Menu';
import Caja from './pages/Caja';
import Inventario from './pages/Inventario';
import Empleados from './pages/Empleados';
import Delivery from './pages/Delivery';
import Reportes from './pages/Reportes';
import ConfigNegocio from './pages/ConfigNegocio';

import './styles/index.css';

const ProtectedLayout = ({ children }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
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
      <Route path="/login" element={user ? <Navigate to="/negocios" replace /> : <Login />} />
      <Route path="/" element={<Navigate to={user ? '/negocios' : '/login'} replace />} />

      <Route path="/negocios" element={<ProtectedLayout><GestionNegocios /></ProtectedLayout>} />
      <Route path="/dashboard" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
      <Route path="/mesas" element={<ProtectedLayout><Mesas /></ProtectedLayout>} />
      <Route path="/pedidos" element={<ProtectedLayout><Pedidos /></ProtectedLayout>} />
      <Route path="/cocina" element={<ProtectedLayout><Cocina /></ProtectedLayout>} />
      <Route path="/menu" element={<ProtectedLayout><Menu /></ProtectedLayout>} />
      <Route path="/caja" element={<ProtectedLayout><Caja /></ProtectedLayout>} />
      <Route path="/inventario" element={<ProtectedLayout><Inventario /></ProtectedLayout>} />
      <Route path="/empleados" element={<ProtectedLayout><Empleados /></ProtectedLayout>} />
      <Route path="/delivery" element={<ProtectedLayout><Delivery /></ProtectedLayout>} />
      <Route path="/reportes" element={<ProtectedLayout><Reportes /></ProtectedLayout>} />
      <Route path="/config" element={<ProtectedLayout><ConfigNegocio /></ProtectedLayout>} />

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
