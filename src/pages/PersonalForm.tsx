// src/pages/Personal.tsx
import { useEffect, useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // 👈 qc para invalidar
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import {
  upsertPersonal,
  type Personal,
  type PersonalType,
  type Dedicacion,
  type Categoria,
  type Incentivos,
  type TipoPersonal,
  type TipoFormacion,
} from "@/services/personalServices";

// --------- helpers para campos por tipo (usar string[], NO keyof) ---------
const fieldsByType: Record<PersonalType, string[]> = {
  INVESTIGADOR: ["categoriaUtn", "programaIncentivos", "dedicacion", "proyectoCoordinaId"],
  PROFESIONAL: [],
  PTAA: ["tipoPersonal", "fechaInicio", "fechaFin"],
  BECARIO: ["fuenteFinanciamiento", "tipoFormacion"],
};

// --------- opciones de selects ---------
const options = {
  tipoPersonal: [
    { value: "INVESTIGADOR" as const, label: "Investigador/a" },
    { value: "PROFESIONAL" as const, label: "Personal Profesional" },
    { value: "PTAA" as const, label: "Personal Técnico, Administrativo y de Apoyo" },
    { value: "BECARIO" as const, label: "Becarios y/o Personal en formación" },
  ],
  categoria: [
    "Resolución A",
    "Resolución B",
    "Resolución D",
    "Resolución E",
    "Resolución F",
    "Resolución G",
  ] as Categoria[],
  incentivos: ["I", "II"] as Incentivos[],
  dedicacion: ["Simple", "Exclusiva", "Semiexclusiva"] as Dedicacion[],
  ptaa: ["Técnico", "Administrativo", "Apoyo"] as TipoPersonal[],
  tipoFormacion: ["Becario", "Personal en Formación"] as TipoFormacion[],
};

// Draft con fechas para que TS no se queje
type PersonalDraft = Partial<Personal> & { fechaInicio?: string; fechaFin?: string };

export default function PersonalPage() {
  const navigate = useNavigate();
  const qc = useQueryClient(); // 👈

  // Draft como Partial. Importante: NO seteamos tipo por defecto.
  const [data, setData] = useState<PersonalDraft>({
    id: "",
    nombreApellido: "",
    horasSemanales: undefined,
    // tipo: undefined,
  });

  // ===== Helpers timezone-safe =====
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

  const setDateField = (k: "fechaInicio" | "fechaFin", dt: Date | null) =>
    setData((d) => ({ ...d, [k]: toYMD(dt) }));

  // (visibleFields hoy no se usa, lo dejamos por si luego lo necesitás)
  const visibleFields: string[] = useMemo(() => {
    const t = data.tipo as PersonalType | undefined;
    return t
      ? ["nombreApellido", "horasSemanales", "tipo", ...fieldsByType[t]]
      : ["nombreApellido", "horasSemanales", "tipo"];
  }, [data.tipo]);

  const change =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.type === "number" ? Number(e.target.value) : (e.target.value as any);
      setData((d) => ({ ...d, [k]: val }));
    };

  const onTipoChange = (next: PersonalType) => {
    setData((prev) => {
      const clean: Record<string, undefined> = {};
      Object.values(fieldsByType).flat().forEach((k) => (clean[k] = undefined));
      return { ...prev, ...clean, tipo: next };
    });
  };

  // Mutación para guardar — invalida la lista y luego navega a /personal
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: Personal) => upsertPersonal(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["personal"] }), // 👈 refresca la landing
  });

  function buildPayload(): Personal {
    if (!data.tipo) throw new Error("Debe seleccionar el tipo de personal.");
    return {
      id: data.id || "",
      nombreApellido: data.nombreApellido!,
      horasSemanales: Number(data.horasSemanales),
      tipo: data.tipo as PersonalType,
      ...(data as any),
    };
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!data.nombreApellido?.trim()) {
      alert("El campo 'Nombre y Apellido' es requerido.");
      return;
    }
    const horas = Number(data.horasSemanales);
    if (!Number.isInteger(horas) || horas < 0) {
      alert("Las horas semanales deben ser un entero válido (≥ 0).");
      return;
    }
    if (!data.tipo) {
      alert("Seleccione el tipo de personal.");
      return;
    }

    await mutateAsync(buildPayload());
    navigate("/personal", { replace: true }); // 👈 permanecer en la landing de Personal
  };

  useEffect(() => {
    // reservado para precarga/edición en el futuro
  }, []);

  return (
    <section>
      <h2 className="text-3xl font-semibold mb-6">Carga de datos de Personal</h2>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm space-y-6"
      >
        {/* Nombre y Apellido */}
        <Field label="Nombre y Apellido">
          <input
            className="input"
            value={data.nombreApellido ?? ""}
            onChange={change("nombreApellido")}
            placeholder="Del personal a cargar"
          />
        </Field>

        {/* Horas semanales */}
        <Field label="Horas semanales">
          <input
            type="number"
            inputMode="numeric"
            step={1}
            min={0}
            className="input"
            value={data.horasSemanales ?? ""} // vacío por defecto
            onChange={(e) => {
              const v = e.currentTarget.value;
              setData((d) => ({
                ...d,
                horasSemanales: v === "" ? undefined : Math.trunc(Number(v)), // entero
              }));
            }}
            placeholder="Dedicadas al grupo"
          />
        </Field>

        {/* Tipo de personal */}
        <Field label="Seleccione el tipo de personal">
          <select
            className="input"
            value={data.tipo ?? ""} // sin default
            onChange={(e) => onTipoChange(e.target.value as PersonalType)}
          >
            <option value="" disabled>Seleccione una opción</option>
            {options.tipoPersonal.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

        {/* Investigador/a */}
        {data.tipo === "INVESTIGADOR" && (
          <>
            <Field label="Categoría UTN">
              <select
                className="input"
                value={(data as any).categoriaUtn ?? ""}
                onChange={change("categoriaUtn")}
              >
                <option value="" disabled>Seleccione una categoría</option>
                {options.categoria.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Programa de incentivos">
              <select
                className="input"
                value={(data as any).programaIncentivos ?? ""}
                onChange={change("programaIncentivos")}
              >
                <option value="" disabled>Seleccione un programa</option>
                {options.incentivos.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </Field>

            <Field label="Dedicación">
              <select
                className="input"
                value={(data as any).dedicacion ?? ""}
                onChange={change("dedicacion")}
              >
                <option value="" disabled>Seleccione un tipo de dedicación</option>
                {options.dedicacion.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </Field>

            <Field label="Proyecto que coordina">
              <input
                className="input"
                value={(data as any).proyectoCoordinaId ?? ""}
                onChange={change("proyectoCoordinaId")}
                placeholder="ID o nombre del proyecto (opcional)"
              />
            </Field>
          </>
        )}

        {/* PTAA */}
        {data.tipo === "PTAA" && (
          <>
            <Field label="Tipo de personal">
              <select
                className="input"
                value={(data as any).tipoPersonal ?? ""}
                onChange={change("tipoPersonal")}
              >
                <option value="" disabled>Seleccione un tipo</option>
                {options.ptaa.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DatePicker
                label="Fecha de inicio"
                value={parseYMD((data as any).fechaInicio)}
                onChange={(dt) => setDateField("fechaInicio", dt)}
                helperText="DD/MM/AAAA"
                className="input"
              />
              <DatePicker
                label="Fecha de finalización"
                value={parseYMD((data as any).fechaFin)}
                onChange={(dt) => setDateField("fechaFin", dt)}
                minDate={parseYMD((data as any).fechaInicio) || undefined}
                helperText="DD/MM/AAAA"
                className="input"
              />
            </div>
          </>
        )}

        {/* Becario / Personal en formación */}
        {data.tipo === "BECARIO" && (
          <>
            <Field label="Fuente de financiamiento">
              <input
                className="input"
                value={(data as any).fuenteFinanciamiento ?? ""}
                onChange={change("fuenteFinanciamiento")}
              />
            </Field>

            <Field label="Tipo de formación">
              <select
                className="input"
                value={(data as any).tipoFormacion ?? ""}
                onChange={change("tipoFormacion")}
              >
                <option value="" disabled>Seleccione una opción</option>
                {options.tipoFormacion.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </Field>
          </>
        )}

        {/* Footer: volver (izq) y cargar (der) */}
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
      <label className="block text-sm font-medium mb-2">{label}</label>
      {children}
    </div>
  );
}
