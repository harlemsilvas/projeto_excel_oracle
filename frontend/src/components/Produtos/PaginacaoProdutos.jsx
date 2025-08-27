// src/components/Produtos/PaginacaoProdutos.jsx
import React from "react";

export default function PaginacaoProdutos({ page, total_pages, onPageChange }) {
  const goFirst = () => onPageChange(1);
  const goPrev = () => onPageChange(Math.max(page - 1, 1));
  const goNext = () => onPageChange(Math.min(page + 1, total_pages));
  const goLast = () => onPageChange(total_pages);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={goFirst}
        disabled={page <= 1}
        className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
      >
        « Primeira
      </button>
      <button
        onClick={goPrev}
        disabled={page <= 1}
        className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
      >
        ‹ Anterior
      </button>
      <span className="text-sm px-2">
        {page} / {total_pages}
      </span>
      <button
        onClick={goNext}
        disabled={page >= total_pages}
        className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
      >
        Próxima ›
      </button>
      <button
        onClick={goLast}
        disabled={page >= total_pages}
        className="border border-gray-300 px-3 py-1 rounded text-sm hover:bg-gray-200 disabled:opacity-50"
      >
        Última »
      </button>
    </div>
  );
}
