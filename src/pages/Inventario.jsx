import { BarChart2, Pencil, CheckCircle2, AlertTriangle } from 'lucide-react';
import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../contexts/ToastContext';
import { Modal, EmptyState } from '../components/shared/UI';

const defaultItem = { nombre: '', cantidad: 0, unidad: 'kg', minimo: 5, categoria: 'Secos', costo: 0 };
const CATEGORIAS_INV = ['Proteínas', 'Verduras', 'Secos', 'Lácteos', 'Bebidas', 'Destilados', 'Frutas', 'Conservas', 'Condimentos'];
const UNIDADES = ['kg', 'lt', 'unid', 'g', 'ml', 'caja', 'bolsa'];

export default function Inventario() {
  const { tenantData, crearInventario, actualizarInventario, eliminarInventario } = useTenant();
  const { toast } = useToast();
  const { inventario } = tenantData;
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultItem);
  const [filterCat, setFilterCat] = useState('todos');
  const [search, setSearch] = useState('');
  const [ajusteModal, setAjusteModal] = useState(null);
  const [ajusteVal, setAjusteVal] = useState('');

  const openCreate = () => { setForm(defaultItem); setEditingId(null); setModal(true); };
  const openEdit = (i) => { setForm({ ...i }); setEditingId(i.id); setModal(true); };
  const save = async () => {
    if (!form.nombre.trim()) return toast('El nombre es requerido', 'error');
    if (editingId) { await actualizarInventario(editingId, form); toast('Ítem actualizado', 'success'); }
    else { await crearInventario(form); toast('Ítem creado', 'success'); }
    setModal(false);
  };
  const ajustar = async () => {
    const delta = +ajusteVal;
    if (isNaN(delta)) return toast('Ingresá un número', 'error');
    const nueva = Math.max(0, ajusteModal.cantidad + delta);
    await actualizarInventario(ajusteModal.id, { cantidad: nueva });
    toast(`Stock ajustado: ${ajusteModal.nombre}`, 'info');
    setAjusteModal(null);
    setAjusteVal('');
  };
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = inventario.filter((i) => {
    const matchCat = filterCat === 'todos' || i.categoria === filterCat;
    const matchSearch = !search || i.nombre.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const bajosDeStock = inventario.filter((i) => i.cantidad <= i.minimo);
  const categorias = [...new Set(inventario.map((i) => i.categoria))];

  const stockColor = (item) => {
    if (item.cantidad === 0) return 'var(--red)';
    if (item.cantidad <= item.minimo) return 'var(--orange)';
    return 'var(--green)';
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">📦 Inventario</h1>
          <div className="page-subtitle">{inventario.length} ítems · {bajosDeStock.length} alerta{bajosDeStock.length !== 1 ? 's' : ''} de stock bajo</div>
        </div>
        <div className="page-actions">
          <div className="search-bar" style={{ width: 240 }}>
            <span>🔍</span>
            <input placeholder="Buscar ingrediente..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate} id="btn-nuevo-inventario">+ Nuevo Ítem</button>
        </div>
      </div>

      {/* Alertas */}
      {bajosDeStock.length > 0 && (
        <div style={{ background: 'var(--red-dim)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 'var(--radius)', padding: '14px 20px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 20 }}><AlertTriangle size={20} /></span>
          <div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Stock bajo en {bajosDeStock.length} ítem{bajosDeStock.length !== 1 ? 's' : ''}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-secondary)' }}>{bajosDeStock.map((i) => i.nombre).join(', ')}</div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <button className={`filter-chip${filterCat === 'todos' ? ' active' : ''}`} onClick={() => setFilterCat('todos')}>Todos</button>
        {categorias.map((c) => (
          <button key={c} className={`filter-chip${filterCat === c ? ' active' : ''}`} onClick={() => setFilterCat(c)}>{c}</button>
        ))}
      </div>

      <div className="table-container">
        {filtered.length === 0 ? <EmptyState icon="Package" title="Sin ítems" subtitle="Agregá los primeros ingredientes al inventario" /> : (
          <table>
            <thead><tr>
              <th>Ingrediente</th><th>Categoría</th><th>Cantidad</th><th>Mínimo</th><th>Costo</th><th>Estado</th><th>Acciones</th>
            </tr></thead>
            <tbody>
              {filtered.map((item) => {
                const pct = Math.min(100, (item.cantidad / (item.minimo * 3)) * 100);
                const color = stockColor(item);
                return (
                  <tr key={item.id}>
                    <td><strong>{item.nombre}</strong></td>
                    <td style={{ color: 'var(--text-muted)' }}>{item.categoria}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ fontWeight: 700, color, minWidth: 50 }}>{item.cantidad} {item.unidad}</span>
                        <div style={{ width: 80, height: 4, background: 'var(--bg-hover)', borderRadius: 2, overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 2, transition: 'width 0.3s' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{item.minimo} {item.unidad}</td>
                    <td style={{ color: 'var(--text-muted)' }}>${item.costo?.toLocaleString('es-AR')}</td>
                    <td>
                      {item.cantidad === 0 ? <span className="badge badge-danger">Sin stock</span>
                        : item.cantidad <= item.minimo ? <span className="badge badge-warning">Stock bajo</span>
                        : <span className="badge badge-listo">OK</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-secondary btn-sm" onClick={() => { setAjusteModal(item); setAjusteVal(''); }} title="Ajustar stock"><BarChart2 size={16} /></button>
                        <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(item)}><Pencil size={16} /></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={async () => { await eliminarInventario(item.id); toast('Ítem eliminado', 'info'); }}></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal crear/editar */}
      <Modal open={modal} onClose={() => setModal(false)} title={editingId ? 'Editar Ítem' : 'Nuevo Ítem de Inventario'}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Nombre *</label>
            <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Carne vacuna" id="inv-nombre" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Categoría</label>
              <select value={form.categoria} onChange={(e) => set('categoria', e.target.value)} id="inv-cat">
                {CATEGORIAS_INV.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Unidad</label>
              <select value={form.unidad} onChange={(e) => set('unidad', e.target.value)} id="inv-unidad">
                {UNIDADES.map((u) => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Cantidad actual</label>
              <input type="number" value={form.cantidad} onChange={(e) => set('cantidad', +e.target.value)} id="inv-cantidad" />
            </div>
            <div className="form-group">
              <label className="form-label">Stock mínimo</label>
              <input type="number" value={form.minimo} onChange={(e) => set('minimo', +e.target.value)} id="inv-minimo" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Costo por unidad ($)</label>
            <input type="number" value={form.costo} onChange={(e) => set('costo', +e.target.value)} id="inv-costo" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>{editingId ? '💾 Guardar' : <><CheckCircle2 size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> Crear</>}</button>
        </div>
      </Modal>

      {/* Modal ajuste de stock */}
      <Modal open={!!ajusteModal} onClose={() => setAjusteModal(null)} title="Ajustar Stock">
        {ajusteModal && (
          <div className="modal-body">
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: 14, marginBottom: 8 }}>
              <div style={{ fontWeight: 700, marginBottom: 2 }}>{ajusteModal.nombre}</div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>Stock actual: <strong style={{ color: stockColor(ajusteModal) }}>{ajusteModal.cantidad} {ajusteModal.unidad}</strong></div>
            </div>
            <div className="form-group">
              <label className="form-label">Ajuste (positivo = entrada, negativo = salida)</label>
              <input type="number" value={ajusteVal} onChange={(e) => setAjusteVal(e.target.value)} placeholder="+10 o -5" id="inv-ajuste" />
            </div>
            {ajusteVal && (
              <div style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                Nuevo stock: <strong style={{ color: 'var(--accent)' }}>{Math.max(0, ajusteModal.cantidad + +ajusteVal)} {ajusteModal.unidad}</strong>
              </div>
            )}
          </div>
        )}
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setAjusteModal(null)}>Cancelar</button>
          <button className="btn btn-primary" onClick={ajustar} id="inv-ajuste-guardar"><BarChart2 size={16} /> Aplicar Ajuste</button>
        </div>
      </Modal>
    </div>
  );
}
