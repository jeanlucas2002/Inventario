import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface ProductFormProps {
  product?: any;
  onClose: () => void;
  onSave: () => void;
}

export function ProductForm({ product, onClose, onSave }: ProductFormProps) {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    code: product?.code || '',
    image_url: product?.image_url || '',
    type: product?.type || '',
    brand: product?.brand || '',
    model: product?.model || '',
    year_range: product?.year_range || '',
    stock: product?.stock || 0,
    min_stock: product?.min_stock || 5,
    unit_price: product?.unit_price || 0,
    supplier_id: product?.supplier_id || '',
    warehouse_location: product?.warehouse_location || '',
    description: product?.description || '',
  });

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    const { data } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');
    if (data) setSuppliers(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (product) {
        await supabase
          .from('products')
          .update(formData)
          .eq('id', product.id);
      } else {
        await supabase.from('products').insert([formData]);
      }
      onSave();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
    }
  };

  const productTypes = [
    'Compresor',
    'Evaporador',
    'Condensador',
    'Válvula de Expansión',
    'Filtro Deshidratador',
    'Gas Refrigerante',
    'Mangueras',
    'Otros',
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Código del Producto *
              </label>
              <input
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de Producto *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
              >
                <option value="">Seleccionar...</option>
                {productTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Marca *
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Modelo *
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rango de Año
              </label>
              <input
                type="text"
                placeholder="Ej: 2015-2020"
                value={formData.year_range}
                onChange={(e) => setFormData({ ...formData, year_range: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stock Disponible *
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Stock Mínimo *
              </label>
              <input
                type="number"
                value={formData.min_stock}
                onChange={(e) => setFormData({ ...formData, min_stock: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Precio Unitario *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Proveedor
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="">Sin proveedor</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Ubicación en Almacén
              </label>
              <input
                type="text"
                placeholder="Ej: Estante A3"
                value={formData.warehouse_location}
                onChange={(e) => setFormData({ ...formData, warehouse_location: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                URL de Imagen
              </label>
              <input
                type="url"
                placeholder="https://ejemplo.com/imagen.jpg"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Guardando...' : 'Guardar Producto'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
