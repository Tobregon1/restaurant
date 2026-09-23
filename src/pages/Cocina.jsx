import { Utensils } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../contexts/ToastContext';
import { ESTADOS_PEDIDO } from '../data/mockData';

export default function Cocina() {
  const { tenantData, actualizarPedido } = useTenant();
  const { toast } = useToast();
  const { pedidos } = tenantData;
  const [tick, setTick] = useState(0);

  // Refresh timer display every 30s
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(interval);
  }, []);

  const activePedidos = pedidos.filter((p) =>
    [ESTADOS_PEDIDO.PENDIENTE, ESTADOS_PEDIDO.EN_COCINA].includes(p.estado)
  ).sort((a, b) => new Date(a.creadoEn) - new Date(b.creadoEn));

  const getMinutes = (isoStr) => Math.floor((Date.now() - new Date(isoStr)) / 60000);

  const cambiarEstado = async (pedido, nuevoEstado) => {
    await actualizarPedido(pedido.id, { estado: nuevoEstado });
    if (nuevoEstado === ESTADOS_PEDIDO.LISTO) toast(`🔔 Mesa ${pedido.mesaNumero} — ¡Pedido listo!`, 'success');
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">👨‍🍳 Cocina — Display</h1>
          <div className="page-subtitle">
            {activePedidos.length} pedido{activePedidos.length !== 1 ? 's' : ''} en proceso
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: 8 }}>
            <span className="badge badge-pendiente">🟡 Pendiente</span>
            <span className="badge badge-en_cocina">🔵 En Cocina</span>
          </div>
        </div>
      </div>

      {activePedidos.length === 0 ? (
        <div className="card">
          <div className="empty-state" style={{ padding: '80px 20px' }}>
            <div className="empty-state-icon"><Utensils size={48} /></div>
            <div className="empty-state-title">¡Todo en orden!</div>
            <div className="empty-state-sub">No hay pedidos pendientes en este momento</div>
          </div>
        </div>
      ) : (
        <div className="kds-grid">
          {activePedidos.map((p) => {
            const minutes = getMinutes(p.creadoEn);
            const timerClass = minutes >= 30 ? 'danger' : minutes >= 20 ? 'warning' : '';
            const isPendiente = p.estado === ESTADOS_PEDIDO.PENDIENTE;

            return (
              <div key={p.id} className="kds-card" style={{ borderColor: isPendiente ? 'rgba(249,115,22,0.3)' : 'rgba(59,130,246,0.3)' }}>
                <div className="kds-card-header" style={{ background: isPendiente ? 'rgba(249,115,22,0.08)' : 'rgba(59,130,246,0.08)' }}>
                  <div>
                    <div style={{ fontFamily: 'Outfit', fontSize: 22, fontWeight: 800 }}>Mesa {p.mesaNumero}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Mozo: {p.mozo}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className={`kds-timer ${timerClass}`} style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Outfit' }}>
                      ⏱ {minutes}m
                    </div>
                    <span className={`badge badge-${p.estado}`} style={{ fontSize: 10 }}>
                      {p.estado === ESTADOS_PEDIDO.PENDIENTE ? '🟡 Pendiente' : '🔵 En Cocina'}
                    </span>
                  </div>
                </div>

                <div className="kds-card-body">
                  {p.items.map((item, i) => (
                    <div key={i} className="kds-item">
                      <div className="kds-qty">{item.cantidad}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 14 }}>{item.nombre}</div>
                        {item.notas && <div style={{ fontSize: 11, color: 'var(--orange)', marginTop: 2 }}>📝 {item.notas}</div>}
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
                    {isPendiente ? (
                      <button
                        className="btn btn-secondary w-full"
                        style={{ borderColor: 'rgba(59,130,246,0.4)', color: 'var(--blue)' }}
                        onClick={() => cambiarEstado(p, ESTADOS_PEDIDO.EN_COCINA)}
                        id={`btn-cocina-${p.id}`}
                      >
                        🔵 Tomar Pedido
                      </button>
                    ) : (
                      <button
                        className="btn btn-success w-full"
                        onClick={() => cambiarEstado(p, ESTADOS_PEDIDO.LISTO)}
                        id={`btn-listo-${p.id}`}
                      >
                        ✅ Marcar como Listo
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
