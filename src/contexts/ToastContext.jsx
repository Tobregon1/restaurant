import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);
let id = 0;

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 3000) => {
    const tid = ++id;
    setToasts((p) => [...p, { id: tid, message, type }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== tid)), duration);
  }, []);

  

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);
