// src/pages/AnaliseSKUPage.jsx
import { useState, useEffect } from "react";
import Estatisticas from "../components/AnaliseSKU/Estatisticas";
import FiltrosAnalise from "../components/AnaliseSKU/FiltrosAnalise";
import TabelaAnalise from "../components/AnaliseSKU/TabelaAnalise";
import PaginacaoAnalise from "../components/AnaliseSKU/PaginacaoAnalise";

export default function AnaliseSKUPage() {
  const [dados, setDados] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);

  const [filtros, setFiltros] = useState({
    q: "",
    duplicados: false,
    min: "",
    max: "",
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    const fetchDados = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filtros).forEach(([k, v]) => v && params.append(k, v));

        const res = await fetch(`/api/sku/analise?${params}`);
        const json = await res.json();
        setDados(json.data || []);
        setStats(json.stats || {});
      } catch (err) {
        console.error("Erro ao carregar análise:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDados();
  }, [filtros]);

  const handlePageChange = (novaPagina) => {
    setFiltros((prev) => ({ ...prev, page: novaPagina }));
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        📊 Análise de SKUs
      </h1>

      <Estatisticas stats={stats} />
      <FiltrosAnalise filtros={filtros} setFiltros={setFiltros} />
      <TabelaAnalise dados={dados} loading={loading} />
      <PaginacaoAnalise
        page={filtros.page}
        total_pages={stats.total_pages || 1}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
