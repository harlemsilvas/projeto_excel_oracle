// src/components/TabelaIntegracoes.jsx
import React from "react";
import { Link } from "react-router-dom"; // Se estiver usando React Router

const TabelaIntegracoes = ({ dados, loading }) => {
  if (loading) {
    return (
      <div className="overflow-x-auto bg-white shadow rounded-lg p-4 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">
          Carregando integrações...
        </p>
        {/* Você pode adicionar um skeleton loader aqui se quiser */}
      </div>
    );
  }

  if (!dados || dados.length === 0) {
    return (
      <div className="overflow-x-auto bg-white shadow rounded-lg p-4 dark:bg-gray-800">
        <p className="text-gray-500 dark:text-gray-400">
          Nenhuma integração encontrada.
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
              Integração
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-300"
            >
              Total de Anúncios
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
          {dados.map((item) => (
            <tr
              key={item.INTEGRACAO}
              className="hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                {item.INTEGRACAO}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                {item.TOTAL_ANUNCIOS?.toLocaleString("pt-BR") || "0"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link
                  to={`/analise/integracoes/${encodeURIComponent(
                    item.INTEGRACAO
                  )}/tipos`}
                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Ver Tipos
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaIntegracoes;
