// src/App.jsx
import React, { useState, useEffect } from "react";
import FiltroAnuncios from "./components/FiltroAnuncios";
import ResumoCards from "./components/ResumoCards";
import AnuncioTable from "./components/AnuncioTable";
import { useTema } from "./contexts/TemaContext";
import { exportarParaExcel } from "./utils/exportExcel";
import AnaliseSKU from "./components/AnaliseSKU";

// Estado inicial corrigido ✅
const estadoInicial = {
  //  [],
  page: 1,
  limit: 10,
  total: 0,
  total_pages: 1,
};

// Para debug (opcional)
// console.log("Estado inicial:", estadoInicial);

export default function App() {
  // Carrega filtros salvos no localStorage
  const [filtros, setFiltros] = useState(() => {
    const saved = localStorage.getItem("anuncios-filtros");
    return saved
      ? JSON.parse(saved)
      : {
          produto_sku: "", // ✅ Nome correto
          tipo_anuncio: "", // ✅ Nome correto
          q: "",
          page: 1,
          limit: 10,
          ordenarPor: "id",
          ordem: "ASC",
        };
  });

  const [dados, setDados] = useState(estadoInicial);
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(false);

  const { darkMode } = useTema();
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
  const API_PREFIX = import.meta.env.VITE_API_PREFIX;

  // Salva filtros no localStorage sempre que mudarem
  useEffect(() => {
    localStorage.setItem("anuncios-filtros", JSON.stringify(filtros));
  }, [filtros]);

  // Buscar resumo
  useEffect(() => {
    const fetchResumo = async () => {
      try {
        const res = await fetch(`${API_URL}${API_PREFIX}/resumo`);
        if (res.ok) {
          const json = await res.json();
          setResumo(json);
        }
      } catch (err) {
        console.error("Erro ao buscar resumo:", err);
      }
    };
    fetchResumo();
  }, [API_URL]);

  // Debounce: espera 500ms após digitação antes de disparar busca
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchData = async () => {
        setLoading(true);
        try {
          const params = new URLSearchParams();
          Object.entries(filtros).forEach(([k, v]) => v && params.append(k, v));

          const url = `${API_URL}${API_PREFIX}/anuncios?${params}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error(`HTTP ${res.status}`);

          const json = await res.json();
          setDados(json);
        } catch (err) {
          console.error("Erro ao buscar anúncios:", err);
          setDados(estadoInicial);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [filtros, API_URL]);

  // Atualiza filtros e reseta página
  const handleFiltroChange = (novosFiltros) => {
    setFiltros((prev) => ({ ...prev, ...novosFiltros, page: 1 }));
  };

  // Muda de página
  const handlePageChange = (novaPagina) => {
    setFiltros((prev) => ({ ...prev, page: novaPagina }));
  };

  // Exporta dados atuais para Excel
  const handleExport = () => {
    if (dados.data && dados.data.length > 0) {
      exportarParaExcel(dados.data);
    } else {
      alert("Nenhum dado para exportar.");
    }
  };

  return (
    <div
      className={`min-h-screen p-6 transition-colors duration-200 ${
        darkMode ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Botão de tema escuro */}
      <button
        onClick={() => window.dispatchEvent(new CustomEvent("toggle-theme"))}
        className="fixed top-4 right-4 p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white shadow hover:scale-105 transition-transform"
        aria-label="Alternar tema escuro"
        title="Alternar tema"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <h1 className="text-2xl font-bold mb-4">📊 Dashboard de Anúncios</h1>
      <AnaliseSKU />

      <FiltroAnuncios filtros={filtros} onChange={handleFiltroChange} />

      {/* Botão de exportação */}
      <div className="mb-6 flex justify-end">
        <button
          onClick={handleExport}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center gap-1 transition"
        >
          📥 Exportar Excel
        </button>
      </div>

      <ResumoCards resumo={resumo} />

      <AnuncioTable
        dados={dados}
        loading={loading}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
