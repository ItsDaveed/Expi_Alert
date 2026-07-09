import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ businessName: '', email: '', password: '', phone: '', address: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Welcome to ExpiAlert 🎉');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center px-4 py-10">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-700">🔔 ExpiAlert</h1>
          <p className="text-gray-500 mt-2 text-sm">Real-Time Product Expiry Management</p>
        </div>

        <h2 className="text-xl font-semibold text-gray-700 mb-6">Create your business account</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Business Name *</label>
            <input type="text" name="businessName" value={form.businessName} onChange={handleChange} required
              placeholder="e.g. HealthPlus Pharmacy"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Email *</label>
            <input type="email" name="email" value={form.email} onChange={handleChange} required
              placeholder="business@email.com"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Password *</label>
            <input type="password" name="password" value={form.password} onChange={handleChange} required
              placeholder="Min. 6 characters"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
            <input type="tel" name="phone" value={form.phone} onChange={handleChange}
              placeholder="+234 800 000 0000"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
            <input type="text" name="address" value={form.address} onChange={handleChange}
              placeholder="Business address"
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition disabled:opacity-60">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-green-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
