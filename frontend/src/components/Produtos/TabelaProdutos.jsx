// src/components/Produtos/TabelaProdutos.jsx
import React from "react";

const fmtBRL = (v) =>
  typeof v === "number"
    ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
    : "-";

export default function TabelaProdutos({ dados, loading }) {
  if (loading) {
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm font-medium text-gray-700 bg-gray-100">
              <th className="px-4 py-2 w-24">ID</th>
              <th className="px-4 py-2">Descrição</th>
              <th className="px-4 py-2 w-40">SKU</th>
              <th className="px-4 py-2 w-36">Categoria</th>
              <th className="px-4 py-2 w-36">Marca</th>
              <th className="px-4 py-2 w-40">Preço Custo</th>
              <th className="px-4 py-2 w-40">Preço</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                <td className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded">
                  —
                </td>
                <td className="px-4 py-2 text-sm bg-gray-100 rounded">—</td>
                <td className="px-4 py-2 text-sm bg-gray-100 rounded">—</td>
                <td className="px-4 py-2 text-sm bg-gray-100 rounded">—</td>
                <td className="px-4 py-2 text-sm bg-gray-100 rounded">—</td>
                <td className="px-4 py-2 text-sm bg-gray-100 rounded">—</td>
                <td className="px-4 py-2 text-sm bg-gray-100 rounded">—</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!dados || dados.length === 0) {
    return (
      <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100 p-6 text-center text-gray-500">
        Nenhum produto encontrado
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow border border-gray-100">
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm font-medium text-gray-700 bg-gray-100">
            <th className="px-4 py-2 w-24">ID</th>
            <th className="px-4 py-2">Descrição</th>
            <th className="px-4 py-2 w-40">SKU</th>
            <th className="px-4 py-2 w-36">Categoria</th>
            <th className="px-4 py-2 w-36">Marca</th>
            <th className="px-4 py-2 w-40">Preço Custo</th>
            <th className="px-4 py-2 w-40">Preço</th>
          </tr>
        </thead>
        <tbody>
          {dados.map((p) => {
            const precoCusto = Number(p.preco_custo ?? 0);
            const preco = Number(p.preco ?? 0);

            return (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm text-gray-700">{p.id}</td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {p.descricao ?? "-"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700 font-mono">
                  {p.codigo_sku ?? "-"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {p.categoria ?? "-"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-700">
                  {p.marca ?? "-"}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {fmtBRL(precoCusto)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {fmtBRL(preco)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
