// src/routes/AppRoutes.jsx
import { Routes, Route, Navigate } from "react-router-dom"; // ✅ Adicione `Navigate` aqui
import LoginPage from "../pages/LoginPage";
import DashboardPage from "../pages/DashboardPage";
import AnaliseSKUPage from "../pages/AnaliseSKUPage";
import AnaliseIntegracoesPage from "../pages/AnaliseIntegracoesPage";
import ProtectedRoute from "../components/ProtectedRoute";
import AnaliseTiposPage from "../pages/AnaliseTiposPage";
import AnaliseSkusPage from "../pages/AnaliseSkusPage";
import DetalheAnunciosPage from "../pages/DetalheAnunciosPage";

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
      <Route
        path="/analise-integracoes"
        element={
          <ProtectedRoute>
            <AnaliseIntegracoesPage />
          </ProtectedRoute>
        }
      />
      {/* Redireciona qualquer rota inválida para o dashboard */}
      <Route
        path="/analise/integracoes/:integracao/tipos"
        element={<AnaliseTiposPage />}
      />
      <Route
        path="/analise/integracoes/:integracao/tipos/:tipo/skus"
        element={<AnaliseSkusPage />}
      />
      {/* ✅ Nova rota para detalhe dos anúncios por SKU */}
      <Route
        path="/analise/skus/:sku/anuncios"
        element={<DetalheAnunciosPage />}
      />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}
