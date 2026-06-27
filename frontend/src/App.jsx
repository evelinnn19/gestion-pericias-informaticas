import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import MainLayout from './components/layout/MainLayout';
import LoginOptionsView from './views/auth/LoginOptionsView';
import LoginView from './views/auth/LoginView';
import CargaOficioView from './views/dashboard/CargaOficioView';
import MonitorioView from './views/dashboard/MonitorioView';
import UsuariosView from './views/dashboard/UsuariosView';
import PeritoDashboardView from './views/dashboard/PeritoDashboardView';
import MesaEntradaDashboardView from './views/dashboard/MesaEntradaDashboardView';
import { Toaster } from 'sonner';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth Routes — públicas */}
          <Route path="/" element={<LoginOptionsView />} />
          <Route path="/login" element={<LoginView />} />

          {/* Dashboard Routes — protegidas por rol */}
          <Route element={<MainLayout />}>
            <Route
              path="/carga-oficio"
              element={
                <ProtectedRoute>
                  <CargaOficioView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/monitorio"
              element={
                <ProtectedRoute>
                  <MonitorioView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/usuarios"
              element={
                <ProtectedRoute>
                  <UsuariosView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/perito-dashboard"
              element={
                <ProtectedRoute>
                  <PeritoDashboardView />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mesa-entrada-dashboard"
              element={
                <ProtectedRoute>
                  <MesaEntradaDashboardView />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
    </AuthProvider>
  );
}

export default App;

