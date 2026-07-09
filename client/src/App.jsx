import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Alerts from './pages/Alerts';
import Settings from './pages/Settings';
import Layout from './components/Layout';

const PrivateRoute = ({ children }) => {
  const { business, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-green-600 border-t-transparent" />
    </div>
  );
  return business ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { business, loading } = useAuth();
  if (loading) return null;
  return business ? <Navigate to="/" /> : children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
    <Route path="/" element={<PrivateRoute><SocketProvider><Layout /></SocketProvider></PrivateRoute>}>
      <Route index element={<Dashboard />} />
      <Route path="products" element={<Products />} />
      <Route path="alerts" element={<Alerts />} />
      <Route path="settings" element={<Settings />} />
    </Route>
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
