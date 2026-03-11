// pages/TrabajoReunionDetalle.tsx
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import SuccessToast from "@/components/SuccessToast";
import { formatFecha } from "@/utils/formatFecha";
import { useAuditoria } from "@/hooks/useAuditoria";
import {
  getTrabajoReunionById,
  type TrabajoReunion,
} from "@/services/trabajosReunionServices";

export default function TrabajoReunionDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { data, isLoading, isError } = useQuery<TrabajoReunion>({
    queryKey: ["trabajos-reunion", id],
    queryFn: () => getTrabajoReunionById(Number(id)),
    enabled: !!id,
  });

  const auditoria = useAuditoria(data);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (isLoading) return <p className="text-slate-500">Cargando…</p>;
  if (isError || !data) return <p className="text-slate-500">Trabajo en congreso no encontrado.</p>;

  const formatFechaHora = (fecha?: string | null) => {
    if (!fecha) return "—";
    return new Date(fecha).toLocaleString("es-AR");
  };

  const investigadores = data.investigadores && data.investigadores.length > 0
    ? data.investigadores.map((inv) => inv.nombre_apellido).join(", ")
    : "—";

  return (
    <>
      <section className="flex flex-col gap-6">
        {/* 🔵 HEADER CON EDITAR ARRIBA */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-semibold leading-none">
            {data.titulo_trabajo}
          </h2>

          <Button
            size="sm"
            onClick={() => navigate(`/trabajos-reunion/${data.id}/editar`)}
          >
            Editar
          </Button>
        </div>

        {/* ================= TARJETA PRINCIPAL ================= */}
        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="space-y-2 text-sm md:text-base text-slate-500 break-words">
            <p>
              <span className="font-medium text-slate-700">Reunión:</span>{" "}
              {data.nombre_reunion}
            </p>

            <p>
              <span className="font-medium text-slate-700">Tipo:</span>{" "}
              {data.tipo_reunion?.nombre || "—"}
            </p>

            <p>
              <span className="font-medium text-slate-700">Procedencia:</span>{" "}
              {data.procedencia}
            </p>

            <p>
              <span className="font-medium text-slate-700">Fecha:</span>{" "}
              {formatFecha(data.fecha_inicio)}
            </p>

            <p>
              <span className="font-medium text-slate-700">Investigadores:</span>{" "}
              {investigadores}
            </p>
          </div>
        </article>

        {/* ================= TARJETA AUDITORÍA ================= */}
        <article className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-slate-700">Auditoría</h3>
            <p className="text-xs text-slate-500 mt-1">
              {data.titulo_trabajo}
            </p>
          </div>

          <div className="space-y-2 text-sm md:text-base text-slate-500">
            <p>
              <span className="font-medium text-slate-700">Creado por:</span>{" "}
              {auditoria.nombreCreador}
            </p>

            <p>
              <span className="font-medium text-slate-700">Fecha de creación:</span>{" "}
              {formatFechaHora(data.created_at)}
            </p>

            <p>
              <span className="font-medium text-slate-700">Eliminado por:</span>{" "}
              {auditoria.nombreEliminador}
            </p>

            <p>
              <span className="font-medium text-slate-700">Fecha de eliminación:</span>{" "}
              {formatFechaHora(data.deleted_at)}
            </p>
          </div>
        </article>

        {/* 🔵 VOLVER ABAJO DE TODO */}
        <div className="flex justify-start pt-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/trabajos-reunion")}
          >
            Volver
          </Button>
        </div>
      </section>

      <SuccessToast
        open={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}