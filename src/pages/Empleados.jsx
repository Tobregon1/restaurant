import { Pencil, User, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../contexts/ToastContext';
import { Modal, EmptyState, Toggle } from '../components/shared/UI';
import { ROLES_EMPLEADO } from '../data/mockData';

const defaultEmp = { nombre: '', rol: 'Mozo', username: '', password: '', telefono: '', activo: true, turno: 'Noche' };
const TURNOS = ['Mañana', 'Tarde', 'Noche', 'Split'];

export default function Empleados() {
  const { tenantData, crearEmpleado, actualizarEmpleado, eliminarEmpleado } = useTenant();
  const { toast } = useToast();
  const { empleados } = tenantData;
  const [modal, setModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultEmp);
  const [filterRol, setFilterRol] = useState('todos');
  const [search, setSearch] = useState('');

  const openCreate = () => { setForm(defaultEmp); setEditingId(null); setModal(true); };
  const openEdit = (e) => { setForm({ ...e }); setEditingId(e.id); setModal(true); };
  const save = async () => {
    if (!form.nombre.trim()) return toast('El nombre es requerido', 'error');
    if (editingId) { await actualizarEmpleado(editingId, form); toast('Empleado actualizado', 'success'); }
    else { await crearEmpleado(form); toast('Empleado agregado', 'success'); }
    setModal(false);
  };
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const filtered = empleados.filter((e) => {
    const matchRol = filterRol === 'todos' || e.rol === filterRol;
    const matchSearch = !search || e.nombre.toLowerCase().includes(search.toLowerCase());
    return matchRol && matchSearch;
  });

  const ROL_ICONS = { Mozo: 'Utensils', Cocinero: 'ChefHat', Cajero: 'BadgeDollarSign', Gerente: 'User', Bartender: 'Beer', Delivery: 'Bike' };
  const TURNO_COLORS = { Mañana: 'var(--accent)', Tarde: 'var(--orange)', Noche: 'var(--purple)', Split: 'var(--blue)' };

  const stats = ROLES_EMPLEADO.map((r) => ({ rol: r, count: empleados.filter((e) => e.rol === r && e.activo).length })).filter((s) => s.count > 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">👥 Empleados</h1>
          <div className="page-subtitle">{empleados.length} empleados · {empleados.filter((e) => e.activo).length} activos</div>
        </div>
        <div className="page-actions">
          <div className="search-bar" style={{ width: 220 }}>
            <span>🔍</span>
            <input placeholder="Buscar empleado..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate} id="btn-nuevo-empleado">+ Empleado</button>
        </div>
      </div>

      {/* Stats por rol */}
      {stats.length > 0 && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          {stats.map((s) => (
            <div key={s.rol} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 20 }}>{ROL_ICONS[s.rol] || [<User size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/>, '']}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15 }}>{s.count}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.rol}{s.count !== 1 ? 's' : ''}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filtros */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <button className={`filter-chip${filterRol === 'todos' ? ' active' : ''}`} onClick={() => setFilterRol('todos')}>Todos</button>
        {ROLES_EMPLEADO.map((r) => (
          <button key={r} className={`filter-chip${filterRol === r ? ' active' : ''}`} onClick={() => setFilterRol(r)}>
            {ROL_ICONS[r]} {r}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="Users" title="Sin empleados" subtitle="Registrá los empleados del negocio" />
      ) : (
        <div className="grid-3">
          {filtered.map((emp) => (
            <div key={emp.id} className="card" style={{ opacity: emp.activo ? 1 : 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--accent-dim)', border: '2px solid var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0 }}>
                    {emp.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{emp.nombre}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{ROL_ICONS[emp.rol]} {emp.rol}</div>
                  </div>
                </div>
                <Toggle checked={emp.activo} onChange={(v) => actualizarEmpleado(emp.id, { activo: v })} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12.5, color: 'var(--text-muted)', marginBottom: 14 }}>
                {emp.username && <div><User size={12} style={{marginRight: 4, verticalAlign: 'middle'}}/> {emp.username}</div>}
                {emp.telefono && <div>📱 {emp.telefono}</div>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: TURNO_COLORS[emp.turno] || 'var(--text-muted)' }}>
                  🕐 Turno {emp.turno}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openEdit(emp)}><Pencil size={16} /></button>
                  <button className="btn btn-danger btn-sm btn-icon" onClick={async () => { await eliminarEmpleado(emp.id); toast('Empleado eliminado', 'info'); }}></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title={editingId ? 'Editar Empleado' : 'Nuevo Empleado'}>
        <div className="modal-body">
          <div className="form-group">
            <label className="form-label">Nombre completo *</label>
            <input value={form.nombre} onChange={(e) => set('nombre', e.target.value)} placeholder="Juan García" id="emp-nombre" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Rol</label>
              <select value={form.rol} onChange={(e) => set('rol', e.target.value)} id="emp-rol">
                {ROLES_EMPLEADO.map((r) => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Turno</label>
              <select value={form.turno} onChange={(e) => set('turno', e.target.value)} id="emp-turno">
                {TURNOS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Usuario</label>
              <input type="text" value={form.username || ''} onChange={(e) => set('username', e.target.value)} id="emp-username" />
            </div>
            <div className="form-group">
              <label className="form-label">Contraseña</label>
              <input type="password" value={form.password || ''} onChange={(e) => set('password', e.target.value)} id="emp-password" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input value={form.telefono || ''} onChange={(e) => set('telefono', e.target.value)} id="emp-tel" />
            </div>
          </div>
          <div className="toggle-row">
            <span className="toggle-label">Empleado Activo</span>
            <label className="toggle">
              <input type="checkbox" checked={form.activo} onChange={(e) => set('activo', e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={save}>{editingId ? '💾 Guardar' : [<CheckCircle2 size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/>, 'Agregar']}</button>
        </div>
      </Modal>
    </div>
  );
}
