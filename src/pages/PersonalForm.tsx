// src/pages/PersonalForm.tsx
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import {
  upsertPersonal,
  type Personal,
  type PersonalType,
} from "@/services/personalServices";
import {
    getTiposPersonal,
    getCategoriasUtn,
    getProgramasIncentivos,
    getTiposDedicacion,
    getTiposFormacion,
    getFuentesFinanciamiento,
    type Option,
} from "@/services/optionsService";

// Helpers para campos por tipo
const fieldsByType: Record<PersonalType, string[]> = {
  INVESTIGADOR: ["categoriaUtnId", "programaIncentivosId", "dedicacionId", "proyectoCoordinaId"],
  PROFESIONAL: [],
  PTAA: ["tipoPersonalId", "fechaInicio", "fechaFin"],
  BECARIO: ["fuenteFinanciamientoId", "tipoFormacionId"],
};

// El tipo para el estado del formulario. Ahora usará IDs numéricos.
type PersonalDraft = Omit<Partial<Personal>, "horasSemanales"> & {
  horasSemanales?: number | string;
  // Campos que son IDs
  categoriaUtnId?: number;
  programaIncentivosId?: number;
  dedicacionId?: number;
  tipoPersonalId?: number;
  tipoFormacionId?: number;
  fuenteFinanciamientoId?: number;
  // Fechas como strings
  fechaInicio?: string;
  fechaFin?: string;
};

