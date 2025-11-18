import { Link } from "react-router-dom";

export default function RecoverPassword() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
      <div className="max-w-lg space-y-4 rounded-3xl bg-white p-10 shadow-xl shadow-emerald-50">
        <p className="text-sm font-semibold uppercase tracking-[0.4em] text-emerald-500">
          Recuperar acesso
        </p>
        <h1 className="text-3xl font-semibold text-slate-900">
          Em breve por aqui
        </h1>
        <p className="text-slate-500">
          Esta tela ainda será implementada. Entre em contato com o suporte ou
          volte para o login.
        </p>
        <div className="flex flex-col gap-3 text-sm font-semibold text-emerald-600">
          <Link to="/login">Voltar para o login</Link>
          <Link to="/cadastro">Criar uma conta</Link>
        </div>
      </div>
    </div>
  );
}

