import { useEffect, useState } from 'react';
import { Bell, BellOff, Trash2, CheckCheck } from 'lucide-react';
import { alertAPI } from '../utils/api';
import { useSocket } from '../context/SocketContext';
import toast from 'react-hot-toast';

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setUnreadCount } = useSocket();

  const fetchAlerts = async () => {
    try {
      const res = await alertAPI.getAll();
      setAlerts(res.data);
    } catch {
      toast.error('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const markRead = async (id) => {
    await alertAPI.markRead(id);
    setAlerts(prev => prev.map(a => a._id === id ? { ...a, isRead: true } : a));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await alertAPI.markAllRead();
    setAlerts(prev => prev.map(a => ({ ...a, isRead: true })));
    setUnreadCount(0);
    toast.success('All alerts marked as read');
  };

  const deleteAlert = async (id) => {
    await alertAPI.delete(id);
    const alert = alerts.find(a => a._id === id);
    setAlerts(prev => prev.filter(a => a._id !== id));
    if (!alert.isRead) setUnreadCount(prev => Math.max(0, prev - 1));
    toast.success('Alert deleted');
  };

  const unread = alerts.filter(a => !a.isRead).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Alerts</h2>
          {unread > 0 && <p className="text-sm text-red-500 mt-0.5">{unread} unread alert(s)</p>}
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-2 text-sm text-green-700 border border-green-600 px-3 py-1.5 rounded-lg hover:bg-green-50 transition">
            <CheckCheck size={15} /> Mark all read
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <BellOff size={40} className="mx-auto mb-3 opacity-40" />
            <p>No alerts yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {alerts.map(a => (
              <div key={a._id}
                className={`flex items-start gap-4 px-5 py-4 transition ${!a.isRead ? 'bg-red-50' : 'hover:bg-gray-50'}`}>
                <Bell size={18} className={`mt-0.5 shrink-0 ${a.type === 'expired' ? 'text-red-500' : 'text-yellow-500'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800 font-medium">{a.message}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {a.product?.name} • {new Date(a.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {!a.isRead && (
                    <button onClick={() => markRead(a._id)} title="Mark as read"
                      className="text-green-600 hover:text-green-800">
                      <CheckCheck size={16} />
                    </button>
                  )}
                  <button onClick={() => deleteAlert(a._id)} title="Delete"
                    className="text-red-400 hover:text-red-600">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
