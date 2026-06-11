import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('estimatrix_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const { data } = await authAPI.login({ email, password, role });
      localStorage.setItem('estimatrix_user', JSON.stringify(data));
      setUser(data);
      return data;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('estimatrix_user');
    setUser(null);
  };

  const updateUser = (data) => {
    const updated = { ...user, ...data };
    localStorage.setItem('estimatrix_user', JSON.stringify(updated));
    setUser(updated);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
