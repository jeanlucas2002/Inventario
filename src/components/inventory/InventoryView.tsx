import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Download, CreditCard as Edit, Trash2, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { ProductForm } from './ProductForm';

export function InventoryView() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterProducts();
  }, [products, searchTerm, typeFilter]);

  const loadData = async () => {
    setLoading(true);
    const [productsRes, suppliersRes] = await Promise.all([
      supabase.from('products').select('*, suppliers(name)').order('created_at', { ascending: false }),
      supabase.from('suppliers').select('*'),
    ]);

    if (productsRes.data) setProducts(productsRes.data);
    if (suppliersRes.data) setSuppliers(suppliersRes.data);
    setLoading(false);
  };

  const filterProducts = () => {
    let filtered = [...products];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.code.toLowerCase().includes(term) ||
          p.brand.toLowerCase().includes(term) ||
          p.model.toLowerCase().includes(term) ||
          p.suppliers?.name?.toLowerCase().includes(term)
      );
    }

    if (typeFilter) {
      filtered = filtered.filter((p) => p.type === typeFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    await supabase.from('products').delete().eq('id', id);
    loadData();
  };

  const exportToCSV = () => {
    const headers = ['Código', 'Tipo', 'Marca', 'Modelo', 'Stock', 'Precio', 'Proveedor'];
    const rows = filteredProducts.map((p) => [
      p.code,
      p.type,
      p.brand,
      p.model,
      p.stock,
      p.unit_price,
      p.suppliers?.name || 'N/A',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventario_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const uniqueTypes = Array.from(new Set(products.map((p) => p.type)));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">Cargando inventario...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Inventario</h1>
          <p className="text-slate-600 mt-1">Gestiona tus productos de autopartes</p>
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Producto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, marca, modelo o proveedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            >
              <option value="">Todos los tipos</option>
              {uniqueTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <button
              onClick={exportToCSV}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Exportar
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Código
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Stock
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Precio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Proveedor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.image_url ? (
                        <img
                          src={product.image_url}
                          alt={product.model}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs">
                          Sin foto
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-slate-900">
                          {product.brand} {product.model}
                        </div>
                        {product.year_range && (
                          <div className="text-sm text-slate-500">{product.year_range}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 font-mono">{product.code}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-slate-100 text-slate-700 rounded">
                      {product.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-slate-900">{product.stock}</span>
                      {product.stock <= product.min_stock && (
                        <AlertCircle className="w-4 h-4 text-red-500" title="Stock bajo" />
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    ${product.unit_price.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {product.suppliers?.name || 'N/A'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowForm(true);
                        }}
                        className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No se encontraron productos</p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditingProduct(null);
            loadData();
          }}
        />
      )}
    </div>
  );
}
