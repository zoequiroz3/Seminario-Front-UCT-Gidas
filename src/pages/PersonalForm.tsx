// src/pages/Personal.tsx
import { useEffect, useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
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
  PTAA: ["tipoPersonal"],
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

export default function PersonalPage() {
  const navigate = useNavigate();

  // Draft como Partial<Personal> para aceptar campos específicos por tipo
  const [data, setData] = useState<Partial<Personal>>({
    id: "",
    nombreApellido: "",
    horasSemanales: 0,
    tipo: "INVESTIGADOR",
  });

  // Campos visibles según el tipo seleccionado
  const visibleFields: string[] = useMemo(() => {
    const t = (data.tipo ?? "INVESTIGADOR") as PersonalType;
    return ["nombreApellido", "horasSemanales", "tipo", ...fieldsByType[t]];
  }, [data.tipo]);

  // Change genérico: acepta cualquier clave string del draft
  const change =
    (k: string) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.type === "number" ? Number(e.target.value) : (e.target.value as any);
      setData((d) => ({ ...d, [k]: val }));
    };

  // Listener del tipo de personal: limpia los campos de otros tipos
  const onTipoChange = (next: PersonalType) => {
    setData((prev) => {
      const clean: Record<string, undefined> = {};
      Object.values(fieldsByType).flat().forEach((k) => (clean[k] = undefined));
      return { ...prev, ...clean, tipo: next };
    });
  };

  // Mutación para guardar
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: Personal) => upsertPersonal(payload),
  });

  // Construye el payload final (lo que se envía como JSON)
  function buildPayload(): Personal {
    return {
      id: data.id || "",
      nombreApellido: data.nombreApellido!,
      horasSemanales: Number(data.horasSemanales),
      tipo: (data.tipo ?? "INVESTIGADOR") as PersonalType,
      ...(data as any), // incluye campos específicos por tipo si están presentes
    };
  }

  // Guardar normal (envía JSON y navega)
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones mínimas
    if (!data.nombreApellido?.trim()) {
      alert("El campo 'Nombre y Apellido' es requerido.");
      return;
    }
    if (data.horasSemanales == null || Number(data.horasSemanales) < 0) {
      alert("Las horas semanales deben ser un número válido.");
      return;
    }

    await mutateAsync(buildPayload());
    navigate("/");
  };

  // Guardar y limpiar para agregar otro
  const saveAndAddAnother = async () => {
    if (!data.nombreApellido?.trim()) {
      alert("El campo 'Nombre y Apellido' es requerido.");
      return;
    }
    if (data.horasSemanales == null || Number(data.horasSemanales) < 0) {
      alert("Las horas semanales deben ser un número válido.");
      return;
    }

    await mutateAsync(buildPayload());

    // limpiar formulario para el siguiente registro
    setData({
      id: "",
      nombreApellido: "",
      horasSemanales: 0,
      tipo: "INVESTIGADOR",
    });
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
            className="input"
            value={data.horasSemanales ?? 0}
            onChange={change("horasSemanales")}
            placeholder="Dedicadas al grupo"
          />
        </Field>

        {/* Tipo de personal */}
        <Field label="Seleccione el tipo de personal">
          <select
            className="input"
            value={data.tipo ?? "INVESTIGADOR"}
            onChange={(e) => onTipoChange(e.target.value as PersonalType)}
          >
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
                <option value="" disabled>
                  Seleccione una categoría
                </option>
                {options.categoria.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Programa de incentivos">
              <select
                className="input"
                value={(data as any).programaIncentivos ?? ""}
                onChange={change("programaIncentivos")}
              >
                <option value="" disabled>
                  Seleccione un programa
                </option>
                {options.incentivos.map((i) => (
                  <option key={i} value={i}>
                    {i}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Dedicación">
              <select
                className="input"
                value={(data as any).dedicacion ?? ""}
                onChange={change("dedicacion")}
              >
                <option value="" disabled>
                  Seleccione un tipo de dedicación
                </option>
                {options.dedicacion.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
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
          <Field label="Tipo de personal">
            <select
              className="input"
              value={(data as any).tipoPersonal ?? ""}
              onChange={change("tipoPersonal")}
            >
              <option value="" disabled>
                Seleccione un tipo
              </option>
              {options.ptaa.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </Field>
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
                <option value="" disabled>
                  Seleccione una opción
                </option>
                {options.tipoFormacion.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}

        {/* Footer: volver (izq), agregar (centro), cargar (der) */}
        <div className="mt-8 flex items-center justify-between">
          {/* Izquierda */}
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
            Volver
          </Button>

          {/* Derecha: submit normal (envía JSON y vuelve al inicio) */}
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
