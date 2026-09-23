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

  const login = (username, password) => {
    // Mock auth — replace with API call when backend is ready
    if (username === superAdmin.username && password === superAdmin.password) {
      const u = { ...superAdmin, password: undefined };
      setUser(u);
      localStorage.setItem('ros_user', JSON.stringify(u));
      return { ok: true };
    }
    return { ok: false, error: 'Credenciales incorrectas' };
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
