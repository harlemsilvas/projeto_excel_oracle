// src/pages/AnaliseTiposPage.jsx
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import TabelaTipos from "../components/TabelaTipos";

const AnaliseTiposPage = () => {
  const { integracao } = useParams(); // Obtém o parâmetro da URL
  const [dados, setDados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ Codifica o nome da integração para URLs
        const response = await fetch(
          `/api/analise/integracoes/${encodeURIComponent(integracao)}/tipos`
        );
        if (!response.ok) {
          let errorMsg = `Erro HTTP: ${response.status}`;
          // Tenta ler a mensagem de erro do corpo da resposta
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) {
            // Ignora erro de parse
          }
          throw new Error(errorMsg);
        }
        const data = await response.json();
        setDados(data);
      } catch (err) {
        console.error("Erro ao buscar dados de tipos:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (integracao) {
      // Só busca se o parâmetro existir
      fetchData();
    }
  }, [integracao]); // Re-executa se 'integracao' mudar

  // Links para o Breadcrumb
  const breadcrumbLinks = [
    { nome: "Dashboard", href: "/" },
    { nome: "Análise por Integração", href: "/analise/integracoes" },
    { nome: `Tipos em ${integracao}`, href: "" }, // Página atual
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen dark:bg-gray-900">
      <Breadcrumb links={breadcrumbLinks} />

      <h1 className="text-2xl font-bold my-4 text-gray-800 dark:text-white">
        🔍 Tipos de Anúncios para Integração:{" "}
        <span className="text-indigo-600 dark:text-indigo-400">
          {integracao}
        </span>
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

      <TabelaTipos dados={dados} loading={loading} integracao={integracao} />
    </div>
  );
};

export default AnaliseTiposPage;
