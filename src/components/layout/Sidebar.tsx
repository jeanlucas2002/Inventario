import { LayoutDashboard, Package, ShoppingCart, Users, TrendingUp, Settings, LogOut, PackageSearch } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const { signOut, profile } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventario', icon: Package },
    { id: 'sales', label: 'Ventas', icon: ShoppingCart },
    { id: 'suppliers', label: 'Proveedores', icon: Users },
    { id: 'reports', label: 'Reportes', icon: TrendingUp },
    { id: 'movements', label: 'Movimientos', icon: PackageSearch },
  ];

  return (
    <div className="bg-slate-900 text-white w-64 min-h-screen flex flex-col">
      <div className="p-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-slate-700 p-2 rounded-lg">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg">AutoParts</h1>
            <p className="text-xs text-slate-400">Gestión de Inventario</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                currentView === item.id
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 space-y-2">
        <div className="px-4 py-2">
          <p className="text-sm font-medium text-white">{profile?.full_name}</p>
          <p className="text-xs text-slate-400">{profile?.email}</p>
          <span className="inline-block mt-1 px-2 py-1 bg-slate-700 text-slate-300 text-xs rounded">
            {profile?.role}
          </span>
        </div>
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
}
