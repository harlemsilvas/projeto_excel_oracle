// src/pages/AnaliseSKUPage.jsx
import { useState, useEffect, useCallback } from "react"; // ✅ Adicione useCallback
import Estatisticas from "../components/AnaliseSKU/Estatisticas";
import FiltrosAnalise from "../components/AnaliseSKU/FiltrosAnalise";
import TabelaAnalise from "../components/AnaliseSKU/TabelaAnalise";
import PaginacaoAnalise from "../components/AnaliseSKU/PaginacaoAnalise";

export default function AnaliseSKUPage() {
  const [dados, setDados] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null); // ✅ Estado para erro

  const [filtros, setFiltros] = useState({
    q: "",
    duplicados: false,
    min: "",
    max: "",
    page: 1,
    limit: 10,
  });

  // ✅ useCallback para memorizar a função e poder usá-la em useEffect e no botão
  const fetchDados = useCallback(async () => {
    setLoading(true);
    setError(null); // ✅ Limpa o erro anterior ao iniciar uma nova busca
    try {
      const params = new URLSearchParams();
      // ✅ Só adiciona parâmetros com valor truthy e que não sejam booleanos falsos (como duplicados=false)
      //    Se quiser enviar `duplicados=false`, remova a condição `v &&`
      Object.entries(filtros).forEach(([k, v]) => {
        // Para campos booleanos como 'duplicados', enviamos o valor mesmo sendo false
        // Para outros campos, só enviamos se forem truthy
        if (k === "duplicados" || (v !== null && v !== undefined && v !== "")) {
          params.append(k, v);
        }
      });

      const url = `/api/sku/analise?${params}`;
      console.log("Fetching:", url); // ✅ Log para debug

      const res = await fetch(url);

      if (!res.ok) {
        let errorMessage = `Erro na requisição (${res.status})`;
        if (res.status === 404) {
          errorMessage = "Endpoint não encontrado (404)";
        } else if (res.status >= 500) {
          errorMessage = `Erro no servidor (${res.status})`;
        } else if (res.status >= 400) {
          // Tenta ler a mensagem de erro do corpo da resposta
          try {
            const errorData = await res.json();
            errorMessage = errorData.error || errorMessage;
          } catch (e) {
            // Se não conseguir parsear o JSON, usa a mensagem padrão
          }
        }
        throw new Error(errorMessage);
      }

      const json = await res.json();
      setDados(json.data || []);
      setStats(json.stats || {});
    } catch (err) {
      console.error("Erro ao carregar análise:", err);
      setError(err.message); // Define a mensagem de erro
    } finally {
      setLoading(false);
    }
  }, [filtros]); // ✅ Dependência: recria a função se 'filtros' mudar

  // ✅ useEffect para buscar dados quando 'fetchDados' (e por consequência 'filtros') mudar
  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  const handlePageChange = (novaPagina) => {
    setFiltros((prev) => ({ ...prev, page: novaPagina }));
  };

  return (
    // ✅ Elemento raiz único que envolve TODO o conteúdo JSX
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        📊 Análise de SKUs
      </h1>

      {/* ✅ Se houver erro, mostra a mensagem acima dos outros componentes */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>
            <strong>Ops!</strong> Ocorreu um erro ao carregar os dados: {error}
          </p>
          <button
            onClick={fetchDados} // ✅ Agora chama a função definida no escopo do componente
            className="mt-2 bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
          >
            Tentar Novamente
          </button>
        </div>
      )}

      {/* ✅ Os componentes principais são renderizados sempre, mas podem mostrar estados de loading/vazio */}
      <Estatisticas stats={stats} />
      <FiltrosAnalise filtros={filtros} setFiltros={setFiltros} />
      <TabelaAnalise dados={dados} loading={loading} />
      <PaginacaoAnalise
        page={filtros.page}
        total_pages={stats.total_pages || 1}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
