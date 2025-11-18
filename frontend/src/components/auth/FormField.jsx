export function FormField({
  label,
  htmlFor,
  type = "text",
  value,
  onChange,
  placeholder,
  error,
  rightSlot,
  ...rest
}) {
  return (
    <label className="flex w-full flex-col gap-2 text-sm font-medium text-slate-600">
      <span>{label}</span>
      <div className="relative">
        <input
          id={htmlFor}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 ${
            error ? "border-red-400" : "border-slate-200"
          }`}
          {...rest}
        />
        {rightSlot && (
          <div className="absolute inset-y-0 right-3 flex items-center">
            {rightSlot}
          </div>
        )}
      </div>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </label>
  );
}

