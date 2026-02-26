// pages/DocumentacionDetalle.tsx
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import { getDocumentacionById } from "@/services/documentacionServices";
import SuccessToast from "@/components/SuccessToast";
import { useEffect, useState } from "react";

import AuditInfo from "@/components/AuditInfo";

export default function DocumentacionDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ["documentacion", id],
    queryFn: () => getDocumentacionById(Number(id)),
    enabled: !!id,
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);

      // limpia el state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (isLoading) return <p className="text-slate-500">Cargando…</p>;
  if (!data) return <p className="text-slate-500">No se encontró el documento.</p>;

  const autores = data.autores?.length
    ? data.autores.map((a) => a.nombre_apellido).join(", ")
    : "—";

  return (
    <>
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          {data.titulo}
        </h2>

        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="space-y-2 text-sm md:text-base text-slate-500">
            <p>
              <span className="font-medium text-slate-700">Autores:</span>{" "}
              {autores}
            </p>

            <p>
              <span className="font-medium text-slate-700">Editorial:</span>{" "}
              {data.editorial ?? "—"}
            </p>

            <p>
              <span className="font-medium text-slate-700">Año:</span>{" "}
              {data.anio ?? "—"}
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
              onClick={() => navigate("/documentacion")}
            >
              Volver
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/documentacion/${id}/editar`)}
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
