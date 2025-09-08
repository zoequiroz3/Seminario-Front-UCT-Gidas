// src/pages/FinanciamientoForm.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import {
  upsertFinanciamiento,
  type Financiamiento,
} from "@/services/financiamientoServices";

// helpers fecha (local, sin timezone shift)
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

export default function FinanciamientoForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [data, setData] = useState<Partial<Financiamiento>>({
    id: "",
    denominacion: "",
    cantidadAdquirida: undefined,
    montoInvertido: undefined,
    fechaIncorporacion: "",
    descripcionBreve: "",
    fuenteFinanciamiento: "",
    destinatario: "",
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: Financiamiento) => upsertFinanciamiento(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["financiamientos"] }),
  });

  // ⬇️ Handlers seguros: leen el valor ANTES de setState
  const changeText =
    (k: keyof Financiamiento) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.currentTarget.value;
      setData((d) => ({ ...d, [k]: v }));
    };

  const changeEntero =
    (k: keyof Financiamiento) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      setData((d) => ({
        ...d,
        [k]: v === "" ? undefined : Math.trunc(Number(v)),
      }));
    };

  const changeDecimal =
    (k: keyof Financiamiento) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      setData((d) => ({
        ...d,
        [k]: v === "" ? undefined : Number(v),
      }));
    };

  const setFecha = (dt: Date | null) =>
    setData((d) => ({ ...d, fechaIncorporacion: toYMD(dt) }));

  function buildPayload(): Financiamiento {
    const cant = Number(data.cantidadAdquirida);
    const monto = Number(data.montoInvertido);

    if (!data.denominacion?.trim()) {
      throw new Error("La denominación es obligatoria.");
    }
    if (!Number.isInteger(cant) || cant < 0) {
      throw new Error("La cantidad debe ser un entero válido (≥ 0).");
    }
    if (Number.isNaN(monto) || monto < 0) {
      throw new Error("El monto invertido debe ser un número válido (≥ 0).");
    }
    if (!data.fechaIncorporacion) {
      throw new Error("La fecha de incorporación es obligatoria.");
    }

    return {
      id: data.id || "",
      denominacion: data.denominacion!,
      cantidadAdquirida: cant,
      montoInvertido: monto,
      fechaIncorporacion: data.fechaIncorporacion,
      descripcionBreve: data.descripcionBreve ?? "",
      fuenteFinanciamiento: data.fuenteFinanciamiento ?? "",
      destinatario: data.destinatario ?? "",
    };
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync(buildPayload());
      navigate("/financiamiento", { replace: true });
    } catch (err: any) {
      alert(err?.message ?? "No se pudo guardar.");
    }
  };

  return (
    <section>
      <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">
        Carga de datos de Objetos y Financiamiento
      </h2>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm space-y-8"
      >
        <Field label="Denominación">
          <input
            className="input"
            value={data.denominacion ?? ""}
            onChange={changeText("denominacion")}
            placeholder="Del bien o servicio"
          />
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
            onChange={setFecha}
            label=""
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
            placeholder="Del bien o servicio"
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
