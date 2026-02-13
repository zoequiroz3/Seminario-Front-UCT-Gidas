// src/pages/ProyectosForm.tsx
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import { upsertProyectos, type Proyecto } from "@/services/proyectosServices";
import {
  createTipoProyecto,
  getFuentesFinanciamiento, // Import getFuentesFinanciamiento
  getGruposUtn, // Import getGruposUtn
  type Option,
} from "@/services/optionsService";

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

// El tipo para el estado del formulario.
type ProyectoDraft = Partial<Proyecto> & {
  tipoProyectoId?: number;
  fuenteFinanciamientoId?: number; // Ensure this is explicitly optional
  grupoUtnId?: number; // Ensure this is explicitly optional
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

  // --- Opciones de Select ---
  const { data: fuentesFinanciamientoOpts } = useQuery({
    queryKey: ["fuentesFinanciamiento"],
    queryFn: getFuentesFinanciamiento,
    staleTime: Infinity,
  });

  const { data: gruposUtnOpts } = useQuery({
    queryKey: ["gruposUtn"],
    queryFn: getGruposUtn,
    staleTime: Infinity,
  });

  // --- Estado ---
  const [data, setData] = useState<ProyectoDraft>({
    id: "",
    codigoProyecto: 0, // Initialize as number
    fechaInicio: "",
    fechaFinalizacion: "",
    nombreProyecto: "",
    descripcionProyecto: "", // New required field
    dificultadesProyecto: "", // New optional field
    fuenteFinanciamientoId: undefined, // Initialize as undefined
    grupoUtnId: undefined, // Initialize as undefined
    // planificacionId: undefined, // Not adding to form for now as it's optional and not in backend payload
  });

  const [tiposProyectoOpts, setTiposProyectoOpts] = useState<Option[]>(
    initialProjectTypes
  );
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





  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = Number(e.target.value);
    if (selectedId === CREATE_NEW_ID) {
      setIsCreating(true);
    } else {
      setData((d) => ({ ...d, tipoProyectoId: selectedId }));
    }
  };

  const change =
    (k: keyof ProyectoDraft) => (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> // Include HTMLTextAreaElement and HTMLSelectElement
    ) => {
      let value: string | number = e.target.value;
      if (e.target.dataset.type === "number") {
        value = parseInt(e.target.value, 10);
        if (isNaN(value)) value = undefined as any; // Handle invalid number input
      }
      setData((d) => ({ ...d, [k]: value }));
    };

  const setFecha = (k: "fechaInicio" | "fechaFinalizacion") => (
    dt: Date | null
  ) => setData((d) => ({ ...d, [k]: toYMD(dt) }));

  const handleSaveNewType = () => {
    if (!newTypeName.trim())
      return alert("El nombre del nuevo tipo no puede estar vacío.");
    mutateCreateType(newTypeName);
  };


  function buildPayload(): Proyecto {
    if (!data.nombreProyecto?.trim())
      throw new Error("El nombre del proyecto es obligatorio.");
    if (!data.descripcionProyecto?.trim())
      throw new Error("La descripción del proyecto es obligatoria."); // New validation
    if (!data.tipoProyectoId)
      throw new Error("El tipo de proyecto es obligatorio.");
    if (!data.codigoProyecto || isNaN(data.codigoProyecto))
      throw new Error("El código del proyecto es obligatorio y debe ser un número."); // Validation for code
    if (!data.fechaInicio)
      throw new Error("La fecha de inicio es obligatoria.");

    return {
      id: data.id || undefined,
      nombreProyecto: data.nombreProyecto,
      descripcionProyecto: data.descripcionProyecto,
      tipoProyectoId: data.tipoProyectoId,
      codigoProyecto: data.codigoProyecto,
      fechaInicio: data.fechaInicio,
      fechaFinalizacion: data.fechaFinalizacion || undefined,
      dificultadesProyecto: data.dificultadesProyecto || undefined,
      grupoUtnId: data.grupoUtnId || undefined,
      fuenteFinanciamientoId: data.fuenteFinanciamientoId || undefined,
      planificacionId: data.planificacionId || undefined,
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

  // Opciones para el select, incluyendo "Crear nuevo..."
  const finalTypeOptions = [
    ...tiposProyectoOpts,
    { id: CREATE_NEW_ID, nombre: "Crear nuevo tipo..." },
  ];

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

        <Field label="Descripción del proyecto">
          <textarea
            className="input min-h-[100px]"
            value={data.descripcionProyecto ?? ""}
            onChange={change("descripcionProyecto")}
            placeholder="Describe detalladamente los objetivos, metodología y alcance del proyecto."
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
              placeholder="Escriba el nombre y presione Guardar"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handleSaveNewType}
                disabled={isCreatingType}
              >
                {isCreatingType ? "Guardando..." : "Guardar Tipo"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setIsCreating(false)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        <Field label="Código del proyecto">
          <input
            className="input"
            type="number" // Set type to number
            value={data.codigoProyecto ?? ""}
            onChange={change("codigoProyecto")}
            placeholder="Ej. 12345"
            required
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Fecha de inicio">
            <DatePicker
              value={parseYMD(data.fechaInicio)}
              onChange={setFecha("fechaInicio")}
              label=""
              className="input"
              required
            />
          </Field>

          <Field label="Fecha de finalización">
            <DatePicker
              value={parseYMD(data.fechaFinalizacion)}
              onChange={setFecha("fechaFinalizacion")}
              label=""
              minDate={parseYMD(data.fechaInicio) || undefined}
              className="input"
            />
          </Field>
        </div>

        <Field label="Dificultades del proyecto (opcional)">
          <textarea
            className="input min-h-[100px]"
            value={data.dificultadesProyecto ?? ""}
            onChange={change("dificultadesProyecto")}
            placeholder="Describa las dificultades encontradas durante el desarrollo del proyecto."
          />
        </Field>

        <Field label="Fuente de financiamiento (opcional)">
          <Select
            options={fuentesFinanciamientoOpts || []}
            value={data.fuenteFinanciamientoId || ""}
            onChange={change("fuenteFinanciamientoId")}
            placeholder="Seleccione la fuente de financiamiento"
          />
        </Field>

        <Field label="Grupo UTN (opcional)">
          <Select
            options={gruposUtnOpts || []}
            value={data.grupoUtnId || ""}
            onChange={change("grupoUtnId")}
            placeholder="Seleccione el grupo UTN asociado"
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
    <select className="input" data-type="number" {...props}>
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
