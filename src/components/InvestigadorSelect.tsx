// src/components/InvestigadorSelect.tsx
import { usePersonal } from "@/hooks/usePersonal";
import type { Personal } from "@/services/personalServices";

export default function InvestigadorSelect({
  value,
  onChange,
  name = "investigadorId",
  required = true,
  className = "input", // 👈 usa la misma clase que tus inputs
  disabled,
}: {
  value?: string;
  onChange: (id: string) => void;
  name?: string;
  required?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  const { list, isLoading } = usePersonal("INVESTIGADOR");

  return (
    <select
      name={name}
      className={className}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled || isLoading || list.length === 0}
      required={required}
    >
      <option value="" disabled>
        {isLoading ? "Cargando..." : "Seleccione un/a investigador/a"}
      </option>
      {(list as Personal[]).map((p) => (
        <option key={p.id} value={p.id}>
          {p.nombreApellido}
        </option>
      ))}
    </select>
  );
}
