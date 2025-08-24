// src/components/AnuncioList.jsx
import React from "react";

export default function AnuncioList({ anuncios }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm text-left border border-gray-200 shadow-sm">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="px-4 py-2 border-b">Título</th>
            <th className="px-4 py-2 border-b">Preço Custo</th>
            <th className="px-4 py-2 border-b">Preço Venda</th>
            <th className="px-4 py-2 border-b">Lucro</th>
            <th className="px-4 py-2 border-b">Ações</th>
          </tr>
        </thead>
        <tbody>
          {anuncios.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-2 border-b">{a.titulo}</td>
              <td className="px-4 py-2 border-b">
                {typeof a.preco_custo === "number"
                  ? `R$ ${a.preco_custo.toFixed(2)}`
                  : "-"}
              </td>
              <td className="px-4 py-2 border-b">
                {typeof a.preco_venda === "number"
                  ? `R$ ${a.preco_venda.toFixed(2)}`
                  : "-"}
              </td>
              <td className="px-4 py-2 border-b">
                {typeof a.lucro === "number" ? `R$ ${a.lucro.toFixed(2)}` : "-"}
              </td>
              <td className="px-4 py-2 border-b">
                <a
                  href={a.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Ver anúncio
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
