import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import HorasExtrasTab from "./components/HorasExtrasTab"; 
import WorkshiftProvider from "./context/WorkshiftContext";
import { UserProvider } from "./context/UserContext"; 

// Componente para proteger rotas com base no papel do usuário
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Verificar se o usuário está autenticado
  if (!user?.authenticated) {
    return <Navigate to="/" replace />;
  }

  // Garante que roles seja um array válido
  const userRoles = Array.isArray(user.roles) ? user.roles : [];

  // Verifica se o usuário tem permissão
  if (!userRoles.some(role => allowedRoles.includes(role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <UserProvider> 
      <WorkshiftProvider>
        <Router>
          <Routes>
            {/* Página inicial (login e registro) */}
            <Route path="/" element={<LoginRegisterPage />} />

            {/* Dashboard acessível para ADMIN e FUNCIONARIO */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute allowedRoles={["ADMIN", "FUNCIONARIO"]}>
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* Dashboard exclusivo para ADMIN */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Página de RH (somente ADMIN pode acessar) */}
            <Route
              path="/rh"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <HorasExtrasTab />
                </ProtectedRoute>
              }
            />

            {/* Redirecionamento para a página inicial caso a rota não exista */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </WorkshiftProvider>
    </UserProvider>
  );
};

export default App;
