import { useState, useEffect } from 'react';
import { Plus, Search, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SaleForm } from './SaleForm';

export function SalesView() {
  const [sales, setSales] = useState<any[]>([]);
  const [filteredSales, setFilteredSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    loadSales();
  }, []);

  useEffect(() => {
    filterSales();
  }, [sales, searchTerm, dateFilter]);

  const loadSales = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('sales')
      .select('*, sale_items(*)')
      .order('created_at', { ascending: false });

    if (data) setSales(data);
    setLoading(false);
  };

  const filterSales = () => {
    let filtered = [...sales];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.sale_number.toLowerCase().includes(term) ||
          s.customer_name.toLowerCase().includes(term)
      );
    }

    if (dateFilter) {
      filtered = filtered.filter((s) => s.created_at.startsWith(dateFilter));
    }

    setFilteredSales(filtered);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">Cargando ventas...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Ventas</h1>
          <p className="text-slate-600 mt-1">Registra y consulta tus ventas</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nueva Venta
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por número de venta o cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  N° Venta
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Productos
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Subtotal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Descuento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Método de Pago
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4 text-sm font-mono text-slate-900 font-medium">
                    {sale.sale_number}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">{sale.customer_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {sale.sale_items?.length || 0} items
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    ${sale.subtotal.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 text-sm text-red-600">
                    {sale.discount > 0 ? `-$${sale.discount.toFixed(2)}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    ${sale.total.toFixed(2)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                      {sale.payment_method}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(sale.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredSales.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No se encontraron ventas</p>
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <SaleForm
          onClose={() => setShowForm(false)}
          onSave={() => {
            setShowForm(false);
            loadSales();
          }}
        />
      )}
    </div>
  );
}
