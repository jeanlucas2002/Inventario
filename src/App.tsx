import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './components/dashboard/DashboardView';
import { InventoryView } from './components/inventory/InventoryView';
import { SalesView } from './components/sales/SalesView';
import { SuppliersView } from './components/suppliers/SuppliersView';
import { ReportsView } from './components/reports/ReportsView';
import { MovementsView } from './components/movements/MovementsView';

function AppContent() {
  const { user, loading } = useAuth();
  const [currentView, setCurrentView] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-slate-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'inventory':
        return <InventoryView />;
      case 'sales':
        return <SalesView />;
      case 'suppliers':
        return <SuppliersView />;
      case 'reports':
        return <ReportsView />;
      case 'movements':
        return <MovementsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 p-8 overflow-auto">
        {renderView()}
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
