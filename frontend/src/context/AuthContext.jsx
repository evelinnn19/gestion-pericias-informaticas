import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// Mapeo de roles a rutas permitidas
export const ROLE_ROUTES = {
  'administrador':       ['/usuarios'],
  'perito':             ['/perito-dashboard'],
  'coordinador central': ['/monitorio'],
  'coordinador':        ['/monitorio'],
  'mesa de entrada':    ['/mesa-entrada-dashboard', '/carga-oficio'],
};

// Ruta de inicio por rol
export const ROLE_HOME = {
  'administrador':       '/usuarios',
  'perito':             '/perito-dashboard',
  'coordinador central': '/monitorio',
  'coordinador':        '/monitorio',
  'mesa de entrada':    '/mesa-entrada-dashboard',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // { email, nombre, role }
  const [loading, setLoading] = useState(true); // mientras se verifica sesión inicial

  // Verificar si hay sesión activa al cargar la app
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          // Intentar restaurar datos guardados en sessionStorage
          const stored = sessionStorage.getItem('auth_user');
          if (stored) {
            setUser(JSON.parse(stored));
          }
        }
      } catch (err) {
        console.error('Error al restaurar sesión:', err);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    // Escuchar cambios de sesión (ej: expiración de token)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        sessionStorage.removeItem('auth_user');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback((userData) => {
    // userData: { email, nombre, role }
    const normalizedUser = {
      ...userData,
      role: userData.role?.toLowerCase(),
    };
    setUser(normalizedUser);
    sessionStorage.setItem('auth_user', JSON.stringify(normalizedUser));
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    sessionStorage.removeItem('auth_user');
  }, []);

  const canAccess = useCallback((path) => {
    if (!user) return false;
    const allowed = ROLE_ROUTES[user.role] ?? [];
    return allowed.includes(path);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, canAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
