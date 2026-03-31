import { motion, AnimatePresence } from "motion/react";
import { AlertCircle, X } from "lucide-react";
import { createPortal } from "react-dom";
import { cn } from "../lib/utils";

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const handleConfirm = async () => {
    await onConfirm();
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[9998]"
          />
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[400px] bg-surface border border-border shadow-2xl z-[9999] rounded-sm overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-border bg-background">
              <div className="flex items-center gap-2">
                {isDangerous && <AlertCircle className="w-4 h-4 text-red-400" />}
                <h2 className="text-sm font-mono font-bold uppercase tracking-widest text-text-main">
                  {title}
                </h2>
              </div>
              <button
                onClick={onCancel}
                className="text-text-dim hover:text-text-main transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <p className="text-sm text-text-main">{message}</p>

              <div className="flex items-center gap-3 justify-end">
                <button
                  onClick={onCancel}
                  disabled={isLoading}
                  className="px-4 py-2 bg-surface-hover border border-border rounded-sm text-sm font-mono text-text-main hover:bg-surface-hover/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  className={cn(
                    "px-4 py-2 rounded-sm text-sm font-mono text-on-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
                    isDangerous
                      ? "bg-red-600 hover:bg-red-700"
                      : "bg-primary hover:bg-primary/90"
                  )}
                >
                  {isLoading ? "..." : confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
