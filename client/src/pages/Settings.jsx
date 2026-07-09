import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';

export default function Settings() {
  const { business, updateBusiness } = useAuth();
  const [form, setForm] = useState({
    businessName: business?.businessName || '',
    phone: business?.phone || '',
    address: business?.address || '',
    notifyByEmail: business?.notifyByEmail ?? true,
    expiryWarningDays: business?.expiryWarningDays || 7,
  });
  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateSettings(form);
      updateBusiness(res.data);
      toast.success('Settings saved!');
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl space-y-5">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-5">Business Profile</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Business Name</label>
            <input type="text" name="businessName" value={form.businessName} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
            <input type="text" name="address" value={form.address} onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>

          <hr className="my-2" />
          <h4 className="font-medium text-gray-700">Notification Preferences</h4>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700">Email Notifications</p>
              <p className="text-xs text-gray-400">Receive daily expiry alerts via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="notifyByEmail" checked={form.notifyByEmail} onChange={handleChange} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-green-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Expiry Warning Threshold (days)
            </label>
            <input type="number" name="expiryWarningDays" value={form.expiryWarningDays} onChange={handleChange}
              min={1} max={90}
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
            <p className="text-xs text-gray-400 mt-1">Products expiring within this many days will be flagged as "Expiring Soon"</p>
          </div>

          <button type="submit" disabled={saving}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60">
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="font-semibold text-gray-700 mb-3">Account Info</h3>
        <div className="text-sm space-y-2 text-gray-600">
          <p><span className="font-medium">Email:</span> {business?.email}</p>
          <p><span className="font-medium">Member since:</span> {new Date(business?.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
