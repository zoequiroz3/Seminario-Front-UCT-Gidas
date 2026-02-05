// src/pages/ProyectosForm.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import { upsertProyectos, type Proyecto } from "@/services/proyectosServices";
import { createTipoProyecto, type Option } from "@/services/optionsService";

// --------------------
// Constantes
// --------------------

const initialProjectTypes: Option[] = [
  { id: 1, nombre: "PICT" },
  { id: 2, nombre: "PID" },
  { id: 3, nombre: "PROINNOVA" },
  { id: 4, nombre: "PDTS" },
  { id: 5, nombre: "Internos" },
  { id: 6, nombre: "Institucionales" },
];

const CREATE_NEW_ID = -1;

// --------------------
// Tipos
// --------------------

type ProyectoDraft = Partial<Omit<Proyecto, "tipoProyectoId">> & {
  tipoProyectoId?: number;
};

// --------------------
// Helpers fechas
// --------------------

const parseYMD = (s?: string | null): Date | null => {
  if (!s) return null;
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
};

const toYMD = (date: Date | null): string => {
  if (!date) return "";
  return date.toISOString().split("T")[0];
};

// --------------------
// Componente
// --------------------

export default function ProyectosForm() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Estado del formulario
  const [data, setData] = useState<ProyectoDraft>({
    nombreProyecto: "",
    codigoProyecto: "",
    fechaInicio: "",
    fechaFinalizacion: "",
    fuenteFinanciamiento: "",
  });

  const [tiposProyectoOpts, setTiposProyectoOpts] =
    useState<Option[]>(initialProjectTypes);

  const [isCreating, setIsCreating] = useState(false);
  const [newTypeName, setNewTypeName] = useState("");

  // --------------------
  // Mutaciones
  // --------------------

  const { mutateAsync: mutateUpsertProject, isPending } = useMutation({
    mutationFn: (payload: Proyecto) => upsertProyectos(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["proyectos"] });
    },
  });

  const { mutate: mutateCreateType, isPending: isCreatingType } = useMutation({
    mutationFn: (name: string) => createTipoProyecto(name),
    onSuccess: (newType) => {
      setTiposProyectoOpts((prev) => [...prev, newType]);
      setData((d) => ({ ...d, tipoProyectoId: newType.id }));
      setIsCreating(false);
      setNewTypeName("");
    },
    onError: (err: any) => {
      alert(err?.message ?? "No se pudo crear el tipo de proyecto.");
    },
  });

  // --------------------
  // Handlers
  // --------------------

  const change =
    (k: keyof ProyectoDraft) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setData((d) => ({ ...d, [k]: e.target.value }));
    };

  const setFecha =
    (k: "fechaInicio" | "fechaFinalizacion") =>
    (dt: Date | null) => {
      setData((d) => ({ ...d, [k]: toYMD(dt) }));
    };

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    if (selectedId === CREATE_NEW_ID) {
      setIsCreating(true);
    } else {
      setData((d) => ({ ...d, tipoProyectoId: selectedId }));
    }
  };

  const handleSaveNewType = () => {
    if (!newTypeName.trim()) {
      alert("El nombre del nuevo tipo no puede estar vacío.");
      return;
    }
    mutateCreateType(newTypeName.trim());
  };

  function buildPayload(): Proyecto {
    if (!data.nombreProyecto?.trim())
      throw new Error("El nombre del proyecto es obligatorio.");
    if (!data.tipoProyectoId)
      throw new Error("El tipo de proyecto es obligatorio.");
    if (!data.fechaInicio)
      throw new Error("La fecha de inicio es obligatoria.");

    return {
      id: data.id || undefined,
      nombreProyecto: data.nombreProyecto,
      tipoProyectoId: data.tipoProyectoId,
      codigoProyecto: data.codigoProyecto ?? "",
      fechaInicio: data.fechaInicio,
      fechaFinalizacion: data.fechaFinalizacion || undefined,
      fuenteFinanciamiento: data.fuenteFinanciamiento || undefined,
    };
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await mutateUpsertProject(buildPayload());
      navigate("/proyectos", { replace: true });
    } catch (err: any) {
      alert(err?.message ?? "No se pudo guardar el proyecto.");
    }
  };

  const finalTypeOptions: Option[] = [
    ...tiposProyectoOpts,
    { id: CREATE_NEW_ID, nombre: "Crear nuevo tipo..." },
  ];

  // --------------------
  // Render
  // --------------------

  return (
    <section className="px-4 py-3 w-full text-sm">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6">
        Carga de Proyectos
      </h2>

      <form
        onSubmit={onSubmit}
        className="rounded-xl border border-slate-200 bg-white/70 p-5 shadow-sm space-y-5"
      >
        <Field label="Nombre del proyecto">
          <input
            className="input"
            value={data.nombreProyecto ?? ""}
            onChange={change("nombreProyecto")}
            placeholder="Ej. Plataforma BI para GIDAS"
            required
          />
        </Field>

        <Field label="Tipo de proyecto">
          <Select
            options={finalTypeOptions}
            value={isCreating ? "" : data.tipoProyectoId || ""}
            onChange={handleTypeChange}
            placeholder="Seleccione un tipo de proyecto"
            disabled={isCreating}
            required
          />
        </Field>

        {isCreating && (
          <div className="p-4 bg-slate-50 rounded-lg space-y-3">
            <label className="font-medium text-sm">
              Nombre del nuevo tipo
            </label>
            <input
              className="input"
              value={newTypeName}
              onChange={(e) => setNewTypeName(e.target.value)}
              placeholder="Ej. Vinculación tecnológica"
              autoFocus
            />
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={handleSaveNewType}
                disabled={isCreatingType}
              >
                {isCreatingType ? "Guardando…" : "Guardar tipo"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsCreating(false);
                  setNewTypeName("");
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <Field label="Código del proyecto">
          <input
            className="input"
            value={data.codigoProyecto ?? ""}
            onChange={change("codigoProyecto")}
            placeholder="Ej. GIDAS-PRJ-001"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Fecha de inicio">
            <DatePicker
              value={parseYMD(data.fechaInicio)}
              onChange={setFecha("fechaInicio")}
              className="input"
            />
          </Field>

          <Field label="Fecha de finalización">
            <DatePicker
              value={parseYMD(data.fechaFinalizacion)}
              onChange={setFecha("fechaFinalizacion")}
              minDate={parseYMD(data.fechaInicio) || undefined}
              className="input"
            />
          </Field>
        </div>

        <Field label="Fuente de financiamiento">
          <input
            className="input"
            value={data.fuenteFinanciamiento ?? ""}
            onChange={change("fuenteFinanciamiento")}
            placeholder="Ej. CONICET, UNLP, BID"
          />
        </Field>

        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
          >
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

// --------------------
// Componentes auxiliares
// --------------------

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block font-medium mb-2">{label}</label>
      {children}
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
  options: Option[];
  placeholder?: string;
};

function Select({ options, placeholder, ...props }: SelectProps) {
  return (
    <select className="input" {...props}>
      <option value="" disabled>
        {placeholder ?? "Seleccione"}
      </option>
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.nombre}
        </option>
      ))}
    </select>
  );
}
