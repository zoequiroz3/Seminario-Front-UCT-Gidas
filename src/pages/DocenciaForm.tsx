import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import Button from "@/components/Button";
import Calendar from "@/components/Calendar";
import { useInvestigadores } from "@/hooks/useInvestigadores";
import { crearActividadDocencia } from "@/services/actividadDocenciaServices";

export default function FormDocenciaInvestigador() {
  const navigate = useNavigate();
  const { data: investigadores = [] } = useInvestigadores();

  const [investigadorId, setInvestigadorId] = useState<number | null>(null);

  const [curso, setCurso] = useState("");
  const [institucion, setInstitucion] = useState("");
  const [fechaInicio, setFechaInicio] = useState<Date | null>(null);
  const [fechaFin, setFechaFin] = useState<Date | null>(null);
  const [gradoAcademico, setGradoAcademico] = useState("");
  const [rolActividad, setRolActividad] = useState("");

  const [errors, setErrors] = useState<Record<string, string>>({});

  const mutation = useMutation({
    mutationFn: crearActividadDocencia,
    onSuccess: () => navigate(-1),
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

   if (!investigadorId) {
  newErrors.investigador = "Debe seleccionar investigador";
}


    if (!curso.trim())
      newErrors.curso = "Debe ingresar curso";

    if (!institucion.trim())
      newErrors.institucion = "Debe ingresar institución";

    if (!fechaInicio)
      newErrors.fechaInicio = "Debe seleccionar fecha de inicio";

    if (!fechaFin)
      newErrors.fechaFin = "Debe seleccionar fecha de fin";

    if (!gradoAcademico.trim())
      newErrors.gradoAcademico = "Debe ingresar grado académico";

    if (!rolActividad.trim())
      newErrors.rolActividad = "Debe ingresar rol";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = (e: React.FormEvent) => {
  e.preventDefault();
  if (!validate()) return;

  mutation.mutate({
  investigador_id: investigadorId!, // ahora seguro es number
  curso,
  institucion,
  fecha_inicio: fechaInicio!.toISOString().split("T")[0],
  fecha_fin: fechaFin!.toISOString().split("T")[0],
  grado_academico: gradoAcademico,
  rol_actividad: rolActividad,
});
};  


  const inputClass = (field: string) =>
    `input ${
      errors[field]
        ? "!border-red-500 !ring-2 !ring-red-500"
        : ""
    }`;

  return (
    <form onSubmit={submit} className="space-y-6">

      {/* INVESTIGADOR */}
      <div>
        <select
  className="input"
  value={investigadorId ?? ""}
  onChange={(e) =>
    setInvestigadorId(
      e.target.value ? Number(e.target.value) : null
    )
  }
>
  <option value="">Seleccionar investigador</option>
  {investigadores.map((inv) => (
    <option key={`inv-${inv.id}`} value={inv.id}>
      {inv.nombre_apellido}
    </option>
  ))}
</select>

        {errors.investigador && (
          <p className="text-red-500 text-sm mt-1">
            {errors.investigador}
          </p>
        )}
      </div>

      {/* CURSO */}
      <div>
        <input
          className={inputClass("curso")}
          placeholder="Curso"
          value={curso}
          onChange={(e) => {
            setCurso(e.target.value);
            if (e.target.value.trim()) clearError("curso");
          }}
        />
        {errors.curso && (
          <p className="text-red-500 text-sm mt-1">
            {errors.curso}
          </p>
        )}
      </div>

      {/* INSTITUCION */}
      <div>
        <input
          className={inputClass("institucion")}
          placeholder="Institución"
          value={institucion}
          onChange={(e) => {
            setInstitucion(e.target.value);
            if (e.target.value.trim()) clearError("institucion");
          }}
        />
        {errors.institucion && (
          <p className="text-red-500 text-sm mt-1">
            {errors.institucion}
          </p>
        )}
      </div>

      {/* FECHAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* FECHA INICIO */}
        <div>
          <Calendar
            label="Fecha inicio"
            value={fechaInicio}
            onChange={(date) => {
              setFechaInicio(date);
              if (date) clearError("fechaInicio");
            }}
            className={`input ${
              errors.fechaInicio
                ? "!border-red-500 !ring-2 !ring-red-500"
                : ""
            }`}
            helperText={errors.fechaInicio ?? "DD/MM/AAAA"}
          />
        </div>

        {/* FECHA FIN */}
        <div>
          <Calendar
            label="Fecha fin"
            value={fechaFin}
            onChange={(date) => {
              setFechaFin(date);
              if (date) clearError("fechaFin");
            }}
            className={`input ${
              errors.fechaFin
                ? "!border-red-500 !ring-2 !ring-red-500"
                : ""
            }`}
            helperText={errors.fechaFin ?? "DD/MM/AAAA"}
          />
        </div>
      </div>




      {/* GRADO */}
      <div>
        <input
          className={inputClass("gradoAcademico")}
          placeholder="Grado académico"
          value={gradoAcademico}
          onChange={(e) => {
            setGradoAcademico(e.target.value);
            if (e.target.value.trim()) clearError("gradoAcademico");
          }}
        />
        {errors.gradoAcademico && (
          <p className="text-red-500 text-sm mt-1">
            {errors.gradoAcademico}
          </p>
        )}
      </div>

      {/* ROL */}
      <div>
        <input
          className={inputClass("rolActividad")}
          placeholder="Rol en actividad"
          value={rolActividad}
          onChange={(e) => {
            setRolActividad(e.target.value);
            if (e.target.value.trim()) clearError("rolActividad");
          }}
        />
        {errors.rolActividad && (
          <p className="text-red-500 text-sm mt-1">
            {errors.rolActividad}
          </p>
        )}
      </div>

      {/* BOTONES */}
      <div className="flex justify-between pt-6">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="px-3 py-1 text-xs"
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>

        <Button
          type="submit"
          size="sm"
          className="px-3 py-1 text-xs"
          disabled={mutation.isPending}
        >
          {mutation.isPending ? "Guardando…" : "Guardar"}
        </Button>
      </div>
    </form>
  );
}
