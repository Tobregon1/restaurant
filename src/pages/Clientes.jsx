import React, { useState } from 'react';
import { Users, Mail, Phone, MapPin, Pencil, Trash2, Search, CheckCircle2 } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../contexts/ToastContext';
import { Modal, EmptyState } from '../components/shared/UI';

const defaultCliente = {
  nombre: '',
  telefono: '',
  email: '',
  direccion: '',
  dniCuit: '',
  condicionIva: 'Consumidor Final',
  notas: ''
};

export default function Clientes() {
  const { tenantData, crearCliente, actualizarCliente, eliminarCliente } = useTenant();
  const { toast } = useToast();
  const { clientes = [] } = tenantData;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultCliente);
  const [search, setSearch] = useState('');

  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(search.toLowerCase()) || 
    (c.telefono && c.telefono.includes(search)) ||
    (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreate = () => {
    setForm({ ...defaultCliente });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (c) => {
    setForm({ ...c });
    setEditingId(c.id);
    setModalOpen(true);
  };

  const saveCliente = async () => {
    if (!form.nombre.trim()) return toast('El nombre es requerido', 'error');

    if (editingId) {
      await actualizarCliente(editingId, form);
      toast('Cliente actualizado', 'success');
    } else {
      await crearCliente(form);
      toast('Cliente registrado', 'success');
    }
    setModalOpen(false);
  };

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <div className="page-subtitle">Base de datos de tus clientes ({clientes.length} registrados)</div>
        </div>
        <div className="page-actions">
          <div className="search-bar" style={{ width: 260 }}>
            <span style={{ marginLeft: 8 }}><Search size={16} /></span>
            <input placeholder="Buscar por nombre, teléfono o email..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Nuevo Cliente</button>
        </div>
      </div>

      {clientes.length === 0 ? (
        <EmptyState 
          icon="Users" 
          title="Sin clientes registrados" 
          subtitle="Comienza a armar tu base de datos para ofrecer una atención más personalizada." 
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto & Facturación</th>
                <th>Dirección</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {c.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div style={{ fontWeight: 500 }}>{c.nombre}</div>
                    </div>
                  </td>
                  <td>
                    {c.telefono && <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12}/> {c.telefono}</div>}
                    {c.email && <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12}/> {c.email}</div>}
                    {c.dniCuit && <div style={{ fontSize: 12, marginTop: 4, fontWeight: 500, color: 'var(--text-color)' }}>CUIT/DNI: {c.dniCuit}</div>}
                    {c.condicionIva && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.condicionIva}</div>}
                  </td>
                  <td>
                    {c.direccion ? <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} color="var(--text-muted)"/> {c.direccion}</div> : <span style={{ color: 'var(--border)' }}>-</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(c)}><Pencil size={16} /></button>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={async () => { await eliminarCliente(c.id); toast('Cliente eliminado', 'info'); }}><Trash2 size={16} color="var(--danger-color)"/></button>
                  </td>
                </tr>
              ))}
              {filteredClientes.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                    No se encontraron resultados para tu búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Cliente' : 'Nuevo Cliente'} wide>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre del Cliente *</label>
              <input value={form.nombre} onChange={(e) => setF('nombre', e.target.value)} placeholder="Ej. Ana Rodríguez" />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input value={form.telefono} onChange={(e) => setF('telefono', e.target.value)} placeholder="11 2345 6789" />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={form.email} onChange={(e) => setF('email', e.target.value)} placeholder="ana@ejemplo.com" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">DNI o CUIT</label>
              <input value={form.dniCuit} onChange={(e) => setF('dniCuit', e.target.value)} placeholder="Ej. 20304050607" />
            </div>
            <div className="form-group">
              <label className="form-label">Condición frente al IVA</label>
              <select value={form.condicionIva} onChange={(e) => setF('condicionIva', e.target.value)}>
                <option value="Consumidor Final">Consumidor Final</option>
                <option value="Responsable Inscripto">Responsable Inscripto</option>
                <option value="Monotributo">Monotributo</option>
                <option value="Exento">Exento</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Dirección (Para Delivery)</label>
            <input value={form.direccion} onChange={(e) => setF('direccion', e.target.value)} placeholder="Av. Siempre Viva 123" />
          </div>

          <div className="form-group">
            <label className="form-label">Notas Adicionales</label>
            <input value={form.notas} onChange={(e) => setF('notas', e.target.value)} placeholder="Preferencias, alergias, cliente VIP..." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={saveCliente}>
            {editingId ? '💾 Guardar' : <><CheckCircle2 size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> Crear Cliente</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}
