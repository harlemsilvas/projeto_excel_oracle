// src/pages/DashboardPage.jsx
import { useState, useEffect, useCallback } from "react";
// ... outros imports ...
import FiltroAnuncios from "../components/FiltroAnuncios";
import ResumoCards from "../components/ResumoCards";
import AnuncioTable from "../components/AnuncioTable";
import ContadorAnuncios from "../components/ContadorAnuncios";

export default function DashboardPage() {
  const [filtros, setFiltros] = useState({
    produto_sku: "",
    tipo_anuncio: "",
    q: "",
    page: 1,
    limit: 10,
    ordenarPor: "id",
    ordem: "ASC",
  });

  const [dados, setDados] = useState({
    data: [], // Inicialize como array vazio
    page: 1,
    limit: 10,
    total: 0,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(false);

  const handleFiltroChange = useCallback((novosFiltros) => {
    setFiltros((prevFiltros) => {
      const filtrosAtualizados = { ...prevFiltros, ...novosFiltros };
      const filtrosBuscaAntigos = {
        produto_sku: prevFiltros.produto_sku,
        tipo_anuncio: prevFiltros.tipo_anuncio,
        q: prevFiltros.q,
        limit: prevFiltros.limit,
        ordenarPor: prevFiltros.ordenarPor,
        ordem: prevFiltros.ordem,
      };
      const filtrosBuscaNovos = {
        produto_sku: filtrosAtualizados.produto_sku,
        tipo_anuncio: filtrosAtualizados.tipo_anuncio,
        q: filtrosAtualizados.q,
        limit: filtrosAtualizados.limit,
        ordenarPor: filtrosAtualizados.ordenarPor,
        ordem: filtrosAtualizados.ordem,
      };

      if (
        JSON.stringify(filtrosBuscaAntigos) !==
        JSON.stringify(filtrosBuscaNovos)
      ) {
        filtrosAtualizados.page = 1;
      }
      return filtrosAtualizados;
    });
  }, []);

  const handlePageChange = useCallback((novaPagina) => {
    setFiltros((prev) => ({ ...prev, page: novaPagina }));
  }, []);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

  const fetchData = useCallback(async () => {
    setLoading(true);
    console.log("[DashboardPage fetchData] Iniciando busca de dados...");
    try {
      const params = new URLSearchParams();
      Object.entries(filtros).forEach(([key, value]) => {
        if (value !== "" && value != null) {
          params.append(key, value);
        }
      });

      const url = `${API_URL}/api/anuncios?${params}`;
      console.log("[DashboardPage fetchData] URL da requisição:", url);

      const res = await fetch(url);

      console.log("[DashboardPage fetchData] Resposta recebida:", res);

      if (!res.ok) {
        throw new Error(`Erro HTTP ${res.status}`);
      }

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const textResponse = await res.text();
        console.error(
          "[DashboardPage fetchData] Resposta NÃO JSON recebida:",
          textResponse
        );
        throw new Error("A resposta da API não é JSON");
      }

      const json = await res.json();
      console.log(
        "[DashboardPage fetchData] Dados JSON brutos recebidos:",
        json
      );

      // --- INÍCIO DA NORMALIZAÇÃO ---
      // ✅ Normaliza os dados recebidos do backend (colunas maiúsculas do Oracle)
      // para usar nomes consistentes em camelCase no frontend.
      const dadosNormalizados = {
        ...json, // Copia page, limit, total, total_pages
        data: Array.isArray(json.data)
          ? json.data.map((item) => {
              // --- Conversão robusta para string ---
              let tituloStr = "-";
              if (item.TITULO !== null && item.TITULO !== undefined) {
                // Se for um objeto (possivelmente um Buffer ou Lob), tente converter
                if (typeof item.TITULO === "object") {
                  // // Exemplo: se for um Buffer
                  // if (
                  //   item.TITULO.type === "Buffer" &&
                  //   Array.isArray(item.TITULO.data)
                  // ) {
                  //   // Converte Buffer para string UTF-8
                  //   tituloStr = Buffer.from(item.TITULO.data).toString("utf8");
                  // } else {
                  //   // Tenta uma representação genérica do objeto (para debug)
                  //   tituloStr = JSON.stringify(item.TITULO);
                  //   console.warn(
                  //     `[Normalização] TITULO era um objeto inesperado:`,
                  //     item.TITULO
                  //   );
                  // }
                } else {
                  // Se for primitivo (string, number), converte normalmente
                  tituloStr = String(item.TITULO);
                }
              }
              // --- Fim da conversão robusta ---

              return {
                id: item.ID,
                // ✅ Usa o valor convertido para string
                titulo: tituloStr,
                produto_sku: item.PRODUTO_SKU,
                preco_custo: item.PRECO_CUSTO,
                preco: item.PRECO,
                tipo_anuncio: item.TIPO_ANUNCIO,
              };
            })
          : [],
      };
      console.log(
        "[DashboardPage fetchData] Dados normalizados:",
        dadosNormalizados
      );
      // --- FIM DA NORMALIZAÇÃO ---

      // Atualiza o estado com os dados normalizados
      setDados(dadosNormalizados);
      console.log(
        "[DashboardPage fetchData] Estado 'dados' atualizado com dados normalizados."
      );
    } catch (err) {
      console.error("[DashboardPage fetchData] Erro ao buscar anúncios:", err);

      // Tenta extrair mais detalhes se for um erro de fetch
      let mensagemErro = "Erro desconhecido ao buscar anúncios.";
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        mensagemErro =
          "Erro de conexão. Verifique se o servidor backend está rodando.";
      } else if (err.message && err.message.includes("HTTP 500")) {
        mensagemErro =
          "Erro no servidor (HTTP 500). Verifique os logs do backend.";
      } else {
        mensagemErro = err.message || mensagemErro;
      }
      // --- Fim do log aprimorado ---
      setDados((prev) => ({
        ...prev,
        data: [], // Em caso de erro, garante que 'data' seja um array vazio
      }));
    } finally {
      setLoading(false);
      console.log("[DashboardPage fetchData] Finalizado. Loading = false.");
    }
  }, [filtros, API_URL]);

  useEffect(() => {
    console.log(
      "[DashboardPage useEffect] Efeito acionado. Filtros atuais:",
      filtros
    );
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">📊 Dashboard de Anúncios</h1>
      <FiltroAnuncios filtros={filtros} onChange={handleFiltroChange} />

      <ContadorAnuncios total={dados.total} />
      {/* <ResumoCards filtros={filtros} /> */}

      <button
        onClick={() => {
          // Força atualização do resumo (se ainda quiser manter o ResumoCards oculto)
          window.dispatchEvent(new CustomEvent("force-refresh-resumo"));
        }}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm flex items-center gap-1"
      >
        🔄 Atualizar Dados
      </button>

      {/* ✅ Passando dados.normalizados (agora com camelCase) para AnuncioTable */}
      <AnuncioTable
        dados={dados}
        loading={loading}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
