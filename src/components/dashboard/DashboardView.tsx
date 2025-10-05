import { useEffect, useState } from 'react';
import { Package, DollarSign, AlertTriangle, TrendingUp, ShoppingCart } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Stats {
  totalProducts: number;
  totalStock: number;
  lowStockProducts: number;
  inventoryValue: number;
  monthlySales: number;
}

export function DashboardView() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalStock: 0,
    lowStockProducts: 0,
    inventoryValue: 0,
    monthlySales: 0,
  });
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);

    const [productsRes, salesRes] = await Promise.all([
      supabase.from('products').select('*'),
      supabase
        .from('sales')
        .select('*, sale_items(*)')
        .order('created_at', { ascending: false })
        .limit(5),
    ]);

    if (productsRes.data) {
      const products = productsRes.data;
      const totalProducts = products.length;
      const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
      const lowStockProducts = products.filter((p) => p.stock <= p.min_stock).length;
      const inventoryValue = products.reduce((sum, p) => sum + p.stock * p.unit_price, 0);

      const lowStock = products
        .filter((p) => p.stock <= p.min_stock)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);

      setStats({
        totalProducts,
        totalStock,
        lowStockProducts,
        inventoryValue,
        monthlySales: 0,
      });

      setLowStockItems(lowStock);
    }

    if (salesRes.data) {
      setRecentSales(salesRes.data);

      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthlySalesTotal = salesRes.data
        .filter((sale) => new Date(sale.created_at) >= firstDayOfMonth)
        .reduce((sum, sale) => sum + sale.total, 0);

      setStats((prev) => ({ ...prev, monthlySales: monthlySalesTotal }));

      const productSales = new Map<string, { name: string; quantity: number }>();
      salesRes.data.forEach((sale) => {
        sale.sale_items?.forEach((item: any) => {
          const current = productSales.get(item.product_code) || {
            name: item.product_name,
            quantity: 0,
          };
          productSales.set(item.product_code, {
            name: current.name,
            quantity: current.quantity + item.quantity,
          });
        });
      });

      const topProductsArray = Array.from(productSales.entries())
        .map(([code, data]) => ({ code, ...data }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 5);

      setTopProducts(topProductsArray);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">Cargando dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-600 mt-1">Resumen general de tu inventario</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Total Productos</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalProducts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Stock Total</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{stats.totalStock}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Stock Bajo</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.lowStockProducts}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Valor Inventario</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">
                ${stats.inventoryValue.toFixed(0)}
              </p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-red-100 p-2 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Alertas de Stock Bajo</h2>
          </div>

          {lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {lowStockItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200"
                >
                  <div>
                    <p className="font-medium text-slate-900">
                      {item.brand} {item.model}
                    </p>
                    <p className="text-sm text-slate-600">{item.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-red-600">{item.stock}</p>
                    <p className="text-xs text-slate-500">Min: {item.min_stock}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">No hay productos con stock bajo</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-green-100 p-2 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Productos Más Vendidos</h2>
          </div>

          {topProducts.length > 0 ? (
            <div className="space-y-3">
              {topProducts.map((item, index) => (
                <div
                  key={item.code}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-600">{item.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-slate-900">{item.quantity}</p>
                    <p className="text-xs text-slate-500">unidades</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-slate-600 text-center py-8">No hay datos de ventas</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-slate-100 p-2 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-slate-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Ventas Recientes</h2>
        </div>

        {recentSales.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                    N° Venta
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-slate-600">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {recentSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-mono text-slate-900">
                      {sale.sale_number}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">{sale.customer_name}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      ${sale.total.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(sale.created_at).toLocaleDateString('es-ES')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-slate-600 text-center py-8">No hay ventas registradas</p>
        )}
      </div>
    </div>
  );
}
