import { Calendar, Armchair, Users, Pencil, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../contexts/ToastContext';
import { Modal, Badge, EmptyState } from '../components/shared/UI';
import { ESTADOS_MESA } from '../data/mockData';

const ZONAS = ['Salón', 'Terraza', 'Barra', 'VIP', 'Exterior', 'Salón VIP', 'Planta Alta', 'Planta Baja', 'Interior'];

const defaultMesa = { numero: '', capacidad: 4, estado: ESTADOS_MESA.LIBRE, zona: 'Salón' };
const defaultReserva = { nombre: '', telefono: '', fecha: new Date().toISOString().split('T')[0], hora: '20:00', personas: 2, mesa: null, notas: '' };

const ESTADO_COLORS = {
  libre: 'var(--green)', ocupada: 'var(--red)', reservada: 'var(--blue)', sucia: 'var(--orange)',
};

export default function Mesas() {
  const { tenantData, crearMesa, actualizarMesa, eliminarMesa, crearReserva, actualizarReserva, eliminarReserva } = useTenant();
  const { toast } = useToast();
  const { mesas, reservas } = tenantData;
  const [tab, setTab] = useState('plano');
  const [mesaModal, setMesaModal] = useState(false);
  const [editingMesa, setEditingMesa] = useState(null);
  const [mesaForm, setMesaForm] = useState(defaultMesa);
  const [reservaModal, setReservaModal] = useState(false);
  const [editingReserva, setEditingReserva] = useState(null);
  const [reservaForm, setReservaForm] = useState(defaultReserva);
  const [filterEstado, setFilterEstado] = useState('todos');
  const [contextMesa, setContextMesa] = useState(null);

  const openMesaCreate = () => { setMesaForm(defaultMesa); setEditingMesa(null); setMesaModal(true); };
  const openMesaEdit = (m) => { setMesaForm({ ...m }); setEditingMesa(m.id); setMesaModal(true); setContextMesa(null); };
  const saveMesa = async () => {
    if (!mesaForm.numero) return toast('El número de mesa es requerido', 'error');
    if (editingMesa) { await actualizarMesa(editingMesa, mesaForm); toast('Mesa actualizada', 'success'); }
    else { await crearMesa(mesaForm); toast('Mesa creada', 'success'); }
    setMesaModal(false);
  };
  const cambiarEstado = async (mesa, estado) => {
    await actualizarMesa(mesa.id, { estado });
    toast(`Mesa ${mesa.numero} → ${estado}`, 'info');
    setContextMesa(null);
  };

  const openReservaCreate = () => { setReservaForm(defaultReserva); setEditingReserva(null); setReservaModal(true); };
  const openReservaEdit = (r) => { setReservaForm({ ...r }); setEditingReserva(r.id); setReservaModal(true); };
  const saveReserva = async () => {
    if (!reservaForm.nombre.trim()) return toast('El nombre es requerido', 'error');
    if (editingReserva) { await actualizarReserva(editingReserva, reservaForm); toast('Reserva actualizada', 'success'); }
    else { await crearReserva(reservaForm); toast('Reserva creada ', 'success'); }
    setReservaModal(false);
  };

  const setM = (k, v) => setMesaForm((p) => ({ ...p, [k]: v }));
  const setR = (k, v) => setReservaForm((p) => ({ ...p, [k]: v }));

  const filteredMesas = filterEstado === 'todos' ? mesas : mesas.filter((m) => m.estado === filterEstado);

  const statsMesas = Object.entries(ESTADOS_MESA).map(([, v]) => ({
    estado: v,
    count: mesas.filter((m) => m.estado === v).length,
  }));

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Mesas & Reservas</h1>
          <div className="page-subtitle">{mesas.length} mesas · {reservas.length} reservas</div>
        </div>
        <div className="page-actions">
          <button className="btn btn-secondary" onClick={openReservaCreate} id="btn-nueva-reserva"><Calendar size={16} /> Nueva Reserva</button>
          <button className="btn btn-primary" onClick={openMesaCreate} id="btn-nueva-mesa">+ Nueva Mesa</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {statsMesas.map((s) => (
          <div key={s.estado} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '12px 20px', flex: 1, textAlign: 'center', cursor: 'pointer', borderTop: `2px solid ${ESTADO_COLORS[s.estado]}` }}
            onClick={() => setFilterEstado(filterEstado === s.estado ? 'todos' : s.estado)}>
            <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'Outfit', color: ESTADO_COLORS[s.estado] }}>{s.count}</div>
            <div style={{ fontSize: 11.5, color: 'var(--text-muted)', textTransform: 'capitalize', marginTop: 2 }}>{s.estado}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius)', border: '1px solid var(--border)', width: 'fit-content' }}>
        {[['plano', <><Armchair size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> Plano</>], ['reservas', <><Calendar size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> Reservas</>]].map(([t, l]) => (
          <button key={t} className={`btn ${tab === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setTab(t)}>{l}</button>
        ))}
      </div>

      {tab === 'plano' && (
        <>
          {filteredMesas.length === 0 ? <EmptyState icon="Armchair" title="Sin mesas" subtitle="Creá la primera mesa del salón" /> : (
            <div className="mesas-grid">
              {filteredMesas.map((m) => (
                <div
                  key={m.id}
                  className={`mesa-card ${m.estado}`}
                  onClick={() => setContextMesa(contextMesa?.id === m.id ? null : m)}
                >
                  <div className="mesa-number" style={{ color: ESTADO_COLORS[m.estado] }}>{m.numero}</div>
                  <Badge estado={m.estado} />
                  <div className="mesa-info"><Users size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> {m.capacidad} personas</div>
                  <div className="mesa-zona">📍 {m.zona}</div>
                  {contextMesa?.id === m.id && (
                    <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 6 }} onClick={(e) => e.stopPropagation()}>
                      <div style={{ height: 1, background: 'var(--border)', marginBottom: 4 }} />
                      {Object.values(ESTADOS_MESA).filter((e) => e !== m.estado).map((e) => (
                        <button key={e} className="btn btn-secondary btn-sm" style={{ fontSize: 11 }}
                          onClick={() => cambiarEstado(m, e)}>
                          → {e}
                        </button>
                      ))}
                      <button className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => openMesaEdit(m)}>✏️ Editar</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'reservas' && (
        <div className="table-container">
          {reservas.length === 0 ? <EmptyState icon="Calendar" title="Sin reservas" subtitle="Aún no hay reservas para hoy" /> : (
            <table>
              <thead><tr>
                <th>Cliente</th><th>Fecha</th><th>Hora</th><th>Personas</th>
                <th>Mesa</th><th>Notas</th><th>Acciones</th>
              </tr></thead>
              <tbody>
                {reservas.map((r) => (
                  <tr key={r.id}>
                    <td><div style={{ fontWeight: 600 }}>{r.nombre}</div><div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.telefono}</div></td>
                    <td>{r.fecha}</td>
                    <td><span style={{ color: 'var(--accent)', fontWeight: 600 }}>{r.hora}</span></td>
                    <td>{r.personas} pax</td>
                    <td>{r.mesa ? `Mesa ${mesas.find((m) => m.id === r.mesa)?.numero ?? r.mesa}` : <span style={{ color: 'var(--text-muted)' }}>Sin asignar</span>}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{r.notas || '—'}</td>
                    <td><div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-secondary btn-sm" onClick={() => openReservaEdit(r)}><Pencil size={16} /></button>
                      <button className="btn btn-danger btn-sm" onClick={async () => { await eliminarReserva(r.id); toast('Reserva eliminada', 'info'); }}></button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Modal Mesa */}
      <Modal open={mesaModal} onClose={() => setMesaModal(false)} title={editingMesa ? 'Editar Mesa' : 'Nueva Mesa'}>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Número *</label>
              <input type="number" value={mesaForm.numero} onChange={(e) => setM('numero', e.target.value)} id="mesa-numero" />
            </div>
            <div className="form-group">
              <label className="form-label">Capacidad</label>
              <input type="number" value={mesaForm.capacidad} onChange={(e) => setM('capacidad', +e.target.value)} id="mesa-capacidad" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Zona</label>
              <select value={mesaForm.zona} onChange={(e) => setM('zona', e.target.value)} id="mesa-zona">
                {ZONAS.map((z) => <option key={z}>{z}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select value={mesaForm.estado} onChange={(e) => setM('estado', e.target.value)} id="mesa-estado">
                {Object.values(ESTADOS_MESA).map((e) => <option key={e}>{e}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setMesaModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={saveMesa}>{editingMesa ? '💾 Guardar' : <><CheckCircle2 size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> Crear</>}</button>
        </div>
      </Modal>

      {/* Modal Reserva */}
      <Modal open={reservaModal} onClose={() => setReservaModal(false)} title={editingReserva ? 'Editar Reserva' : 'Nueva Reserva'}>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre del cliente *</label>
              <input value={reservaForm.nombre} onChange={(e) => setR('nombre', e.target.value)} id="res-nombre" />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input value={reservaForm.telefono} onChange={(e) => setR('telefono', e.target.value)} id="res-tel" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Fecha</label>
              <input type="date" value={reservaForm.fecha} onChange={(e) => setR('fecha', e.target.value)} id="res-fecha" />
            </div>
            <div className="form-group">
              <label className="form-label">Hora</label>
              <input type="time" value={reservaForm.hora} onChange={(e) => setR('hora', e.target.value)} id="res-hora" />
            </div>
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Personas</label>
              <input type="number" value={reservaForm.personas} onChange={(e) => setR('personas', +e.target.value)} id="res-personas" />
            </div>
            <div className="form-group">
              <label className="form-label">Mesa (opcional)</label>
              <select value={reservaForm.mesa ?? ''} onChange={(e) => setR('mesa', e.target.value || null)} id="res-mesa">
                <option value="">Sin asignar</option>
                {mesas.filter((m) => m.estado === 'libre' || m.estado === 'reservada').map((m) => (
                  <option key={m.id} value={m.id}>Mesa {m.numero} ({m.capacidad} pax)</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notas</label>
            <input value={reservaForm.notas} onChange={(e) => setR('notas', e.target.value)} placeholder="Cumpleaños, alergias, etc." id="res-notas" />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setReservaModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={saveReserva}>{editingReserva ? '💾 Guardar' : <><CheckCircle2 size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/> Reservar</>}</button>
        </div>
      </Modal>
    </div>
  );
}
