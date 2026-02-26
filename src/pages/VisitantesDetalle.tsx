import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import { getVisitanteById } from "@/services/visitantesServices";

import AuditInfo from "@/components/AuditInfo";

export default function VisitantesDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["visitante", id],
    queryFn: () => getVisitanteById(Number(id)),
    enabled: !!id,
  });

  const formatFecha = (fecha?: string | Date | null) => {
    if (!fecha) return "—";

    if (fecha instanceof Date) {
      const d = String(fecha.getDate()).padStart(2, "0");
      const m = String(fecha.getMonth() + 1).padStart(2, "0");
      const y = fecha.getFullYear();
      return `${d}/${m}/${y}`;
    }

    const dateStr = String(fecha);

    if (dateStr.includes("T")) {
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        const d = String(date.getDate()).padStart(2, "0");
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const y = date.getFullYear();
        return `${d}/${m}/${y}`;
      }
    }

    if (dateStr.includes("-")) {
      const [y, m, d] = dateStr.split("-");
      return `${d}/${m}/${y}`;
    }

    return dateStr;
  };

  if (isLoading) return <p className="text-slate-500">Cargando…</p>;
  if (!data) return <p className="text-slate-500">No se encontró el visitante.</p>;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {data.razon}
      </h2>

      <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="space-y-2 text-sm md:text-base text-slate-500">
          <p>
            <span className="font-medium text-slate-700">Fecha:</span>{" "}
            {formatFecha(data.fecha)}
          </p>

          <p>
            <span className="font-medium text-slate-700">Razón de la visita:</span>{" "}
            {data.razon || "—"}
          </p>

          <p>
            <span className="font-medium text-slate-700">Procedencia:</span>{" "}
            {data.procedencia || "—"}
          </p>

          <p>
            <span className="font-medium text-slate-700">Tipo de visita:</span>{" "}
            {data.tipo_visita?.nombre || "—"}
          </p>

          <p>
            <span className="font-medium text-slate-700">Grupo UTN:</span>{" "}
            {data.grupo || "—"}
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
            onClick={() => navigate(`/visitantes/${id}/editar`)}
          >
            Editar
          </Button>
        </div>
      </article>
    </section>
  );
}
