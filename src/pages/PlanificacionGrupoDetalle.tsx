import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import SuccessToast from "@/components/SuccessToast";
import { useState, useEffect } from "react";
import {
  getPlanificacionById,
  type PlanificacionGrupo,
} from "@/services/planificacionGrupoServices";

export default function PlanificacionGrupoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading, isError } =
    useQuery<PlanificacionGrupo>({
      queryKey: ["planificaciones", id],
      queryFn: () => getPlanificacionById(Number(id)),
      enabled: !!id,
    });

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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
        No se encontró la planificación.
      </p>
    );
  }

  return (
    <>
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          Planificación {data.anio}
        </h2>

        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="space-y-3 md:text-[18px] text-slate-500 whitespace-pre-line break-words">
            <p>
              <span className="font-medium text-slate-700">
                Grupo:
              </span>{" "}
              {data.grupo || "—"}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Año:
              </span>{" "}
              {data.anio}
            </p>

            <p>
              <span className="font-medium text-slate-700 block mb-2">
                Descripción:
              </span>
              {data.descripcion}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/planificaciones")}
            >
              Volver
            </Button>

            <Button
              size="sm"
              onClick={() =>
                navigate(`/planificaciones/${data.id}/editar`)
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