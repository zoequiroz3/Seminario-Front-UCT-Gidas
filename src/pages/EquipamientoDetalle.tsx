import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import { getEquipamientoById } from "@/services/equipamientoServices";
import type { Equipamiento } from "@/services/equipamientoServices";
import { formatFecha } from "@/utils/formatFecha";
import SuccessToast from "@/components/SuccessToast";
import { useState, useEffect } from "react";

const fmtMoney = (n?: number) =>
  typeof n === "number"
    ? new Intl.NumberFormat("es-AR", {
        style: "currency",
        currency: "ARS",
        maximumFractionDigits: 2,
      }).format(n)
    : "—";

export default function EquipamientoDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading, isError } = useQuery<Equipamiento>({
    queryKey: ["equipamiento", id],
    queryFn: () => getEquipamientoById(Number(id)),
    enabled: !!id,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // 🔥 LEE EL STATE DEL NAVIGATE (ACTUALIZADO)
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);

      // limpia el state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (isLoading) {
    return <p className="text-slate-500">Cargando…</p>;
  }

  if (isError || !data) {
    return <p className="text-slate-500">No se encontró el equipamiento.</p>;
  }

  return (
    <>
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          {data.denominacion}
        </h2>

        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="space-y-2 text-sm md:text-base text-slate-500">
            <p>
              <span className="font-medium text-slate-700">
                Descripción breve:
              </span>{" "}
              {data.descripcion_breve || "—"}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Fecha de incorporación:
              </span>{" "}
              {formatFecha(data.fecha_incorporacion)}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Monto invertido:
              </span>{" "}
              {fmtMoney(data.monto_invertido)}
            </p>
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/equipamiento")}
            >
              Volver
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/equipamiento/${data.id}/editar`)}
            >
              Editar
            </Button>
          </div>
        </article>
      </section>

      {/* 🔥 TOAST */}
      <SuccessToast
        open={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
