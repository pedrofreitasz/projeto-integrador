const variants = {
  error: "border-red-200 bg-red-50 text-red-700",
  success: "border-emerald-200 bg-emerald-50 text-emerald-700"
};

export function FormAlert({ variant = "error", message }) {
  if (!message) return null;

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm font-medium ${variants[variant]}`}
    >
      {message}
    </div>
  );
}

