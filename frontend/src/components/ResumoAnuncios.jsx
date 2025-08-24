// ResumoAnuncios.jsx
export default function ResumoAnuncios({ resumo }) {
  const cards = [
    {
      titulo: "Total de Anúncios",
      valor: resumo?.total_anuncios || 0,
      cor: "bg-blue-500",
    },
    {
      titulo: "Preço Médio",
      valor: `R$ ${Number(resumo?.preco_medio || 0).toFixed(2)}`,
      cor: "bg-green-500",
    },
    {
      titulo: "Lucro Médio",
      valor: `R$ ${Number(resumo?.lucro_medio || 0).toFixed(2)}`,
      cor: "bg-yellow-500",
    },
    {
      titulo: "Lucro Total",
      valor: `R$ ${Number(resumo?.lucro_total || 0).toFixed(2)}`,
      cor: "bg-purple-500",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((c, idx) => (
        <div
          key={idx}
          className={`${c.cor} text-white rounded-lg p-4 shadow-lg`}
        >
          <h3 className="text-lg font-semibold">{c.titulo}</h3>
          <p className="text-2xl font-bold">{c.valor}</p>
        </div>
      ))}
    </div>
  );
}
