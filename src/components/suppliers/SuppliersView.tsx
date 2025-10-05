import { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, Phone, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SupplierForm } from './SupplierForm';

export function SuppliersView() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);

  useEffect(() => {
    loadSuppliers();
  }, []);

  const loadSuppliers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('suppliers')
      .select('*')
      .order('name');
    if (data) setSuppliers(data);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este proveedor?')) return;

    await supabase.from('suppliers').delete().eq('id', id);
    loadSuppliers();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-600">Cargando proveedores...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Proveedores</h1>
          <p className="text-slate-600 mt-1">Gestiona tu red de proveedores</p>
        </div>
        <button
          onClick={() => {
            setEditingSupplier(null);
            setShowForm(true);
          }}
          className="bg-slate-900 text-white px-6 py-3 rounded-lg font-medium hover:bg-slate-800 transition flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Nuevo Proveedor
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suppliers.map((supplier) => (
          <div
            key={supplier.id}
            className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">{supplier.name}</h3>
                {supplier.contact_person && (
                  <p className="text-sm text-slate-600">{supplier.contact_person}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingSupplier(supplier);
                    setShowForm(true);
                  }}
                  className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(supplier.id)}
                  className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {supplier.phone && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Phone className="w-4 h-4" />
                  <span>{supplier.phone}</span>
                </div>
              )}
              {supplier.email && (
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <Mail className="w-4 h-4" />
                  <span>{supplier.email}</span>
                </div>
              )}
              {supplier.address && (
                <p className="text-sm text-slate-600 mt-2">{supplier.address}</p>
              )}
              {supplier.notes && (
                <p className="text-sm text-slate-500 italic mt-2 pt-2 border-t border-slate-100">
                  {supplier.notes}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {suppliers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center">
          <p className="text-slate-600">No hay proveedores registrados</p>
        </div>
      )}

      {showForm && (
        <SupplierForm
          supplier={editingSupplier}
          onClose={() => {
            setShowForm(false);
            setEditingSupplier(null);
          }}
          onSave={() => {
            setShowForm(false);
            setEditingSupplier(null);
            loadSuppliers();
          }}
        />
      )}
    </div>
  );
}
