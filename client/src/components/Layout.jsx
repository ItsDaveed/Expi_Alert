import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Bell, Settings, LogOut, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/products', icon: Package, label: 'Products' },
  { to: '/alerts', icon: Bell, label: 'Alerts' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const { business, logout } = useAuth();
  const { unreadCount } = useSocket();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-green-700 text-white flex flex-col transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0`}>

        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-green-600">
          <div>
            <h1 className="text-xl font-bold tracking-wide">🔔 ExpiAlert</h1>
            <p className="text-xs text-green-200 truncate">{business?.businessName}</p>
          </div>
          <button className="md:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition
                ${isActive ? 'bg-white text-green-700' : 'text-green-100 hover:bg-green-600'}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === 'Alerts' && unreadCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-4 py-4 border-t border-green-600">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-sm text-green-100 hover:bg-green-600 transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center gap-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu size={22} className="text-gray-600" />
          </button>
          <h1 className="font-bold text-green-700">🔔 ExpiAlert</h1>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
