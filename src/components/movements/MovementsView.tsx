import { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { supabase } from '../../lib/supabase';

export function MovementsView() {
  const [movements, setMovements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    loadMovements();
  }, [dateFilter]);

  const loadMovements = async () => {
    setLoading(true);

    let query = supabase
      .from('inventory_movements')
      .select('*, products(code, brand, model, type), profiles(full_name)')
      .order('created_at', { ascending: false });

    if (dateFilter) {
      query = query.gte('created_at', dateFilter).lte('created_at', dateFilter + 'T23:59:59');
    }

    const { data } = await query;
    if (data) setMovements(data);
    setLoading(false);
  };

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'entry':
        return <TrendingUp className="w-5 h-5 text-green-600" />;
      case 'exit':
        return <TrendingDown className="w-5 h-5 text-red-600" />;
      case 'adjustment':
        return <RefreshCw className="w-5 h-5 text-blue-600" />;
      default:
        return null;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'entry':
        return 'bg-green-100 text-green-700';
      case 'exit':
        return 'bg-red-100 text-red-700';
      case 'adjustment':
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getMovementLabel = (type: string) => {
    switch (type) {
      case 'entry':
        return 'Entrada';
      case 'exit':
        return 'Salida';
      case 'adjustment':
        return 'Ajuste';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">Cargando movimientos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Movimientos de Inventario</h1>
        <p className="text-slate-600 mt-1">Historial de entradas y salidas</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-slate-400" />
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:border-transparent"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Producto
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Cantidad
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Razón
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {movements.map((movement) => (
                <tr key={movement.id} className="hover:bg-slate-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      {getMovementIcon(movement.movement_type)}
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getMovementColor(
                          movement.movement_type
                        )}`}
                      >
                        {getMovementLabel(movement.movement_type)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {movement.products ? (
                      <div>
                        <p className="font-medium text-slate-900">
                          {movement.products.brand} {movement.products.model}
                        </p>
                        <p className="text-sm text-slate-600">
                          {movement.products.code} - {movement.products.type}
                        </p>
                      </div>
                    ) : (
                      <span className="text-slate-500">Producto eliminado</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-sm font-medium ${
                        movement.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {movement.quantity > 0 ? '+' : ''}
                      {movement.quantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900 capitalize">
                    {movement.reason}
                    {movement.notes && (
                      <p className="text-xs text-slate-500 mt-1">{movement.notes}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {movement.profiles?.full_name || 'Sistema'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {new Date(movement.created_at).toLocaleString('es-ES', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {movements.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-600">No hay movimientos registrados</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
