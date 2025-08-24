// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom"; // ✅ Adicione `Navigate` aqui
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import AnaliseSKUPage from "../pages/AnaliseSKUPage";
import ProtectedRoute from "../components/ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/analise-sku"
        element={
          <ProtectedRoute>
            <AnaliseSKUPage />
          </ProtectedRoute>
        }
      />
      {/* Redireciona qualquer rota inválida para o dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
