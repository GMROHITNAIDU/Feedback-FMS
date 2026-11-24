import { useState, useEffect } from 'react';
import { Package, Plus, Loader2, Pencil, Trash2, X, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';
import AdminPageHeader from '@/components/AdminPageHeader';
import type { Product } from '@/types';

export default function AdminProductsPage() {
  const toast = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  async function loadProducts() {
    const { data, error } = await api.from('products').select('*').order('name');
    if (error) {
      toast('Failed to load products', 'error');
      setLoading(false);
      return;
    }
    setProducts(data as Product[]);
    setLoading(false);
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function openCreate() {
    setEditing(null);
    setName('');
    setDescription('');
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setName(product.name);
    setDescription(product.description ?? '');
    setShowForm(true);
  }

  async function handleSave() {
    if (!name.trim()) {
      toast('Product name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editing) {
        const { error } = await api
          .from('products')
          .update({ name: name.trim(), description: description.trim() || null })
          .eq('id', editing.id);
        if (error) throw error;
        toast('Product updated successfully', 'success');
      } else {
        const { error } = await api
          .from('products')
          .insert({ name: name.trim(), description: description.trim() || null });
        if (error) throw error;
        toast('Product created successfully', 'success');
      }
      setShowForm(false);
      loadProducts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to save product';
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      const { error } = await api.from('products').delete().eq('id', confirmDelete.id);
      if (error) throw error;
      toast('Product deleted successfully', 'success');
      setConfirmDelete(null);
      loadProducts();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to delete product';
      toast(msg, 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <AdminPageHeader
        title="Products"
        description="Manage products that customers can submit feedback for."
        action={
          <button onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        }
      />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary-500" />
        </div>
      ) : products.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-neutral-100 mb-4">
            <Package className="h-7 w-7 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-1">No products yet</h3>
          <p className="text-sm text-neutral-500 mb-6">
            Add your first product so customers can start submitting feedback.
          </p>
          <button onClick={openCreate} className="btn-primary inline-flex">
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="card p-5 group hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                  <Package className="h-5 w-5 text-primary-600" />
                </div>
                <div className="flex gap-1 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(product)}
                    className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-primary-600 transition-colors"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(product)}
                    className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="font-semibold text-neutral-900 mb-1">{product.name}</h3>
              {product.description ? (
                <p className="text-sm text-neutral-500 leading-relaxed line-clamp-3">
                  {product.description}
                </p>
              ) : (
                <p className="text-sm text-neutral-400 italic">No description</p>
              )}
              <p className="text-xs text-neutral-400 mt-3">
                Added {new Date(product.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit modal */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 animate-fade-in"
          onClick={() => setShowForm(false)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-white shadow-xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-neutral-100">
              <h2 className="font-bold text-lg text-neutral-900">
                {editing ? 'Edit Product' : 'Add Product'}
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              >
                <X className="h-5 w-5 text-neutral-500" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="label-text">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="Product name"
                />
              </div>
              <div>
                <label className="label-text">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field resize-none"
                  placeholder="Brief product description..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-6 border-t border-neutral-100 bg-neutral-50">
              <button onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="btn-primary">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {editing ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 animate-fade-in"
          onClick={() => setConfirmDelete(null)}
        >
          <div
            className="w-full max-w-sm rounded-2xl bg-white shadow-xl animate-slide-up p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 mb-4">
              <Trash2 className="h-6 w-6 text-red-500" />
            </div>
            <h3 className="font-bold text-lg text-neutral-900 mb-2">Delete product?</h3>
            <p className="text-sm text-neutral-500 mb-6">
              Are you sure you want to delete "{confirmDelete.name}"? This will also delete
              all feedback associated with this product. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-500 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-red-600 active:scale-[0.98] disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
