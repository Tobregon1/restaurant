import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Utensils, Search, ChevronRight } from 'lucide-react';

export default function PublicMenu() {
  const { tenantId } = useParams();
  const [tenant, setTenant] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tRes = await fetch('http://localhost:3001/api/negocios');
        const tData = await tRes.json();
        const currentTenant = tData.find(t => t.id === tenantId);
        
        if (currentTenant) {
          setTenant(currentTenant);
          const cRes = await fetch(`http://localhost:3001/api/categorias/${tenantId}`);
          const cats = await cRes.json();
          setCategorias(cats.sort((a, b) => a.orden - b.orden));
          
          const mRes = await fetch(`http://localhost:3001/api/menu_items/${tenantId}`);
          setMenuItems(await mRes.json());

          if (cats.length > 0) setActiveCategory(cats[0].id);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [tenantId]);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
        <div className="loading-spinner" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f172a', color: 'white' }}>
        <h2>Menú no encontrado</h2>
      </div>
    );
  }

  const filteredItems = menuItems.filter(item => {
    if (activeCategory && !search && item.categoriaId !== activeCategory) return false;
    if (search && !item.nombre.toLowerCase().includes(search.toLowerCase())) return false;
    return item.disponible !== false;
  });

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      {/* Header */}
      <header style={{ padding: '24px 20px', background: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: tenant.color || '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Utensils size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 20, fontWeight: 700, margin: 0, fontFamily: 'Outfit' }}>{tenant.nombre}</h1>
            <p style={{ fontSize: 13, color: '#94a3b8', margin: 0 }}>Menú Digital</p>
          </div>
        </div>

        <div style={{ position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: 12, top: 11, color: '#64748b' }} />
          <input
            type="text"
            placeholder="Buscar en el menú..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '10px 12px 10px 40px', borderRadius: 12,
              background: '#1e293b', border: '1px solid #334155', color: 'white',
              outline: 'none', fontSize: 15
            }}
          />
        </div>
      </header>

      {/* Categories Horizontal Scroll */}
      {!search && (
        <div style={{ display: 'flex', overflowX: 'auto', padding: '0 20px', gap: 12, marginBottom: 20, scrollbarWidth: 'none' }}>
          {categorias.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '8px 16px', borderRadius: 20, whiteSpace: 'nowrap',
                background: activeCategory === cat.id ? (tenant.color || '#f59e0b') : '#1e293b',
                color: activeCategory === cat.id ? 'white' : '#cbd5e1',
                border: 'none', fontWeight: 600, fontSize: 14, cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      )}

      {/* Items List */}
      <div style={{ padding: '0 20px 40px' }}>
        {filteredItems.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
            No se encontraron productos.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {filteredItems.map(item => (
              <div key={item.id} style={{ display: 'flex', background: '#1e293b', borderRadius: 16, overflow: 'hidden', border: '1px solid #334155' }}>
                <div style={{ flex: 1, padding: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, margin: '0 0 4px', color: '#f8fafc' }}>{item.nombre}</h3>
                  <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 12px', lineHeight: 1.4 }}>{item.descripcion || 'Sin descripción'}</p>
                  <div style={{ fontSize: 16, fontWeight: 700, color: tenant.color || '#f59e0b' }}>
                    ${Number(item.precio).toLocaleString()}
                  </div>
                </div>
                <div style={{ width: 100, background: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Placeholder for image */}
                  <Utensils size={32} color="#475569" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
