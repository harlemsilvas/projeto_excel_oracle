// src/components/TabelaSkus.jsx
import React from "react";
import { Link } from "react-router-dom";

// Função auxiliar para formatar moeda
const fmtBRL = (v) =>
  typeof v === "number"
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "-";

const TabelaSkus = ({ dados, loading }) => {
  if (loading) {
    return (
      <div className="overflow-x-auto bg-white shadow rounded-lg p-4 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">
          Carregando SKUs...
        </p>
        {/* Skeleton loading pode ser adicionado aqui */}
      </div>
    );
  }

  if (!dados || !Array.isArray(dados) || dados.length === 0) {
    return (
      <div className="overflow-x-auto bg-white shadow rounded-lg p-4 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum SKU encontrado para os filtros aplicados.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white shadow rounded-lg dark:bg-gray-800">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead className="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              SKU
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Total de Anúncios
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Preço Médio
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Lucro Médio
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Ações
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {dados.map((item) => {
            // Garante que os valores numéricos sejam números
            const totalAnuncios = parseInt(item.TOTAL_ANUNCIOS, 10) || 0;
            const precoMedio = parseFloat(item.PRECO_MEDIO) || 0;
            const lucroMedio = parseFloat(item.LUCRO_MEDIO) || 0;

            return (
              <tr
                key={`${item.PRODUTO_SKU}-${item.TOTAL_ANUNCIOS}`}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-blue-600 dark:text-blue-400">
                  {item.PRODUTO_SKU}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  <span className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded-full text-xs font-medium">
                    {totalAnuncios.toLocaleString("pt-BR")}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                  {fmtBRL(precoMedio)}
                </td>
                <td
                  className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    lucroMedio >= 0
                      ? "text-emerald-700 dark:text-emerald-500"
                      : "text-red-700 dark:text-red-500"
                  }`}
                >
                  {fmtBRL(lucroMedio)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {/* ✅ Link para a próxima etapa da perfuração */}
                  <Link
                    to={`/analise/skus/${encodeURIComponent(
                      item.PRODUTO_SKU
                    )}/anuncios?page=1&limit=10`}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    Ver Anúncios
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaSkus;
