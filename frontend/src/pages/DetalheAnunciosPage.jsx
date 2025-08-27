// src/pages/DetalheAnunciosPage.jsx
import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import Breadcrumb from "../components/Breadcrumb";
import TabelaAnuncios from "../components/TabelaAnuncios";
import PaginacaoAnalise from "../components/AnaliseSKU/PaginacaoAnalise";

const DetalheAnunciosPage = () => {
  const { sku } = useParams(); // Obtém o SKU da URL
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
        const params = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });

        // ✅ Codifica o SKU para evitar problemas com caracteres especiais
        const url = `/api/analise/skus/${encodeURIComponent(
          sku
        )}/anuncios?${params}`;
        console.log("Fetching anúncios por SKU:", url);

        const res = await fetch(url);
        if (!res.ok) {
          let errorMsg = `Erro HTTP: ${res.status}`;
          try {
            const errorData = await res.json();
            errorMsg = errorData.error || errorMsg;
          } catch (e) {
            // Ignora erro de parse
          }
          throw new Error(errorMsg);
        }

        const json = await res.json();

        setDados({
          data: Array.isArray(json.data) ? json.data : [],
          page: json.page || 1,
          limit: json.limit || 10,
          total: json.total || 0,
          total_pages: json.total_pages || 1,
        });
      } catch (err) {
        console.error("Erro ao buscar anúncios por SKU:", err);
        setError(err.message);
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

    if (sku) {
      fetchData();
    }
  }, [sku, page, limit]);

  const handlePageChange = (novaPagina) => {
    setSearchParams({ page: novaPagina.toString(), limit: limit.toString() });
  };

  // Links para o Breadcrumb
  const breadcrumbLinks = [
    { nome: "Dashboard", href: "/" },
    { nome: "Análise por Integração", href: "/analise/integracoes" },
    // Você pode adicionar mais níveis conforme a navegação anterior
    { nome: `Anúncios do SKU: ${sku}`, href: "" }, // Página atual
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen dark:bg-gray-900">
      <Breadcrumb links={breadcrumbLinks} />

      <h1 className="text-2xl font-bold my-4 text-gray-800 dark:text-white">
        📋 Detalhes dos Anúncios para SKU:{" "}
        <span className="text-indigo-600 dark:text-indigo-400 font-mono">
          {sku}
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

      <TabelaAnuncios dados={dados.data} loading={loading} />

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

export default DetalheAnunciosPage;
