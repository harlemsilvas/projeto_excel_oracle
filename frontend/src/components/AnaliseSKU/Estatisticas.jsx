// src/components/AnaliseSKU/Estatisticas.jsx
export default function Estatisticas({ stats }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded shadow text-center dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Total de SKUs
        </p>
        <p className="text-xl font-bold dark:text-white">
          {stats.total_skus || 0}
        </p>
      </div>
      <div className="bg-white p-4 rounded shadow text-center dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">Duplicados</p>
        <p className="text-xl font-bold text-orange-600">
          {stats.total_duplicados || 0}
        </p>
      </div>
      <div className="bg-white p-4 rounded shadow text-center dark:bg-gray-800">
        <p className="text-sm text-gray-500 dark:text-gray-400">Páginas</p>
        <p className="text-xl font-bold dark:text-white">
          {stats.total_pages || 1}
        </p>
      </div>
    </div>
  );
}
