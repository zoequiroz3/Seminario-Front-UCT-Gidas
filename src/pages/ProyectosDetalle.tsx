// pages/ProyectoDetalle.tsx
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import {
  getProyectoById,
  type Proyecto,
} from "@/services/proyectosServices";
import { useAuditoria } from "@/hooks/useAuditoria";

export default function ProyectoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery<Proyecto | null>({
    queryKey: ["proyecto", id],
    queryFn: () =>
      id ? getProyectoById(Number(id)) : Promise.resolve(null),
    enabled: !!id,
  });

  const auditoria = useAuditoria(data);

  if (isLoading) return <p className="text-slate-500">Cargando…</p>;
  if (!data) return <p className="text-slate-500">No se encontró el proyecto.</p>;

  const formatFecha = (fecha?: string) => {
    if (!fecha) return "—";
    const date = new Date(fecha);
    return date.toLocaleDateString("es-AR");
  };

  const formatFechaHora = (fecha?: string | null) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleString("es-AR");
  };

  const investigadores = data.investigadores?.length
    ? data.investigadores.map((a) => a.nombre_apellido).join(", ")
    : "—";

  const becarios = data.becarios?.length
    ? data.becarios.map((a) => a.nombre_apellido).join(", ")
    : "—";

  return (
    <section className="flex flex-col gap-6">
      {/* 🔵 HEADER CON EDITAR ARRIBA */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          {data.nombreProyecto}
        </h2>

        <Button
          size="sm"
          onClick={() => navigate(`/proyectos/editar/${data.id}`)}
        >
          Editar
        </Button>
      </div>

      {/* ================= TARJETA PRINCIPAL ================= */}
      <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="space-y-3 text-sm md:text-base text-slate-500">
          <p>
            <span className="font-medium text-slate-700">Código del proyecto:</span>{" "}
            {data.codigoProyecto}
          </p>

          <p>
            <span className="font-medium text-slate-700">Investigadores:</span>{" "}
            {investigadores}
          </p>

          <p>
            <span className="font-medium text-slate-700">Becarios:</span>{" "}
            {becarios}
          </p>

          <p>
            <span className="font-medium text-slate-700">Descripción:</span>{" "}
            {data.descripcionProyecto || "—"}
          </p>

          <p>
            <span className="font-medium text-slate-700">Tipo de proyecto:</span>{" "}
            {data.tipoProyectoNombre || "—"}
          </p>

          <p>
            <span className="font-medium text-slate-700">Fuente de financiamiento:</span>{" "}
            {data.fuenteFinanciamientoNombre || "—"}
          </p>

          <p>
            <span className="font-medium text-slate-700">Fecha inicio:</span>{" "}
            {formatFecha(data.fechaInicio)}
          </p>

          <p>
            <span className="font-medium text-slate-700">Fecha fin:</span>{" "}
            {formatFecha(data.fechaFinalizacion)}
          </p>
        </div>
      </article>

      
      {/* 🔵 VOLVER ABAJO DE TODO */}
      <div className="flex justify-start pt-4">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      </div>
    </section>
  );
}