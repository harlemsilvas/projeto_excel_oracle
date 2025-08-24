import React from "react";
import "../styles/AnuncioList.css";

export default function AnuncioList({ anuncios }) {
  return (
    <div className="anuncios-container">
      {anuncios.map((a, i) => (
        <div className="anuncio-card" key={i}>
          <div className="anuncio-title">{a.titulo}</div>
          <div className="anuncio-preco">
            {a.preco_custo != null
              ? `R$ ${Number(a.preco_custo).toFixed(2)}`
              : "Preço não informado"}
          </div>
          <div className="anuncio-detalhes">
            {a.categoria || "Sem categoria"}
            <br />
            Vendas: {a.vendas || 0}
          </div>
          <a
            href={a.url}
            target="_blank"
            rel="noopener noreferrer"
            className="anuncio-link"
          >
            Ver anúncio
          </a>
        </div>
      ))}
    </div>
  );
}
