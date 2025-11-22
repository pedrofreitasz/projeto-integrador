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
          <li><Link to="/">Início</Link></li>
          <li><Link to="/mapa">Mapa de Pontos</Link></li>
          <li><Link to="/orçamentos">Orçamentos</Link></li>
          <li><Link to="/calculadora">Calculadora</Link></li>
          <li><Link to="/historico">Histórico</Link></li>
          <li><Link to="/FAQ">FAQ</Link></li>
        </ul>
      </nav>

      <div className="flex items-center gap-4">
        <Link
          to="/login"
          className="px-6 py-2 rounded-xl border border-green-400 text-green-500 hover:bg-green-50 transition"
        >
          Login
        </Link>

        <Link
          to="/cadastro"
          className="px-6 py-2 rounded-xl bg-green-400 text-black font-semibold hover:bg-green-500 transition"
        >
          Cadastrar
        </Link>
      </div>
    </header>
  );
}
