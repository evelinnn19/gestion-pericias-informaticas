import { Outlet, useNavigate } from 'react-router-dom';
import { UserCircle, LogOut } from 'lucide-react';
import { ShieldLockLogo } from '../ui/Logo';

export default function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Implement logout logic here
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f3f4f6]">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-6">
        {/* Left: Logo and System Name */}
        <div className="flex items-center gap-3">
          <div className="text-[#1f3e97]">
            <ShieldLockLogo className="w-10 h-10" />
          </div>
          <h1 className="text-xl font-bold text-[#1f3e97]">Sistema de Pericias SGO</h1>
        </div>

        {/* Right: User Role and Actions */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#1f3e97]">
            <UserCircle className="w-8 h-8" />
            <span className="font-semibold text-lg">Mesa de Entrada</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-[#1f3e97] hover:text-blue-800 transition-colors"
          >
            <LogOut className="w-6 h-6" />
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
