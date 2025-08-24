// src/components/Layout/Menu.jsx
import { useNavigate } from "react-router-dom";
import { logout } from "../../utils/auth";

export default function Menu() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="flex justify-between items-center">
        <div className="font-bold text-xl">Projeto Excel</div>
        <div className="flex gap-6">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/analise-sku")}>
            Análise de SKUs
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded text-sm"
          >
            Logout ({currentUser?.username})
          </button>
        </div>
      </div>
    </nav>
  );
}
