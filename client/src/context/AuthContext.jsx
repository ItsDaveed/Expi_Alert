import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [business, setBusiness] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('expialert_token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      axios.get('/api/auth/me')
        .then(res => setBusiness(res.data))
        .catch(() => localStorage.removeItem('expialert_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await axios.post('/api/auth/login', { email, password });
    localStorage.setItem('expialert_token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setBusiness(res.data);
    return res.data;
  };

  const register = async (data) => {
    const res = await axios.post('/api/auth/register', data);
    localStorage.setItem('expialert_token', res.data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setBusiness(res.data);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('expialert_token');
    delete axios.defaults.headers.common['Authorization'];
    setBusiness(null);
  };

  const updateBusiness = (data) => setBusiness(prev => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ business, loading, login, register, logout, updateBusiness }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
