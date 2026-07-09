import { useEffect, useState } from 'react';
import { Package, CheckCircle, AlertTriangle, XCircle, Bell } from 'lucide-react';
import { dashboardAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <div className={`${bg} rounded-2xl p-5 flex items-center gap-4 shadow-sm`}>
    <div className={`${color} bg-white rounded-xl p-3`}>
      <Icon size={22} />
    </div>
    <div>
      <p className="text-sm text-white/80">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  </div>
);

const statusBadge = (status) => {
  const map = {
    fresh: 'bg-green-100 text-green-700',
    expiring_soon: 'bg-yellow-100 text-yellow-700',
    expired: 'bg-red-100 text-red-700',
  };
  const labels = { fresh: 'Fresh', expiring_soon: 'Expiring Soon', expired: 'Expired' };
  return <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${map[status]}`}>{labels[status]}</span>;
};

export default function Dashboard() {
  const { business } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.get()
      .then(res => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-4 border-green-600 border-t-transparent" />
    </div>
  );

  const { stats, recentAlerts, expiringThisWeek } = data || {};

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Welcome, {business?.businessName} 👋</h2>
        <p className="text-gray-500 text-sm mt-1">Here's your real-time product expiry overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Products" value={stats?.total || 0} icon={Package} color="text-blue-600" bg="bg-blue-500" />
        <StatCard label="Fresh" value={stats?.fresh || 0} icon={CheckCircle} color="text-green-600" bg="bg-green-500" />
        <StatCard label="Expiring Soon" value={stats?.expiringSoon || 0} icon={AlertTriangle} color="text-yellow-600" bg="bg-yellow-500" />
        <StatCard label="Expired" value={stats?.expired || 0} icon={XCircle} color="text-red-600" bg="bg-red-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiring This Week */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">⚠️ Expiring This Week</h3>
            <Link to="/products?status=expiring_soon" className="text-xs text-green-600 hover:underline">View all</Link>
          </div>
          {expiringThisWeek?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No products expiring this week 🎉</p>
          ) : (
            <div className="space-y-3">
              {expiringThisWeek?.map(p => {
                const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={p._id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-medium text-gray-700">{p.name}</p>
                      <p className="text-xs text-gray-400">{p.category}</p>
                    </div>
                    <div className="text-right">
                      {statusBadge(p.status)}
                      <p className="text-xs text-gray-400 mt-1">{days} day(s) left</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent Alerts */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-700">🔔 Recent Alerts</h3>
            <Link to="/alerts" className="text-xs text-green-600 hover:underline">View all</Link>
          </div>
          {recentAlerts?.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6">No unread alerts</p>
          ) : (
            <div className="space-y-3">
              {recentAlerts?.map(a => (
                <div key={a._id} className="flex items-start gap-3 text-sm border-b pb-2 last:border-0">
                  <Bell size={16} className="text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-gray-700">{a.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
