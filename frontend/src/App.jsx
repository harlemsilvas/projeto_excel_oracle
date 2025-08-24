// src/App.jsx
import { BrowserRouter } from "react-router-dom";
import Header from "./components/Layout/Header";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
        <Header />
        <main className="p-6 max-w-7xl mx-auto">
          <AppRoutes />
        </main>
      </div>
    </BrowserRouter>
  );
}
