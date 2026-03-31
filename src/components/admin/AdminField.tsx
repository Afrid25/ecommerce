import type { ReactNode } from "react";

type AdminFieldProps = {
  label: string;
  helperText?: string;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
};

export const adminInputClassName =
  "w-full rounded-2xl border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)]";

export function AdminField({
  label,
  helperText,
  htmlFor,
  className = "",
  children,
}: AdminFieldProps) {
  return (
    <div className={`space-y-2 ${className}`.trim()}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold text-[#16311a]">
        {label}
      </label>
      {children}
      {helperText ? (
        <p className="text-xs leading-6 text-[var(--text-secondary)]">{helperText}</p>
      ) : null}
    </div>
  );
}
