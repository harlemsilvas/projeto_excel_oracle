// src/components/ResumoCards.jsx
import React, { useMemo, useState } from "react";
import { useRetryFetch } from "../hooks/useRetryFetch";

export default function ResumoCards({ filtros }) {
  // Gera a query string com base nos filtros
  const queryString = useMemo(() => {
    if (!filtros) return "";
    const params = new URLSearchParams();
    Object.entries(filtros).forEach(([key, value]) => {
      if (value !== "" && value != null) {
        params.append(key, value);
      }
    });
    return params.toString() ? `?${params.toString()}` : "";
  }, [filtros]);

  // Gera uma chave de cache única com base nos filtros
  const cacheKey = useMemo(() => {
    if (!queryString) return "resumo_global";
    return `resumo_${btoa(queryString).slice(0, 20)}`; // Base64 curto
  }, [queryString]);

  // Estado para forçar recarregamento
  const [forceRefresh, setForceRefresh] = useState(0);

  // Usa o hook com debounce e cache
  const { data, loading, error } = useRetryFetch(`/api/resumo${queryString}`, {
    debounceMs: 500,
    cacheKey: forceRefresh > 0 ? null : cacheKey, // Se forceRefresh > 0, ignora o cache
  });

  // Formatação dos valores
  const formatCurrency = (value) => {
    return `R$ ${parseFloat(value || 0).toFixed(2)}`;
  };

  const cards = [
    { titulo: "Total de Anúncios", valor: data?.total_anuncios || 0 },
    {
      titulo: "Preço Médio",
      valor: formatCurrency(data?.preco_medio),
    },
    {
      titulo: "Lucro Médio",
      valor: formatCurrency(data?.lucro_medio),
    },
    {
      titulo: "Lucro Total",
      valor: formatCurrency(data?.lucro_total),
    },
  ];

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded mb-6">
        <p className="text-red-700 font-medium">❌ Erro ao carregar resumo</p>
        <p className="text-sm text-red-600 mt-1">{error}</p>
        <p className="text-xs text-red-500 mt-2">
          Verifique se a API está rodando em{" "}
          {import.meta.env.VITE_API_URL || "http://localhost:3000"}
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* Botão para forçar atualização */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => {
            // Remove do cache e força recarregamento
            if (cacheKey) {
              localStorage.removeItem(cacheKey);
            }
            setForceRefresh((prev) => prev + 1); // Força re-render
          }}
          className="text-xs text-blue-500 hover:underline flex items-center gap-1"
        >
          🔄 Atualizar dados
        </button>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {cards.map((card, i) => (
          <div
            key={i}
            className={`bg-white p-4 rounded-lg shadow transition-all duration-200 ${
              loading ? "opacity-75" : "hover:shadow-md"
            }`}
          >
            <p className="text-gray-500 text-sm font-medium">{card.titulo}</p>
            {loading ? (
              <div className="mt-2">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-3/4"></div>
              </div>
            ) : (
              <p className="text-xl font-bold text-gray-800 mt-1">
                {card.valor}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
