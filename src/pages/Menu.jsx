import { ClipboardList, Pencil, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { useToast } from '../contexts/ToastContext';
import { Modal, EmptyState, Toggle } from '../components/shared/UI';

const defaultCat = { nombre: '', icono: 'Utensils', orden: 1 };
const defaultItem = { nombre: '', descripcion: '', precio: 0, categoriaId: '', disponible: true, tiempo: 15 };
const ICONOS = ['Utensils', 'Pizza', 'Coffee', 'Beer', 'Beef', 'Salad', 'IceCream', 'CupSoda'];

export default function Menu() {
  const { tenantData, crearCategoria, actualizarCategoria, eliminarCategoria, crearMenuItem, actualizarMenuItem, eliminarMenuItem } = useTenant();
  const { toast } = useToast();
  const { categorias, menuItems } = tenantData;
  const [catModal, setCatModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [catForm, setCatForm] = useState(defaultCat);
  const [itemModal, setItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState(defaultItem);
  const [activeTab, setActiveTab] = useState(categorias[0]?.id ?? null);
  const [search, setSearch] = useState('');

  const openCatCreate = () => { setCatForm(defaultCat); setEditingCat(null); setCatModal(true); };
  const openCatEdit = (c) => { setCatForm({ ...c }); setEditingCat(c.id); setCatModal(true); };
  const saveCat = async () => {
    if (!catForm.nombre.trim()) return toast('El nombre es requerido', 'error');
    if (editingCat) { await actualizarCategoria(editingCat, catForm); toast('Categoría actualizada', 'success'); }
    else { await crearCategoria(catForm); toast('Categoría creada', 'success'); }
    setCatModal(false);
  };

  const openItemCreate = (catId) => { setItemForm({ ...defaultItem, categoriaId: catId || categorias[0]?.id || '' }); setEditingItem(null); setItemModal(true); };
  const openItemEdit = (i) => { setItemForm({ ...i }); setEditingItem(i.id); setItemModal(true); };
  const saveItem = async () => {
    if (!itemForm.nombre.trim()) return toast('El nombre es requerido', 'error');
    if (!itemForm.categoriaId) return toast('Seleccioná una categoría', 'error');
    if (editingItem) { await actualizarMenuItem(editingItem, itemForm); toast('Ítem actualizado', 'success'); }
    else { await crearMenuItem(itemForm); toast('Ítem creado', 'success'); }
    setItemModal(false);
  };

  const toggleDisponible = async (item) => {
    await actualizarMenuItem(item.id, { disponible: !item.disponible });
    toast(`${item.nombre} — ${!item.disponible ? 'habilitado' : 'deshabilitado'}`, 'info');
  };

  const setC = (k, v) => setCatForm((p) => ({ ...p, [k]: v }));
  const setI = (k, v) => setItemForm((p) => ({ ...p, [k]: v }));

  const displayItems = menuItems.filter((i) => {
    const matchCat = activeTab ? i.categoriaId === activeTab : true;
    const matchSearch = !search || i.nombre.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = { total: menuItems.length, disponibles: menuItems.filter((i) => i.disponible).length };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Menú Digital</h1>
          <div className="page-subtitle">{stats.total} ítems · {stats.disponibles} disponibles · {categorias.length} categorías</div>
        </div>
        <div className="page-actions">
          <div className="search-bar" style={{ width: 220 }}>
            <span>🔍</span>
            <input placeholder="Buscar plato..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-secondary" onClick={openCatCreate} id="btn-nueva-categoria">+ Categoría</button>
          <button className="btn btn-primary" onClick={() => openItemCreate(activeTab)} id="btn-nuevo-item">+ Ítem</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 20 }}>
        {/* Categorías sidebar */}
        <div className="card" style={{ padding: 12, height: 'fit-content' }}>
          <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Categorías</div>
          <div
            className={`nav-item${!activeTab ? ' active' : ''}`}
            onClick={() => setActiveTab(null)}
          >
            <span><ClipboardList size={18} /></span> Todos
          </div>
          {categorias.map((c) => {
            const count = menuItems.filter((i) => i.categoriaId === c.id).length;
            return (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div
                  className={`nav-item${activeTab === c.id ? ' active' : ''}`}
                  style={{ flex: 1 }}
                  onClick={() => setActiveTab(c.id)}
                >
                  <span>{c.icono}</span> {c.nombre}
                  {count > 0 && <span className="nav-badge">{count}</span>}
                </div>
                <button className="btn btn-ghost btn-sm btn-icon" style={{ padding: '4px 6px' }} onClick={() => openCatEdit(c)}><Pencil size={16} /></button>
                <button className="btn btn-ghost btn-sm btn-icon" style={{ padding: '4px 6px' }} onClick={async () => { await eliminarCategoria(c.id); toast('Categoría eliminada', 'info'); if (activeTab === c.id) setActiveTab(null); }}></button>
              </div>
            );
          })}
          {categorias.length === 0 && <div style={{ fontSize: 12, color: 'var(--text-muted)', padding: '8px 0' }}>Sin categorías</div>}
        </div>

        {/* Items grid */}
        <div>
          {displayItems.length === 0 ? (
            <EmptyState icon="Pizza" title="Sin ítems" subtitle={search ? 'Sin resultados para tu búsqueda' : 'Agregá el primer plato del menú'} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {displayItems.map((item) => {
                const cat = categorias.find((c) => c.id === item.categoriaId);
                return (
                  <div key={item.id} className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 18px', opacity: item.disponible ? 1 : 0.5 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{item.nombre}</span>
                        {cat && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{cat.icono} {cat.nombre}</span>}
                        {!item.disponible && <span className="badge badge-cancelado" style={{ fontSize: 10 }}>No disponible</span>}
                      </div>
                      {item.descripcion && <div style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>{item.descripcion}</div>}
                      {item.tiempo && <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 2 }}>⏱ {item.tiempo} min</div>}
                    </div>
                    <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Outfit', color: 'var(--accent)', minWidth: 100, textAlign: 'right' }}>
                      ${item.precio.toLocaleString('es-AR')}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Toggle checked={item.disponible} onChange={() => toggleDisponible(item)} />
                      <button className="btn btn-secondary btn-sm btn-icon" onClick={() => openItemEdit(item)}><Pencil size={16} /></button>
                      <button className="btn btn-danger btn-sm btn-icon" onClick={async () => { await eliminarMenuItem(item.id); toast('Ítem eliminado', 'info'); }}></button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Modal Categoría */}
      <Modal open={catModal} onClose={() => setCatModal(false)} title={editingCat ? 'Editar Categoría' : 'Nueva Categoría'}>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input value={catForm.nombre} onChange={(e) => setC('nombre', e.target.value)} placeholder="Entradas, Carnes..." id="cat-nombre" />
            </div>
            <div className="form-group">
              <label className="form-label">Orden</label>
              <input type="number" value={catForm.orden} onChange={(e) => setC('orden', +e.target.value)} id="cat-orden" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Ícono</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ICONOS.map((ico) => (
                <button
                  key={ico}
                  onClick={() => setC('icono', ico)}
                  style={{ width: 36, height: 36, borderRadius: 8, background: catForm.icono === ico ? 'var(--accent-dim)' : 'var(--bg-elevated)', border: catForm.icono === ico ? '2px solid var(--accent)' : '1px solid var(--border)', fontSize: 20, cursor: 'pointer', transition: 'all 0.15s' }}
                >
                  {ico}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setCatModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={saveCat}>{editingCat ? '💾 Guardar' : [<CheckCircle2 size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/>, 'Crear']}</button>
        </div>
      </Modal>

      {/* Modal Ítem */}
      <Modal open={itemModal} onClose={() => setItemModal(false)} title={editingItem ? 'Editar Ítem' : 'Nuevo Ítem de Menú'} wide>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Nombre *</label>
              <input value={itemForm.nombre} onChange={(e) => setI('nombre', e.target.value)} placeholder="Bife de Chorizo" id="item-nombre" />
            </div>
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select value={itemForm.categoriaId} onChange={(e) => setI('categoriaId', e.target.value)} id="item-cat">
                <option value="">Seleccioná...</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.icono} {c.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Descripción</label>
            <input value={itemForm.descripcion} onChange={(e) => setI('descripcion', e.target.value)} placeholder="Descripción del plato..." id="item-desc" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Precio ($) *</label>
              <input type="number" value={itemForm.precio} onChange={(e) => setI('precio', +e.target.value)} id="item-precio" />
            </div>
            <div className="form-group">
              <label className="form-label">Tiempo de preparación (min)</label>
              <input type="number" value={itemForm.tiempo} onChange={(e) => setI('tiempo', +e.target.value)} id="item-tiempo" />
            </div>
          </div>
          <div className="toggle-row">
            <span className="toggle-label">Disponible en el menú</span>
            <label className="toggle">
              <input type="checkbox" checked={itemForm.disponible} onChange={(e) => setI('disponible', e.target.checked)} />
              <span className="toggle-slider" />
            </label>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={() => setItemModal(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={saveItem}>{editingItem ? '💾 Guardar' : [<CheckCircle2 size={16} style={{marginRight: 4, verticalAlign: 'middle'}}/>, 'Crear']}</button>
        </div>
      </Modal>
    </div>
  );
}
