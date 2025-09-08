// src/pages/FinanciamientoDetalle.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import {
  getFinanciamientos,
  upsertFinanciamiento,
  type Financiamiento,
} from "@/services/financiamientoServices";

// ---- helpers de fecha (local, sin desfases) ----
const parseYMD = (s?: string | null): Date | null => {
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
  return `${d.padStart(2, "0")}/${m.padStart(2, "0")}/${y}`;
};
const fmtMoney = (n?: number) =>
  typeof n === "number" ? new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(n) : "—";

// Draft local (todos opcionales)
type FDraft = Partial<Financiamiento>;

export default function FinanciamientoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Traemos lista (mock o API real)
  const { data: list = [], isLoading, isError } = useQuery({
    queryKey: ["financiamientos"],
    queryFn: getFinanciamientos,
    staleTime: 60_000,
  });

  const item = list.find((x) => x.id === id);

  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<FDraft | null>(null);

  useEffect(() => {
    if (item) {
      setData({ ...item });
    }
  }, [item]);

  // Mutación de guardado
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: Financiamiento) => upsertFinanciamiento(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financiamientos"] }),
  });

  // Handlers seguros (leer value ANTES de setState)
  const changeText =
    (k: keyof Financiamiento) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.currentTarget.value;
      setData((d) => (d ? { ...d, [k]: v } : d));
    };

  const changeEntero =
    (k: keyof Financiamiento) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      setData((d) => (d ? { ...d, [k]: v === "" ? undefined : Math.trunc(Number(v)) } : d));
    };

  const changeDecimal =
    (k: keyof Financiamiento) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      setData((d) => (d ? { ...d, [k]: v === "" ? undefined : Number(v) } : d));
    };

  const setFechaIncorporacion = (dt: Date | null) =>
    setData((d) => (d ? { ...d, fechaIncorporacion: toYMD(dt) } : d));

  // Guardar cambios
  const save = async () => {
    if (!data || !item) return;

    // Validaciones mínimas
    const cant = Number(data.cantidadAdquirida);
    const monto = Number(data.montoInvertido);

    if (!item.denominacion?.trim()) {
      alert("La denominación es obligatoria.");
      return;
    }
    if (!Number.isInteger(cant) || cant < 0) {
      alert("La cantidad adquirida debe ser un entero válido (≥ 0).");
      return;
    }
    if (Number.isNaN(monto) || monto < 0) {
      alert("El monto invertido debe ser un número válido (≥ 0).");
      return;
    }
    if (!data.fechaIncorporacion) {
      alert("La fecha de incorporación es obligatoria.");
      return;
    }

    const payload: Financiamiento = {
      id: item.id,
      denominacion: item.denominacion, // bloqueada en edición
      cantidadAdquirida: cant,
      montoInvertido: monto,
      fechaIncorporacion: data.fechaIncorporacion!,
      descripcionBreve: data.descripcionBreve ?? "",
      fuenteFinanciamiento: data.fuenteFinanciamiento ?? "",
      destinatario: data.destinatario ?? "",
    };

    await mutateAsync(payload);
    setEditing(false);
  };

  // --------- UI ---------
  if (isLoading) return <div className="grid place-items-center min-h-[50vh]">Cargando…</div>;
  if (isError)   return <div className="grid place-items-center min-h-[50vh]">Error al cargar.</div>;
  if (!item || !data) {
    return (
      <section>
        <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">Objetos y Financiamiento</h2>
        <div className="rounded-xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          No se encontró el registro.
          <div className="mt-6">
            <Button variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">Objetos y Financiamiento</h2>

      {!editing ? (
        // --------- VISTA (detalle) ---------
        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <h3 className="md:text-[25px] text-lg font-semibold mb-2">{item.denominacion}</h3>

          <dl className="text-sm space-y-2">
            <Field label="Cantidad adquirida" value={String(item.cantidadAdquirida ?? "—")} />
            <Field label="Monto invertido" value={fmtMoney(item.montoInvertido)} />
            <Field label="Fecha de incorporación" value={fmtES(item.fechaIncorporacion)} />
            <Field label="Descripción breve" value={item.descripcionBreve || "—"} />
            <Field label="Fuente de financiamiento" value={item.fuenteFinanciamiento || "—"} />
            <Field label="Destinatario" value={item.destinatario || "—"} />
          </dl>

          <div className="mt-8 flex items-center justify-between font-medium">
            <Button variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
            <Button onClick={() => setEditing(true)}>Editar</Button>
          </div>
        </article>
      ) : (
        // --------- EDICIÓN (form inline) ---------
        <form
          onSubmit={(e) => { e.preventDefault(); void save(); }}
          className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm space-y-6"
        >
          <Field label="Denominación">
            <input className="input" value={item.denominacion} disabled />
          </Field>

          <Field label="Cantidad adquirida">
            <input
              type="number"
              inputMode="numeric"
              step={1}
              min={0}
              className="input"
              value={data.cantidadAdquirida ?? ""}
              onChange={changeEntero("cantidadAdquirida")}
              placeholder="Del bien"
            />
          </Field>

          <Field label="Monto invertido">
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0}
              className="input"
              value={data.montoInvertido ?? ""}
              onChange={changeDecimal("montoInvertido")}
              placeholder="Monto total"
            />
          </Field>

          <Field label="Fecha de incorporación">
            <DatePicker
              value={parseYMD(data.fechaIncorporacion)}
              onChange={setFechaIncorporacion}
              helperText="DD/MM/AAAA"
              className="input"
            />
          </Field>

          <Field label="Descripción breve">
            <input
              className="input"
              value={data.descripcionBreve ?? ""}
              onChange={changeText("descripcionBreve")}
              placeholder="Del bien o servicio"
            />
          </Field>

          <Field label="Fuente de financiamiento">
            <input
              className="input"
              value={data.fuenteFinanciamiento ?? ""}
              onChange={changeText("fuenteFinanciamiento")}
              placeholder="Organismo/Programa"
            />
          </Field>

          <Field label="Destinatario">
            <input
              className="input"
              value={data.destinatario ?? ""}
              onChange={changeText("destinatario")}
              placeholder=""
            />
          </Field>

          <div className="mt-8 flex items-center justify-between">
            <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={() => { setEditing(false); setData({ ...item }); }}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Guardando…" : "Guardar cambios"}
              </Button>
            </div>
          </div>
        </form>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  className = "",
  children,
}: {
  label: string;
  value?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={className}>
      <dt className="md:text-[20px] font-medium mt-7">{label}</dt>
      <dd className="md:text-[18px] text-slate-500 mt-2">
        {children ?? value ?? "—"}
      </dd>
    </div>
  );
}
