import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile } from "../services/api";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    if (!token) {
      setLoading(false);
      return;
    }

    getProfile(token)
      .then(data => {
        setUser(data.user || data);
        setLoading(false);
      })
      .catch(err => {
        setUser(null);
        setLoading(false);
        localStorage.removeItem("token");
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/");
  };

  return (
    <header className="w-full flex items-center justify-between px-10 py-4 bg-white shadow-sm">
        <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-base font-semibold text-white">
                EV
                </div>
                <h1 className="text-xl font-semibold">EV Charge SC</h1>
            </Link>
        </div>

      <nav>
        <ul className="flex items-center gap-8 text-sm font-medium text-gray-700">
          <li><Link to="/" className="hover:text-emerald-600 transition">Início</Link></li>
          <li><Link to="/mapa" className="hover:text-emerald-600 transition">Mapa de Pontos</Link></li>
          <li><Link to="/dashboard" className="hover:text-emerald-600 transition">Dashboard</Link></li>
          <li><Link to="/orcamentos" className="hover:text-emerald-600 transition">Orçamento</Link></li>
          <li><Link to="/calculadora" className="hover:text-emerald-600 transition">Calculadora</Link></li>
          <li><Link to="/historico" className="hover:text-emerald-600 transition">Histórico</Link></li>
          <li><Link to="/FAQ" className="hover:text-emerald-600 transition">FAQ</Link></li>
        </ul>
      </nav>

      <div className="flex items-center gap-4">
        {loading ? (
          <span className="text-sm text-gray-500">Carregando...</span>
        ) : user ? (
          <div className="flex items-center gap-4">
            <Link
              to="/perfil"
              className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition"
            >
              Olá, {user.name || user.nome}
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 transition font-medium"
            >
              Sair
            </button>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="px-6 py-2 rounded-lg border border-emerald-400 text-emerald-500 hover:bg-emerald-50 transition font-medium"
            >
              Login
            </Link>

            <Link
              to="/cadastro"
              className="px-6 py-2 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-600 transition"
            >
              Cadastrar
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
