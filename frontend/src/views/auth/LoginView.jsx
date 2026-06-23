import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldLockLogo } from '@/components/ui/Logo';
import { supabase } from '@/lib/supabase';
import { apiClient } from '@/api/client';

export default function LoginView() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // ===== DEBUG INICIO =====
      const emailEnviado = username.trim().toLowerCase();
      console.log('--- [DEBUG LOGIN] ---');
      console.log('Email exacto enviado a Supabase Auth:', JSON.stringify(emailEnviado));
      console.log('Password length:', password.length);
      console.log('Supabase URL configurada:', import.meta.env.VITE_SUPABASE_URL);
      console.log('Anon Key (primeros 20 chars):', import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0, 20));
      // ===== FIN DEBUG =====

      // PASO 1: Autenticar con Supabase Auth directamente desde el frontend.
      // Esto es correcto: la anon key del frontend está diseñada para esto.
      // El backend no puede hacer signInWithPassword con la service role key.
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailEnviado,
        password: password,
      });

      // ===== DEBUG RESULTADO AUTH =====
      console.log('authData:', JSON.stringify(authData, null, 2));
      console.log('authError:', JSON.stringify(authError, null, 2));
      // ===== FIN DEBUG =====

      if (authError) {
        console.error('[DEBUG] Fallo en signInWithPassword:', authError.message, '| Status:', authError.status, '| Code:', authError.code);
        setError(`Credenciales incorrectas. (Debug: ${authError.message})`);
        return;
      }


      const correoAutenticado = authData.user.email;

      // PASO 2: Con el usuario autenticado, pedir el perfil y rol al backend.
      // El backend consulta la tabla pública "usuarios" por correo y devuelve el rol.
      const response = await apiClient.get(`/usuarios/perfil?correo=${encodeURIComponent(correoAutenticado)}`);
      const { role } = response.data;
      const normalizedRole = role?.toLowerCase();

      // PASO 3: Redirigir según el rol devuelto por el backend
      switch (normalizedRole) {
        case 'administrador':
          navigate('/usuarios');
          break;
        case 'perito':
          navigate('/perito-dashboard');
          break;
        case 'coordinador central':
        case 'coordinador':
          navigate('/monitoreo');
          break;
        case 'mesa de entrada':
          navigate('/mesa-entrada-dashboard');
          break;
        default:
          navigate('/');
          break;
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Ocurrió un error al iniciar sesión';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
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

            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm text-center font-medium border border-red-200">
                {error}
              </div>
            )}

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
                className="h-12 bg-gray-50 border-gray-200 rounded-xl px-4 text-base focus-visible:ring-blue-600 disabled:opacity-60"
                required
                disabled={isLoading}
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
                className="h-12 bg-gray-50 border-gray-200 rounded-xl px-4 text-base focus-visible:ring-blue-600 disabled:opacity-60"
                required
                disabled={isLoading}
              />
            </div>

            <div className="pt-4 flex justify-center">
              <Button
                type="submit"
                className="w-4/5 bg-[#24429e] hover:bg-blue-800 text-white rounded-full h-12 text-base font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                disabled={isLoading}
              >
                {isLoading ? 'INICIANDO SESIÓN...' : 'INICIAR SESIÓN'}
              </Button>
            </div>

          </form>
        </CardContent>
      </Card>
    </div>
  );
}
