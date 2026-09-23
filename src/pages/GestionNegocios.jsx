import { Building, Trash2, Utensils, Beer, GlassWater, Coffee, Pizza, Beef, Fish, IceCream, Pencil, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../contexts/ToastContext';
import { Modal } from '../components/shared/UI';
import { TIPOS_NEGOCIO } from '../data/mockData';

const NEGOCIO_ICONS = { Restaurante: <Utensils size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/>, Bar: <Beer size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/>, Restobar: <GlassWater size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/>, Cafetería: <Coffee size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/>, Pizzería: <Pizza size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/>, Parrilla: <Beef size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/>, Sushi: <Fish size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/>, Heladería: <IceCream size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> };
const ACCENT_COLORS = ['#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#f97316', '#ec4899', '#14b8a6'];

const defaultForm = { nombre: '', tipo: 'Restaurante', color: '#f59e0b', direccion: '', telefono: '', email: '', horarios: '', costoDelivery: 500, iva: 21, activo: true };

export default function GestionNegocios() {
  const { negocios, activeTenant, selectTenant, crearNegocio, actualizarNegocio, eliminarNegocio } = useTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [search, setSearch] = useState('');

  const filtered = negocios.filter((n) =>
    n.nombre.toLowerCase().includes(search.toLowerCase()) ||
    n.tipo.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setForm(defaultForm); setEditingId(null); setModalOpen(true); };
  const openEdit = (n, e) => { e.stopPropagation(); setForm({ ...n }); setEditingId(n.id); setModalOpen(true); };
  const handleSelect = (n) => {
    selectTenant(n);
    navigate('/dashboard');
    toast(`Negocio seleccionado: ${n.nombre}`, 'success');
  };

  const handleSave = async () => {
    if (!form.nombre.trim()) return toast('El nombre es requerido', 'error');
    if (editingId) {
      await actualizarNegocio(editingId, form);
      toast('Negocio actualizado ', 'success');
    } else {
      await crearNegocio(form);
      toast('Negocio creado ', 'success');
    }
    setModalOpen(false);
  };

  const handleDelete = async () => {
    await eliminarNegocio(confirmDelete);
    setConfirmDelete(null);
    toast('Negocio eliminado', 'info');
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const stats = (n) => ({
    empleados: JSON.parse(localStorage.getItem('ros_empleados') || '{}')[n.id]?.length ?? 0,
    mesas: JSON.parse(localStorage.getItem('ros_mesas') || '{}')[n.id]?.length ?? 0,
  });

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestión de Negocios</h1>
          <div className="page-subtitle">{negocios.length} negocio{negocios.length !== 1 ? 's' : ''} registrado{negocios.length !== 1 ? 's' : ''}</div>
        </div>
        <div className="page-actions">
          <div className="search-bar" style={{ width: 260 }}>
            <span>🔍</span>
            <input placeholder="Buscar negocio..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate} id="btn-crear-negocio">+ Nuevo Negocio</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Negocios', value: negocios.length, icon: <Building /> },
          { label: 'Activos', value: negocios.filter((n) => n.activo).length, icon: <CheckCircle2 /> },
          { label: 'Restaurantes', value: negocios.filter((n) => n.tipo === 'Restaurante').length, icon: <Utensils /> },
          { label: 'Bares / Restobares', value: negocios.filter((n) => ['Bar', 'Restobar'].includes(n.tipo)).length, icon: <Beer /> },
        ].map((s) => (
          <div className="stat-card" key={s.label}>
            <div className="stat-icon">{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Grid de negocios */}
      {filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon"><Building size={48} /></div>
            <div className="empty-state-title">No hay negocios todavía</div>
            <div className="empty-state-sub">Creá tu primer restaurante, bar o restobar</div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={openCreate}>+ Crear Negocio</button>
          </div>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map((n) => {
            const s = stats(n);
            const isActive = activeTenant?.id === n.id;
            return (
              <div
                key={n.id}
                className="negocio-card"
                style={{ '--card-accent': n.color, cursor: 'pointer' }}
                onClick={() => handleSelect(n)}
              >
                {isActive && (
                  <div style={{ position: 'absolute', top: 10, right: 10 }}>
                    <span className="badge badge-listo" style={{ fontSize: 10 }}>● Activo</span>
                  </div>
                )}
                <div className="negocio-card-icon" style={{ background: `${n.color}22`, fontSize: 28 }}>
                  {NEGOCIO_ICONS[n.tipo] || '🏠'}
                </div>
                <div className="negocio-card-nombre">{n.nombre}</div>
                <div className="negocio-card-tipo">{n.tipo} · {n.activo ? '🟢 Activo' : '🔴 Inactivo'}</div>
                {n.direccion && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>📍 {n.direccion}</div>}
                <div className="negocio-card-stats">
                  <div className="negocio-stat"><strong>{s.mesas}</strong>mesas</div>
                  <div className="negocio-stat"><strong>{s.empleados}</strong>empleados</div>
                  {n.horarios && <div className="negocio-stat"><strong style={{ fontSize: 11 }}>{n.horarios}</strong></div>}
                </div>
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary btn-sm" style={{ flex: 1, background: n.color, borderColor: n.color }}
                    onClick={(e) => { e.stopPropagation(); handleSelect(n); }}>
                    Abrir Panel
                  </button>
                  <button className="btn btn-secondary btn-sm btn-icon" onClick={(e) => openEdit(n, e)} title="Editar"><Pencil size={16} /></button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={(e) => { e.stopPropagation(); setConfirmDelete(n.id); }} title="Eliminar"><Trash2 size={16} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal crear/editar */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Negocio' : 'Nuevo Negocio'} wide>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre del negocio *</label>
              <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="La Parrilla del Río" id="neg-nombre" />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo de negocio</label>
              <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)} id="neg-tipo">
                {TIPOS_NEGOCIO.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Color de acento</label>
            <div className="color-swatches">
              {ACCENT_COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-swatch${form.color === c ? ' selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => set('color', c)}
                />
              ))}
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Dirección</label>
              <input value={form.direccion} onChange={(e) => set('direccion', e.target.value)} placeholder="Av. Corrientes 1234" id="neg-direccion" />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input value={form.telefono} onChange={(e) => set('telefono', e.target.value)} placeholder="+54 11 1234-5678" id="neg-telefono" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="info@negocio.com" id="neg-email" />
            </div>
            <div className="form-group">
              <label className="form-label">Horarios</label>
              <input value={form.horarios} onChange={(e) => set('horarios', e.target.value)} placeholder="Lun-Dom: 12:00 - 00:00" id="neg-horarios" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Costo Delivery ($)</label>
              <input type="number" value={form.costoDelivery} onChange={(e) => set('costoDelivery', +e.target.value)} id="neg-delivery" />
            </div>
            <div className="form-group">
              <label className="form-label">IVA (%)</label>
              <input type="number" value={form.iva} onChange={(e) => set('iva', +e.target.value)} id="neg-iva" />
            </div>
          </div>
          <div className="toggle-row">
            <span className="toggle-label">Negocio Activo</span>
            <label className="toggle">
              <input type="checkbox" checked={form.activo} onChange={(e) => set('activo', e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={handleSave} id="neg-guardar">
            {editingId ? '💾 Guardar cambios' : <><CheckCircle2 size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> Crear Negocio</>}
          </button>
        </div>
      </Modal>

      {/* Confirm delete */}
      <Modal open={!!confirmDelete} onClose={() => setConfirmDelete(null)} title="Confirmar Eliminación">
        <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
          ¿Estás seguro que querés eliminar este negocio? Esta acción no se puede deshacer.
        </p>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
          <button className="btn btn-danger" onClick={handleDelete}><Trash2 size={16} /> Eliminar</button>
        </div>
      </Modal>
    </div>
  );
}
