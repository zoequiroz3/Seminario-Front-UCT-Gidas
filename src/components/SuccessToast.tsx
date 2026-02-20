import { useEffect } from "react";

type Props = {
  open: boolean;
  message: string;
  duration?: number;
  onClose: () => void;
};

export default function SuccessToast({
  open,
  message,
  duration = 2000,
  onClose,
}: Props) {
  useEffect(() => {
    if (!open) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="rounded-xl bg-emerald-600 text-white px-5 py-3 shadow-lg animate-fade-in">
        {message}
      </div>
    </div>
  );
}
