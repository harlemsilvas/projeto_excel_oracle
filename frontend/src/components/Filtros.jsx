import React from "react";

export default function Filtros({ filtros, setFiltros }) {
  function handleChange(e) {
    setFiltros({ ...filtros, [e.target.name]: e.target.value });
  }

  function limparFiltros() {
    setFiltros({ categoria: "", vendedor: "", precoMin: "", precoMax: "" });
  }

  return (
    <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4">
      <input
        type="text"
        name="categoria"
        placeholder="Categoria"
        value={filtros.categoria}
        onChange={handleChange}
        className="border p-2 rounded flex-1"
      />
      <input
        type="text"
        name="vendedor"
        placeholder="Vendedor"
        value={filtros.vendedor}
        onChange={handleChange}
        className="border p-2 rounded flex-1"
      />
      <input
        type="number"
        name="precoMin"
        placeholder="Preço Mín."
        value={filtros.precoMin}
        onChange={handleChange}
        className="border p-2 rounded w-32"
      />
      <input
        type="number"
        name="precoMax"
        placeholder="Preço Máx."
        value={filtros.precoMax}
        onChange={handleChange}
        className="border p-2 rounded w-32"
      />

      <button
        onClick={limparFiltros}
        className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
      >
        Limpar
      </button>
    </div>
  );
}
