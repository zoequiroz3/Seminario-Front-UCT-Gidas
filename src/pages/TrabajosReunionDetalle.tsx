import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import SuccessToast from "@/components/SuccessToast";
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

  const {
    data,
    isLoading,
    isError,
  } = useQuery<TrabajoReunion>({
    queryKey: ["trabajos-reunion", id],
    queryFn: () => getTrabajoReunionById(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (isLoading) {
    return <p className="text-slate-500">Cargando…</p>;
  }

  if (isError || !data) {
    return (
      <p className="text-slate-500">
        Trabajo en congreso no encontrado.
      </p>
    );
  }

  return (
    <>
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          {data.titulo_trabajo}
        </h2>

        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="grid grid-cols-[160px_1fr] gap-y-4 text-slate-600 break-words">
            
            <span className="font-medium text-slate-700">
              Reunión:
            </span>
            <span>{data.nombre_reunion}</span>

            <span className="font-medium text-slate-700">
              Tipo:
            </span>
            <span>{data.tipo_reunion?.nombre || "—"}</span>

            <span className="font-medium text-slate-700">
              Procedencia:
            </span>
            <span>{data.procedencia}</span>

            <span className="font-medium text-slate-700">
              Fecha:
            </span>
            <span>{data.fecha_inicio}</span>

            <span className="font-medium text-slate-700 self-start">
              Investigadores:
            </span>
            <span>
              {data.investigadores && data.investigadores.length > 0
                ? data.investigadores
                    .map((inv) => inv.nombre_apellido)
                    .join(", ")
                : "—"}
            </span>

            <span className="font-medium text-slate-700">
              Grupo:
            </span>
            <span>{data.grupo_utn || "—"}</span>

          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/trabajos-reunion")}
            >
              Volver
            </Button>

            <Button
              size="sm"
              onClick={() =>
                navigate(`/trabajos-reunion/${data.id}/editar`)
              }
            >
              Editar
            </Button>
          </div>
        </article>
      </section>

      <SuccessToast
        open={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}