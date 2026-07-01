import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, ROLE_ROUTES, ROLE_HOME } from '@/context/AuthContext';

/**
 * ProtectedRoute — envuelve rutas que requieren autenticación y un rol específico.
 *
 * Si no hay sesión       → redirige a /login
 * Si el rol no permite   → redirige a la home de su rol
 */
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f3f4f6]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1f3e97] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#1f3e97] font-semibold">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Verificar que el rol tenga acceso a esta ruta
  const allowedPaths = ROLE_ROUTES[user.role] ?? [];
  const hasAccess = allowedPaths.includes(location.pathname);

  if (!hasAccess) {
    const homePath = ROLE_HOME[user.role] ?? '/login';
    return <Navigate to={homePath} replace />;
  }

  return children;
}
