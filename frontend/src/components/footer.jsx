import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-white px-16 py-12 border-t mt-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 items-start">

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-base font-semibold text-white">
              EV
            </div>
            <h1 className="text-xl font-semibold">EV Charge SC</h1>
          </div>

          <p className="text-gray-600 max-w-xs text-sm leading-relaxed">
            Sua jornada para a mobilidade elétrica começa aqui. Qualidade e confiança no Oeste Catarinense.
          </p>

          <p className="text-xs text-gray-500 flex items-center gap-2 mt-2">
            © 2025 EV Charge SC™. Todos os direitos reservados
          </p>
        </div>

        <div>
            <h2 className="font-semibold mb-4">LINKS RÁPIDOS</h2>
            <ul className="flex flex-col gap-2 text-sm text-gray-700">
                <li>
                  <Link to="/" className="hover:text-emerald-600 transition">Início</Link>
                </li>
                <li>
                  <Link to="/calculadora" className="hover:text-emerald-600 transition">Calculadora</Link>
                </li>
            </ul>
        </div>

        <div>
          <h2 className="font-semibold mb-4">CONTATO</h2>
          <ul className="flex flex-col gap-2 text-sm text-gray-700">
            <li>chargescev@gmail.com</li>
            <li>(49) 99800-3195</li>
            <li>Rodovia SC 283 – km 17,</li>
            <li>Concórdia – Santa Catarina, CEP 89703-720</li>
          </ul>
        </div>

      </div>
    </footer>
  );
}
