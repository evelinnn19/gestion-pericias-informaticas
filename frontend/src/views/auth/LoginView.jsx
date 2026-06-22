import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldLockLogo } from '@/components/ui/Logo';

export default function LoginView() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    // Simulate login logic, then redirect
    navigate('/carga-oficio');
  };

  return (
    <div className="min-h-screen bg-[#24429e] flex flex-col items-center justify-center p-6">
      
      {/* Logo and Title */}
      <div className="flex flex-col items-center mb-8">
        <div className="text-white mb-4">
          <ShieldLockLogo className="w-32 h-32" />
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-white">
          Portal de Autenticación
        </h1>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md rounded-2xl shadow-xl">
        <CardContent className="pt-8 pb-8 px-8">
          <form onSubmit={handleLogin} className="space-y-6">
            
            <div className="space-y-2">
              <Label htmlFor="username" className="text-base font-semibold text-gray-900">
                Usuario
              </Label>
              <Input 
                id="username" 
                type="text" 
                placeholder="Ingrese su nombre de usuario" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 rounded-xl px-4 text-base focus-visible:ring-blue-600"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base font-semibold text-gray-900">
                Contraseña
              </Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="Ingrese su contraseña" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 bg-gray-50 border-gray-200 rounded-xl px-4 text-base focus-visible:ring-blue-600"
                required
              />
            </div>

            <div className="pt-4 flex justify-center">
              <Button 
                type="submit" 
                className="w-4/5 bg-[#24429e] hover:bg-blue-800 text-white rounded-full h-12 text-base font-semibold"
              >
                INICIAR SESIÓN
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
