import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t mt-auto px-4 py-6 md:px-16 md:py-10">
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-start md:justify-between gap-6">
    {/* bloco logo + texto */}
    <div className="flex flex-col gap-3 md:max-w-xs">
      <div className="flex items-center gap-3">
        <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-emerald-500 text-sm md:text-base font-semibold text-white">
          EV
        </div>
        <h1 className="text-lg md:text-xl font-semibold">EV Charge SC</h1>
      </div>

      <p className="text-gray-600 text-xs md:text-sm leading-relaxed">
        Sua jornada para a mobilidade elétrica começa aqui. Qualidade e confiança no Oeste Catarinense.
      </p>

      <p className="text-[11px] md:text-xs text-gray-500 flex items-center gap-2 mt-1">
        © 2025 EV Charge SC™. Todos os direitos reservados
      </p>
    </div>

    {/* links rápidos */}
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold text-sm md:text-base">
        LINKS RÁPIDOS
      </h2>
      <ul className="flex flex-col gap-1.5 text-xs md:text-sm text-gray-700">
        <li>
          <Link to="/" className="hover:text-emerald-600 transition">
            Início
          </Link>
        </li>
        <li>
          <Link
            to="/calculadora"
            className="hover:text-emerald-600 transition"
          >
            Calculadora
          </Link>
        </li>
      </ul>
    </div>

    {/* contato */}
    <div className="flex flex-col gap-3">
      <h2 className="font-semibold text-sm md:text-base">
        CONTATO
      </h2>
      <ul className="flex flex-col gap-1.5 text-xs md:text-sm text-gray-700">
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
