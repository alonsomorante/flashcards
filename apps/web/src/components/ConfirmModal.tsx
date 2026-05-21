import { X, AlertTriangle } from "lucide-react";

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onClose: () => void;
  variant?: "danger" | "primary";
}

export function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onClose,
  variant = "danger",
}: ConfirmModalProps) {
  if (!open) return null;

  const isDanger = variant === "danger";

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 p-6 pt-24 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-[1.5rem] bg-paper p-8 shadow-2xl animate-scale-in border-[3px] border-primary">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDanger && (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-danger-light">
                <AlertTriangle size={20} className="text-danger" />
              </div>
            )}
            <h2
              className="text-xl font-bold text-dark"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-full p-2 text-dark-muted transition-colors hover:bg-cream-dark"
          >
            <X size={20} />
          </button>
        </div>
        <p className="mb-8 text-base leading-relaxed text-dark-light">
          {message}
        </p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="cursor-pointer inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold text-dark-muted transition-colors hover:bg-cream-dark"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`cursor-pointer inline-flex h-11 items-center rounded-xl px-5 text-sm font-semibold text-white transition-all ${
              isDanger
                ? "bg-danger hover:bg-danger-light hover:text-danger"
                : "bg-primary hover:bg-primary-dark"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
