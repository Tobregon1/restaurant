import { Armchair, ClipboardList, BadgeDollarSign, Bike, Building, Users, CheckCircle2, AlertTriangle } from 'lucide-react';
import React from 'react';
import { useTenant } from '../contexts/TenantContext';
import { ESTADOS_PEDIDO, ESTADOS_DELIVERY } from '../data/mockData';

const formatCurrency = (n) => `$${n?.toLocaleString('es-AR') ?? 0}`;

export default function Dashboard() {
  const { activeTenant, tenantData } = useTenant();

  if (!activeTenant) return (
    <div className="page-content">
      <div className="empty-state" style={{ paddingTop: 100 }}>
        <div className="empty-state-icon"><Building size={48} /></div>
        <div className="empty-state-title">Seleccioná un negocio</div>
        <div className="empty-state-sub">Para ver el dashboard, primero seleccioná un negocio desde "Gestión de Negocios"</div>
      </div>
    </div>
  );

  const { mesas, pedidos, inventario, delivery, ventas, empleados } = tenantData;

  const mesasOcupadas = mesas.filter((m) => m.estado === 'ocupada').length;
  const pedidosPendientes = pedidos.filter((p) => p.estado === ESTADOS_PEDIDO.PENDIENTE || p.estado === ESTADOS_PEDIDO.EN_COCINA).length;
  const ventaHoy = ventas[ventas.length - 1]?.totalVentas ?? 0;
  const ventaAyer = ventas[ventas.length - 2]?.totalVentas ?? 1;
  const ventaDiff = Math.round(((ventaHoy - ventaAyer) / ventaAyer) * 100);
  const stockBajo = inventario.filter((i) => i.cantidad <= i.minimo).length;
  const deliveryActivos = delivery.filter((d) => ['nuevo', 'preparando', 'en_camino'].includes(d.estado)).length;

  const pedidosRecientes = [...pedidos].sort((a, b) => new Date(b.creadoEn) - new Date(a.creadoEn)).slice(0, 5);

  const minToStr = (ms) => {
    const min = Math.floor((Date.now() - new Date(ms)) / 60000);
    if (min < 1) return 'Ahora';
    if (min < 60) return `hace ${min}m`;
    return `hace ${Math.floor(min / 60)}h`;
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">¡Buenas noches! 👋</h1>
          <div className="page-subtitle">{activeTenant.nombre} — {activeTenant.tipo}</div>
        </div>
        {activeTenant.activo && <span className="badge badge-listo">● Negocio abierto</span>}
      </div>

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-icon"><Armchair size={24} /></div>
          <div className="stat-label">Mesas Ocupadas</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{mesasOcupadas}<span style={{ fontSize: 16, color: 'var(--text-muted)', fontWeight: 400 }}>/{mesas.length}</span></div>
          <div className="stat-sub">{mesas.length - mesasOcupadas} disponibles</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><ClipboardList size={24} /></div>
          <div className="stat-label">Pedidos Activos</div>
          <div className="stat-value" style={{ color: pedidosPendientes > 0 ? 'var(--orange)' : 'var(--green)' }}>{pedidosPendientes}</div>
          <div className="stat-sub">en cocina / pendientes</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><BadgeDollarSign size={24} /></div>
          <div className="stat-label">Venta del Día</div>
          <div className="stat-value" style={{ color: 'var(--green)' }}>{formatCurrency(ventaHoy)}</div>
          <div className="stat-sub" style={{ color: ventaDiff >= 0 ? 'var(--green)' : 'var(--red)' }}>
            {ventaDiff >= 0 ? '↑' : '↓'} {Math.abs(ventaDiff)}% vs ayer
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><Bike size={24} /></div>
          <div className="stat-label">Delivery Activos</div>
          <div className="stat-value" style={{ color: deliveryActivos > 0 ? 'var(--purple)' : 'var(--text-secondary)' }}>{deliveryActivos}</div>
          <div className="stat-sub">en proceso</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Pedidos recientes */}
        <div className="card">
          <div className="flex items-center justify-between" style={{ marginBottom: 16 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>Pedidos Recientes</h3>
            <span className="badge badge-en_cocina">{pedidos.length} total</span>
          </div>
          {pedidosRecientes.length === 0 ? (
            <div className="empty-state" style={{ padding: 30 }}>
              <div className="empty-state-icon"><ClipboardList size={48} /></div>
              <div className="empty-state-title">Sin pedidos</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pedidosRecientes.map((p) => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 600 }}>Mesa {p.mesaNumero}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{p.items.length} items · {minToStr(p.creadoEn)}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', marginBottom: 4 }}>${p.total?.toLocaleString('es-AR')}</div>
                    <span className={`badge badge-${p.estado}`} style={{ fontSize: 10 }}>
                      {p.estado === 'en_cocina' ? 'En Cocina' : p.estado === 'pendiente' ? 'Pendiente' : p.estado === 'listo' ? '¡Listo!' : p.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock & Empleados */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Stock bajo */}
          <div className="card">
            <div className="flex items-center justify-between" style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}><AlertTriangle size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Stock Bajo</h3>
              {stockBajo > 0 && <span className="badge badge-danger">{stockBajo} alertas</span>}
            </div>
            {inventario.filter((i) => i.cantidad <= i.minimo).length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--green)', display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> Todos los productos con stock suficiente
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {inventario.filter((i) => i.cantidad <= i.minimo).slice(0, 4).map((i) => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--red-dim)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239,68,68,0.2)' }}>
                    <span style={{ fontSize: 13 }}>{i.nombre}</span>
                    <span style={{ fontSize: 12, color: 'var(--red)', fontWeight: 600 }}>{i.cantidad} {i.unidad} (mín: {i.minimo})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Equipo */}
          <div className="card">
            <div style={{ marginBottom: 14 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700 }}><Users size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Equipo en turno</h3>
            </div>
            {empleados.filter((e) => e.activo).slice(0, 4).map((e) => (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: '1px solid var(--accent-glow)', flexShrink: 0 }}>
                  {e.nombre.charAt(0)}
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{e.nombre}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{e.rol} · {e.turno}</div>
                </div>
              </div>
            ))}
            {empleados.length === 0 && <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin empleados registrados</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
