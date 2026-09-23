import { BadgeDollarSign, TrendingUp } from 'lucide-react';
import React, { useState } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const formatCurrency = (n) => `$${n?.toLocaleString('es-AR') ?? 0}`;

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
        {payload.map((p, i) => (
          <div key={i} style={{ fontSize: 13.5, fontWeight: 700, color: p.color }}>
            {p.name}: {p.name === 'Ventas' ? formatCurrency(p.value) : p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Reportes() {
  const { tenantData } = useTenant();
  const { ventas, pedidos, menuItems } = tenantData;
  const [periodo, setPeriodo] = useState('7');

  const periodoNum = parseInt(periodo);
  const ventasFiltradas = ventas.slice(-periodoNum);

  const totalPeriodo = ventasFiltradas.reduce((s, v) => s + v.totalVentas, 0);
  const ticketsPeriodo = ventasFiltradas.reduce((s, v) => s + v.cantidadTickets, 0);
  const ticketPromedio = ticketsPeriodo > 0 ? Math.round(totalPeriodo / ticketsPeriodo) : 0;
  const mejorDia = ventasFiltradas.reduce((best, v) => v.totalVentas > (best?.totalVentas ?? 0) ? v : best, null);

  // Top productos (por ocurrencia en pedidos)
  const itemCounts = {};
  pedidos.forEach((p) => p.items?.forEach((item) => {
    itemCounts[item.nombre] = (itemCounts[item.nombre] ?? 0) + item.cantidad;
  }));
  const topProductos = Object.entries(itemCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }));

  const chartData = ventasFiltradas.map((v) => ({
    fecha: v.fecha.slice(5), // MM-DD
    Ventas: v.totalVentas,
    Tickets: v.cantidadTickets,
  }));

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Reportes</h1>
          <div className="page-subtitle">Análisis de ventas y rendimiento</div>
        </div>
        <div style={{ display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 4, borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
          {[['7', 'Últimos 7 días'], ['14', '2 semanas'], ['30', 'Último mes']].map(([v, l]) => (
            <button key={v} className={`btn ${periodo === v ? 'btn-primary' : 'btn-ghost'}`} onClick={() => setPeriodo(v)}>{l}</button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4" style={{ marginBottom: 28 }}>
        <div className="stat-card">
          <div className="stat-icon"><BadgeDollarSign size={24} /></div>
          <div className="stat-label">Ventas Totales</div>
          <div className="stat-value" style={{ color: 'var(--green)', fontSize: 22 }}>{formatCurrency(totalPeriodo)}</div>
          <div className="stat-sub">en {periodoNum} días</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🧾</div>
          <div className="stat-label">Tickets Emitidos</div>
          <div className="stat-value">{ticketsPeriodo}</div>
          <div className="stat-sub">promedio {(ticketsPeriodo / periodoNum).toFixed(1)}/día</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><TrendingUp size={24} /></div>
          <div className="stat-label">Ticket Promedio</div>
          <div className="stat-value" style={{ color: 'var(--accent)' }}>{formatCurrency(ticketPromedio)}</div>
          <div className="stat-sub">por cliente</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-label">Mejor Día</div>
          <div className="stat-value" style={{ fontSize: 16 }}>{mejorDia?.fecha?.slice(5) ?? '—'}</div>
          <div className="stat-sub" style={{ color: 'var(--green)' }}>{formatCurrency(mejorDia?.totalVentas ?? 0)}</div>
        </div>
      </div>

      <div className="grid-2" style={{ gap: 20 }}>
        {/* Gráfico de ventas */}
        <div className="card">
          <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 15 }}>Ventas Diarias</div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="fecha" tick={{ fill: '#4e5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4e5568', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="Ventas" stroke="#f59e0b" strokeWidth={2.5} fill="url(#colorVentas)" name="Ventas" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Tickets */}
        <div className="card">
          <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 15 }}>Tickets por Día</div>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="fecha" tick={{ fill: '#4e5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#4e5568', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="Tickets" fill="#10b981" radius={[4, 4, 0, 0]} name="Tickets" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Productos */}
      <div className="card" style={{ marginTop: 20 }}>
        <div style={{ marginBottom: 16, fontWeight: 700, fontSize: 15 }}>🏆 Top Productos Vendidos</div>
        {topProductos.length === 0 ? (
          <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sin datos de ventas por producto aún</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {topProductos.map((p, i) => {
              const maxCount = topProductos[0].cantidad;
              const pct = (p.cantidad / maxCount) * 100;
              return (
                <div key={p.nombre} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: 6, background: i === 0 ? 'var(--accent-dim)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: i === 0 ? 'var(--accent)' : 'var(--text-muted)', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13.5, fontWeight: 500 }}>{p.nombre}</span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.cantidad} unidades</span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-elevated)', borderRadius: 2 }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: i === 0 ? 'var(--accent)' : 'var(--green)', borderRadius: 2, transition: 'width 0.5s' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