export default function PersonalPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  // --- Carga de Opciones desde la API ---
  const { data: tiposPersonalOpts = [] } = useQuery({ queryKey: ["tiposPersonal"], queryFn: getTiposPersonal });
  const { data: categoriasUtnOpts = [] } = useQuery({ queryKey: ["categoriasUtn"], queryFn: getCategoriasUtn });
  const { data: programasIncentivosOpts = [] } = useQuery({ queryKey: ["programasIncentivos"], queryFn: getProgramasIncentivos });
  const { data: tiposDedicacionOpts = [] } = useQuery({ queryKey: ["tiposDedicacion"], queryFn: getTiposDedicacion });
  const { data: tiposFormacionOpts = [] } = useQuery({ queryKey: ["tiposFormacion"], queryFn: getTiposFormacion });
  const { data: fuentesFinanciamientoOpts = [] } = useQuery({ queryKey: ["fuentesFinanciamiento"], queryFn: getFuentesFinanciamiento });

  const [data, setData] = useState<PersonalDraft>({
    id: "",
    nombreApellido: "",
    horasSemanales: "",
  });

  // --- Manejadores de Fechas ---
  const parseYMD = (s?: string | null): Date | null => {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
  };

  const toYMD = (date: Date | null): string => {
    if (!date) return "";
    return date.toISOString().split('T')[0];
  };

  const setDateField = (k: "fechaInicio" | "fechaFin", dt: Date | null) =>
    setData((d) => ({ ...d, [k]: toYMD(dt) }));

  // --- Manejadores de Cambios ---
  const change = (k: keyof PersonalDraft) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const val = e.target.type === "number" || e.target.dataset.type === "number"
        ? Number(e.target.value)
        : e.target.value;
      setData((d) => ({ ...d, [k]: val }));
    };

  const onTipoChange = (next: PersonalType) => {
    setData((prev) => ({
      id: prev.id,
      nombreApellido: prev.nombreApellido,
      horasSemanales: prev.horasSemanales,
      tipo: next,
      categoriaUtnId: undefined,
      programaIncentivosId: undefined,
      dedicacionId: undefined,
      tipoPersonalId: undefined,
      fechaInicio: undefined,
      fechaFin: undefined,
      fuenteFinanciamientoId: undefined,
      tipoFormacionId: undefined,
    }));
  };

  // --- Mutación y Envío ---
  const { mutateAsync, isPending } = useMutation({
    mutationFn: (payload: Personal) => upsertPersonal(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["personal"] }),
  });

  function buildPayload(): Personal {
    if (!data.tipo) throw new Error("Debe seleccionar el tipo de personal.");
    return {
      ...data,
      id: data.id || undefined, // Enviar undefined si está vacío
      nombreApellido: data.nombreApellido!,
      horasSemanales: Number(data.horasSemanales),
      tipo: data.tipo,
    } as Personal;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data.nombreApellido?.trim()) return alert("El campo 'Nombre y Apellido' es requerido.");
    const horas = Number(data.horasSemanales);
    if (!Number.isInteger(horas) || horas < 0) return alert("Las horas semanales deben ser un entero válido (≥ 0).");
    if (!data.tipo) return alert("Seleccione el tipo de personal.");

    if (data.tipo === "BECARIO" && !data.tipoFormacionId) {
      return alert("El campo 'Tipo de formación' es requerido para un becario.");
    }

    await mutateAsync(buildPayload());
    navigate("/personal", { replace: true });
  };
  
  const TIPO_PERSONAL_OPTIONS = [
    { value: "INVESTIGADOR" as const, label: "Investigador/a" },
    { value: "PROFESIONAL" as const, label: "Personal Profesional" },
    { value: "PTAA" as const, label: "Personal Técnico, Administrativo y de Apoyo" },
    { value: "BECARIO" as const, label: "Becarios y/o Personal en formación" },
  ];

  return (
    <section>
      <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">Carga de datos de Personal</h2>
      <form onSubmit={onSubmit} className="mt-8 rounded-2xl border border-slate-200 bg-white/80 p-8 shadow-sm space-y-8">
        
        <Field label="Nombre y Apellido">
          <input className="input" value={data.nombreApellido ?? ""} onChange={change("nombreApellido")} placeholder="Del personal a cargar" required />
        </Field>

        <Field label="Horas semanales">
          <input type="number" inputMode="numeric" step={1} min={0} className="input" value={data.horasSemanales ?? ""} onChange={change("horasSemanales")} placeholder="Dedicadas al grupo" required />
        </Field>

        <Field label="Seleccione el tipo de personal">
          <select className="input" value={data.tipo || ""} onChange={(e) => onTipoChange(e.target.value as PersonalType)} required>
            <option value="" disabled>Seleccione una opción</option>
            {TIPO_PERSONAL_OPTIONS.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
          </select>
        </Field>

        {data.tipo === "INVESTIGADOR" && (
          <>
            <Field label="Categoría UTN">
              <Select options={categoriasUtnOpts} value={data.categoriaUtnId || ""} onChange={change("categoriaUtnId")} placeholder="Seleccione una categoría"/>
            </Field>
            <Field label="Programa de incentivos">
                <Select options={programasIncentivosOpts} value={data.programaIncentivosId || ""} onChange={change("programaIncentivosId")} placeholder="Seleccione un programa"/>
            </Field>
            <Field label="Dedicación">
                <Select options={tiposDedicacionOpts} value={data.dedicacionId || ""} onChange={change("dedicacionId")} placeholder="Seleccione un tipo de dedicación"/>
            </Field>
          </>
        )}

        {data.tipo === "PTAA" && (
          <>
            <Field label="Tipo de personal (PTAA)">
              <Select options={tiposPersonalOpts} value={data.tipoPersonalId || ""} onChange={change("tipoPersonalId")} placeholder="Seleccione un tipo" />
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DatePicker label="Fecha de inicio" value={parseYMD(data.fechaInicio)} onChange={(dt) => setDateField("fechaInicio", dt)} className="input" />
              <DatePicker label="Fecha de finalización" value={parseYMD(data.fechaFin)} onChange={(dt) => setDateField("fechaFin", dt)} minDate={parseYMD(data.fechaInicio) || undefined} className="input"/>
            </div>
          </>
        )}

        {data.tipo === "BECARIO" && (
          <>
            <Field label="Fuente de financiamiento">
                <Select options={fuentesFinanciamientoOpts} value={data.fuenteFinanciamientoId || ""} onChange={change("fuenteFinanciamientoId")} placeholder="Seleccione una fuente"/>
            </Field>
            <Field label="Tipo de formación">
                <Select options={tiposFormacionOpts} value={data.tipoFormacionId || ""} onChange={change("tipoFormacionId")} placeholder="Seleccione una opción" required/>
            </Field>
          </>
        )}

        <div className="mt-8 flex items-center justify-between">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Volver</Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Guardando…" : "Cargar"}
          </Button>
        </div>
      </form>
    </section>
  );
}

// --- Componentes de UI Locales ---

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="md:text-[17px] block font-medium mb-3">{label}</label>
      {children}
    </div>
  );
}

type SelectProps = React.SelectHTMLAttributes<HTMLSelectElement> & {
    options: Option[];
    placeholder?: string;
}

function Select({options, placeholder, ...props}: SelectProps) {
    return (
        <select className="input" data-type="number" {...props}>
            <option value="" disabled>{placeholder ?? "Seleccione"}</option>
            {options.map((o) => (<option key={o.id} value={o.id}>{o.nombre}</option>))}
        </select>
    )
}
