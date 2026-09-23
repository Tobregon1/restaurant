import { Utensils, CookingPot, ScrollText, CheckCircle2, XCircle, Clock, ChefHat, Check } from 'lucide-react';
import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../contexts/ToastContext';
import { ESTADOS_PEDIDO } from '../data/mockData';

const formatCurrency = (n) => `$${n?.toLocaleString('es-AR') ?? 0}`;

export default function Pedidos() {
  const { tenantData, crearPedido, actualizarPedido, actualizarMesa } = useTenant();
  const { toast } = useToast();
  const { mesas, menuItems, categorias, pedidos } = tenantData;

  const [selectedMesa, setSelectedMesa] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [catFilter, setCatFilter] = useState(null);
  const [tab, setTab] = useState('nueva');

  const mesasOcupadas = mesas.filter((m) => ['ocupada', 'libre'].includes(m.estado));
  const filteredItems = catFilter ? menuItems.filter((i) => i.categoriaId === catFilter) : menuItems;
  const activePedidos = pedidos.filter((p) => [ESTADOS_PEDIDO.PENDIENTE, ESTADOS_PEDIDO.EN_COCINA, ESTADOS_PEDIDO.LISTO].includes(p.estado));

  const addItem = (item) => {
    setOrderItems((prev) => {
      const existing = prev.find((i) => i.itemId === item.id);
      if (existing) return prev.map((i) => i.itemId === item.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      return [...prev, { itemId: item.id, nombre: item.nombre, precio: item.precio, cantidad: 1, notas: '' }];
    });
  };

  const updateQty = (itemId, delta) => {
    setOrderItems((prev) => {
      const updated = prev.map((i) => i.itemId === itemId ? { ...i, cantidad: Math.max(0, i.cantidad + delta) } : i);
      return updated.filter((i) => i.cantidad > 0);
    });
  };

  const total = orderItems.reduce((s, i) => s + i.precio * i.cantidad, 0);

  const enviarPedido = async () => {
    if (!selectedMesa) return toast('Seleccioná una mesa', 'error');
    if (orderItems.length === 0) return toast('Agregá items al pedido', 'error');
    const pedido = {
      mesaId: selectedMesa.id,
      mesaNumero: selectedMesa.numero,
      estado: ESTADOS_PEDIDO.PENDIENTE,
      items: orderItems,
      mozo: 'Sistema',
      creadoEn: new Date().toISOString(),
      total,
    };
    await crearPedido(pedido);
    await actualizarMesa(selectedMesa.id, { estado: 'ocupada' });
    toast(`Pedido enviado a cocina `, 'success');
    setOrderItems([]);
    setSelectedMesa(null);
    setTab('activos');
  };

  const cambiarEstado = async (pedido, nuevoEstado) => {
    await actualizarPedido(pedido.id, { estado: nuevoEstado });
    toast(`Pedido mesa ${pedido.mesaNumero} → ${nuevoEstado}`, 'info');
  };

  const ESTADO_LABELS = { pendiente: <><Clock size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> Pendiente</>, en_cocina: <><ChefHat size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> En Cocina</>, listo: <><Check size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> ¡Listo!</>, entregado: <><CheckCircle2 size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> Entregado</>, cancelado: <><XCircle size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> Cancelado</> };

  return (
    <div className="page-content" style={{ paddingBottom: 0 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pedidos</h1>
          <div className="page-subtitle">Tomá pedidos por mesa y seguí el estado</div>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          <button className={`btn ${tab === 'nueva' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('nueva')}>📋 Nuevo Pedido</button>
          <button className={`btn ${tab === 'activos' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('activos')}>
            🔥 Activos
            {activePedidos.length > 0 && <span className="nav-badge" style={{ marginLeft: 6 }}>{activePedidos.length}</span>}
          </button>
          <button className={`btn ${tab === 'historial' ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab('historial')}>📜 Historial</button>
        </div>
      </div>

      {/* NUEVA ORDEN */}
      {tab === 'nueva' && (
        <>
          {/* Mesa selector */}
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ marginBottom: 10, fontWeight: 600, fontSize: 14 }}>Seleccioná la mesa</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {mesasOcupadas.map((m) => (
                <button
                  key={m.id}
                  className={`btn ${selectedMesa?.id === m.id ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSelectedMesa(m)}
                >
                  Mesa {m.numero} <span style={{ fontSize: 11, opacity: 0.7 }}>({m.capacidad}p)</span>
                </button>
              ))}
              {mesasOcupadas.length === 0 && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>No hay mesas disponibles</span>}
            </div>
          </div>

          <div className="pedido-layout">
            {/* Menú panel */}
            <div className="menu-panel">
              <div className="menu-panel-header">
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Menú</div>
              </div>
              <div className="menu-cats">
                <button className={`filter-chip${!catFilter ? ' active' : ''}`} onClick={() => setCatFilter(null)}>Todos</button>
                {categorias.map((c) => (
                  <button key={c.id} className={`filter-chip${catFilter === c.id ? ' active' : ''}`} onClick={() => setCatFilter(c.id)}>
                    {c.icono} {c.nombre}
                  </button>
                ))}
              </div>
              <div className="menu-items-grid">
                {filteredItems.filter((i) => i.disponible).map((item) => (
                  <div key={item.id} className="menu-item-card" onClick={() => addItem(item)}>
                    <div className="menu-item-nombre">{item.nombre}</div>
                    <div className="menu-item-precio">{formatCurrency(item.precio)}</div>
                    {item.tiempo && <div className="menu-item-tiempo">⏱ {item.tiempo} min</div>}
                  </div>
                ))}
                {filteredItems.filter((i) => i.disponible).length === 0 && (
                  <div style={{ color: 'var(--text-muted)', gridColumn: '1/-1', textAlign: 'center', padding: 30 }}>Sin items disponibles</div>
                )}
              </div>
            </div>

            {/* Order panel */}
            <div className="order-panel">
              <div className="order-panel-header">
                <div style={{ fontWeight: 700, fontSize: 15 }}>
                  {selectedMesa ? `Mesa ${selectedMesa.numero}` : 'Sin mesa seleccionada'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{orderItems.length} items</div>
              </div>
              <div className="order-items">
                {orderItems.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)', fontSize: 13 }}>
                    Hacé click en los platos del menú para agregarlos
                  </div>
                ) : orderItems.map((item) => (
                  <div key={item.itemId} className="order-item">
                    <div className="order-item-qty">
                      <button className="qty-btn" onClick={() => updateQty(item.itemId, -1)}>−</button>
                      <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{item.cantidad}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.itemId, 1)}>+</button>
                    </div>
                    <div className="order-item-info">
                      <div className="order-item-nombre">{item.nombre}</div>
                      <div className="order-item-precio">{formatCurrency(item.precio * item.cantidad)}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="order-footer">
                <div className="order-total">
                  <div className="order-total-label">Total</div>
                  <div className="order-total-value">{formatCurrency(total)}</div>
                </div>
                <button className="btn btn-primary w-full" onClick={enviarPedido} disabled={orderItems.length === 0 || !selectedMesa} id="btn-enviar-pedido"><CookingPot size={16} /> Enviar a Cocina
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ACTIVOS */}
      {tab === 'activos' && (
        <div className="kds-grid">
          {activePedidos.length === 0 ? (
            <div style={{ gridColumn: '1/-1' }}>
              <div className="empty-state"><div className="empty-state-icon"><Utensils size={48} /></div><div className="empty-state-title">Sin pedidos activos</div></div>
            </div>
          ) : activePedidos.map((p) => (
            <div key={p.id} className="kds-card">
              <div className="kds-card-header">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15 }}>Mesa {p.mesaNumero}</div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{p.mozo}</div>
                </div>
                <span className={`badge badge-${p.estado}`}>{ESTADO_LABELS[p.estado]}</span>
              </div>
              <div className="kds-card-body">
                {p.items.map((item, i) => (
                  <div key={i} className="kds-item">
                    <div className="kds-qty">{item.cantidad}</div>
                    <span style={{ flex: 1 }}>{item.nombre}</span>
                    <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{formatCurrency(item.precio * item.cantidad)}</span>
                  </div>
                ))}
                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <span style={{ fontWeight: 700, color: 'var(--accent)' }}>Total: {formatCurrency(p.total)}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                  {p.estado === ESTADOS_PEDIDO.PENDIENTE && (
                    <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => cambiarEstado(p, ESTADOS_PEDIDO.EN_COCINA)}>→ Cocina</button>
                  )}
                  {p.estado === ESTADOS_PEDIDO.EN_COCINA && (
                    <button className="btn btn-success btn-sm" style={{ flex: 1 }} onClick={() => cambiarEstado(p, ESTADOS_PEDIDO.LISTO)}>✓ Listo</button>
                  )}
                  {p.estado === ESTADOS_PEDIDO.LISTO && (
                    <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => cambiarEstado(p, ESTADOS_PEDIDO.ENTREGADO)}>✓ Entregado</button>
                  )}
                  <button className="btn btn-danger btn-sm" onClick={() => cambiarEstado(p, ESTADOS_PEDIDO.CANCELADO)}>✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* HISTORIAL */}
      {tab === 'historial' && (
        <div className="table-container">
          {pedidos.length === 0 ? <div style={{ padding: 40 }}><div className="empty-state"><div className="empty-state-icon"><ScrollText size={48} /></div><div className="empty-state-title">Sin historial</div></div></div> : (
            <table>
              <thead><tr><th>Mesa</th><th>Items</th><th>Estado</th><th>Mozo</th><th>Total</th><th>Hora</th></tr></thead>
              <tbody>
                {[...pedidos].reverse().map((p) => (
                  <tr key={p.id}>
                    <td><strong>Mesa {p.mesaNumero}</strong></td>
                    <td style={{ color: 'var(--text-muted)' }}>{p.items.length} items</td>
                    <td><span className={`badge badge-${p.estado}`}>{ESTADO_LABELS[p.estado]}</span></td>
                    <td>{p.mozo}</td>
                    <td style={{ color: 'var(--accent)', fontWeight: 700 }}>{formatCurrency(p.total)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{new Date(p.creadoEn).toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
