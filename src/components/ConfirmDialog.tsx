import Button from "@/components/Button";

type Props = {
  open: boolean;
  title: string;
  message?: string;
  items?: string[]; 
  onCancel: () => void;
  onConfirm: () => void;
};


export default function ConfirmDialog({
  open,
  title,
  message,
  items = [],
  onCancel,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Fondo blur */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal centrado */}
      <div
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-2">
          {title}
        </h3>

        {message && (
          <p className="text-sm text-slate-600 mb-3">
            {message}
          </p>
        )}

        {items.length > 0 && (
          <ul className="mb-4 max-h-40 overflow-y-auto rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {items.map((name) => (
              <li key={name} className="py-0.5">
                • {name}
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-between">
          <Button
            variant="secondary"
            size="sm"
            className="px-3 py-1 text-xs"
            onClick={onCancel}
          >
            Cancelar
          </Button>

          <Button
            size="sm"
            className="px-3 py-1 text-xs"
            onClick={onConfirm}
          >
            Aceptar
          </Button>
        </div>
      </div>
    </div>
  );
}
