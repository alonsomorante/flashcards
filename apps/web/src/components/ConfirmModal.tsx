import { X } from "lucide-react";

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-[1.5rem] bg-paper p-6 shadow-2xl animate-scale-in border-[3px] border-primary">
        <div className="mb-4 flex items-center justify-between">
          <h2
            className="text-lg font-semibold text-dark"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer rounded-lg p-1.5 text-dark-muted transition-colors hover:bg-cream-dark"
          >
            <X size={18} />
          </button>
        </div>
        <p className="mb-6 text-sm leading-relaxed text-dark-light">
          {message}
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="cursor-pointer inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium text-dark-muted transition-colors hover:bg-cream-dark"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`cursor-pointer inline-flex h-10 items-center rounded-xl px-4 text-sm font-medium text-white transition-all ${
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
