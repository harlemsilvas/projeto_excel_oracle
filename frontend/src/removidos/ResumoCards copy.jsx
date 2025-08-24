// src/components/ResumoCards.jsx
import { useRetryFetch } from "../hooks/useRetryFetch";

export default function ResumoCards() {
  const { data, loading, error } = useRetryFetch("/api/resumo");

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded mb-6">
        <p className="text-red-700">❌ Erro: {error}</p>
        <p className="text-sm text-red-600">
          Verifique se a API está rodando em {import.meta.env.VITE_API_URL}
        </p>
      </div>
    );
  }

  const cards = [
    { titulo: "Total de Anúncios", valor: data?.total_anuncios || 0 },
    {
      titulo: "Preço Médio",
      valor: `R$ ${(data?.preco_medio || 0).toFixed(2)}`,
    },
    {
      titulo: "Lucro Médio",
      valor: `R$ ${(data?.lucro_medio || 0).toFixed(2)}`,
    },
    {
      titulo: "Lucro Total",
      valor: `R$ ${(data?.lucro_total || 0).toFixed(2)}`,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-white p-4 rounded shadow text-center">
          <p className="text-gray-500 text-sm">{card.titulo}</p>
          <p className="text-xl font-bold">
            {loading ? "Carregando..." : card.valor}
          </p>
        </div>
      ))}
    </div>
  );
}
