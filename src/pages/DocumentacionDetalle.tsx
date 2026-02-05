// pages/DocumentacionDetalle.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import { getDocumentacionById } from "@/services/documentacionServices";

export default function DocumentacionDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ["documentacion", id],
    queryFn: () => getDocumentacionById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) return <p className="text-slate-500">Cargando…</p>;
  if (!data) return <p className="text-slate-500">No se encontró el documento.</p>;

  const autores = data.autores?.length
    ? data.autores.map((a) => a.nombre_apellido).join(", ")
    : "—";

  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        Documentación
      </h2>

      <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">

        {/* Título */}
        <h3 className="md:text-[25px] text-lg font-semibold mb-6">
          {data.titulo}
        </h3>

        {/* Info lineal */}
        <div className="space-y-3 md:text-[18px] text-slate-500">
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

        {/* Acciones */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            variant="secondary"
            size="sm"
            className="px-3 py-1 text-xs"
            onClick={() => navigate(-1)}
          >
            Volver
          </Button>

          <Button
            size="sm"
            className="px-3 py-1 text-xs"
            onClick={() => navigate(`/documentacion/${id}/editar`)}
          >
            Editar
          </Button>
        </div>
      </article>
    </section>
  );
}
