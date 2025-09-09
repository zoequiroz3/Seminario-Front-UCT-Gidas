// src/pages/ProyectosForm.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import {
  upsertProyectos,
  type Proyecto,
} from "@/services/proyectosServices";

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

export default function ProyectosForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [data, setData] = useState<Partial<Proyecto>>({
    id: "",
    tipoProyecto: "",
    codigoProyecto: "",
    fechaInicio: "",
    fechaFinalizacion: "",
    nombreProyecto: "",
    fuenteFinanciamiento: "",
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: Proyecto) => upsertProyectos(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["proyectos"] }),
  });

  // Handlers seguros: leen el valor ANTES de setState
  const changeText =
    (k: keyof Proyecto) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const v = e.currentTarget.value;
      setData((d) => ({ ...d, [k]: v }));
    };

  const changeEntero =
    (k: keyof Proyecto) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      setData((d) => ({
        ...d,
        [k]: (v === "" ? "" : String(Math.trunc(Number(v)))) as any, // mantenemos la firma aunque no haya enteros en Proyecto
      }));
    };

  const changeDecimal =
    (k: keyof Proyecto) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.currentTarget.value;
      setData((d) => ({
        ...d,
        [k]: (v === "" ? "" : String(Number(v))) as any, // mantenemos la firma aunque no haya decimales en Proyecto
      }));
    };

  const setFechaInicio = (dt: Date | null) =>
    setData((d) => ({ ...d, fechaInicio: toYMD(dt) }));

  const setFechaFinalizacion = (dt: Date | null) =>
    setData((d) => ({ ...d, fechaFinalizacion: toYMD(dt) }));

  function buildPayload(): Proyecto {
    // Validaciones mínimas basadas en el modelo del service
    if (!data.nombreProyecto?.trim()) {
      throw new Error("El nombre del proyecto es obligatorio.");
    }
    if (!data.tipoProyecto?.trim()) {
      throw new Error("El tipo de proyecto es obligatorio.");
    }
    if (!data.fechaInicio) {
      throw new Error("La fecha de inicio es obligatoria.");
    }
    if (data.fechaFinalizacion && data.fechaInicio) {
      const ini = parseYMD(data.fechaInicio);
      const fin = parseYMD(data.fechaFinalizacion);
      if (ini && fin && fin < ini) {
        throw new Error("La fecha de finalización no puede ser anterior a la de inicio.");
      }
    }

    return {
      id: data.id || "",
      tipoProyecto: data.tipoProyecto!,
      codigoProyecto: data.codigoProyecto ?? "",
      fechaInicio: data.fechaInicio!,
      fechaFinalizacion: data.fechaFinalizacion ?? "",
      nombreProyecto: data.nombreProyecto!,
      fuenteFinanciamiento: data.fuenteFinanciamiento ?? "",
    };
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateAsync(buildPayload());
      navigate("/proyectos", { replace: true });
    } catch (err: any) {
      alert(err?.message ?? "No se pudo guardar.");
    }
  };

  return (
    <section>
      <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">
        Carga de Proyectos
      </h2>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm space-y-8"
      >
        <Field label="Nombre del proyecto">
          <input
            className="input"
            value={data.nombreProyecto ?? ""}
            onChange={changeText("nombreProyecto")}
            placeholder="Ej. Plataforma BI para GIDAS"
          />
        </Field>

        <Field label="Tipo de proyecto">
          <input
            className="input"
            value={data.tipoProyecto ?? ""}
            onChange={changeText("tipoProyecto")}
            placeholder="Ej. Investigación, Desarrollo, Extensión…"
          />
        </Field>

        <Field label="Código del proyecto">
          <input
            className="input"
            value={data.codigoProyecto ?? ""}
            onChange={changeText("codigoProyecto")}
            placeholder="Ej. GIDAS-PRJ-001"
          />
        </Field>

        <Field label="Fecha de inicio">
          <DatePicker
            value={parseYMD(data.fechaInicio)}
            onChange={setFechaInicio}
            label=""
            helperText="DD/MM/AAAA"
            className="input"
          />
        </Field>

        <Field label="Fecha de finalización">
          <DatePicker
            value={parseYMD(data.fechaFinalizacion)}
            onChange={setFechaFinalizacion}
            label=""
            helperText="DD/MM/AAAA"
            className="input"
          />
        </Field>

        <Field label="Fuente de financiamiento">
          <input
            className="input"
            value={data.fuenteFinanciamiento ?? ""}
            onChange={changeText("fuenteFinanciamiento")}
            placeholder="Ej. CONICET, UNLP, BID…"
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
