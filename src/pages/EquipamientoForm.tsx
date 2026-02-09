import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import { getEquipamientoById, createEquipamiento } from "@/services/equipamientoServices";
import React from "react";


// helpers fecha (local, sin timezone shift)
const parseYMD = (s?: string | null): Date | null => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

export default function EquipamientoForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: initial, isLoading } = useQuery({
    queryKey: ["equipamiento", id],
    queryFn: () => (id ? getEquipamientoById(Number(id)) : null),
    enabled: Boolean(id),
  });

  const [data, setData] = React.useState({
    denominacion: "",
    descripcion_breve: "",
    monto_invertido: undefined as number | undefined,
    fecha_incorporacion: "",
  });

  // cargar datos si es edición
  React.useEffect(() => {
    if (initial) {
      setData({
        denominacion: initial.denominacion ?? "",
        descripcion_breve: initial.descripcion_breve ?? "",
        monto_invertido: initial.monto_invertido ?? undefined,
        fecha_incorporacion: initial.fecha_incorporacion ?? "",
      });
    }
  }, [initial]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: createEquipamiento,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["equipamiento"] });
    },
  });

  if (isLoading) return <p>Cargando…</p>;

const isEdit = Boolean(id);


  return (
    <section className="w-full">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {isEdit ? "Editar equipamiento" : "Nuevo equipamiento"}
      </h2>

      <form
        onSubmit={async (e) => {
          e.preventDefault();

          // 🔴 validaciones mínimas
          if (!data.denominacion.trim()) {
            alert("La denominación es obligatoria");
            return;
          }
          if (!data.descripcion_breve.trim()) {
            alert("La descripción es obligatoria");
            return;
          }
          if (!data.fecha_incorporacion) {
            alert("La fecha es obligatoria");
            return;
          }
          if (!data.monto_invertido || data.monto_invertido <= 0) {
            alert("El monto debe ser mayor a 0");
            return;
          }

          // 🟢 payload EXACTO para el backend
          await mutateAsync({
            denominacion: data.denominacion,
            descripcion_breve: data.descripcion_breve,
            fecha_incorporacion: data.fecha_incorporacion,
            monto_invertido: data.monto_invertido,
          });

          navigate("/equipamiento");
        }}
        className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm space-y-6"
      >
        <Field label="Denominación">
          <input
            className="input text-sm md:text-base"
            value={data.denominacion}
            onChange={(e) =>
              setData((d) => ({ ...d, denominacion: e.target.value }))
            }
          />
        </Field>

        <Field label="Descripción breve">
          <input
            className="input text-sm md:text-base"
            value={data.descripcion_breve}
            onChange={(e) =>
              setData((d) => ({ ...d, descripcion_breve: e.target.value }))
            }
          />
        </Field>

        <Field label="Monto invertido">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min={0}
            className="input text-sm md:text-base"
            value={data.monto_invertido ?? ""}
            onChange={(e) =>
              setData((d) => ({
                ...d,
                monto_invertido: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              }))
            }
          />
        </Field>

        <Field label="Fecha de incorporación">
          <DatePicker
            value={parseYMD(data.fecha_incorporacion)}
            onChange={(dt) =>
              setData((d) => ({
                ...d,
                fecha_incorporacion: dt
                  ? dt.toISOString().slice(0, 10)
                  : "",
              }))
            }
            helperText="DD/MM/AAAA"
            className="input text-sm md:text-base"
          />
        </Field>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="px-3 py-1 text-xs"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>

          <Button
            type="submit"
            size="sm"
            className="px-3 py-1 text-xs"
            disabled={isPending}
          >
            {isPending ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1.5">  
        {label}
      </label>
      {children}
    </div>
  );
}
