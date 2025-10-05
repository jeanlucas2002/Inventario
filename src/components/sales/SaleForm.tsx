import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Save, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface SaleFormProps {
  onClose: () => void;
  onSave: () => void;
}

interface SaleItem {
  product_id: string;
  product_code: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total: number;
  available_stock: number;
}

export function SaleForm({ onClose, onSave }: SaleFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('efectivo');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      setFilteredProducts(
        products.filter(
          (p) =>
            p.code.toLowerCase().includes(term) ||
            p.brand.toLowerCase().includes(term) ||
            p.model.toLowerCase().includes(term)
        )
      );
    } else {
      setFilteredProducts([]);
    }
  }, [searchTerm, products]);

  const loadProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .gt('stock', 0)
      .order('brand');
    if (data) setProducts(data);
  };

  const addProduct = (product: any) => {
    const existingItem = items.find((item) => item.product_id === product.id);

    if (existingItem) {
      if (existingItem.quantity < product.stock) {
        setItems(
          items.map((item) =>
            item.product_id === product.id
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                  total: (item.quantity + 1) * item.unit_price,
                }
              : item
          )
        );
      }
    } else {
      setItems([
        ...items,
        {
          product_id: product.id,
          product_code: product.code,
          product_name: `${product.type} ${product.brand} ${product.model}`,
          quantity: 1,
          unit_price: product.unit_price,
          total: product.unit_price,
          available_stock: product.stock,
        },
      ]);
    }

    setSearchTerm('');
  };

  const removeItem = (productId: string) => {
    setItems(items.filter((item) => item.product_id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setItems(
      items.map((item) =>
        item.product_id === productId
          ? { ...item, quantity, total: quantity * item.unit_price }
          : item
      )
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const total = subtotal - discount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      alert('Debe agregar al menos un producto');
      return;
    }

    if (!customerName.trim()) {
      alert('Debe ingresar el nombre del cliente');
      return;
    }

    setLoading(true);

    try {
      const { data: saleNumberData } = await supabase.rpc('generate_sale_number');

      const { data: saleData, error: saleError } = await supabase
        .from('sales')
        .insert([
          {
            sale_number: saleNumberData,
            customer_name: customerName,
            subtotal,
            discount,
            total,
            payment_method: paymentMethod,
            notes,
            created_by: user?.id,
          },
        ])
        .select()
        .single();

      if (saleError) throw saleError;

      const saleItems = items.map((item) => ({
        sale_id: saleData.id,
        product_id: item.product_id,
        product_code: item.product_code,
        product_name: item.product_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      }));

      const { error: itemsError } = await supabase.from('sale_items').insert(saleItems);

      if (itemsError) throw itemsError;

      onSave();
    } catch (error) {
      console.error('Error creating sale:', error);
      alert('Error al crear la venta. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900">Nueva Venta</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Cliente *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Método de Pago *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              >
                <option value="efectivo">Efectivo</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="transferencia">Transferencia</option>
                <option value="cheque">Cheque</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Buscar Producto
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por código, marca o modelo..."
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            </div>

            {filteredProducts.length > 0 && (
              <div className="mt-2 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {filteredProducts.map((product) => (
                  <button
                    key={product.id}
                    type="button"
                    onClick={() => addProduct(product)}
                    className="w-full px-4 py-3 text-left hover:bg-slate-50 transition border-b border-slate-100 last:border-0"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-slate-900">
                          {product.brand} {product.model}
                        </p>
                        <p className="text-sm text-slate-600">
                          {product.code} - {product.type}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-slate-900">${product.unit_price}</p>
                        <p className="text-xs text-slate-500">Stock: {product.stock}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <h3 className="font-semibold text-slate-900 mb-4">Productos en Venta</h3>

            {items.length === 0 ? (
              <p className="text-slate-600 text-center py-8">
                No hay productos agregados
              </p>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product_id}
                    className="bg-white p-4 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{item.product_name}</p>
                        <p className="text-sm text-slate-600">{item.product_code}</p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div>
                          <label className="block text-xs text-slate-600 mb-1">Cantidad</label>
                          <input
                            type="number"
                            min="1"
                            max={item.available_stock}
                            value={item.quantity}
                            onChange={(e) =>
                              updateQuantity(item.product_id, parseInt(e.target.value))
                            }
                            className="w-20 px-3 py-1 border border-slate-300 rounded text-center"
                          />
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-600">Precio Unit.</p>
                          <p className="font-medium text-slate-900">
                            ${item.unit_price.toFixed(2)}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-slate-600">Total</p>
                          <p className="font-bold text-slate-900">${item.total.toFixed(2)}</p>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(item.product_id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-700">Subtotal:</span>
              <span className="text-xl font-semibold text-slate-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label className="text-slate-700">Descuento:</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max={subtotal}
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-32 px-3 py-2 border border-slate-300 rounded-lg text-right"
              />
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-300">
              <span className="text-lg font-medium text-slate-900">Total:</span>
              <span className="text-2xl font-bold text-slate-900">${total.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={loading || items.length === 0}
              className="flex-1 bg-slate-900 text-white py-3 rounded-lg font-medium hover:bg-slate-800 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {loading ? 'Procesando...' : 'Completar Venta'}
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
