// src/components/Layout/Header.jsx
import { useNavigate } from "react-router-dom";
import { getCurrentUser, logout } from "../../utils/auth";

export default function Header() {
  const navigate = useNavigate();
  const user = getCurrentUser();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="bg-white shadow dark:bg-gray-800 dark:text-white">
      <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        {/* Logo / Nome do sistema */}
        <div className="flex items-center">
          <h1
            className="text-xl font-bold text-blue-600 cursor-pointer"
            onClick={() => navigate("/dashboard")}
          >
            📊 Projeto Excel
          </h1>
        </div>

        {/* Navegação */}
        <nav className="flex flex-wrap gap-4 sm:gap-6 text-sm font-medium">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition"
          >
            Dashboard
          </button>
          <button
            onClick={() => navigate("/analise-sku")}
            className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition"
          >
            Análise de SKUs
          </button>
          <button
            onClick={() => navigate("/analise-integracoes")}
            className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition"
          >
            Análise de Integrações
          </button>
          <button
            onClick={() => navigate("/produtos")}
            className="text-gray-700 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400 transition"
          >
            📦 Produtos
          </button>
        </nav>

        {/* Usuário e Logout */}
        <div className="flex items-center gap-4 text-sm">
          {user ? (
            <>
              <span className="text-gray-600 dark:text-gray-300">
                Olá, <strong>{user.username}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition"
              >
                🔐 Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition"
            >
              🔐 Login
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
