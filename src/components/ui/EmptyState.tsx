import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-[var(--surface)] border border-[var(--border)] rounded-2xl border-dashed animate-slide-in hover:border-blue-400/50 transition-colors">
      <div className="flex items-center justify-center w-20 h-20 rounded-full bg-[var(--bg-muted)] text-[var(--text-muted)] mb-6 shadow-inner">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[var(--text)] mb-2 tracking-tight">{title}</h3>
      <p className="text-[var(--text-muted)] max-w-sm mb-8 leading-relaxed">{description}</p>
      {action}
    </div>
  );
}
