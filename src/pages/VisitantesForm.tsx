import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Calendar from "@/components/Calendar";
import {
  crearVisitante,
  getVisitanteById,
  actualizarVisitante,
} from "@/services/visitantesServices";
import { getGruposUtn, type GrupoUtn } from "@/services/gruposUtnServices";
import { getTiposVisita, type TipoVisita } from "@/services/tiposVisitaServices";
import { getProcedencias, type Procedencia } from "@/services/procedenciasServices";

export default function VisitantesForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isEdit = Boolean(id);

  const { data: gruposUtn = [] } = useQuery({
    queryKey: ["grupos-utn"],
    queryFn: getGruposUtn,
  });

  const { data: tiposVisita = [] } = useQuery({
    queryKey: ["tipos-visita"],
    queryFn: getTiposVisita,
  });

  const { data: procedencias = [] } = useQuery({
    queryKey: ["procedencias"],
    queryFn: getProcedencias,
  });

  const { data: initialData, isLoading } = useQuery({
    queryKey: ["visitante", id],
    queryFn: () => (id ? getVisitanteById(Number(id)) : null),
    enabled: isEdit,
  });

  const [razon, setRazon] = useState("");
  const [fecha, setFecha] = useState<Date | null>(null);
  const [procedenciaId, setProcedenciaId] = useState<number | null>(null);
  const [tipoVisitaId, setTipoVisitaId] = useState<number | null>(null);
  const [grupoUtnId, setGrupoUtnId] = useState<number | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialData) return;

    setRazon(initialData.razon ?? "");
    if (initialData.fecha) setFecha(new Date(initialData.fecha));
    setProcedenciaId(initialData.procedencia_visita_id ?? null);
    setTipoVisitaId(initialData.tipo_visita_id ?? null);
    setGrupoUtnId(initialData.grupo_utn_id ?? null);
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      isEdit
        ? actualizarVisitante(Number(id), payload)
        : crearVisitante(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["visitantes"] });
      navigate(-1);
    },
  });

  const clearError = (field: string) => {
    setErrors((prev) => {
      const copy = { ...prev };
      delete copy[field];
      return copy;
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!razon.trim()) newErrors.razon = "Debe ingresar razón de la visita";
    if (!fecha) newErrors.fecha = "Debe seleccionar fecha";
    if (!procedenciaId) newErrors.procedencia = "Debe seleccionar procedencia";
    if (!tipoVisitaId) newErrors.tipoVisita = "Debe seleccionar tipo de visita";
    if (!grupoUtnId) newErrors.grupoUtn = "Debe seleccionar grupo UTN";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    mutation.mutate({
      razon,
      fecha: fecha!.toISOString().split("T")[0],
      procedencia_visita_id: procedenciaId!,
      tipo_visita_id: tipoVisitaId!,
      grupo_utn_id: grupoUtnId!,
    });
  };

  if (isEdit && isLoading) return <p>Cargando visitante…</p>;

  const inputClass = (field: string) =>
    `input ${errors[field] ? "!border-red-500 !ring-2 !ring-red-500" : ""}`;

  return (
    <section className="w-full">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {isEdit ? "Editar visitante" : "Nueva visita académica"}
      </h2>

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
      >
        <Field label="Razón de la visita">
          <textarea
            className={`input min-h-[80px] ${inputClass("razon")}`}
            value={razon}
            onChange={(e) => {
              setRazon(e.target.value);
              if (e.target.value.trim()) clearError("razon");
            }}
          />
          {errors.razon && <p className="text-red-500 text-sm mt-1">{errors.razon}</p>}
        </Field>

        <Field label="Fecha">
          <Calendar
            value={fecha}
            onChange={(date) => {
              setFecha(date);
              if (date) clearError("fecha");
            }}
            className={inputClass("fecha")}
            helperText={errors.fecha ?? "DD/MM/AAAA"}
          />
        </Field>

        <Field label="Procedencia">
          <select
            className={inputClass("procedencia")}
            value={procedenciaId ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : null;
              setProcedenciaId(value);
              if (value) clearError("procedencia");
            }}
          >
            <option value="" disabled>Seleccionar procedencia</option>
            {procedencias.map((p: Procedencia) => (
              <option key={p.id} value={p.id}>
                {p.nombre}
              </option>
            ))}
          </select>
          {errors.procedencia && <p className="text-red-500 text-sm mt-1">{errors.procedencia}</p>}
        </Field>

        <Field label="Tipo de visita">
          <select
            className={inputClass("tipoVisita")}
            value={tipoVisitaId ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : null;
              setTipoVisitaId(value);
              if (value) clearError("tipoVisita");
            }}
          >
            <option value="" disabled>Seleccionar tipo de visita</option>
            {tiposVisita.map((t: TipoVisita) => (
              <option key={t.id} value={t.id}>
                {t.nombre}
              </option>
            ))}
          </select>
          {errors.tipoVisita && <p className="text-red-500 text-sm mt-1">{errors.tipoVisita}</p>}
        </Field>

        <Field label="Grupo UTN">
          <select
            className={inputClass("grupoUtn")}
            value={grupoUtnId ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : null;
              setGrupoUtnId(value);
              if (value) clearError("grupoUtn");
            }}
          >
            <option value="" disabled>Seleccionar grupo UTN</option>
            {gruposUtn.map((g: GrupoUtn) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>
          {errors.grupoUtn && <p className="text-red-500 text-sm mt-1">{errors.grupoUtn}</p>}
        </Field>

        <div className="flex justify-between pt-6">
          <Button type="button" variant="secondary" size="sm" onClick={() => navigate(-1)}>
            Volver
          </Button>
          <Button type="submit" size="sm" disabled={mutation.isPending}>
            {mutation.isPending ? "Guardando…" : isEdit ? "Actualizar" : "Guardar"}
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
