import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import SuccessToast from "@/components/SuccessToast";
import { formatFecha } from "@/utils/formatFecha";

import {
  getTrabajoRevistaById,
  type TrabajoRevista,
} from "@/services/trabajosRevistasServices";

import AuditInfo from "@/components/AuditInfo";

export default function TrabajoRevistaDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { data, isLoading, isError } =
    useQuery<TrabajoRevista>({
      queryKey: ["trabajo-revista", id],
      queryFn: () =>
        getTrabajoRevistaById(Number(id)),
      enabled: !!id,
    });

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(
        location.state.successMessage
      );
      setShowSuccess(true);
      window.history.replaceState(
        {},
        document.title
      );
    }
  }, [location.state]);

  if (isLoading)
    return (
      <p className="text-slate-500">
        Cargando…
      </p>
    );

  if (isError || !data)
    return (
      <p className="text-slate-500">
        Trabajo en revista no encontrado.
      </p>
    );

  return (
    <>
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          {data.titulo_trabajo}
        </h2>

        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="space-y-3 text-sm md:text-base text-slate-600">

            <p>
              <span className="font-medium text-slate-700">
                Revista:
              </span>{" "}
              {data.nombre_revista || "—"}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Editorial:
              </span>{" "}
              {data.editorial || "—"}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                ISSN:
              </span>{" "}
              {data.issn || "—"}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                País:
              </span>{" "}
              {data.pais || "—"}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Tipo:
              </span>{" "}
              {data.tipo_reunion?.nombre || "—"}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Fecha:
              </span>{" "}
              {formatFecha(data.fecha)}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Investigadores:
              </span>{" "}
              {data.investigadores?.length
                ? data.investigadores
                  .map(
                    (i) =>
                      i.nombre_apellido
                  )
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
              onClick={() =>
                navigate(
                  "/trabajos-revistas"
                )
              }
            >
              Volver
            </Button>

            <Button
              size="sm"
              onClick={() =>
                navigate(
                  `/trabajos-revistas/${data.id}/editar`
                )
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
        onClose={() =>
          setShowSuccess(false)
        }
      />
    </>
  );
}