import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProfile, getEmployeeProfile } from "../services/api";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const loadUserProfile = () => {
    const token = localStorage.getItem("token");
    const employeeToken = localStorage.getItem("employeeToken");

    if (employeeToken) {
      getEmployeeProfile()
        .then((data) => {
          setEmployee(data.employee || data);
          setUser(null);
          setLoading(false);
        })
        .catch(() => {
          setEmployee(null);
          setLoading(false);
          localStorage.removeItem("employeeToken");
          localStorage.removeItem("employeeData");
        });
    } else if (token) {
      getProfile(token)
        .then((data) => {
          setUser(data.user || data);
          setEmployee(null);
          setLoading(false);
        })
        .catch(() => {
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
    setIsMenuOpen(false);
  };

  const isEmployee = !!employee;

  const renderLinks = () => (
    <>
      {!isEmployee && (
        <>
          <Link to="/" className="hover:text-emerald-600 transition">
            Início
          </Link>
          <Link to="/calculadora" className="hover:text-emerald-600 transition">
            Orçamento
          </Link>
          <Link to="/FAQ" className="hover:text-emerald-600 transition">
            FAQ
          </Link>
        </>
      )}
      <Link to="/mapa" className="hover:text-emerald-600 transition">
        Mapa de Pontos
      </Link>
      {!isEmployee && (
        <Link to="/historico" className="hover:text-emerald-600 transition">
          Histórico
        </Link>
      )}
      {isEmployee && (
        <>
          <Link
            to="/dashboard-funcionario"
            className="hover:text-emerald-600 transition"
          >
            Dashboard
          </Link>
          {(employee?.position === "responsável por instalação" ||
            employee?.position === "CEO") && (
            <Link
              to="/instalacao"
              className="hover:text-emerald-600 transition"
            >
              Instalações
            </Link>
          )}
          {employee?.position === "CEO" && (
            <Link to="/balanco" className="hover:text-emerald-600 transition">
              Balanço
            </Link>
          )}
        </>
      )}
    </>
  );

  const renderAuthArea = (isMobile = false) => {
    if (loading) {
      return (
        <span className="text-sm text-gray-500">
          Carregando...
        </span>
      );
    }

    if (employee) {
      return (
        <div className={`flex items-center gap-4 ${isMobile ? "flex-col items-start" : ""}`}>
          <Link
            to="/dashboard-funcionario"
            className="flex items-center gap-3 hover:opacity-80 transition"
            onClick={() => setIsMenuOpen(false)}
          >
            {employee.imagemUrl ? (
              <img
                src={`${
                  process.env.REACT_APP_API_URL || "http://localhost:5000"
                }${employee.imagemUrl}`}
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
            className="px-6 py-2 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 transition font-medium w-full md:w-auto"
          >
            Sair
          </button>
        </div>
      );
    }

    if (user) {
      return (
        <div className={`flex items-center gap-4 ${isMobile ? "flex-col items-start" : ""}`}>
          <Link
            to="/perfil"
            className="flex items-center gap-3 hover:opacity-80 transition"
            onClick={() => setIsMenuOpen(false)}
          >
            {user.imagemUrl ? (
              <img
                src={`${
                  process.env.REACT_APP_API_URL || "http://localhost:5000"
                }${user.imagemUrl}`}
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
            className="px-6 py-2 rounded-lg border border-red-400 text-red-500 hover:bg-red-50 transition font-medium w-full md:w-auto"
          >
            Sair
          </button>
        </div>
      );
    }

    return (
      <div className={`flex items-center gap-3 ${isMobile ? "flex-col w-full" : ""}`}>
        <Link
          to="/login"
          onClick={() => setIsMenuOpen(false)}
          className="px-5 py-2 rounded-lg border border-emerald-400 text-emerald-500 hover:bg-emerald-50 transition font-medium w-full md:w-auto text-center"
        >
          Login
        </Link>
        <Link
          to="/cadastro"
          onClick={() => setIsMenuOpen(false)}
          className="px-5 py-2 rounded-lg bg-emerald-500 text-black font-semibold hover:bg-emerald-600 transition w-full md:w-auto text-center"
        >
          Cadastrar
        </Link>
      </div>
    );
  };

  return (
    <>
      <header className="w-full px-4 py-3 md:px-10 md:py-4 bg-white shadow-sm flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-3" onClick={() => setIsMenuOpen(false)}>
            <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-full bg-emerald-500 text-sm md:text-base font-semibold text-white">
              EV
            </div>
            <h1 className="text-lg md:text-xl font-semibold">EV Charge SC</h1>
          </Link>
        </div>

        {/* Links desktop */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-8 text-sm font-medium text-gray-700">
            {renderLinks()}
          </ul>
        </nav>

        {/* Área de login desktop */}
        <div className="hidden md:flex items-center gap-4">
          {renderAuthArea(false)}
        </div>

        {/* Botão hamburguer mobile */}
<button
  type="button"
  aria-label="Abrir menu"
  className="md:hidden inline-flex items-center justify-center h-9 w-9 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
  onClick={() => setIsMenuOpen(true)}
>
  <span className="sr-only">Abrir menu</span>
  <div className="flex flex-col items-center justify-center gap-[3px]">
    <span className="block w-5 h-[2px] bg-slate-700 rounded-sm" />
    <span className="block w-5 h-[2px] bg-slate-700 rounded-sm" />
    <span className="block w-5 h-[2px] bg-slate-700 rounded-sm" />
  </div>
</button>

      </header>

      {/* Overlay + sidebar mobile */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setIsMenuOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-72 max-w-full bg-white shadow-xl px-5 py-6 flex flex-col gap-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-xs font-semibold text-white">
                  EV
                </div>
                <span className="font-semibold text-base">EV Charge SC</span>
              </div>
              <button
                type="button"
                aria-label="Fechar menu"
                className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"
                onClick={() => setIsMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            <nav className="flex flex-col gap-3 text-sm font-medium text-gray-700">
              {renderLinks()}
            </nav>

            <div className="mt-4 border-t pt-4">
              {renderAuthArea(true)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
