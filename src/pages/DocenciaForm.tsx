import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Calendar from "@/components/Calendar";
import { useInvestigadores } from "@/hooks/useInvestigadores";
import {
  crearActividadDocencia,
  getActividadDocenciaById,
  actualizarActividadDocencia,
} from "@/services/actividadDocenciaServices";

export default function FormDocenciaInvestigador() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const isEdit = Boolean(id);

  const { data: investigadores = [] } = useInvestigadores();

  /* =========================
     CARGA DATOS SI ES EDICIÓN
     ========================= */
  const { data: initialData, isLoading } = useQuery({
    queryKey: ["actividad-docencia", id],
    queryFn: () =>
      id ? getActividadDocenciaById(Number(id)) : null,
    enabled: isEdit,
  });

  /* =========================
     STATE
     ========================= */
  const [investigadorId, setInvestigadorId] =
    useState<number | null>(null);
  const [curso, setCurso] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [fechaInicio, setFechaInicio] =
    useState<Date | null>(null);
  const [fechaFin, setFechaFin] =
    useState<Date | null>(null);
  const [gradoAcademico, setGradoAcademico] =
    useState("");
  const [rolActividad, setRolActividad] =
    useState("");

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  /* =========================
     PRECARGAR DATOS
     ========================= */
  useEffect(() => {
    if (!initialData) return;

    setInvestigadorId(initialData.investigador_id);
    setCurso(initialData.curso ?? "");
    setInstitucion(initialData.institucion ?? "");
    setGradoAcademico(initialData.grado_academico ?? "");
    setRolActividad(initialData.rol_actividad ?? "");

    if (initialData.fecha_inicio)
      setFechaInicio(new Date(initialData.fecha_inicio));

    if (initialData.fecha_fin)
      setFechaFin(new Date(initialData.fecha_fin));
  }, [initialData]);

  /* =========================
     MUTATION
     ========================= */
  const mutation = useMutation({
    mutationFn: (payload: any) =>
      isEdit
        ? actualizarActividadDocencia(Number(id), payload)
        : crearActividadDocencia(payload),
    onSuccess: () => {
      qc.invalidateQueries({
        queryKey: ["actividades-docencia"],
      });
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

    if (!investigadorId)
      newErrors.investigador =
        "Debe seleccionar investigador";

    if (!curso.trim())
      newErrors.curso = "Debe ingresar curso";

    if (!institucion.trim())
      newErrors.institucion =
        "Debe ingresar institución";

    if (!fechaInicio)
      newErrors.fechaInicio =
        "Debe seleccionar fecha de inicio";

    if (!fechaFin)
      newErrors.fechaFin =
        "Debe seleccionar fecha de fin";

    if (!gradoAcademico.trim())
      newErrors.gradoAcademico =
        "Debe ingresar grado académico";

    if (!rolActividad.trim())
      newErrors.rolActividad =
        "Debe ingresar rol";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    mutation.mutate({
      investigador_id: investigadorId!,
      curso,
      institucion,
      fecha_inicio:
        fechaInicio!.toISOString().split("T")[0],
      fecha_fin:
        fechaFin!.toISOString().split("T")[0],
      grado_academico: gradoAcademico,
      rol_actividad: rolActividad,
    });
  };

  if (isEdit && isLoading)
    return <p>Cargando actividad…</p>;

  const inputClass = (field: string) =>
    `input ${
      errors[field]
        ? "!border-red-500 !ring-2 !ring-red-500"
        : ""
    }`;

  return (
    <section className="w-full">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {isEdit
          ? "Editar actividad en docencia"
          : "Nueva actividad en docencia"}
      </h2>

      <form
  onSubmit={submit}
  className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
>

  {/* Investigador */}
  <Field label="Investigador">
    <>
      <select
        className={inputClass("investigador")}
        value={investigadorId ?? ""}
        onChange={(e) => {
          const value = e.target.value
            ? Number(e.target.value)
            : null;
          setInvestigadorId(value);
          if (value) clearError("investigador");
        }}
      >
        <option value="" disabled>
          Seleccionar investigador
        </option>
        {investigadores.map((inv) => (
          <option key={inv.id} value={inv.id}>
            {inv.nombre_apellido}
          </option>
        ))}
      </select>

      {errors.investigador && (
        <p className="text-red-500 text-sm mt-1">
          {errors.investigador}
        </p>
      )}
    </>
  </Field>

  {/* Curso */}
  <Field label="Curso">
    <>
      <input
        className={inputClass("curso")}
        value={curso}
        onChange={(e) => {
          setCurso(e.target.value);
          if (e.target.value.trim())
            clearError("curso");
        }}
      />
      {errors.curso && (
        <p className="text-red-500 text-sm mt-1">
          {errors.curso}
        </p>
      )}
    </>
  </Field>

  {/* Institución */}
  <Field label="Institución">
    <>
      <input
        className={inputClass("institucion")}
        value={institucion}
        onChange={(e) => {
          setInstitucion(e.target.value);
          if (e.target.value.trim())
            clearError("institucion");
        }}
      />
      {errors.institucion && (
        <p className="text-red-500 text-sm mt-1">
          {errors.institucion}
        </p>
      )}
    </>
  </Field>

  {/* Fechas */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Field label="Fecha inicio">
      <Calendar
        value={fechaInicio}
        onChange={(date) => {
          setFechaInicio(date);
          if (date)
            clearError("fechaInicio");
        }}
        className={inputClass("fechaInicio")}
        helperText={errors.fechaInicio ?? "DD/MM/AAAA"}
      />
    </Field>

    <Field label="Fecha fin">
      <Calendar
        value={fechaFin}
        onChange={(date) => {
          setFechaFin(date);
          if (date)
            clearError("fechaFin");
        }}
        className={inputClass("fechaFin")}
        helperText={errors.fechaFin ?? "DD/MM/AAAA"}
      />
    </Field>
  </div>

  {/* Grado académico */}
  <Field label="Grado académico">
    <>
      <input
        className={inputClass("gradoAcademico")}
        value={gradoAcademico}
        onChange={(e) => {
          setGradoAcademico(e.target.value);
          if (e.target.value.trim())
            clearError("gradoAcademico");
        }}
      />
      {errors.gradoAcademico && (
        <p className="text-red-500 text-sm mt-1">
          {errors.gradoAcademico}
        </p>
      )}
    </>
  </Field>

  {/* Rol */}
  <Field label="Rol en la actividad">
    <>
      <input
        className={inputClass("rolActividad")}
        value={rolActividad}
        onChange={(e) => {
          setRolActividad(e.target.value);
          if (e.target.value.trim())
            clearError("rolActividad");
        }}
      />
      {errors.rolActividad && (
        <p className="text-red-500 text-sm mt-1">
          {errors.rolActividad}
        </p>
      )}
    </>
  </Field>

  {/* Botones */}
  <div className="flex justify-between pt-6">
    <Button
      type="button"
      variant="secondary"
      size="sm"
      onClick={() => navigate(-1)}
    >
      Volver
    </Button>

    <Button
      type="submit"
      size="sm"
      disabled={mutation.isPending}
    >
      {mutation.isPending
        ? "Guardando…"
        : isEdit
        ? "Actualizar"
        : "Guardar"}
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
      <label className="block text-sm font-medium mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}
