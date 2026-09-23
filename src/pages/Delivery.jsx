import { Bike } from 'lucide-react';
import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../contexts/ToastContext';
import { Modal, EmptyState, Badge } from '../components/shared/UI';
import { ESTADOS_DELIVERY } from '../data/mockData';

const defaultPedido = { cliente: '', telefono: '', direccion: '', items: [], estado: 'nuevo', repartidor: '', notas: '' };

const ESTADO_STEPS = ['nuevo', 'preparando', 'en_camino', 'entregado'];
const ESTADO_ICONS = { nuevo: 'PlusCircle', preparando: 'ChefHat', en_camino: 'Bike', entregado: 'CheckCircle2', cancelado: 'XCircle' };
const ESTADO_LABELS = { nuevo: 'Nuevo', preparando: 'Preparando', en_camino: 'En Camino', entregado: 'Entregado', cancelado: 'Cancelado' };

const formatCurrency = (n) => `$${n?.toLocaleString('es-AR') ?? 0}`;

export default function Delivery() {
  const { tenantData, crearDelivery, actualizarDelivery } = useTenant();
  const { toast } = useToast();
  const { delivery, menuItems, categorias, activeTenant } = tenantData;
  const [tab, setTab] = useState('activos');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(defaultPedido);
  const [orderItems, setOrderItems] = useState([]);
  const [catFilter, setCatFilter] = useState(null);

  const activos = delivery.filter((d) => !['entregado', 'cancelado'].includes(d.estado));
  const historial = delivery.filter((d) => ['entregado', 'cancelado'].includes(d.estado));

  const addItem = (item) => {
    setOrderItems((prev) => {
      const ex = prev.find((i) => i.itemId === item.id);
      if (ex) return prev.map((i) => i.itemId === item.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { itemId: item.id, nombre: item.nombre, precio: item.precio, cantidad: 1 }];
    });
  };
  const updateQty = (itemId, delta) => {
    setOrderItems((p) => p.map((i) => i.itemId === itemId ? { ...i, cantidad: Math.max(0, i.cantidad + delta) } : i).filter((i) => i.cantidad > 0));
  };
  const total = orderItems.reduce((s, i) => s + i.precio * i.cantidad, 0);
  const totalConEnvio = total + (activeTenant?.costoDelivery ?? 0);

  const crearPedido = async () => {
    if (!form.cliente.trim()) return toast('El nombre del cliente es requerido', 'error');
    if (!form.direccion.trim()) return toast('La dirección es requerida', 'error');
    if (orderItems.length === 0) return toast('Agregá items al pedido', 'error');
    await crearDelivery({ ...form, items: orderItems, estado: 'nuevo', total: totalConEnvio, creadoEn: new Date().toISOString() });
    toast('Pedido de delivery creado ', 'success');
    setModal(false);
    setForm(defaultPedido);
    setOrderItems([]);
    setTab('activos');
  };

  const avanzarEstado = async (pedido) => {
    const idx = ESTADO_STEPS.indexOf(pedido.estado);
    if (idx < ESTADO_STEPS.length - 1) {
      const nuevoEstado = ESTADO_STEPS[idx + 1];
      await actualizarDelivery(pedido.id, { estado: nuevoEstado });
      toast(`${pedido.cliente} → ${ESTADO_LABELS[nuevoEstado]}`, 'info');
    }
  };

  const cancelar = async (pedido) => {
    await actualizarDelivery(pedido.id, { estado: 'cancelado' });
    toast('Pedido cancelado', 'info');
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">🛵 Delivery</h1>
          <div className="page-subtitle">{activos.length} pedido{activos.length !== 1 ? 's' : ''} activo{activos.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="page-actions">
          <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
            <button className={`btn ${tab === 'activos' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('activos')}>
              🔥 Activos {activos.length > 0 && <span className="nav-badge" style={{ marginLeft: 6 }}>{activos.length}</span>}
            </button>
            <button className={`btn ${tab === 'historial' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('historial')}>📜 Historial</button>
          </div>
          <button className="btn btn-primary" onClick={() => setModal(true)} id="btn-nuevo-delivery">+ Nuevo Pedido</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        {ESTADO_STEPS.map((e) => {
          const count = delivery.filter((d) => d.estado === e).length;
          return (
            <div key={e} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{ESTADO_ICONS[e]}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 18, fontFamily: 'Outfit' }}>{count}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{ESTADO_LABELS[e]}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Activos */}
      {tab === 'activos' && (
        activos.length === 0 ? <EmptyState icon="Bike" title="Sin pedidos activos" subtitle="Creá un nuevo pedido de delivery" /> : (
          <div className="kds-grid">
            {activos.map((d) => {
              const stepIdx = ESTADO_STEPS.indexOf(d.estado);
              return (
                <div key={d.id} className="kds-card">
                  <div className="kds-card-header">
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{d.cliente}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>📍 {d.direccion}</div>
                    </div>
                    <Badge estado={d.estado} />
                  </div>
                  <div className="kds-card-body">
                    {/* Progress */}
                    <div style={{ display: 'flex', gap: 4, marginBottom: 14 }}>
                      {ESTADO_STEPS.map((e, i) => (
                        <div key={e} style={{ flex: 1, height: 4, borderRadius: 2, background: i <= stepIdx ? 'var(--accent)' : 'var(--bg-hover)', transition: 'background 0.3s' }} />
                      ))}
                    </div>
                    {d.telefono && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>📱 {d.telefono}</div>}
                    {d.repartidor && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 8 }}>🧑 {d.repartidor}</div>}
                    {d.items?.map((item, i) => (
                      <div key={i} className="kds-item">
                        <div className="kds-qty">{item.cantidad}</div>
                        <span style={{ flex: 1 }}>{item.nombre}</span>
                        <span style={{ color: 'var(--accent)' }}>{formatCurrency(item.precio * item.cantidad)}</span>
                      </div>
                    ))}
                    <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', fontWeight: 700 }}>
                      <span>Total c/envío</span>
                      <span style={{ color: 'var(--accent)' }}>{formatCurrency(d.total)}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      {d.estado !== ESTADOS_DELIVERY.ENTREGADO && (
                        <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => avanzarEstado(d)}>
                          {ESTADO_ICONS[ESTADO_STEPS[ESTADO_STEPS.indexOf(d.estado) + 1] ?? 'entregado']} {ESTADO_LABELS[ESTADO_STEPS[ESTADO_STEPS.indexOf(d.estado) + 1] ?? 'entregado']}
                        </button>
                      )}
                      <button className="btn btn-danger btn-sm" onClick={() => cancelar(d)}>✕</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Historial */}
      {tab === 'historial' && (
        <div className="table-container">
          {historial.length === 0 ? <EmptyState icon="ScrollText" title="Sin historial" /> : (
            <table>
              <thead><tr><th>Cliente</th><th>Dirección</th><th>Items</th><th>Total</th><th>Estado</th><th>Hora</th></tr></thead>
              <tbody>
                {[...historial].reverse().map((d) => (
                  <tr key={d.id}>
                    <td><strong>{d.cliente}</strong><div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{d.telefono}</div></td>
                    <td style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{d.direccion}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{d.items?.length} items</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatCurrency(d.total)}</td>
                    <td><Badge estado={d.estado} /></td>
                    <td style={{ fontSize: 12, color: 'var(--text-muted)' }}>{d.creadoEn ? new Date(d.creadoEn).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' }) : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal nuevo pedido */}
      <Modal open={modal} onClose={() => setModal(false)} title="Nuevo Pedido de Delivery" wide>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
          {/* Datos del cliente */}
          <div>
            <div style={{ fontWeight: 600, marginBottom: 12, fontSize: 14 }}>Datos del cliente</div>
            <div className="modal-body" style={{ gap: 10 }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre *</label>
                  <input value={form.cliente} onChange={(e) => set('cliente', e.target.value)} id="del-cliente" />
                </div>
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input value={form.telefono} onChange={(e) => set('telefono', e.target.value)} id="del-tel" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Dirección *</label>
                <input value={form.direccion} onChange={(e) => set('direccion', e.target.value)} id="del-dir" />
              </div>
              <div className="form-group">
                <label className="form-label">Repartidor</label>
                <input value={form.repartidor} onChange={(e) => set('repartidor', e.target.value)} id="del-repartidor" />
              </div>
              {/* Menú */}
              <div style={{ fontWeight: 600, marginTop: 8, marginBottom: 8, fontSize: 14 }}>Agregar items</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                <button className={`filter-chip${!catFilter ? ' active' : ''}`} onClick={() => setCatFilter(null)}>Todos</button>
                {categorias.map((c) => (
                  <button key={c.id} className={`filter-chip${catFilter === c.id ? ' active' : ''}`} onClick={() => setCatFilter(c.id)}>{c.icono} {c.nombre}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                {menuItems.filter((i) => i.disponible && (!catFilter || i.categoriaId === catFilter)).map((item) => (
                  <div key={item.id} className="menu-item-card" onClick={() => addItem(item)} style={{ padding: '10px' }}>
                    <div className="menu-item-nombre">{item.nombre}</div>
                    <div className="menu-item-precio">{formatCurrency(item.precio)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Resumen */}
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius)', padding: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Resumen del pedido</div>
            {orderItems.length === 0 ? (
              <div style={{ fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Sin items</div>
            ) : orderItems.map((item) => (
              <div key={item.itemId} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5 }}>
                <button className="qty-btn" onClick={() => updateQty(item.itemId, -1)}>−</button>
                <span style={{ fontWeight: 700 }}>{item.cantidad}</span>
                <button className="qty-btn" onClick={() => updateQty(item.itemId, 1)}>+</button>
                <span style={{ flex: 1 }}>{item.nombre}</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{formatCurrency(item.precio * item.cantidad)}</span>
              </div>
            ))}
            {orderItems.length > 0 && (
              <div style={{ borderTop: '1px solid var(--border)', marginTop: 8, paddingTop: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 4 }}>
                  <span>Subtotal</span><span>{formatCurrency(total)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, color: 'var(--text-muted)' }}>
                  <span>Envío</span><span>{formatCurrency(activeTenant?.costoDelivery ?? 0)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: 16, color: 'var(--accent)', marginTop: 8, fontFamily: 'Outfit' }}>
                  <span>Total</span><span>{formatCurrency(totalConEnvio)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={crearPedido} id="del-crear"><Bike size={16} /> Crear Pedido</button>
        </div>
      </Modal>
    </div>
  );
}
