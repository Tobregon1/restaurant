import React, { useState } from 'react';
import { Calendar, Clock, Users, CheckCircle2, XCircle, Pencil, Trash2 } from 'lucide-react';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../contexts/ToastContext';
import { Modal, EmptyState } from '../components/shared/UI';

const defaultReserva = {
  clienteNombre: '',
  clienteTelefono: '',
  fechaHora: '',
  personas: 2,
  mesaId: '',
  estado: 'pendiente',
  notas: ''
};

export default function Reservas() {
  const { tenantData, crearReserva, actualizarReserva, eliminarReserva } = useTenant();
  const { toast } = useToast();
  const { reservas = [], mesas = [] } = tenantData;
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultReserva);

  // Ordenamos por fecha
  const reservasOrdenadas = [...reservas].sort((a, b) => new Date(a.fechaHora) - new Date(b.fechaHora));

  const openCreate = () => {
    // Sugerir la hora actual + 1 hora redondeada a 30 mins
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(d.getMinutes() >= 30 ? 60 : 30);
    d.setSeconds(0, 0);
    const offset = d.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(d - offset)).toISOString().slice(0, 16);

    setForm({ ...defaultReserva, fechaHora: localISOTime });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (r) => {
    // Formatear para el input datetime-local (YYYY-MM-DDThh:mm)
    const dt = new Date(r.fechaHora);
    const offset = dt.getTimezoneOffset() * 60000;
    const localISOTime = (new Date(dt - offset)).toISOString().slice(0, 16);
    
    setForm({ ...r, fechaHora: localISOTime, mesaId: r.mesaId || '' });
    setEditingId(r.id);
    setModalOpen(true);
  };

  const saveReserva = async () => {
    if (!form.clienteNombre.trim() || !form.fechaHora) return toast('Nombre y fecha son requeridos', 'error');
    
    const dataToSend = { ...form, fechaHora: new Date(form.fechaHora).toISOString() };

    if (editingId) {
      await actualizarReserva(editingId, dataToSend);
      toast('Reserva actualizada', 'success');
    } else {
      await crearReserva(dataToSend);
      toast('Reserva registrada', 'success');
    }
    setModalOpen(false);
  };

  const cambiarEstado = async (reserva, nuevoEstado) => {
    await actualizarReserva(reserva.id, { estado: nuevoEstado });
    toast(`Estado cambiado a ${nuevoEstado}`, 'info');
  };

  const formatearFecha = (isoString) => {
    const d = new Date(isoString);
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'short', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(d);
  };

  const renderBadge = (estado) => {
    switch (estado) {
      case 'confirmada': return <span className="badge badge-listo">Confirmada</span>;
      case 'completada': return <span className="badge badge-entregado">Completada</span>;
      case 'cancelada': return <span className="badge badge-cancelado">Cancelada</span>;
      default: return <span className="badge badge-nuevo">Pendiente</span>;
    }
  };

  const setF = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reservas</h1>
          <div className="page-subtitle">Gestión de mesas y agendas</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={openCreate}>+ Nueva Reserva</button>
        </div>
      </div>

      {reservas.length === 0 ? (
        <EmptyState 
          icon="Calendar" 
          title="Sin reservas" 
          subtitle="No hay reservas registradas en el sistema. Agendá la primera para empezar." 
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Fecha y Hora</th>
                <th>Cliente</th>
                <th>Personas</th>
                <th>Mesa</th>
                <th>Estado</th>
                <th style={{ textAlign: 'right' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {reservasOrdenadas.map((r) => {
                const mesaAsignada = mesas.find(m => m.id === r.mesaId);
                return (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
                        <Calendar size={14} color="var(--accent)" />
                        {formatearFecha(r.fechaHora)}
                      </div>
                    </td>
                    <td>
                      <div><strong>{r.clienteNombre}</strong></div>
                      {r.clienteTelefono && <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>📞 {r.clienteTelefono}</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Users size={14} /> {r.personas}
                      </div>
                    </td>
                    <td>
                      {mesaAsignada ? `Mesa ${mesaAsignada.numero}` : <span style={{ color: 'var(--text-muted)' }}>Sin asignar</span>}
                    </td>
                    <td>{renderBadge(r.estado)}</td>
                    <td style={{ textAlign: 'right' }}>
                      {r.estado === 'pendiente' && (
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => cambiarEstado(r, 'confirmada')} title="Confirmar"><CheckCircle2 size={16} color="var(--success-color)" /></button>
                      )}
                      {['pendiente', 'confirmada'].includes(r.estado) && (
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={() => cambiarEstado(r, 'cancelada')} title="Cancelar"><XCircle size={16} color="var(--danger-color)" /></button>
                      )}
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => openEdit(r)}><Pencil size={16} /></button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={async () => { await eliminarReserva(r.id); toast('Reserva eliminada', 'info'); }}><Trash2 size={16} color="var(--danger-color)"/></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingId ? 'Editar Reserva' : 'Nueva Reserva'} wide>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre del Cliente *</label>
              <input value={form.clienteNombre} onChange={(e) => setF('clienteNombre', e.target.value)} placeholder="Juan Pérez" />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input value={form.clienteTelefono} onChange={(e) => setF('clienteTelefono', e.target.value)} placeholder="11 2345 6789" />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha y Hora *</label>
              <input type="datetime-local" value={form.fechaHora} onChange={(e) => setF('fechaHora', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Cantidad de Personas</label>
              <input type="number" min="1" value={form.personas} onChange={(e) => setF('personas', +e.target.value)} />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Asignar Mesa (Opcional)</label>
              <select value={form.mesaId} onChange={(e) => setF('mesaId', e.target.value)}>
                <option value="">Sin asignar</option>
                {mesas.map(m => (
                  <option key={m.id} value={m.id}>Mesa {m.numero} (Capacidad: {m.capacidad})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select value={form.estado} onChange={(e) => setF('estado', e.target.value)}>
                <option value="pendiente">Pendiente</option>
                <option value="confirmada">Confirmada</option>
                <option value="completada">Completada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notas Adicionales</label>
            <input value={form.notas} onChange={(e) => setF('notas', e.target.value)} placeholder="Alergias, pedidos especiales..." />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={saveReserva}>{editingId ? '💾 Guardar' : 'Agendar Reserva'}</button>
        </div>
      </Modal>
    </div>
  );
}
