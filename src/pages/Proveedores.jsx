import React, { useState } from 'react';
import { Truck, Mail, Phone, Pencil, Trash2, Search, CheckCircle2, Factory } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../contexts/ToastContext';
import { Modal, EmptyState } from '../components/shared/UI';

const defaultProveedor = {
  nombre: '',
  contacto: '',
  telefono: '',
  email: '',
  categoria: '',
  notas: ''
};

export default function Proveedores() {
  const { tenantData, crearProveedor, actualizarProveedor, eliminarProveedor } = useTenant();
  const { toast } = useToast();
  const { proveedores = [] } = tenantData;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultProveedor);
  const [search, setSearch] = useState('');

  const filteredProveedores = proveedores.filter(p => 
    p.nombre.toLowerCase().includes(search.toLowerCase()) || 
    (p.categoria && p.categoria.toLowerCase().includes(search.toLowerCase()))
  );

  const openCreate = () => {
    setForm({ ...defaultProveedor });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setForm({ ...p });
    setEditingId(p.id);
    setModalOpen(true);
  };

  const saveProveedor = async () => {
    if (!form.nombre.trim()) return toast('El nombre es requerido', 'error');

    if (editingId) {
      await actualizarProveedor(editingId, form);
      toast('Proveedor actualizado', 'success');
    } else {
      await crearProveedor(form);
      toast('Proveedor registrado', 'success');
    }
    setModalOpen(false);
  };

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Proveedores</h1>
          <div className="page-subtitle">Directorio de proveedores y abastecimiento ({proveedores.length} registrados)</div>
        </div>
        <div className="page-actions">
          <div className="search-bar" style={{ width: 260 }}>
            <span style={{ marginLeft: 8 }}><Search size={16} /></span>
            <input placeholder="Buscar proveedor o categoría..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Nuevo Proveedor</button>
        </div>
      </div>

      {proveedores.length === 0 ? (
        <EmptyState 
          icon="Truck" 
          title="Sin proveedores registrados" 
          subtitle="Registra a tus proveedores para centralizar los contactos de compras y abastecimiento." 
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Proveedor</th>
                <th>Contacto</th>
                <th>Categoría</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProveedores.map((p) => (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--accent-dim)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Factory size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 500 }}>{p.nombre}</div>
                        {p.notas && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.notas}</div>}
                      </div>
                    </div>
                  </td>
                  <td>
                    {p.contacto && <div style={{ fontSize: 13, fontWeight: 500 }}>{p.contacto}</div>}
                    {p.telefono && <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Phone size={12}/> {p.telefono}</div>}
                    {p.email && <div style={{ fontSize: 13, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}><Mail size={12}/> {p.email}</div>}
                    {!p.contacto && !p.telefono && !p.email && <span style={{ color: 'var(--border)' }}>-</span>}
                  </td>
                  <td>
                    {p.categoria ? (
                      <span className="badge badge-nuevo" style={{ background: 'var(--border)', color: 'var(--text-color)' }}>
                        {p.categoria}
                      </span>
                    ) : <span style={{ color: 'var(--border)' }}>-</span>}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(p)}><Pencil size={16} /></button>
                    <button className="btn btn-ghost btn-sm btn-icon" onClick={async () => { await eliminarProveedor(p.id); toast('Proveedor eliminado', 'info'); }}><Trash2 size={16} color="var(--danger-color)"/></button>
                  </td>
                </tr>
              ))}
              {filteredProveedores.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: 24, color: 'var(--text-muted)' }}>
                    No se encontraron resultados para tu búsqueda.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Proveedor' : 'Nuevo Proveedor'} wide>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre de la Empresa / Proveedor *</label>
              <input value={form.nombre} onChange={(e) => setF('nombre', e.target.value)} placeholder="Ej. Distribuidora Sur" />
            </div>
            <div className="form-group">
              <label className="form-label">Persona de Contacto</label>
              <input value={form.contacto} onChange={(e) => setF('contacto', e.target.value)} placeholder="Ej. Juan Pérez (Ventas)" />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Teléfono / WhatsApp</label>
              <input value={form.telefono} onChange={(e) => setF('telefono', e.target.value)} placeholder="11 2345 6789" />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" value={form.email} onChange={(e) => setF('email', e.target.value)} placeholder="ventas@distribuidora.com" />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Categoría de Productos</label>
              <input value={form.categoria} onChange={(e) => setF('categoria', e.target.value)} placeholder="Bebidas, Carnes, Descartables..." />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notas Adicionales</label>
            <input value={form.notas} onChange={(e) => setF('notas', e.target.value)} placeholder="Días de entrega, condiciones de pago..." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={saveProveedor}>
            {editingId ? '💾 Guardar' : <><CheckCircle2 size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> Crear Proveedor</>}
          </button>
        </div>
      </Modal>
    </div>
  );
}
