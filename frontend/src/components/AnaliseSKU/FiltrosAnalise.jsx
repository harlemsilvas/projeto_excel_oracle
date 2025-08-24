// src/components/AnaliseSKU/FiltrosAnalise.jsx
import React, { useState } from "react";

export default function FiltrosAnalise({ filtros, setFiltros }) {
  const [inputQ, setInputQ] = useState(filtros.q);

  // Debounce para busca
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setFiltros((prev) => ({ ...prev, q: inputQ, page: 1 }));
    }, 500);

    return () => clearTimeout(timer);
  }, [inputQ, setFiltros]);

  return (
    <div className="bg-white p-4 rounded shadow mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 dark:bg-gray-800">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Buscar SKU
        </label>
        <input
          type="text"
          value={inputQ}
          onChange={(e) => setInputQ(e.target.value)}
          placeholder="Buscar por SKU..."
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div className="flex items-end">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            checked={filtros.duplicados}
            onChange={(e) =>
              setFiltros((prev) => ({
                ...prev,
                duplicados: e.target.checked,
                page: 1,
              }))
            }
            className="rounded border-gray-300 text-blue-500 focus:ring-blue-500"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            Apenas duplicados
          </span>
        </label>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Mínimo de anúncios
        </label>
        <input
          type="number"
          value={filtros.min}
          onChange={(e) =>
            setFiltros((prev) => ({ ...prev, min: e.target.value, page: 1 }))
          }
          placeholder="2"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Máximo de anúncios
        </label>
        <input
          type="number"
          value={filtros.max}
          onChange={(e) =>
            setFiltros((prev) => ({ ...prev, max: e.target.value, page: 1 }))
          }
          placeholder="10"
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
      </div>
    </div>
  );
}
