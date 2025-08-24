// components/AnuncioTable.jsx
import React from "react";

const AnuncioTable = ({ dados, loading, onPageChange }) => {
  // Função para formatar valores como moeda BRL
  const fmtBRL = (v) =>
    typeof v === "number"
      ? v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "-";

  // Extrai os dados e informações de paginação
  const anuncios = dados.data || [];
  const currentPage = dados.page || 1;
  const totalPages = dados.total_pages || 1;

  // Funções para navegação de página
  const goFirst = () => onPageChange(1);
  const goPrev = () => onPageChange(Math.max(currentPage - 1, 1));
  const goNext = () => onPageChange(Math.min(currentPage + 1, totalPages));
  const goLast = () => onPageChange(totalPages);

  // Manipulador para saltar para uma página específica
  const handleJumpToPage = (e) => {
    e.preventDefault();
    const input = e.target.page;
    const num = parseInt(input.value, 10);
    if (num >= 1 && num <= totalPages) {
      onPageChange(num);
      input.value = ""; // Limpa o campo após o envio
    }
  };

  return (
    <div className="table-container bg-white rounded-lg shadow border border-gray-100 overflow-hidden">
      {/* Cabeçalho da tabela */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {loading
            ? "Carregando…"
            : `Exibindo ${anuncios.length} anúncio(s) na página ${currentPage}`}
        </div>
        <div className="text-xs text-gray-500">
          Página {currentPage} de {totalPages}
        </div>
      </div>

      {/* Tabela propriamente dita */}
      <div className="overflow-x-auto">
        <table className="w-full">
          {/* Cabeçalho da tabela */}
          <thead>
            <tr className="text-left text-sm font-medium text-gray-700 bg-gray-100">
              <th className="px-4 py-2 w-24">ID</th>
              <th className="px-4 py-2">Título</th>
              <th className="px-4 py-2 w-40">SKU</th>
              <th className="px-4 py-2 w-36">Tipo</th>
              <th className="px-4 py-2 w-40">Preço Custo</th>
              <th className="px-4 py-2 w-40">Preço</th>
              <th className="px-4 py-2 w-36">Lucro</th>
            </tr>
          </thead>

          {/* Corpo da tabela */}
          <tbody>
            {loading ? (
              // Exibe linhas de carregamento (skeleton) enquanto carrega
              Array.from({ length: 5 }).map((_, i) => (
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
              ))
            ) : anuncios.length === 0 ? (
              // Exibe mensagem se não houver anúncios
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  Nenhum anúncio encontrado
                </td>
              </tr>
            ) : (
              // Mapeia e exibe os anúncios
              anuncios.map((a) => {
                // Calcula o lucro
                const precoCusto = Number(a.preco_custo ?? 0);
                const preco = Number(a.preco ?? 0);
                const lucro = preco - precoCusto;

                return (
                  // Linha da tabela para cada anúncio
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-700">{a.id}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {a.titulo ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {a.produto_sku ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-700">
                      {a.tipo_anuncio ?? "-"}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {fmtBRL(precoCusto)}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {fmtBRL(preco)}
                    </td>
                    <td
                      className={`px-4 py-2 text-sm font-medium ${
                        lucro >= 0 ? "text-emerald-700" : "text-red-700"
                      }`}
                    >
                      {fmtBRL(lucro)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginação */}
      <div className="px-4 py-3 flex flex-wrap items-center justify-between gap-4 border-t border-gray-100">
        <div className="flex items-center gap-4">
          <div className="text-xs text-gray-500">Ir para página:</div>
          <form onSubmit={handleJumpToPage} className="flex gap-2">
            <input
              type="number"
              name="page"
              min="1"
              max={totalPages}
              placeholder={`1-${totalPages}`}
              className="border border-gray-300 rounded px-2 py-1 text-sm w-20"
            />
            <button
              type="submit"
              className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
            >
              Ir
            </button>
          </form>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goFirst}
            disabled={currentPage <= 1}
            className="btn-pag"
          >
            « Primeira
          </button>
          <button
            onClick={goPrev}
            disabled={currentPage <= 1}
            className="btn-pag"
          >
            ‹ Anterior
          </button>
          <span className="text-sm px-2">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={goNext}
            disabled={currentPage >= totalPages}
            className="btn-pag"
          >
            Próxima ›
          </button>
          <button
            onClick={goLast}
            disabled={currentPage >= totalPages}
            className="btn-pag"
          >
            Última »
          </button>
        </div>
      </div>
    </div>
  );
};

// Otimização: evitar re-render desnecessário
export default React.memo(AnuncioTable);

// Estilo dos botões de paginação
const style = document.createElement("style");
style.textContent = `
.btn-pag {
  border: 1px solid #d1d5db;
  padding: 0.25rem 0.75rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background: white;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-pag:hover:not([disabled]) {
  background: #f3f4f6;
}
.btn-pag:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
`;
document.head.appendChild(style);
