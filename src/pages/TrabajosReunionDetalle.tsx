import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import SuccessToast from "@/components/SuccessToast";
import { formatFecha } from "@/utils/formatFecha";
import {
  getTrabajoReunionById,
  type TrabajoReunion,
} from "@/services/trabajosReunionServices";

import AuditInfo from "@/components/AuditInfo";

export default function TrabajoReunionCientificaDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { data, isLoading, isError } =
    useQuery<TrabajoReunion>({
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
          <div className="space-y-2 text-sm md:text-base text-slate-500 break-words">

            <p>
              <span className="font-medium text-slate-700">
                Reunión:
              </span>{" "}
              {data.nombre_reunion}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Tipo:
              </span>{" "}
              {data.tipo_reunion?.nombre || "—"}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Procedencia:
              </span>{" "}
              {data.procedencia}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Fecha:
              </span>{" "}
              {formatFecha(data.fecha_inicio)}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Investigadores:
              </span>{" "}
              {data.investigadores &&
                data.investigadores.length > 0
                ? data.investigadores
                  .map((inv) => inv.nombre_apellido)
                  .join(", ")
                : "—"}
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