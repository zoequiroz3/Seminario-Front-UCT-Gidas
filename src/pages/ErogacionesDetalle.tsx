import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import SuccessToast from "@/components/SuccessToast";
import { useState, useEffect } from "react";
import {
  getErogacionById,
  type Erogaciones,
} from "@/services/erogacionesServices";

const fmtMoney = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }).format(n)
    : "—";

import AuditInfo from "@/components/AuditInfo";

export default function ErogacionesDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading, isError } = useQuery<Erogaciones>({
    queryKey: ["erogaciones", id],
    queryFn: () => getErogacionById(Number(id)),
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
        No se encontró la erogación.
      </p>
    );
  }

  return (
    <>
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          Erogación N°{" "}
          {String(data.numero_erogacion).padStart(6, "0")}
        </h2>

        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="space-y-3 md:text-[18px] text-slate-500">
            <p>
              <span className="font-medium text-slate-700">
                Tipo de erogación:
              </span>{" "}
              {data.tipo_erogacion?.nombre || "—"}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Ingresos:
              </span>{" "}
              {fmtMoney(data.ingresos)}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Egresos:
              </span>{" "}
              {fmtMoney(data.egresos)}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Fuente de financiamiento:
              </span>{" "}
              {data.fuente?.nombre || "—"}
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
              onClick={() => navigate("/erogaciones")}
            >
              Volver
            </Button>

            <Button
              size="sm"
              onClick={() =>
                navigate(`/erogaciones/${data.id}/editar`)
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
