import { useEffect, useState } from 'react';
import { Plus, Search, Pencil, Trash2, X } from 'lucide-react';
import { productAPI } from '../utils/api';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
  fresh: 'bg-green-100 text-green-700',
  expiring_soon: 'bg-yellow-100 text-yellow-700',
  expired: 'bg-red-100 text-red-700',
};
const STATUS_LABELS = { fresh: 'Fresh', expiring_soon: 'Expiring Soon', expired: 'Expired' };

const EMPTY_FORM = {
  name: '', barcode: '', category: 'General', quantity: '', unit: 'pcs',
  expiryDate: '', manufactureDate: '', supplier: '', location: '', notes: '',
};

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchProducts = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      const res = await productAPI.getAll(params);
      setProducts(res.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, [search, statusFilter]);

  const openAdd = () => { setEditProduct(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({
      name: p.name, barcode: p.barcode || '', category: p.category,
      quantity: p.quantity, unit: p.unit,
      expiryDate: p.expiryDate?.split('T')[0] || '',
      manufactureDate: p.manufactureDate?.split('T')[0] || '',
      supplier: p.supplier || '', location: p.location || '', notes: p.notes || '',
    });
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editProduct) {
        const res = await productAPI.update(editProduct._id, form);
        setProducts(prev => prev.map(p => p._id === editProduct._id ? res.data : p));
        toast.success('Product updated!');
      } else {
        const res = await productAPI.add(form);
        setProducts(prev => [res.data, ...prev]);
        toast.success('Product added!');
      }
      setShowModal(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return;
    try {
      await productAPI.delete(id);
      setProducts(prev => prev.filter(p => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete product');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Products</h2>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500">
          <option value="">All Status</option>
          <option value="fresh">Fresh</option>
          <option value="expiring_soon">Expiring Soon</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-green-600 border-t-transparent" />
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No products found</p>
            <p className="text-sm mt-1">Add your first product to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                <tr>
                  <th className="px-5 py-3 text-left">Product</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-left">Qty</th>
                  <th className="px-5 py-3 text-left">Expiry Date</th>
                  <th className="px-5 py-3 text-left">Days Left</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => {
                  const days = Math.ceil((new Date(p.expiryDate) - new Date()) / (1000 * 60 * 60 * 24));
                  return (
                    <tr key={p._id} className="hover:bg-gray-50 transition">
                      <td className="px-5 py-3 font-medium text-gray-800">{p.name}</td>
                      <td className="px-5 py-3 text-gray-500">{p.category}</td>
                      <td className="px-5 py-3 text-gray-500">{p.quantity} {p.unit}</td>
                      <td className="px-5 py-3 text-gray-500">{new Date(p.expiryDate).toLocaleDateString()}</td>
                      <td className="px-5 py-3">
                        <span className={`font-semibold ${days < 0 ? 'text-red-600' : days <= 7 ? 'text-yellow-600' : 'text-green-600'}`}>
                          {days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[p.status]}`}>
                          {STATUS_LABELS[p.status]}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => openEdit(p)} className="text-blue-500 hover:text-blue-700">
                            <Pencil size={15} />
                          </button>
                          <button onClick={() => handleDelete(p._id)} className="text-red-500 hover:text-red-700">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold">{editProduct ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={() => setShowModal(false)}><X size={20} className="text-gray-500" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              {[
                { label: 'Product Name *', name: 'name', type: 'text', required: true, placeholder: 'e.g. Paracetamol 500mg' },
                { label: 'Barcode', name: 'barcode', type: 'text', placeholder: 'Scan or type barcode' },
                { label: 'Category', name: 'category', type: 'text', placeholder: 'e.g. Medicine, Food' },
                { label: 'Quantity *', name: 'quantity', type: 'number', required: true },
                { label: 'Unit', name: 'unit', type: 'text', placeholder: 'pcs, kg, litres' },
                { label: 'Expiry Date *', name: 'expiryDate', type: 'date', required: true },
                { label: 'Manufacture Date', name: 'manufactureDate', type: 'date' },
                { label: 'Supplier', name: 'supplier', type: 'text' },
                { label: 'Location (Shelf/Aisle)', name: 'location', type: 'text' },
              ].map(f => (
                <div key={f.name}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                  <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                    required={f.required} placeholder={f.placeholder}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                <textarea name="notes" value={form.notes} onChange={handleChange} rows={2}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg text-sm hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg text-sm font-medium transition disabled:opacity-60">
                  {saving ? 'Saving...' : editProduct ? 'Update' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
