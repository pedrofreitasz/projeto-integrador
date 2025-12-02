import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile, getEmployeeProfile } from "../services/api";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadUserProfile = () => {
    const token = localStorage.getItem("token");
    const employeeToken = localStorage.getItem("employeeToken");
    
    if (employeeToken) {
      getEmployeeProfile()
        .then(data => {
          setEmployee(data.employee || data);
          setUser(null);
          setLoading(false);
        })
        .catch(err => {
          setEmployee(null);
          setLoading(false);
          localStorage.removeItem("employeeToken");
          localStorage.removeItem("employeeData");
        });
    } else if (token) {
      getProfile(token)
        .then(data => {
          setUser(data.user || data);
          setEmployee(null);
          setLoading(false);
        })
        .catch(err => {
          setUser(null);
          setLoading(false);
          localStorage.removeItem("token");
        });
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserProfile();

    const handleProfileUpdate = () => {
      loadUserProfile();
    };

    window.addEventListener("profileUpdated", handleProfileUpdate);

    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
    };
  }, []);

  const handleLogout = () => {
    if (employee) {
      localStorage.removeItem("employeeToken");
      localStorage.removeItem("employeeData");
      setEmployee(null);
      navigate("/login-funcionario");
    } else {
      localStorage.removeItem("token");
      setUser(null);
      navigate("/");
    }
  };

  const isEmployee = !!employee;

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
          {!isEmployee && (
            <>
              <li><Link to="/" className="hover:text-emerald-600 transition">Início</Link></li>
              <li><Link to="/calculadora" className="hover:text-emerald-600 transition">Orçamento</Link></li>
              <li><Link to="/FAQ" className="hover:text-emerald-600 transition">FAQ</Link></li>
            </>
          )}
          <li><Link to="/mapa" className="hover:text-emerald-600 transition">Mapa de Pontos</Link></li>
          {!isEmployee && (
            <li><Link to="/historico" className="hover:text-emerald-600 transition">Histórico</Link></li>
          )}
          {isEmployee && (
            <>
              <li><Link to="/dashboard-funcionario" className="hover:text-emerald-600 transition">Dashboard</Link></li>
              {(employee?.position === "responsável por instalação" || employee?.position === "CEO") && (
                <li><Link to="/instalacao" className="hover:text-emerald-600 transition">Instalações</Link></li>
              )}
              {employee?.position === "CEO" && (
                <li><Link to="/balanco" className="hover:text-emerald-600 transition">Balanço</Link></li>
              )}
            </>
          )}
        </ul>
      </nav>

      <div className="flex items-center gap-4">
        {loading ? (
          <span className="text-sm text-gray-500">Carregando...</span>
        ) : employee ? (
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard-funcionario"
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              {employee.imagemUrl ? (
                <img
                  src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}${employee.imagemUrl}`}
                  alt="Foto de perfil"
                  className="h-10 w-10 rounded-full object-cover border-2 border-emerald-200"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
                  {employee.name?.charAt(0)?.toUpperCase() || "F"}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition">
                Olá, {employee.name}
              </span>
            </Link>
            <button
              onClick={handleLogout}
              className="px-6 py-2 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 transition font-medium"
            >
              Sair
            </button>
          </div>
        ) : user ? (
          <div className="flex items-center gap-4">
            <Link
              to="/perfil"
              className="flex items-center gap-3 hover:opacity-80 transition"
            >
              {user.imagemUrl ? (
                <img
                  src={`${process.env.REACT_APP_API_URL || "http://localhost:5000"}${user.imagemUrl}`}
                  alt="Foto de perfil"
                  className="h-10 w-10 rounded-full object-cover border-2 border-emerald-200"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-emerald-500 flex items-center justify-center text-white font-semibold text-sm">
                  {(user.name || user.nome)?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
              <span className="text-sm font-medium text-gray-700 hover:text-emerald-600 transition">
                Olá, {user.name || user.nome}
              </span>
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
