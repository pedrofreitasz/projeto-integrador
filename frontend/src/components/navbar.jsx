import { Link } from "react-router-dom";

export default function Navbar() {
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
          <li><Link to="/orçamentos" className="hover:text-emerald-600 transition">Para Empresas</Link></li>
          <li><Link to="/calculadora" className="hover:text-emerald-600 transition">Calculadora</Link></li>
          <li><Link to="/FAQ" className="hover:text-emerald-600 transition">Blog</Link></li>
          <li><Link to="/FAQ" className="hover:text-emerald-600 transition">FAQ</Link></li>
        </ul>
      </nav>

      <div className="flex items-center gap-4">
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
      </div>
    </header>
  );
}
