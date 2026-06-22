import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldLockLogo } from '@/components/ui/Logo';

export default function LoginOptionsView() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl flex flex-col items-center">
        {/* Logo */}
        <div className="text-[#1f3e97] mb-6">
          <ShieldLockLogo className="w-40 h-40" />
        </div>

        {/* Titles */}
        <h1 className="text-5xl md:text-6xl font-extrabold text-[#1f3e97] text-center tracking-tight mb-2">
          Sistema de Pericias SGO
        </h1>
        <h2 className="text-lg md:text-xl font-semibold text-gray-500 text-center mb-12">
          División de Informática – Ministerio Público Fiscal
        </h2>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-sm">
          <Button 
            className="w-full bg-[#1f3e97] hover:bg-blue-800 text-white rounded-full h-12 text-base font-semibold"
            onClick={() => navigate('/login')}
          >
            INICIAR SESIÓN
          </Button>

          <Button 
            variant="outline" 
            className="w-full rounded-full h-12 flex items-center justify-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-medium"
            onClick={() => { /* Implement Google Auth */ }}
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Iniciar Sesión con Google
          </Button>

          <Button 
            variant="outline" 
            className="w-full rounded-full h-12 flex items-center justify-center gap-2 border-gray-300 text-gray-600 hover:bg-gray-50 font-medium"
            onClick={() => { /* Implement Microsoft Auth */ }}
          >
            <svg viewBox="0 0 21 21" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 0H0V10H10V0Z" fill="#F25022"/>
              <path d="M21 0H11V10H21V0Z" fill="#7FBA00"/>
              <path d="M10 11H0V21H10V11Z" fill="#00A4EF"/>
              <path d="M21 11H11V21H21V11Z" fill="#FFB900"/>
            </svg>
            Iniciar Sesión con Microsoft
          </Button>
        </div>
      </div>
    </div>
  );
}
