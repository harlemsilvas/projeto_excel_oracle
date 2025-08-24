export default function Resumo({ data }) {
  if (!data) return <p>Carregando resumo...</p>;
  const money = (v) =>
    Number(v || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  return (
    <div>
      <h2>Resumo Geral</h2>
      <ul>
        <li>Total de anúncios: {data.total_anuncios ?? 0}</li>
        <li>Preço médio: {money(data.preco_medio)}</li>
        <li>Lucro médio: {money(data.lucro_medio)}</li>
        <li>Lucro total: {money(data.lucro_total)}</li>
      </ul>
    </div>
  );
}
