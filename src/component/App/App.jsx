import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import Login from '../Login/LoginPage'; // Importa tu componente de login aquí
import DashboardPanel from './MainPanel'; // Tu componente principal después de iniciar sesión
import Register from '../Login/RegisterPage';
import "../../DashboardsPanel.css"

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