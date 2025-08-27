// src/components/Produtos/FiltroProdutos.jsx
import React from "react";

export default function FiltroProdutos({ filtros, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const limparFiltros = () => {
    onChange({
      sku: "",
      q: "",
      categoria: "",
      marca: "",
      page: 1,
      limit: 10,
      ordenarPor: "id",
      ordem: "ASC",
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4">
      <input
        type="text"
        name="sku"
        placeholder="SKU"
        value={filtros.sku ?? ""}
        onChange={handleChange}
        className="border p-2 rounded flex-1 min-w-48"
      />
      <input
        type="text"
        name="q"
        placeholder="Buscar por título"
        value={filtros.q ?? ""}
        onChange={handleChange}
        className="border p-2 rounded flex-1 min-w-48"
      />
      <input
        type="text"
        name="categoria"
        placeholder="Categoria"
        value={filtros.categoria ?? ""}
        onChange={handleChange}
        className="border p-2 rounded flex-1 min-w-48"
      />
      <input
        type="text"
        name="marca"
        placeholder="Marca"
        value={filtros.marca ?? ""}
        onChange={handleChange}
        className="border p-2 rounded flex-1 min-w-48"
      />

      <select
        name="ordenarPor"
        value={filtros.ordenarPor ?? "id"}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="id">ID</option>
        <option value="codigo_sku">SKU</option>
        <option value="descricao">Descrição</option>
        <option value="preco">Preço</option>
        <option value="categoria">Categoria</option>
        <option value="marca">Marca</option>
      </select>

      <select
        name="ordem"
        value={filtros.ordem ?? "ASC"}
        onChange={handleChange}
        className="border p-2 rounded"
      >
        <option value="ASC">Ascendente</option>
        <option value="DESC">Descendente</option>
      </select>

      <button
        onClick={() => onChange({})}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Buscar
      </button>

      <button
        onClick={limparFiltros}
        className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
      >
        Limpar
      </button>
    </div>
  );
}
