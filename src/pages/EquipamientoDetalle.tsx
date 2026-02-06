import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import { useEquipamiento } from "@/hooks/useEquipamiento";
import type { Equipamiento } from "@/services/equipamientoServices";

// -------- helpers fecha --------
const parseYMD = (s?: string): Date | null => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const toYMD = (date: Date | null): string => {
  if (!date) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const fmtES = (ymd?: string) => {
  if (!ymd) return "—";
  const [y, m, d] = ymd.split("-");
  return `${d}/${m}/${y}`;
};

const fmtMoney = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 2,
      }).format(n)
    : "—";

// -------- draft --------
type Draft = Partial<Equipamiento>;

export default function EquipamientoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { list, isLoading, isError, update, updating } = useEquipamiento();

  const item = list.find((e) => e.id === Number(id));

  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<Draft | null>(null);

  useEffect(() => {
    if (item) setData({ ...item });
  }, [item]);

  if (isLoading)
    return <div className="grid place-items-center min-h-[50vh]">Cargando…</div>;

  if (isError || !item || !data) {
    return (
      <section>
        <h2 className="text-[38px] font-semibold">Equipamiento</h2>
        <div className="mt-6 rounded-xl border bg-white/80 p-6">
          No se encontró el registro.
          <div className="mt-6">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Volver
            </Button>
          </div>
        </div>
      </section>
    );
  }

  // -------- handlers --------
  const changeText =
    (k: keyof Equipamiento) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.currentTarget.value;
      setData((d) => (d ? { ...d, [k]: v } : d));
    };

  const changeDecimal =
    (k: keyof Equipamiento) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      setData((d) =>
        d ? { ...d, [k]: v === "" ? undefined : Number(v) } : d
      );
    };

  const setFecha = (dt: Date | null) =>
    setData((d) => (d ? { ...d, fecha_incorporacion: toYMD(dt) } : d));

  // -------- guardar --------
  const save = async () => {
    if (!data) return;

    if (!data.denominacion?.trim()) {
      alert("La denominación es obligatoria.");
      return;
    }
    if (!data.descripcion_breve?.trim()) {
      alert("La descripción es obligatoria.");
      return;
    }
    if (!data.fecha_incorporacion) {
      alert("La fecha de incorporación es obligatoria.");
      return;
    }
    if (
      data.monto_invertido === undefined ||
      Number.isNaN(Number(data.monto_invertido)) ||
      data.monto_invertido <= 0
    ) {
      alert("El monto invertido debe ser mayor a 0.");
      return;
    }

    await update({
      id: item.id,
      data: {
        denominacion: data.denominacion,
        descripcion_breve: data.descripcion_breve,
        fecha_incorporacion: data.fecha_incorporacion,
        monto_invertido: data.monto_invertido,
      },
    });

    qc.invalidateQueries({ queryKey: ["equipamiento"] });
    setEditing(false);
  };

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-[38px] font-semibold">Equipamiento</h2>

      {/* -------- VISTA -------- */}
      {!editing ? (
        <article className="rounded-2xl border bg-white/80 p-6 shadow-sm">
          <h3 className="text-lg md:text-[25px] font-semibold mb-2">
            {item.denominacion}
          </h3>

          <dl className="space-y-2 text-sm">
            <Field label="Monto invertido" value={fmtMoney(item.monto_invertido)} />
            <Field
              label="Fecha de incorporación"
              value={fmtES(item.fecha_incorporacion)}
            />
            <Field
              label="Descripción breve"
              value={item.descripcion_breve || "—"}
            />
          </dl>

          <div className="mt-8 flex justify-between">
            <Button variant="secondary" onClick={() => navigate(-1)}>
              Volver
            </Button>
            <Button onClick={() => setEditing(true)}>Editar</Button>
          </div>
        </article>
      ) : (
        /* -------- EDICIÓN -------- */
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void save();
          }}
          className="rounded-2xl border bg-white/80 p-6 shadow-sm space-y-6"
        >
          <Field label="Denominación">
            <input className="input" value={data.denominacion} disabled />
          </Field>

          <Field label="Descripción breve">
            <input
              className="input"
              value={data.descripcion_breve ?? ""}
              onChange={changeText("descripcion_breve")}
            />
          </Field>

          <Field label="Monto invertido">
            <input
              type="number"
              step="0.01"
              className="input"
              value={data.monto_invertido ?? ""}
              onChange={changeDecimal("monto_invertido")}
            />
          </Field>

          <Field label="Fecha de incorporación">
            <DatePicker
              value={parseYMD(data.fecha_incorporacion)}
              onChange={setFecha}
              helperText="DD/MM/AAAA"
              className="input"
            />
          </Field>

          <div className="mt-8 flex justify-between">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setEditing(false);
                setData({ ...item });
              }}
            >
              Cancelar
            </Button>

            <Button type="submit" disabled={updating}>
              {updating ? "Guardando…" : "Guardar cambios"}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

// -------- campo reutilizable --------
function Field({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: React.ReactNode;
}) {
  return (
    <div>
      <dt className="md:text-[20px] font-medium mt-7">{label}</dt>
      <dd className="md:text-[18px] text-slate-500 mt-2">
        {children ?? value ?? "—"}
      </dd>
    </div>
  );
}
