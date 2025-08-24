// src/components/FiltroAnuncios.jsx
import React, { useState, useEffect } from "react";

export default function FiltroAnuncios({ filtros, onChange }) {
  const [tipos, setTipos] = useState([]);
  // ✅ Adicione fallback
  const safeFiltros = filtros || {
    produto_sku: "",
    tipo_anuncio: "",
    q: "",
    page: 1,
    limit: 10,
    ordenarPor: "id",
    ordem: "ASC",
  };

  // Carrega os tipos do banco ao montar o componente
  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
    const API_PREFIX = import.meta.env.VITE_API_PREFIX || "api";
    const cached = localStorage.getItem("tipos_anuncio");

    if (cached) {
      try {
        const { data, timestamp } = JSON.parse(cached);
        const now = new Date().getTime();
        const isExpired = now - timestamp > 24 * 60 * 60 * 1000; // 24h

        if (!isExpired) {
          setTipos(data);
          return;
        }
      } catch (err) {
        console.warn("Erro ao ler cache, recarregando...", err);
      }
    }

    const fetchTipos = async () => {
      try {
        const res = await fetch(`${API_URL}${API_PREFIX}/tipos`);
        if (res.ok) {
          const data = await res.json();
          setTipos(data);
          const cacheData = {
            data,
            timestamp: new Date().getTime(),
          };
          localStorage.setItem("tipos_anuncio", JSON.stringify(cacheData));
        } else {
          console.error("Erro na resposta da API:", res.status);
        }
      } catch (err) {
        console.error("Erro ao carregar tipos:", err);
      }
    };

    fetchTipos();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    const campoBackend = {
      sku: "produto_sku",
      tipo: "tipo_anuncio",
    };

    const nomeFinal = campoBackend[name] || name;

    onChange({
      [nomeFinal]: value,
    });
  };

  const limparFiltros = () => {
    onChange({
      produto_sku: "",
      tipo_anuncio: "",
      q: "",
      page: 1,
      limit: 10,
      ordenarPor: "id",
      ordem: "ASC",
    });
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4 items-end">
      <div className="flex-1 min-w-48">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Tipo
        </label>
        <select
          name="tipo"
          value={safeFiltros.tipo_anuncio ?? ""}
          onChange={handleChange}
          className="w-full border p-2 rounded text-sm"
        >
          <option value="">Todos os tipos</option>
          {tipos.length > 0 ? (
            tipos.map((tipo) => (
              <option key={tipo} value={tipo}>
                {tipo}
              </option>
            ))
          ) : (
            <option disabled>Carregando...</option>
          )}
        </select>
      </div>

      <div className="flex-1 min-w-48">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          SKU
        </label>
        <input
          type="text"
          name="sku"
          placeholder="Filtrar por SKU"
          value={safeFiltros.produto_sku ?? ""}
          onChange={handleChange}
          className="w-full border p-2 rounded text-sm"
        />
      </div>

      <div className="flex-1 min-w-48">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Buscar por título
        </label>
        <input
          type="text"
          name="q"
          placeholder="Título"
          value={safeFiltros.q ?? ""}
          onChange={handleChange}
          className="w-full border p-2 rounded text-sm"
        />
      </div>

      {/* ... outros filtros (ordenarPor, ordem, limit) */}

      <div>
        <button
          type="button"
          onClick={() => onChange({})}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
        >
          Buscar
        </button>
      </div>

      <div>
        <button
          type="button"
          onClick={limparFiltros}
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300 text-sm"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}
