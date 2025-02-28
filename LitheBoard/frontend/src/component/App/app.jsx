import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Login from "../Login/login_page"; // Importa tu componente de login aquí
import Register from "../Login/register_page";
import "../../dashboards_panel.css";
import LoadingIndicator from "../loading_indicator.jsx"

const DashboardPanel = lazy(() => import("./main_panel"));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <Suspense fallback={<LoadingIndicator />}>
              <DashboardPanel />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
