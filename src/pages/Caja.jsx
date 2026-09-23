import { CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../contexts/ToastContext';
import { ESTADOS_PEDIDO, METODOS_PAGO } from '../data/mockData';

const formatCurrency = (n) => `$${n?.toLocaleString('es-AR') ?? 0}`;

export default function Caja() {
  const { tenantData, actualizarPedido, actualizarMesa } = useTenant();
  const { toast } = useToast();
  const { pedidos, mesas } = tenantData;
  const [metodoPago, setMetodoPago] = useState('Efectivo');
  const [selectedPedido, setSelectedPedido] = useState(null);
  const [efectivoRecibido, setEfectivoRecibido] = useState('');
  const [ticketVisible, setTicketVisible] = useState(null);

  const pedidosCobrar = pedidos.filter((p) =>
    [ESTADOS_PEDIDO.LISTO, ESTADOS_PEDIDO.EN_COCINA, ESTADOS_PEDIDO.PENDIENTE].includes(p.estado)
  );

  const cobrar = async () => {
    if (!selectedPedido) return toast('Seleccioná un pedido', 'error');
    const ticket = {
      ...selectedPedido,
      metodoPago,
      cobradoEn: new Date().toISOString(),
      efectivoRecibido: metodoPago === 'Efectivo' ? +efectivoRecibido : selectedPedido.total,
      vuelto: metodoPago === 'Efectivo' && efectivoRecibido ? +efectivoRecibido - selectedPedido.total : 0,
    };
    await actualizarPedido(selectedPedido.id, { estado: ESTADOS_PEDIDO.ENTREGADO, metodoPago });
    const mesa = mesas.find((m) => m.id === selectedPedido.mesaId);
    if (mesa) await actualizarMesa(mesa.id, { estado: 'sucia' });
    setTicketVisible(ticket);
    setSelectedPedido(null);
    setEfectivoRecibido('');
    toast(' Pago registrado con éxito', 'success');
  };

  const hoyVentas = pedidos.filter((p) => p.estado === ESTADOS_PEDIDO.ENTREGADO);
  const totalHoy = hoyVentas.reduce((s, p) => s + (p.total ?? 0), 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">💰 Caja</h1>
          <div className="page-subtitle">Cobrá pedidos y registrá pagos</div>
        </div>
        <div className="stat-card" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16, padding: '12px 20px' }}>
          <div>
            <div className="stat-label">Ventas del día</div>
            <div className="stat-value" style={{ color: 'var(--green)', fontSize: 22 }}>{formatCurrency(totalHoy)}</div>
          </div>
          <div style={{ fontSize: 24 }}>💵</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Pedidos a cobrar */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Pedidos a Cobrar</h3>
          {pedidosCobrar.length === 0 ? (
            <div className="card">
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-state-icon"><CheckCircle2 size={48} /></div>
                <div className="empty-state-title">Sin pedidos pendientes</div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {pedidosCobrar.map((p) => (
                <div
                  key={p.id}
                  className="card"
                  onClick={() => setSelectedPedido(selectedPedido?.id === p.id ? null : p)}
                  style={{ cursor: 'pointer', borderColor: selectedPedido?.id === p.id ? 'var(--accent)' : 'var(--border)', transition: 'all 0.15s' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>Mesa {p.mesaNumero}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.items.length} items · Mozo: {p.mozo}</div>
                    </div>
                    <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent)' }}>{formatCurrency(p.total)}</div>
                  </div>
                  {p.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-muted)', padding: '3px 0' }}>
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span>{formatCurrency(item.precio * item.cantidad)}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Panel de cobro */}
        <div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Cobrar</h3>
          <div className="card">
            {!selectedPedido ? (
              <div className="empty-state" style={{ padding: 40 }}>
                <div className="empty-state-icon">👈</div>
                <div className="empty-state-title">Seleccioná un pedido</div>
                <div className="empty-state-sub">Hacé click en un pedido de la izquierda</div>
              </div>
            ) : (
              <>
                <div style={{ marginBottom: 20, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ fontWeight: 700, fontSize: 16 }}>Mesa {selectedPedido.mesaNumero}</span>
                    <span style={{ fontWeight: 800, fontSize: 22, color: 'var(--accent)', fontFamily: 'Outfit' }}>{formatCurrency(selectedPedido.total)}</span>
                  </div>
                  {selectedPedido.items.map((item, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-secondary)', padding: '4px 0', borderTop: '1px solid var(--border)' }}>
                      <span>{item.cantidad}× {item.nombre}</span>
                      <span>{formatCurrency(item.precio * item.cantidad)}</span>
                    </div>
                  ))}
                </div>

                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Método de pago</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {METODOS_PAGO.map((m) => (
                      <button
                        key={m}
                        className={`btn btn-sm ${metodoPago === m ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setMetodoPago(m)}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                {metodoPago === 'Efectivo' && (
                  <div className="form-group" style={{ marginBottom: 16 }}>
                    <label className="form-label">Efectivo recibido</label>
                    <input
                      type="number"
                      value={efectivoRecibido}
                      onChange={(e) => setEfectivoRecibido(e.target.value)}
                      placeholder="0"
                      id="efectivo-recibido"
                    />
                    {efectivoRecibido && +efectivoRecibido >= selectedPedido.total && (
                      <div style={{ marginTop: 8, padding: 10, background: 'var(--green-dim)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', border: '1px solid rgba(16,185,129,0.3)' }}>
                        <span style={{ color: 'var(--green)', fontWeight: 600 }}>Vuelto:</span>
                        <span style={{ color: 'var(--green)', fontWeight: 800 }}>{formatCurrency(+efectivoRecibido - selectedPedido.total)}</span>
                      </div>
                    )}
                  </div>
                )}

                <button className="btn btn-primary btn-lg w-full" onClick={cobrar} id="btn-cobrar"><CheckCircle2 size={16} /> Cobrar {formatCurrency(selectedPedido.total)}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Ticket modal */}
      {ticketVisible && (
        <div className="modal-overlay" onClick={() => setTicketVisible(null)}>
          <div className="modal" style={{ maxWidth: 360, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🧾</div>
            <h2 style={{ marginBottom: 4 }}>Ticket de Cobro</h2>
            <div style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 }}>
              Mesa {ticketVisible.mesaNumero} · {new Date(ticketVisible.cobradoEn).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: 16, marginBottom: 16, textAlign: 'left' }}>
              {ticketVisible.items.map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0' }}>
                  <span>{item.cantidad}× {item.nombre}</span>
                  <span>{formatCurrency(item.precio * item.cantidad)}</span>
                </div>
              ))}
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 10, paddingTop: 10, display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16 }}>
                <span>TOTAL</span>
                <span style={{ color: 'var(--accent)' }}>{formatCurrency(ticketVisible.total)}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 8 }}>
              <span>Método:</span><strong>{ticketVisible.metodoPago}</strong>
            </div>
            {ticketVisible.metodoPago === 'Efectivo' && ticketVisible.vuelto > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, color: 'var(--green)', marginBottom: 16 }}>
                <span>Vuelto:</span><strong>{formatCurrency(ticketVisible.vuelto)}</strong>
              </div>
            )}
            <button className="btn btn-primary w-full" onClick={() => setTicketVisible(null)}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
}
