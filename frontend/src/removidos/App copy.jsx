import { useEffect, useState } from "react";
import axios from "axios";
import Resumo from "./components/Resumo";
import AnuncioList from "./components/AnuncioList";
import "./index.css"; // importa o Tailwindnp

const API_BASE = "http://localhost:3000";

export default function App() {
  const [resumo, setResumo] = useState(null);

  // filtros
  const [tipo, setTipo] = useState("");
  const [sku, setSku] = useState("");
  const [palavra, setPalavra] = useState("");

  // paginação
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);

  // dados
  const [anuncios, setAnuncios] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const loadResumo = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/resumo`);
      setResumo({
        total_anuncios: data.total_anuncios ?? 0,
        preco_medio: Number(data.preco_medio ?? 0),
        lucro_medio: Number(data.lucro_medio ?? 0),
        lucro_total: Number(data.lucro_total ?? 0),
      });
    } catch (e) {
      console.error("Erro no resumo:", e);
    }
  };

  const loadAnuncios = async () => {
    setLoading(true);
    try {
      const params = { page, limit };
      if (tipo) params.tipo = tipo;
      if (sku) params.sku = sku.trim();
      if (palavra) params.q = palavra.trim();

      const { data } = await axios.get(`${API_BASE}/anuncios`, { params });

      setAnuncios(data.data || []);
      setTotal(data.total || 0);
      setTotalPages(data.total_pages || 1);
    } catch (e) {
      console.error("Erro ao carregar anúncios:", e);
    } finally {
      setLoading(false);
    }
  };

  // carrega resumo uma vez
  useEffect(() => {
    loadResumo();
  }, []);

  // recarrega anúncios quando filtro/página mudam
  useEffect(() => {
    loadAnuncios();
  }, [tipo, sku, palavra, page, limit]);

  const limparFiltros = () => {
    setTipo("");
    setSku("");
    setPalavra("");
    setPage(1);
  };

  return (
    <div
      style={{
        maxWidth: 1000,
        margin: "2rem auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h1>📊 Painel de Anúncios</h1>
      <Resumo data={resumo} />
      <hr />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr auto",
          gap: "12px",
          alignItems: "end",
        }}
      >
        <label>
          Tipo:
          <select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value);
              setPage(1);
            }}
          >
            <option value="">-- Todos --</option>
            <option value="Premium">Premium</option>
            <option value="Clássico">Clássico</option>
          </select>
        </label>

        <label>
          SKU:
          <input
            type="text"
            value={sku}
            onChange={(e) => {
              setSku(e.target.value);
              setPage(1);
            }}
            placeholder="Ex.: 61461"
          />
        </label>

        <label>
          Palavra no título:
          <input
            type="text"
            value={palavra}
            onChange={(e) => {
              setPalavra(e.target.value);
              setPage(1);
            }}
            placeholder="Ex.: óleo"
          />
        </label>

        <button onClick={limparFiltros}>Limpar</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <label>
          Itens por página:
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1);
            }}
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
      </div>

      {loading && <p>Carregando anúncios...</p>}

      {!loading && (
        <>
          <AnuncioList anuncios={anuncios} />
          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              marginTop: 12,
            }}
          >
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page <= 1}
            >
              ◀️ Anterior
            </button>
            <span>
              Página {page} de {totalPages} — {total} resultados
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page >= totalPages}
            >
              Próxima ▶️
            </button>
          </div>
        </>
      )}
    </div>
  );
}
