import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import { getDistincionById } from "@/services/distincionesServices";

export default function DistincionesDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["distincion", id],
    queryFn: () => getDistincionById(Number(id)),
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
  if (!data) return <p className="text-slate-500">No se encontró la distinción.</p>;

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        {data.descripcion}
      </h2>

      <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="space-y-2 text-sm md:text-base text-slate-500">
          <p>
            <span className="font-medium text-slate-700">Fecha:</span>{" "}
            {formatFecha(data.fecha)}
          </p>

          <p>
            <span className="font-medium text-slate-700">Descripción:</span>{" "}
            {data.descripcion || "—"}
          </p>

          <p>
            <span className="font-medium text-slate-700">Proyecto de investigación:</span>{" "}
            {data.proyecto?.nombre || "—"}
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between">
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
            onClick={() => navigate(`/distinciones/${id}/editar`)}
          >
            Editar
          </Button>
        </div>
      </article>
    </section>
  );
}
