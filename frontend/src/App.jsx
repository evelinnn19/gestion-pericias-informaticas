import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import LoginOptionsView from './views/auth/LoginOptionsView';
import LoginView from './views/auth/LoginView';
import CargaOficioView from './views/dashboard/CargaOficioView';
import MonitorioView from './views/dashboard/MonitorioView';
import UsuariosView from './views/dashboard/UsuariosView';
import PeritoDashboardView from './views/dashboard/PeritoDashboardView';
import MesaEntradaDashboardView from './views/dashboard/MesaEntradaDashboardView';

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth Routes */}
        <Route path="/" element={<LoginOptionsView />} />
        <Route path="/login" element={<LoginView />} />
        
        {/* Dashboard Routes with Layout */}
        <Route element={<MainLayout />}>
          <Route path="/carga-oficio" element={<CargaOficioView />} />
          <Route path="/monitorio" element={<MonitorioView />} />
          <Route path="/usuarios" element={<UsuariosView />} />
          <Route path="/perito-dashboard" element={<PeritoDashboardView />} />
          <Route path="/mesa-entrada-dashboard" element={<MesaEntradaDashboardView />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
