import { Settings, Bike, Building, BadgeDollarSign, Phone, Palette, CreditCard } from 'lucide-react';
import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../contexts/ToastContext';
import { TIPOS_NEGOCIO, METODOS_PAGO } from '../data/mockData';

const ACCENT_COLORS = ['#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6', '#f97316', '#ec4899', '#14b8a6'];

export default function ConfigNegocio() {
  const { activeTenant, actualizarNegocio } = useTenant();
  const { toast } = useToast();
  const [form, setForm] = useState(activeTenant ?? {});
  const [section, setSection] = useState('general');

  if (!activeTenant) {
    return (
      <div className="page-content">
        <div className="empty-state" style={{ paddingTop: 80 }}>
          <div className="empty-state-icon"><Settings size={48} /></div>
          <div className="empty-state-title">Seleccioná un negocio primero</div>
        </div>
      </div>
    );
  }

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));
  const toggleMetodo = (m) => {
    const current = form.metodoPago ?? [];
    const updated = current.includes(m) ? current.filter((x) => x !== m) : [...current, m];
    set('metodoPago', updated);
  };

  const save = async () => {
    await actualizarNegocio(activeTenant.id, form);
    toast(' Configuración guardada', 'success');
  };

  const sections = [
    { id: 'general', label: 'General', icon: <Building size={16} /> },
    { id: 'contacto', label: 'Contacto', icon: <Phone size={16} /> },
    { id: 'apariencia', label: 'Apariencia', icon: <Palette size={16} /> },
    { id: 'delivery', label: 'Delivery', icon: <Bike size={16} /> },
    { id: 'pagos', label: 'Pagos & Fiscal', icon: <CreditCard size={16} /> },
  ];

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">⚙️ Configuración</h1>
          <div className="page-subtitle">{activeTenant.nombre}</div>
        </div>
        <button className="btn btn-primary" onClick={save} id="btn-guardar-config">💾 Guardar Cambios</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20 }}>
        {/* Nav lateral */}
        <div className="card" style={{ padding: 12, height: 'fit-content' }}>
          {sections.map((s) => (
            <div
              key={s.id}
              className={`nav-item${section === s.id ? ' active' : ''}`}
              onClick={() => setSection(s.id)}
            >
              <span style={{ marginRight: 8, verticalAlign: 'middle' }}>{s.icon}</span> {s.label}
            </div>
          ))}
        </div>

        {/* Contenido */}
        <div className="card">
          {section === 'general' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}><Building size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Información General</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Nombre del negocio</label>
                  <input value={form.nombre ?? ''} onChange={(e) => set('nombre', e.target.value)} id="cfg-nombre" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo de negocio</label>
                  <select value={form.tipo ?? ''} onChange={(e) => set('tipo', e.target.value)} id="cfg-tipo">
                    {TIPOS_NEGOCIO.map((t) => <option key={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Horarios de atención</label>
                <input value={form.horarios ?? ''} onChange={(e) => set('horarios', e.target.value)} placeholder="Ej: Lun-Dom 12:00 - 00:00" id="cfg-horarios" />
              </div>
              <div className="toggle-row">
                <span className="toggle-label">Negocio Activo</span>
                <label className="toggle">
                  <input type="checkbox" checked={form.activo ?? true} onChange={(e) => set('activo', e.target.checked)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          )}

          {section === 'contacto' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>📞 Información de Contacto</h3>
              <div className="form-group">
                <label className="form-label">Dirección</label>
                <input value={form.direccion ?? ''} onChange={(e) => set('direccion', e.target.value)} placeholder="Av. Ejemplo 1234, Ciudad" id="cfg-dir" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Teléfono</label>
                  <input value={form.telefono ?? ''} onChange={(e) => set('telefono', e.target.value)} id="cfg-tel" />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input type="email" value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} id="cfg-email" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Instagram</label>
                  <input value={form.redes?.instagram ?? ''} onChange={(e) => set('redes', { ...(form.redes ?? {}), instagram: e.target.value })} placeholder="@sunegocio" id="cfg-ig" />
                </div>
                <div className="form-group">
                  <label className="form-label">Facebook</label>
                  <input value={form.redes?.facebook ?? ''} onChange={(e) => set('redes', { ...(form.redes ?? {}), facebook: e.target.value })} id="cfg-fb" />
                </div>
              </div>
            </div>
          )}

          {section === 'apariencia' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>🎨 Apariencia</h3>
              <div className="form-group">
                <label className="form-label">Color de acento</label>
                <div className="color-swatches" style={{ marginTop: 8 }}>
                  {ACCENT_COLORS.map((c) => (
                    <div
                      key={c}
                      className={`color-swatch${form.color === c ? ' selected' : ''}`}
                      style={{ background: c, width: 40, height: 40 }}
                      onClick={() => set('color', c)}
                    />
                  ))}
                </div>
                <div style={{ marginTop: 12, padding: 16, background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', border: `2px solid ${form.color || 'var(--accent)'}` }}>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 8 }}>Preview:</div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button style={{ background: form.color || 'var(--accent)', color: '#000', border: 'none', padding: '8px 16px', borderRadius: 8, fontWeight: 600, cursor: 'default' }}>Botón primario</button>
                    <span style={{ color: form.color || 'var(--accent)', fontWeight: 700 }}>{form.nombre || 'Nombre del negocio'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {section === 'delivery' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}><Bike size={20} style={{ marginRight: 8, verticalAlign: 'middle' }} /> Configuración de Delivery</h3>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Costo de envío ($)</label>
                  <input type="number" value={form.costoDelivery ?? 0} onChange={(e) => set('costoDelivery', +e.target.value)} id="cfg-envio" />
                </div>
                <div className="form-group">
                  <label className="form-label">Zona de cobertura (km)</label>
                  <input type="number" value={form.zoneDelivery ?? 5} onChange={(e) => set('zoneDelivery', +e.target.value)} id="cfg-zona" />
                </div>
              </div>
              <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-sm)', padding: 14, border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Resumen de costos</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5 }}>
                  <span>Costo de envío:</span>
                  <span style={{ color: 'var(--accent)', fontWeight: 700 }}>${(form.costoDelivery ?? 0).toLocaleString('es-AR')}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13.5, marginTop: 6 }}>
                  <span>Cobertura:</span>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>hasta {form.zoneDelivery ?? 5} km</span>
                </div>
              </div>
            </div>
          )}

          {section === 'pagos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>💳 Pagos & Fiscal</h3>
              <div className="form-group">
                <label className="form-label">IVA (%)</label>
                <input type="number" value={form.iva ?? 21} onChange={(e) => set('iva', +e.target.value)} id="cfg-iva" style={{ maxWidth: 200 }} />
              </div>
              <div className="form-group">
                <label className="form-label">Métodos de pago habilitados</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
                  {METODOS_PAGO.map((m) => {
                    const enabled = (form.metodoPago ?? []).includes(m);
                    return (
                      <button
                        key={m}
                        className={`btn btn-sm ${enabled ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => toggleMetodo(m)}
                      >
                        {enabled ? '✓ ' : ''}{m}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div style={{ background: 'var(--bg-elevated)', padding: 14, borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }}>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Métodos activos:</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(form.metodoPago ?? []).map((m) => (
                    <span key={m} className="badge badge-listo">{m}</span>
                  ))}
                  {(!form.metodoPago || form.metodoPago.length === 0) && <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Ninguno seleccionado</span>}
                </div>
              </div>
            </div>
          )}

          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={save}>💾 Guardar Cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
}
