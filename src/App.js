import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import HorasExtrasTab from "./components/HorasExtrasTab"; // Importa a página de RH
import WorkshiftProvider from "./context/WorkshiftContext";
import { UserProvider } from "./context/UserContext"; // Importa o UserProvider

// Componente para proteger rotas com base no papel do usuário
const ProtectedRoute = ({ children, requiredRole }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // Verificar se o usuário está autenticado
  if (!user?.authenticated) {
    return <Navigate to="/" replace />;
  }

  // Verificar se o usuário tem o papel necessário para acessar a rota
  if (requiredRole === "ADMIN" && !user.roles?.includes("ADMIN")) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requiredRole === "FUNCIONARIO" && !user.roles?.includes("FUNCIONARIO")) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App = () => {
  return (
    <UserProvider> {/* Envolvendo toda a aplicação com UserProvider */}
      <WorkshiftProvider>
        <Router>
          <Routes>
            {/* Página inicial (login e registro) */}
            <Route path="/" element={<LoginRegisterPage />} />

            {/* Rota protegida do Dashboard para funcionários */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute requiredRole="FUNCIONARIO">
                  <UserDashboard />
                </ProtectedRoute>
              }
            />

            {/* Rota protegida da Administração apenas para admins */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Rota protegida para RH (apenas ADMIN pode acessar) */}
            <Route
              path="/rh"
              element={
                <ProtectedRoute requiredRole="ADMIN">
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
