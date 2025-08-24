// src/components/AnaliseSKU.jsx
const fetchAnalise = async () => {
  try {
    const res = await fetch("/api/sku/analise");

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const contentType = res.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      const text = await res.text();
      console.warn("Resposta não é JSON:", text);
      throw new Error(
        "A resposta não é JSON. Verifique se a rota está correta."
      );
    }

    const data = await res.json();
    setDados(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error("Erro ao carregar análise de SKUs:", err);
    setErro(err.message);
  } finally {
    setLoading(false);
  }
};
// // src/components/AnaliseSKU.jsx
// import React, { useState, useEffect } from "react";
// import { exportarParaExcel } from "../utils/exportExcel";

// export default function AnaliseSKU() {
//   const [dados, setDados] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [erro, setErro] = useState(null);
//   const [filtroDuplicados, setFiltroDuplicados] = useState(false);

//   useEffect(() => {
//     const fetchAnalise = async () => {
//       setLoading(true);
//       setErro(null);

//       try {
//         const res = await fetch("/api/sku/analise");

//         // Se a rota não existir, o backend pode retornar HTML (ex: 404)
//         if (!res.ok) {
//           throw new Error(`Erro HTTP ${res.status}: ${res.statusText}`);
//         }

//         // Verifica se a resposta é JSON
//         const contentType = res.headers.get("content-type");
//         if (!contentType || !contentType.includes("application/json")) {
//           const text = await res.text();
//           throw new Error(
//             "A resposta não é JSON. Possível erro de rota ou página 404."
//           );
//         }

//         const data = await res.json();
//         setDados(Array.isArray(data) ? data : []);
//       } catch (err) {
//         console.error("Erro ao carregar análise de SKUs:", err);
//         setErro(
//           err.message.includes("não é JSON")
//             ? "Erro de rota: verifique se /api/sku/analise está configurada no backend."
//             : err.message
//         );
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAnalise();
//   }, []);

//   // Filtra SKUs com mais de um anúncio
//   const dadosFiltrados = filtroDuplicados
//     ? dados.filter((item) => item.total_anuncios > 1)
//     : dados;

//   // Exporta dados para Excel
//   const handleExport = () => {
//     if (dados.length === 0) {
//       alert("Nenhum dado para exportar.");
//       return;
//     }

//     const dadosExportacao = dados.map((item) => ({
//       SKU: item.sku,
//       "Total de Anúncios": item.total_anuncios,
//       "IDs dos Anúncios": Array.isArray(item.anuncios_ids)
//         ? item.anuncios_ids.join(", ")
//         : "N/A",
//       Títulos: Array.isArray(item.titulos) ? item.titulos.join(" | ") : "N/A",
//     }));

//     exportarParaExcel(dadosExportacao, "analise_skus");
//   };

//   return (
//     <div className="bg-white rounded-lg shadow p-6 mb-8">
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
//         <h2 className="text-xl font-bold">📊 Análise de SKUs</h2>

//         <div className="flex flex-wrap gap-4 items-center">
//           <label className="inline-flex items-center text-sm">
//             <input
//               type="checkbox"
//               checked={filtroDuplicados}
//               onChange={(e) => setFiltroDuplicados(e.target.checked)}
//               className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
//             />
//             <span className="ml-2">Mostrar apenas SKUs duplicados</span>
//           </label>

//           <button
//             onClick={handleExport}
//             disabled={loading || dados.length === 0}
//             className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded text-sm flex items-center gap-1 transition"
//           >
//             📥 Exportar Excel
//           </button>
//         </div>
//       </div>

//       {/* Loading */}
//       {loading && (
//         <p className="text-center py-4 text-gray-500 animate-pulse">
//           Carregando análise de SKUs...
//         </p>
//       )}

//       {/* Erro */}
//       {erro && (
//         <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
//           <strong>Erro:</strong> {erro}
//           <br />
//           <small>
//             Dica: verifique se o backend está rodando e a rota
//             `/api/sku/analise` existe.
//           </small>
//         </div>
//       )}

//       {/* Dados */}
//       {!loading && !erro && (
//         <>
//           {dadosFiltrados.length === 0 ? (
//             <p className="text-center py-4 text-gray-500">
//               {filtroDuplicados
//                 ? "Nenhum SKU com mais de um anúncio encontrado."
//                 : "Nenhum SKU encontrado."}
//             </p>
//           ) : (
//             <div className="overflow-x-auto">
//               <table className="w-full text-sm">
//                 <thead className="bg-gray-50 border-b">
//                   <tr>
//                     <th className="text-left p-3">SKU</th>
//                     <th className="text-left p-3">Total de Anúncios</th>
//                     <th className="text-left p-3">IDs dos Anúncios</th>
//                     <th className="text-left p-3">Títulos</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {dadosFiltrados.map((item, index) => (
//                     <tr key={index} className="border-b hover:bg-gray-50">
//                       <td className="p-3 font-mono text-blue-600">
//                         {item.sku}
//                       </td>
//                       <td className="p-3">
//                         <span
//                           className={`px-2 py-1 rounded-full text-xs font-medium ${
//                             item.total_anuncios === 1
//                               ? "bg-green-100 text-green-800"
//                               : "bg-orange-100 text-orange-800"
//                           }`}
//                         >
//                           {item.total_anuncios}
//                         </span>
//                       </td>
//                       <td className="p-3 font-mono text-xs text-gray-600">
//                         {Array.isArray(item.anuncios_ids)
//                           ? item.anuncios_ids.join(", ")
//                           : "-"}
//                       </td>
//                       <td className="p-3 text-gray-800">
//                         {Array.isArray(item.titulos) ? (
//                           item.titulos.map((titulo, i) => (
//                             <div key={i} className="mb-1 last:mb-0">
//                               {titulo}
//                             </div>
//                           ))
//                         ) : (
//                           <em>Sem título</em>
//                         )}
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           )}
//         </>
//       )}
//     </div>
//   );
// }
