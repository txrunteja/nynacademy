import type { PropsWithChildren } from "react";
import { X } from "lucide-react";

interface ModalProps extends PropsWithChildren {
  open: boolean;
  title: string;
  onClose: () => void;
}

export function ModalOrDrawer({ open, title, onClose, children }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-pulse-subtle text-transparent" 
        style={{ animationDuration: '0.4s', animationIterationCount: 1, transform: 'none' }}
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative max-h-[90vh] w-full max-w-xl overflow-auto rounded-2xl border border-white/10 bg-[var(--surface)] shadow-2xl animate-slide-in">
        <div className="sticky top-0 flex items-center justify-between border-b border-[var(--border)] bg-[var(--surface)] px-8 py-5 z-10">
          <h3 className="text-xl font-bold tracking-tight text-[var(--text)]">{title}</h3>
          <button 
            className="app-close-button bg-[var(--bg-muted)]/50 hover:bg-red-100 dark:hover:bg-red-900/30 hover:text-red-500" 
            onClick={onClose}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-8 bg-[var(--bg)]/30">
          {children}
        </div>
      </div>
    </div>
  );
}
