import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import Button from "@/components/Button";
import SuccessToast from "@/components/SuccessToast";
import { getPersonalCompletoByRolAndId } from "@/services/personalCompletoServices";

export default function PersonalDetalle() {
  const { rol, id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);

      // Limpia el state para que no vuelva a aparecer al refrescar
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["personal-detalle", rol, id],
    queryFn: () =>
      getPersonalCompletoByRolAndId(rol!, Number(id)),
    enabled: !!rol && !!id,
  });

  if (isLoading) return <p>Cargando…</p>;
  if (isError || !data) return <p>No encontrado</p>;

  const formatearLabel = (key: string) => {
    return key
      .replace(/_/g, " ")
      .replace(/\b\w/g, (l: string) => l.toUpperCase());
  };

  const renderValue = (value: any) => {
    if (value === null || value === undefined) return "—";

    if (Array.isArray(value)) {
      return value.length
        ? value
            .map((v) => v.nombre_apellido || v.nombre || JSON.stringify(v))
            .join(", ")
        : "—";
    }

    if (typeof value === "object") {
      return value.nombre || value.descripcion || JSON.stringify(value);
    }

    return value.toString();
  };

  return (
    <>
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          {data?.nombre_apellido ?? "Detalle de personal"}
        </h2>

        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="space-y-2 text-sm md:text-base text-slate-500">
            {Object.entries(data)
              .filter(
                ([key]) =>
                  key !== "id" &&
                  key !== "nombre_apellido" &&
                  key !== "activo"
              )
              .map(([key, value]) => (
                <p key={key}>
                  <span className="font-medium text-slate-700">
                    {formatearLabel(key)}:
                  </span>{" "}
                  {renderValue(value)}
                </p>
              ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button
              variant="secondary"
              size="sm"
              className="px-3 py-1 text-xs"
              onClick={() => navigate("/personal")}
            >
              Volver
            </Button>

            <Button
              size="sm"
              className="px-3 py-1 text-xs"
              onClick={() =>
                navigate(`/personal/${rol}/${id}/editar`)
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
