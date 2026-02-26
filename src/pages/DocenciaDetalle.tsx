// pages/ActividadDocenciaDetalle.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import { getActividadDocenciaById } from "@/services/actividadDocenciaServices";
import { getGradoAcademicoById } from "@/services/gradoAcademicoService";
import { getRolActividadById } from "@/services/rolActividadService";

import AuditInfo from "@/components/AuditInfo";

export default function ActividadDocenciaDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["actividad-docencia", id],
    queryFn: () => getActividadDocenciaById(Number(id)),
    enabled: !!id,
  });

  const { data: gradoAcademico } = useQuery({
    queryKey: ["grado-academico", data?.grado_academico_id],
    queryFn: () =>
      getGradoAcademicoById(Number(data?.grado_academico_id)),
    enabled: !!data?.grado_academico_id,
  });

  const { data: rolActividad } = useQuery({
    queryKey: ["rol-actividad", data?.rol_actividad_id],
    queryFn: () =>
      getRolActividadById(Number(data?.rol_actividad_id)),
    enabled: !!data?.rol_actividad_id,
  });

  if (isLoading) return <p className="text-slate-500">Cargando…</p>;
  if (!data)
    return <p className="text-slate-500">No se encontró la actividad.</p>;

  const formatFecha = (fecha?: string | null) => {
    if (!fecha) return "—";

    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const anio = date.getFullYear();

    return `${dia}/${mes}/${anio}`;
  };

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {data.curso}
      </h2>

      <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">

        <div className="space-y-2 text-sm md:text-base text-slate-500">

          <p>
            <span className="font-medium text-slate-700">
              Investigador:
            </span>{" "}
            {data.investigador ?? "—"}
          </p>

          <p>
            <span className="font-medium text-slate-700">
              Fecha de inicio:
            </span>{" "}
            {formatFecha(data.fecha_inicio)}
          </p>

          <p>
            <span className="font-medium text-slate-700">
              Fecha de finalización:
            </span>{" "}
            {formatFecha(data.fecha_fin)}
          </p>

          <p>
            <span className="font-medium text-slate-700">
              Grado Académico:
            </span>{" "}
            {gradoAcademico?.nombre ?? "—"}
          </p>

          <p>
            <span className="font-medium text-slate-700">
              Institución:
            </span>{" "}
            {data.institucion ?? "—"}
          </p>

          <p>
            <span className="font-medium text-slate-700">
              Rol en la actividad:
            </span>{" "}
            {rolActividad?.nombre ?? "—"}
          </p>
        </div>

        <AuditInfo
          created_at={data.created_at}
          creator_name={data.creator_name}
          deleted_at={data.deleted_at}
          deleter_name={data.deleter_name}
          activo={data.activo}
        />

        <div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-4">
          <Button
            variant="secondary"
            size="sm"
            className="px-3 py-1 text-xs"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>

          <Button
            size="sm"
            className="px-3 py-1 text-xs"
            onClick={() =>
              navigate(`/docenciaInvestigador/${id}/editar`)
            }
          >
            Editar
          </Button>
        </div>
      </article>
    </section>
  );
}
