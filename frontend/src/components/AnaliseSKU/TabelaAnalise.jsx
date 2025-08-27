// src/components/AnaliseSKU/TabelaAnalise.jsx
import { exportarParaExcel } from "../../utils/exportExcel";

export default function TabelaAnalise({ dados = [], loading }) {
  const handleExport = () => {
    // ✅ Garante que dados seja um array antes de usar map
    const dadosArray = Array.isArray(dados) ? dados : [];
    const exportData = dadosArray.map((item) => ({
      SKU: item.sku,
      "Total de Anúncios": item.total_anuncios,
      // ✅ Verifica se anuncios_ids é um array antes de usar join
      "IDs dos Anúncios": Array.isArray(item.anuncios_ids)
        ? item.anuncios_ids.join(", ")
        : "N/A",
      // ✅ Verifica se titulos é um array antes de usar join
      Títulos: Array.isArray(item.titulos) ? item.titulos.join(" | ") : "N/A",
    }));
    exportarParaExcel(exportData, "analise_skus");
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden dark:bg-gray-800">
      <div className="p-4 flex justify-between">
        <h3 className="text-lg font-medium dark:text-white">
          Detalhes por SKU
        </h3>
        <button
          onClick={handleExport}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm"
        >
          📥 Exportar
        </button>
      </div>

      {loading ? (
        <p className="text-center py-6 text-gray-500">Carregando...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700 dark:text-gray-200">
              <tr>
                <th className="text-left p-3">SKU</th>
                <th className="text-left p-3">Qtd Anúncios</th>
                <th className="text-left p-3">IDs</th>
                <th className="text-left p-3">Títulos</th>
              </tr>
            </thead>
            <tbody>
              {/* ✅ Garante que dados seja um array antes de usar map */}
              {Array.isArray(dados) && dados.length > 0 ? (
                dados.map((item) => (
                  // ✅ Usar item.sku como key é mais seguro se for único
                  <tr
                    key={item.sku}
                    className="border-b hover:bg-gray-50 dark:hover:bg-gray-700 dark:border-gray-700"
                  >
                    <td className="p-3 font-mono text-blue-600 dark:text-blue-400">
                      {item.sku}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.total_anuncios === 1
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {item.total_anuncios}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-xs text-gray-600 dark:text-gray-400">
                      {/* ✅ Verificação adicionada */}
                      {Array.isArray(item.anuncios_ids)
                        ? item.anuncios_ids.join(", ")
                        : "-"}
                    </td>
                    <td className="p-3 text-gray-800 dark:text-gray-200">
                      {/* ✅ Verificação adicionada para titulos */}
                      {Array.isArray(item.titulos) ? (
                        item.titulos.map((t, idx) => (
                          <div key={idx} className="mb-1 last:mb-0">
                            {t}
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-500">N/A</div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="p-6 text-center text-gray-500 dark:text-gray-400"
                  >
                    {loading ? "Carregando dados..." : "Nenhum dado encontrado"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
