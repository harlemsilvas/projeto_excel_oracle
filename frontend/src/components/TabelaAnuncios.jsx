// src/components/TabelaAnuncios.jsx
import React from "react";

// Função auxiliar para formatar moeda
const fmtBRL = (v) =>
  typeof v === "number"
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "-";

const TabelaAnuncios = ({ dados, loading }) => {
  if (loading) {
    return (
      <div className="overflow-x-auto bg-white shadow rounded-lg p-4 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400 animate-pulse">
          Carregando anúncios...
        </p>
        {/* Skeleton loading pode ser adicionado aqui */}
      </div>
    );
  }

  if (!dados || !Array.isArray(dados) || dados.length === 0) {
    return (
      <div className="overflow-x-auto bg-white shadow rounded-lg p-4 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhum anúncio encontrado para este SKU.
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
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              ID
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Título
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              SKU
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Tipo
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Preço Custo
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Preço
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Lucro
            </th>
            <th
              scope="col"
              className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Integração
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
          {dados.map((a) => {
            const precoCusto = Number(a.PRECO_CUSTO ?? 0);
            const preco = Number(a.PRECO ?? 0);
            const lucro = preco - precoCusto;

            return (
              <tr
                key={a.ID}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-4 py-2 text-sm font-mono text-blue-600 dark:text-blue-400">
                  {a.ID}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                  {a.TITULO ?? "-"}
                </td>
                <td className="px-4 py-2 text-sm font-mono text-gray-700 dark:text-gray-300">
                  {a.PRODUTO_SKU ?? "-"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {a.TIPO_ANUNCIO ?? "-"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                  {fmtBRL(precoCusto)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">
                  {fmtBRL(preco)}
                </td>
                <td
                  className={`px-4 py-2 text-sm font-medium ${
                    lucro >= 0
                      ? "text-emerald-700 dark:text-emerald-500"
                      : "text-red-700 dark:text-red-500"
                  }`}
                >
                  {fmtBRL(lucro)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                  {a.INTEGRACAO ?? "-"}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaAnuncios;
