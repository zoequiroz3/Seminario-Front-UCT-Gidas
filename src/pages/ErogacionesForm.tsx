import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import { Erogaciones, upsertErogaciones } from "@/services/erogacionesServices";

export default function ErogacionesForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [data, setData] = useState<Partial<Erogaciones>>({
    id: "",
    egresos: undefined,
    ingresos: undefined,
    numeroErogacion: undefined,
    fuenteErogaciones: "",
    tipoErogacion: "",
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: Erogaciones) => upsertErogaciones(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["erogaciones"] }),
  });

  const changeText =
    (k: keyof Erogaciones) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.currentTarget.value;
      setData((d) => ({ ...d, [k]: v }));
    };

  const changeNumber =
    (k: keyof Erogaciones) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      setData((d) => ({
        ...d,
        [k]: v === "" ? undefined : Number(v),
      }));
    };

  function buildPayload(): Erogaciones {
    const {
      egresos,
      ingresos,
      numeroErogacion,
      fuenteErogaciones,
      tipoErogacion,
    } = data;

    if (!fuenteErogaciones?.trim()) {
      throw new Error("La fuente de erogación es obligatoria.");
    }
    if (!tipoErogacion?.trim()) {
      throw new Error("El tipo de erogación es obligatorio.");
    }
    if (!Number.isFinite(numeroErogacion)) {
      throw new Error("El número de erogación debe ser válido.");
    }
    if (!Number.isFinite(egresos) || egresos! < 0) {
      throw new Error("Los egresos deben ser un número válido.");
    }
    if (!Number.isFinite(ingresos) || ingresos! < 0) {
      throw new Error("Los ingresos deben ser un número válido.");
    }

    return {
      id: data.id || "",
      egresos: egresos!,
      ingresos: ingresos!,
      numeroErogacion: numeroErogacion!,
      fuenteErogaciones: fuenteErogaciones!,
      tipoErogacion: tipoErogacion!,
    };
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync(buildPayload());
      navigate("/erogaciones", { replace: true });
    } catch (err: any) {
      alert(err?.message ?? "No se pudo guardar.");
    }
  };

  return (
    <section>
      <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">
        Carga de Erogaciones
      </h2>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm space-y-8"
      >
        <Field label="Número de Erogación">
          <input
            type="number"
            className="input"
            value={data.numeroErogacion ?? ""}
            onChange={changeNumber("numeroErogacion")}
            placeholder="Ej: 101"
          />
        </Field>

        <Field label="Tipo de Erogación">
          <input
            className="input"
            value={data.tipoErogacion ?? ""}
            onChange={changeText("tipoErogacion")}
            placeholder="Ej: Transferencia, Subsidio, Reembolso…"
          />
        </Field>

        <Field label="Fuente de Erogación">
          <input
            className="input"
            value={data.fuenteErogaciones ?? ""}
            onChange={changeText("fuenteErogaciones")}
            placeholder="Ej: Tesoro Nacional"
          />
        </Field>

        <Field label="Ingresos">
          <input
            type="number"
            inputMode="decimal"
            className="input"
            value={data.ingresos ?? ""}
            onChange={changeNumber("ingresos")}
            placeholder="Ej: 200000.00"
          />
        </Field>

        <Field label="Egresos">
          <input
            type="number"
            inputMode="decimal"
            className="input"
            value={data.egresos ?? ""}
            onChange={changeNumber("egresos")}
            placeholder="Ej: 180000.00"
          />
        </Field>

        <div className="mt-8 flex items-center justify-between">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Volver
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando…" : "Cargar"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="md:text-[17px] block text-sm font-medium mb-4">{label}</label>
      {children}
    </div>
  );
}
