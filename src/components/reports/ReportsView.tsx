import { useState, useEffect } from 'react';
import { Download, TrendingUp, Package, Users, DollarSign } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function ReportsView() {
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [salesData, setSalesData] = useState<any[]>([]);
  const [inventoryData, setInventoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    setDateFrom(firstDay.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (dateFrom && dateTo) {
      loadReports();
    }
  }, [dateFrom, dateTo]);

  const loadReports = async () => {
    setLoading(true);

    const { data: sales } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo + 'T23:59:59');

    const { data: products } = await supabase
      .from('products')
      .select('*, suppliers(name)');

    if (sales) setSalesData(sales);
    if (products) setInventoryData(products);
    setLoading(false);
  };

  const totalSales = salesData.reduce((sum, sale) => sum + sale.total, 0);
  const totalDiscount = salesData.reduce((sum, sale) => sum + sale.discount, 0);
  const averageSale = salesData.length > 0 ? totalSales / salesData.length : 0;

  const productsSold = new Map<string, { name: string; quantity: number; revenue: number }>();
  salesData.forEach((sale) => {
    sale.sale_items?.forEach((item: any) => {
      const current = productsSold.get(item.product_code) || {
        name: item.product_name,
        quantity: 0,
        revenue: 0,
      };
      productsSold.set(item.product_code, {
        name: current.name,
        quantity: current.quantity + item.quantity,
        revenue: current.revenue + item.total,
      });
    });
  });

  const topProducts = Array.from(productsSold.entries())
    .map(([code, data]) => ({ code, ...data }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10);

  const inventoryValue = inventoryData.reduce((sum, p) => sum + p.stock * p.unit_price, 0);
  const lowStockCount = inventoryData.filter((p) => p.stock <= p.min_stock).length;

  const exportSalesReport = () => {
    const headers = ['N° Venta', 'Fecha', 'Cliente', 'Subtotal', 'Descuento', 'Total', 'Método Pago'];
    const rows = salesData.map((s) => [
      s.sale_number,
      new Date(s.created_at).toLocaleDateString('es-ES'),
      s.customer_name,
      s.subtotal,
      s.discount,
      s.total,
      s.payment_method,
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    downloadCSV(csv, `ventas_${dateFrom}_${dateTo}.csv`);
  };

  const exportInventoryReport = () => {
    const headers = ['Código', 'Tipo', 'Marca', 'Modelo', 'Stock', 'Stock Mín', 'Precio', 'Valor Total', 'Proveedor'];
    const rows = inventoryData.map((p) => [
      p.code,
      p.type,
      p.brand,
      p.model,
      p.stock,
      p.min_stock,
      p.unit_price,
      (p.stock * p.unit_price).toFixed(2),
      p.suppliers?.name || 'N/A',
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    downloadCSV(csv, `inventario_${new Date().toISOString().split('T')[0]}.csv`);
  };

  const exportTopProductsReport = () => {
    const headers = ['Código', 'Producto', 'Cantidad Vendida', 'Ingresos'];
    const rows = topProducts.map((p) => [
      p.code,
      p.name,
      p.quantity,
      p.revenue.toFixed(2),
    ]);

    const csv = [headers, ...rows].map((row) => row.join(',')).join('\n');
    downloadCSV(csv, `productos_mas_vendidos_${dateFrom}_${dateTo}.csv`);
  };

  const downloadCSV = (csv: string, filename: string) => {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Reportes</h1>
        <p className="text-slate-600 mt-1">Analiza el rendimiento de tu negocio</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fecha Desde
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Fecha Hasta
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <button
            onClick={loadReports}
            disabled={loading}
            className="px-6 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition disabled:opacity-50"
          >
            {loading ? 'Cargando...' : 'Generar Reportes'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Ventas Totales</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                ${totalSales.toFixed(2)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">N° de Ventas</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">{salesData.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Venta Promedio</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                ${averageSale.toFixed(2)}
              </p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 font-medium">Valor Inventario</p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                ${inventoryValue.toFixed(0)}
              </p>
            </div>
            <div className="bg-slate-100 p-3 rounded-lg">
              <Package className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Reporte de Ventas</h2>
            <button
              onClick={exportSalesReport}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Exportar a CSV"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Ventas:</span>
              <span className="font-semibold text-slate-900">{salesData.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Ingresos:</span>
              <span className="font-semibold text-green-600">${totalSales.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Descuentos:</span>
              <span className="font-semibold text-red-600">${totalDiscount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Venta Promedio:</span>
              <span className="font-semibold text-slate-900">${averageSale.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Reporte de Inventario</h2>
            <button
              onClick={exportInventoryReport}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Exportar a CSV"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Total Productos:</span>
              <span className="font-semibold text-slate-900">{inventoryData.length}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-600">Stock Bajo:</span>
              <span className="font-semibold text-red-600">{lowStockCount}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-slate-600">Valor Total:</span>
              <span className="font-semibold text-green-600">${inventoryValue.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Top Productos</h2>
            <button
              onClick={exportTopProductsReport}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Exportar a CSV"
            >
              <Download className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {topProducts.slice(0, 5).map((product, index) => (
              <div key={product.code} className="flex items-center justify-between py-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-600">
                    {index + 1}
                  </span>
                  <span className="text-sm text-slate-900">{product.name}</span>
                </div>
                <span className="text-sm font-semibold text-slate-900">{product.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {topProducts.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-slate-900">Productos Más Vendidos (Detalle)</h2>
            <button
              onClick={exportTopProductsReport}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
            >
              <Download className="w-5 h-5" />
              Exportar
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Código</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Producto</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Cantidad</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 uppercase">Ingresos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {topProducts.map((product, index) => (
                  <tr key={product.code} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm text-slate-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-900">{product.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{product.name}</td>
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{product.quantity}</td>
                    <td className="px-4 py-3 text-sm font-medium text-green-600">
                      ${product.revenue.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
