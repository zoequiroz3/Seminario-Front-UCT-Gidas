import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import Button from "@/components/Button";
import SuccessToast from "@/components/SuccessToast";
import { getArticuloById } from "@/services/articulosDivulgacionServices";
import AuditInfo from "@/components/AuditInfo";

export default function ArticulosDivulgacionDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["articulos-divulgacion", id],
    queryFn: () => getArticuloById(Number(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  if (isLoading) return <p className="text-slate-500">Cargando…</p>;
  if (!data) return <p className="text-slate-500">No se encontró el artículo.</p>;

  const formatFecha = (fecha?: string | null) => {
    if (!fecha) return "—";
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const anio = date.getFullYear();
    return `${dia}/${mes}/${anio}`;
  };

  return (
    <>
      <section className="flex flex-col gap-6">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          {data.titulo}
        </h2>

        <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
          <div className="space-y-3 md:text-base text-slate-500">
            <p>
              <span className="font-medium text-slate-700">Fecha de publicación:</span>{" "}
              {formatFecha(data.fecha_publicacion)}
            </p>

            <div className="pt-2">
              <span className="font-medium text-slate-700 block mb-1">Descripción:</span>
              <p className="whitespace-pre-line">{data.descripcion}</p>
            </div>
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
              onClick={() => navigate("/articulos-divulgacion")}
            >
              Volver
            </Button>

            <Button
              size="sm"
              onClick={() => navigate(`/articulos-divulgacion/${id}/editar`)}
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
