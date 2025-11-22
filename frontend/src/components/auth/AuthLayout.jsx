export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-10">
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-base font-semibold text-white">
              EV
            </div>
            <span className="text-xl font-semibold text-slate-800">
              EV Charge SC
            </span>
          </div>
        </header>

        <main className="w-full max-w-[360px]">{children}</main>
      </div>
    </div>
  );
}

