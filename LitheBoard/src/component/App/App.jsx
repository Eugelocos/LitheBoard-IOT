import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import Login from '../Login/login_page'; // Importa tu componente de login aquí
import DashboardPanel from './main_panel'; // Tu componente principal después de iniciar sesión
import Register from '../Login/register_page';
import "../../dashboards_panel.css"

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<DashboardPanel />} />
      </Routes>
    </Router>
  );
}

export default App;