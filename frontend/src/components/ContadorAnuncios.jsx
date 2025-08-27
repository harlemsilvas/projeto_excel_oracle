// src/components/ContadorAnuncios.jsx
export default function ContadorAnuncios({ total }) {
  return (
    <div className="bg-white p-4 rounded shadow text-center">
      <p className="text-gray-500 text-sm">Total de Anúncios</p>
      <p className="text-2xl font-bold">{total.toLocaleString("pt-BR")}</p>
    </div>
  );
}
