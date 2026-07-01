import { Outlet, useNavigate, Link } from 'react-router-dom';
import { UserCircle, LogOut, BarChart } from 'lucide-react';
import { ShieldLockLogo } from '../ui/Logo';
import { useAuth } from '@/context/AuthContext';

// Etiquetas visuales por rol
const ROLE_LABELS = {
  'administrador':       'Administrador',
  'perito':             'Perito',
  'coordinador central': 'Coordinador Central',
  'coordinador':        'Coordinador',
  'mesa de entrada':    'Mesa de Entrada',
};

export default function MainLayout() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLabel = ROLE_LABELS[user?.role] ?? user?.role ?? 'Usuario';
  const displayName = user?.nombre ?? user?.email ?? 'Usuario';

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6 shadow-sm">
        {/* Left: Logo and System Name */}
        <div className="flex items-center gap-3">
          <div className="text-[#1f3e97]">
            <ShieldLockLogo className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-bold text-[#1f3e97]">Sistema de Pericias SGO</h1>
        </div>

        {/* Right: User Info and Logout */}
        <div className="flex items-center gap-4">
          {/* User info block */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#1f3e97] flex items-center justify-center shadow">
              <UserCircle className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="font-semibold text-sm text-gray-900 max-w-[180px] truncate">
                {displayName}
              </span>
              <span className="text-xs text-[#1f3e97] font-medium bg-blue-50 px-2 py-0.5 rounded-full w-fit">
                {roleLabel}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200" />

          {/* Estadísticas link */}
          <Link
            to="/estadistica"
            title="Estadísticas"
            className="flex items-center gap-1.5 text-gray-500 hover:text-blue-600 transition-colors group"
          >
            <BarChart className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium hidden sm:inline">Estadísticas</span>
          </Link>

          {/* Divider */}
          <div className="h-8 w-px bg-gray-200" />

          {/* Logout button */}
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 transition-colors group"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-medium hidden sm:inline">Salir</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-6 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
