// src/pages/ErogacionesDetalle.tsx
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
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

export default function ErogacionesDetalle() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data, isLoading, isError } = useQuery<Erogaciones>({
    queryKey: ["erogaciones", id],
    queryFn: () => getErogacionById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return <p className="text-slate-500">Cargando…</p>;
  }

  if (isError || !data) {
    return <p className="text-slate-500">No se encontró la erogación.</p>;
  }

  return (
    <section className="flex flex-col gap-6">
      {/* Título principal */}
      <h2 className="text-2xl md:text-3xl font-semibold leading-none">
        Erogaciones
      </h2>

      {/* Tarjeta */}
      <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        {/* Título tarjeta */}
        <h3 className="md:text-[25px] text-lg font-semibold mb-6">
          Erogación N° {String(data.numeroErogacion).padStart(6, "0")}
        </h3>

        {/* Info lineal (MISMO FORMATO QUE DOCUMENTACIÓN) */}
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
            onClick={() => navigate(`/erogaciones/${data.id}/editar`)}
          >
            Editar
          </Button>
        </div>
      </article>
    </section>
  );
}
