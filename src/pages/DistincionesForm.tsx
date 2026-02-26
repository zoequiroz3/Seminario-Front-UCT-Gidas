import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Calendar from "@/components/Calendar";
import Field from "@/components/Field";
import {
  crearDistincion,
  getDistincionById,
  actualizarDistincion,
} from "@/services/distincionesServices";
import { getProyectos, type Proyecto } from "@/services/proyectoInvestigacionServices";
import { useUct } from "@/hooks/useUct";

export default function DistincionesForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { uct } = useUct();

  const isEdit = Boolean(id);

  const { data: proyectos = [] } = useQuery({
    queryKey: ["proyectos"],
    queryFn: getProyectos,
  });

  const { data: initialData, isLoading } = useQuery({
    queryKey: ["distincion", id],
    queryFn: () => (id ? getDistincionById(Number(id)) : null),
    enabled: isEdit,
  });

  const [fecha, setFecha] = useState<Date | null>(null);
  const [descripcion, setDescripcion] = useState("");
  const [proyectoId, setProyectoId] = useState<number | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!initialData) return;

    if (initialData.fecha) setFecha(new Date(initialData.fecha));
    setDescripcion(initialData.descripcion ?? "");
    setProyectoId(initialData.proyecto_investigacion_id ?? null);
  }, [initialData]);

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      isEdit
        ? actualizarDistincion(Number(id), payload)
        : crearDistincion(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["distinciones", "all"] });
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

    if (!fecha) newErrors.fecha = "Debe seleccionar fecha";
    if (!descripcion.trim()) newErrors.descripcion = "Debe ingresar descripción";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!uct) return;

    mutation.mutate({
      fecha: fecha!.toISOString().split("T")[0],
      descripcion,
      proyecto_investigacion_id: proyectoId ?? undefined,
      grupo_utn_id: uct.id,
    });
  };

  if (isEdit && isLoading) return <p>Cargando distinción…</p>;

  const inputClass = (field: string) =>
    `input ${errors[field] ? "!border-red-500 !ring-2 !ring-red-500" : ""}`;

  return (
    <section className="w-full">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {isEdit ? "Editar distinción" : "Nueva distinción recibida"}
      </h2>

      <form
        onSubmit={submit}
        className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
      >
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

        <Field label="Descripción">
          <textarea
            className={`input min-h-[80px] ${inputClass("descripcion")}`}
            value={descripcion}
            onChange={(e) => {
              setDescripcion(e.target.value);
              if (e.target.value.trim()) clearError("descripcion");
            }}
          />
          {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
        </Field>

        <Field label="Proyecto de investigación (opcional)">
          <select
            className="input"
            value={proyectoId ?? ""}
            onChange={(e) => {
              const value = e.target.value ? Number(e.target.value) : null;
              setProyectoId(value);
            }}
          >
            <option value="">Seleccionar proyecto</option>
            {proyectos.map((p: Proyecto) => (
              <option key={p.id} value={p.id}>
                {p.codigo} - {p.nombre}
              </option>
            ))}
          </select>
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
