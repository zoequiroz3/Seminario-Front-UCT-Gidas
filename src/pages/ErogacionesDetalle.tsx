import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import {
  getErogaciones,
  upsertErogaciones,
  type Erogaciones,
} from "@/services/erogacionesServices";

const fmtMoney = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 2,
      }).format(n)
    : "—";

// Draft local (todos opcionales)
type EDraft = Partial<Erogaciones>;

export default function ErogacionesDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: list = [], isLoading, isError } = useQuery({
    queryKey: ["erogaciones"],
    queryFn: getErogaciones,
    staleTime: 60_000,
  });

  const item = list.find((x) => x.id === id);
  const [editing, setEditing] = useState(false);
  const [data, setData] = useState<EDraft | null>(null);

  useEffect(() => {
    if (item) setData({ ...item });
  }, [item]);

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: Erogaciones) => upsertErogaciones(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["erogaciones"] }),
  });

  const changeText =
    (k: keyof Erogaciones) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.currentTarget.value;
      setData((d) => (d ? { ...d, [k]: v } : d));
    };

  const changeDecimal =
    (k: keyof Erogaciones) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      setData((d) => (d ? { ...d, [k]: v === "" ? undefined : Number(v) } : d));
    };

  const changeEntero =
    (k: keyof Erogaciones) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      setData((d) => (d ? { ...d, [k]: v === "" ? undefined : Math.trunc(Number(v)) } : d));
    };

  const save = async () => {
    if (!data || !item) return;

    const payload: Erogaciones = {
      id: item.id,
      egresos: data.egresos ?? 0,
      ingresos: data.ingresos ?? 0,
      fuenteErogaciones: data.fuenteErogaciones ?? "",
      tipoErogacion: data.tipoErogacion ?? "",
      numeroErogacion: data.numeroErogacion ?? 0,
    };

    await mutateAsync(payload);
    setEditing(false);
  };

  if (isLoading) return <div className="grid place-items-center min-h-[50vh]">Cargando…</div>;
  if (isError) return <div className="grid place-items-center min-h-[50vh]">Error al cargar.</div>;
  if (!item || !data) {
    return (
      <section>
        <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">Erogaciones</h2>
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
      <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">Erogaciones</h2>

      {!editing ? (
        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <h3 className="md:text-[25px] text-lg font-semibold mb-2">
            Erogación N° {String(item.numeroErogacion).padStart(6, "0")}
          </h3>

          <dl className="text-sm space-y-2">
            <Field label="Tipo de erogación" value={item.tipoErogacion} />
            <Field label="Ingresos" value={fmtMoney(item.ingresos)} />
            <Field label="Egresos" value={fmtMoney(item.egresos)} />
            <Field label="Fuente de financiamiento" value={item.fuenteErogaciones} />
          </dl>

          <div className="mt-8 flex items-center justify-between font-medium">
            <Button variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
            <Button onClick={() => setEditing(true)}>Editar</Button>
          </div>
        </article>
      ) : (
        <form
            onSubmit={(e) => { e.preventDefault(); void save(); }}
            className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm space-y-6"
            >
            <Field label="Número de erogación">
                <input
                className="input"
                value={String(item.numeroErogacion).padStart(6, "0")}
                disabled
                />
            </Field>

            <Field label="Tipo de erogación">
                <input
                className="input"
                value={data.tipoErogacion ?? ""}
                onChange={changeText("tipoErogacion")}
                placeholder="Gasto corriente, inversión, etc."
                />
            </Field>

            <Field label="Ingresos">
                <input
                type="number"
                inputMode="decimal"
                className="input"
                value={data.ingresos ?? ""}
                onChange={changeDecimal("ingresos")}
                placeholder="Monto recibido"
                />
            </Field>

            <Field label="Egresos">
                <input
                type="number"
                inputMode="decimal"
                className="input"
                value={data.egresos ?? ""}
                onChange={changeDecimal("egresos")}
                placeholder="Monto gastado"
                />
            </Field>

            <Field label="Fuente de financiamiento">
                <input
                className="input"
                value={data.fuenteErogaciones ?? ""}
                onChange={changeText("fuenteErogaciones")}
                placeholder="Programa u organismo"
                />
            </Field>

            <div className="mt-8 flex items-center justify-between">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
                <div className="flex gap-2">
                <Button type="button" variant="secondary" onClick={() => { setEditing(false); setData({ ...item }); }}>
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
