// src/components/FiltroAnuncios.jsx
import React, { useState, useEffect } from "react";
// ... outros imports ...

export default function FiltroAnuncios({ filtros, onChange }) {
  // Estados para os valores dos inputs
  const [inputValues, setInputValues] = useState({
    tipo_anuncio: filtros.tipo_anuncio || "",
    produto_sku: filtros.produto_sku || "",
    q: filtros.q || "",
    integracao: filtros.integracao || "", // ✅ Novo estado para integração
  });

  // Estados para opções de dropdowns (se necessário)
  const [tipos, setTipos] = useState([]);
  const [integracoes, setIntegracoes] = useState([]); // ✅ Estado para lista de integrações

  // --- Carregar opções disponíveis ---
  useEffect(() => {
    // Carregar tipos de anúncio (já existente)
    const fetchTipos = async () => {
      try {
        // ... lógica existente para buscar tipos ...
        // Exemplo simplificado:
        const res = await fetch("/api/tipos");
        if (res.ok) {
          const data = await res.json();
          setTipos(data);
        }
      } catch (err) {
        console.error("Erro ao carregar tipos:", err);
      }
    };

    // ✅ Carregar integrações
    const fetchIntegracoes = async () => {
      try {
        // Esta rota ainda não existe, vamos criá-la
        const res = await fetch("/api/anuncios/integracoes");
        if (res.ok) {
          const data = await res.json();
          setIntegracoes(data); // Espera um array de strings
        }
      } catch (err) {
        console.error("Erro ao carregar integrações:", err);
        // Fallback: pode ser um array vazio ou uma lista padrão
        setIntegracoes(["MercadoLivre", "B2W", "Amazon"]); // Exemplo
      }
    };

    fetchTipos();
    fetchIntegracoes();
  }, []);

  // --- Lidar com mudanças nos inputs ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  // --- Aplicar filtros (com debounce) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      onChange(inputValues); // Passa todos os valores atuais
    }, 500); // 500ms de debounce

    return () => clearTimeout(timer);
  }, [inputValues, onChange]);

  // --- Limpar todos os filtros ---
  const limparFiltros = () => {
    const filtrosLimpos = {
      tipo_anuncio: "",
      produto_sku: "",
      q: "",
      integracao: "", // ✅ Limpar integração também
      page: 1, // Reseta para a primeira página
    };
    setInputValues(filtrosLimpos);
    onChange(filtrosLimpos);
  };

  return (
    <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-4 items-end">
      {/* Filtro por Tipo */}
      <div className="flex-1 min-w-48">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Tipo
        </label>
        <select
          name="tipo_anuncio"
          value={inputValues.tipo_anuncio}
          onChange={handleChange}
          className="w-full border p-2 rounded text-sm"
        >
          <option value="">Todos os tipos</option>
          {tipos.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>

      {/* Filtro por SKU */}
      <div className="flex-1 min-w-48">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          SKU
        </label>
        <input
          type="text"
          name="produto_sku"
          placeholder="Filtrar por SKU"
          value={inputValues.produto_sku}
          onChange={handleChange}
          className="w-full border p-2 rounded text-sm"
        />
      </div>

      {/* Filtro por Título */}
      <div className="flex-1 min-w-48">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Buscar por título
        </label>
        <input
          type="text"
          name="q"
          placeholder="Título"
          value={inputValues.q}
          onChange={handleChange}
          className="w-full border p-2 rounded text-sm"
        />
      </div>

      {/* ✅ Novo Filtro por Integração */}
      <div className="flex-1 min-w-48">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Integração
        </label>
        <select
          name="integracao"
          value={inputValues.integracao}
          onChange={handleChange}
          className="w-full border p-2 rounded text-sm"
        >
          <option value="">Todas as integrações</option>
          {integracoes.map((integracao) => (
            <option key={integracao} value={integracao}>
              {integracao}
            </option>
          ))}
        </select>
      </div>

      {/* Botões de Ação */}
      <div>
        <button
          type="button"
          onClick={() => onChange(inputValues)} // Aciona imediatamente
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
