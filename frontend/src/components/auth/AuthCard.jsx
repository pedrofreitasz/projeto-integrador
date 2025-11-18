export default function AuthCard({
  title,
  subtitle,
  children,
  footer,
  badgeLabel
}) {
  return (
    <div className="w-full rounded-[24px] border border-slate-100 bg-white p-8 shadow-[0_20px_45px_rgba(15,23,42,0.08)]">
      {badgeLabel && (
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-400">
          {badgeLabel}
        </p>
      )}
      <h2 className="mt-2 text-2xl font-semibold text-slate-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}

      <div className="mt-6 space-y-5">{children}</div>

      {footer && <div className="mt-6">{footer}</div>}
    </div>
  );
}

