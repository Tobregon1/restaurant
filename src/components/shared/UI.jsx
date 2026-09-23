import React from 'react';
import * as LucideIcons from 'lucide-react';

export const Modal = ({ open, onClose, title, children, wide }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal${wide ? ' modal-wide' : ''}`}>
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button className="btn btn-ghost btn-icon" onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
};

export const Badge = ({ estado }) => {
  const labels = {
    libre: 'Libre', ocupada: 'Ocupada', reservada: 'Reservada', sucia: 'Sucia',
    pendiente: 'Pendiente', en_cocina: 'En Cocina', listo: '¡Listo!', entregado: 'Entregado',
    cancelado: 'Cancelado', nuevo: 'Nuevo', preparando: 'Preparando', en_camino: 'En Camino',
  };
  return <span className={`badge badge-${estado}`}>{labels[estado] ?? estado}</span>;
};

export const Spinner = () => <div className="loading-spinner" />;

export const EmptyState = ({ icon: IconName, title = 'Sin datos', subtitle = '' }) => {
  const IconComponent = LucideIcons[IconName] || LucideIcons.Inbox;
  return (
    <div className="empty-state">
      <div className="empty-state-icon"><IconComponent size={48} /></div>
      <div className="empty-state-title">{title}</div>
      {subtitle && <div className="empty-state-sub">{subtitle}</div>}
    </div>
  );
};

export const Toggle = ({ checked, onChange }) => (
  <label className="toggle">
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span className="toggle-slider" />
  </label>
);
