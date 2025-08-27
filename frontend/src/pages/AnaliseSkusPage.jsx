// src/pages/AnaliseSkusPage.jsx
import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import TabelaSkus from "../components/TabelaSkus";
import PaginacaoAnalise from "../components/AnaliseSKU/PaginacaoAnalise"; // Reutilizando componente existente

const AnaliseSkusPage = () => {
  const { integracao, tipo } = useParams(); // Obtém os parâmetros da URL
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;

  const [dados, setDados] = useState({
    data: [],
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // ✅ Codifica os parâmetros para URLs
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        const url = `/api/analise/integracoes/${encodeURIComponent(
          integracao
        )}/tipos/${encodeURIComponent(tipo)}/skus?${params}`;
        console.log("Fetching SKUs:", url); // ✅ Log para debug

        const response = await fetch(url);
        if (!response.ok) {
          let errorMsg = `Erro HTTP: ${response.status}`;
          try {
            const errorData = await response.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) {
            // Ignora erro de parse
          }
          throw new Error(errorMsg);
        }
        const data = await response.json();

        // Garante que 'data' seja um array
        setDados({
          data: Array.isArray(data.data) ? data.data : [],
          page: data.page || 1,
          limit: data.limit || 10,
          total: data.total || 0,
          total_pages: data.total_pages || 1,
        });
      } catch (err) {
        console.error("Erro ao buscar dados de SKUs:", err);
        setError(err.message);
        // Reseta os dados em caso de erro
        setDados({
          data: [],
          page: 1,
          limit: 10,
          total: 0,
          total_pages: 1,
        });
      } finally {
        setLoading(false);
      }
    };

    if (integracao && tipo) {
      fetchData();
    }
  }, [integracao, tipo, page, limit]); // Re-executa se algum desses valores mudar

  const handlePageChange = (novaPagina) => {
    // Atualiza os parâmetros da URL, o que aciona o useEffect novamente
    setSearchParams({ page: novaPagina.toString(), limit: limit.toString() });
  };

  // Links para o Breadcrumb
  const breadcrumbLinks = [
    { nome: "Dashboard", href: "/" },
    { nome: "Análise por Integração", href: "/analise/integracoes" },
    {
      nome: integracao,
      href: `/analise/integracoes/${encodeURIComponent(integracao)}/tipos`,
    },
    { nome: `SKUs em ${tipo}`, href: "" }, // Página atual
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen dark:bg-gray-900">
      <Breadcrumb links={breadcrumbLinks} />

      <h1 className="text-2xl font-bold my-4 text-gray-800 dark:text-white">
        📦 SKUs para Integração:{" "}
        <span className="text-indigo-600 dark:text-indigo-400">
          {integracao}
        </span>{" "}
        & Tipo:{" "}
        <span className="text-indigo-600 dark:text-indigo-400">{tipo}</span>
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

      <TabelaSkus dados={dados.data} loading={loading} />

      {/* Paginação */}
      <div className="mt-6 flex justify-center">
        <PaginacaoAnalise
          page={dados.page}
          total_pages={dados.total_pages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
};

export default AnaliseSkusPage;
