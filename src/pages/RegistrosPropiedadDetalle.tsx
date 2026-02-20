import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import SuccessToast from "@/components/SuccessToast";
import { useState, useEffect } from "react";
import {
  getRegistroPropiedadById,
  type RegistroPropiedad,
} from "@/services/registrosPropiedadServices";
import { formatFecha } from "@/utils/formatFecha";

export default function RegistrosPropiedadDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading, isError } = useQuery<RegistroPropiedad>({
    queryKey: ["registros-propiedad", id],
    queryFn: () => getRegistroPropiedadById(Number(id)),
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
        No se encontró el registro de propiedad.
      </p>
    );
  }

  return (
    <>
      <section className="flex flex-col gap-6">
        {/* Título */}
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          {data.nombre_articulo}
        </h2>

        {/* Card */}
        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">

          <div className="space-y-2 text-sm md:text-base text-slate-500">

            <p>
              <span className="font-medium text-slate-700">
                Organismo registrante:
              </span>{" "}
              {data.organismo_registrante || "—"}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Fecha de registro:
              </span>{" "}
              {formatFecha(data.fecha_registro)}
            </p>

            <p>
              <span className="font-medium text-slate-700">
                Tipo de registro:
              </span>{" "}
              {data.tipo_registro || "—"}
            </p>

          </div>

          {/* Acciones */}
          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/registros-propiedad")}
            >
              Volver
            </Button>

            <Button
              size="sm"
              onClick={() =>
                navigate(`/registros-propiedad/${data.id}/editar`)
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
