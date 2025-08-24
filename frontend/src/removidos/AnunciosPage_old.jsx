import React, { useState, useEffect } from "react";
import ResumoCards from "./ResumoCards";
import AnuncioTable from "./AnuncioTable";
import FiltroAnuncios from "./FiltroAnuncios";

export default function AnunciosPage() {
  const [filtros, setFiltros] = useState({
    busca: "",
    precoMin: "",
    precoMax: "",
    categoria: "",
    pagina: 1,
    limite: 10,
    ordenarPor: "preco_custo",
    ordem: "asc",
  });

  const [dados, setDados] = useState({
    total_anuncios: 0,
    preco_medio: 0,
    lucro_medio: 0,
    lucro_total: 0,
    anuncios: [],
    total_paginas: 1,
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDados();
  }, [filtros]);

  const fetchDados = async () => {
    setLoading(true);

    const queryParams = new URLSearchParams(filtros).toString();
    try {
      const res = await fetch(`http://localhost:3000/anuncios?${queryParams}`);
      const json = await res.json();
      setDados(json);
    } catch (err) {
      console.error("Erro ao buscar anúncios:", err);
    }
    setLoading(false);
  };

  const handleFiltroChange = (novoFiltro) => {
    setFiltros((prev) => ({ ...prev, ...novoFiltro, pagina: 1 }));
  };

  const handlePageChange = (novaPagina) => {
    setFiltros((prev) => ({ ...prev, pagina: novaPagina }));
  };

  const handleOrdenacao = (coluna) => {
    setFiltros((prev) => ({
      ...prev,
      ordenarPor: coluna,
      ordem:
        prev.ordenarPor === coluna && prev.ordem === "asc" ? "desc" : "asc",
    }));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Filtros */}
      <FiltroAnuncios filtros={filtros} onChange={handleFiltroChange} />

      {/* Resumo com Cards */}
      <ResumoCards
        total={dados.total_anuncios}
        precoMedio={dados.preco_medio}
        lucroMedio={dados.lucro_medio}
        lucroTotal={dados.lucro_total}
        loading={loading}
      />

      {/* Tabela com paginação e ordenação */}
      <AnuncioTable
        anuncios={dados.anuncios}
        pagina={filtros.pagina}
        totalPaginas={dados.total_paginas}
        onPageChange={handlePageChange}
        onOrdenar={handleOrdenacao}
        ordenarPor={filtros.ordenarPor}
        ordem={filtros.ordem}
        loading={loading}
      />
    </div>
  );
}
