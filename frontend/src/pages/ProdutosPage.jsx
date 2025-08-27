// src/pages/ProdutosPage.jsx
import { useState, useEffect, useCallback } from "react";
import FiltroProdutos from "../components/Produtos/FiltroProdutos";
import TabelaProdutos from "../components/Produtos/TabelaProdutos";
import PaginacaoProdutos from "../components/Produtos/PaginacaoProdutos";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function ProdutosPage() {
  const [filtros, setFiltros] = useState({
    sku: "",
    q: "",
    categoria: "",
    marca: "",
    page: 1,
    limit: 10,
    ordenarPor: "id",
    ordem: "ASC",
  });

  const [dados, setDados] = useState({
    data: [],
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleFiltroChange = useCallback((novosFiltros) => {
    setFiltros((prev) => ({ ...prev, ...novosFiltros, page: 1 }));
  }, []);

  const handlePageChange = useCallback((novaPagina) => {
    setFiltros((prev) => ({ ...prev, page: novaPagina }));
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        Object.entries(filtros).forEach(([k, v]) => {
          if (v !== "" && v != null) {
            params.append(k, v);
          }
        });

        const url = `${API_URL}/api/produtos?${params}`;
        console.log("[ProdutosPage] Buscando:", url);

        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();

        setDados({
          data: Array.isArray(json.data) ? json.data : [],
          page: json.page || 1,
          limit: json.limit || 10,
          total: json.total || 0,
          total_pages: json.total_pages || 1,
        });
      } catch (err) {
        console.error("[ProdutosPage] Erro ao buscar produtos:", err);
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

    fetchData();
  }, [filtros]);

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        📦 Cadastro de Produtos
      </h1>

      <FiltroProdutos filtros={filtros} onChange={handleFiltroChange} />

      <TabelaProdutos dados={dados.data} loading={loading} />

      <div className="mt-6 flex justify-center">
        <PaginacaoProdutos
          page={dados.page}
          total_pages={dados.total_pages}
          onPageChange={handlePageChange}
        />
      </div>
    </div>
  );
}
