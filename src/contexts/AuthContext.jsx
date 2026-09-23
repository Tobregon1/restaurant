import React, { createContext, useContext, useState, useEffect } from 'react';
import { superAdmin } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('ros_user');
    if (saved) setUser(JSON.parse(saved));
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await response.json();
      if (!response.ok) {
        return { ok: false, error: data.error || 'Credenciales incorrectas' };
      }
      
      setUser(data.user);
      localStorage.setItem('ros_token', data.token);
      localStorage.setItem('ros_user', JSON.stringify(data.user));
      
      if (data.tenant) {
        localStorage.setItem('ros_tenant', JSON.stringify(data.tenant));
      }
      return { ok: true };
    } catch (error) {
      return { ok: false, error: 'Error de red. Asegúrate de que el servidor esté corriendo.' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ros_user');
    localStorage.removeItem('ros_tenant');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
