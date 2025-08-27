// src/pages/AnaliseIntegracoesPage.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Se estiver usando React Router
import Breadcrumb from "../components/Breadcrumb";
import TabelaIntegracoes from "../components/TabelaIntegracoes";

const AnaliseIntegracoesPage = () => {
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/analise/integracoes");
        if (!response.ok) {
          throw new Error(`Erro HTTP: ${response.status}`);
        }
        const data = await response.json();
        setDados(data);
      } catch (err) {
        console.error("Erro ao buscar dados de integrações:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Links para o Breadcrumb
  const breadcrumbLinks = [
    { nome: "Dashboard", href: "/" },
    { nome: "Análise por Integração", href: "/analise/integracoes" }, // Página atual, sem link
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen dark:bg-gray-900">
      <Breadcrumb links={breadcrumbLinks} />

      <h1 className="text-2xl font-bold my-4 text-gray-800 dark:text-white">
        🔍 Análise por Integração
      </h1>

      {error && (
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
          role="alert"
        >
          <strong className="font-bold">Erro! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <TabelaIntegracoes dados={dados} loading={loading} />
    </div>
  );
};

export default AnaliseIntegracoesPage;
