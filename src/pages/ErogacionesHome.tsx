import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import {
  getErogaciones,
  type Erogaciones,
} from "@/services/erogacionesServices";

export default function ErogacionesLanding() {
  const navigate = useNavigate();

  const { data: list = [], isLoading, isError } = useQuery({
    queryKey: ["erogaciones"],
    queryFn: getErogaciones,
    staleTime: 60_000,
  });

  return (
    <section className="w-full min-h-[calc(100vh-96px)] px-10 md:px-5 lg:px-1 py-2 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">
          Erogaciones
        </h2>
        <Button variant="primary" onClick={() => navigate("/erogaciones/nuevo")}>
          Agregar nuevo
        </Button>
      </div>

      {/* Contenido */}
      <div className="mt-8 flex-1">
        {isLoading && <p className="text-slate-500">Cargando…</p>}
        {isError && <p className="text-red-600">No se pudo cargar la lista.</p>}
        {!isLoading && !isError && (
          list.length === 0 ? (
            <p className="text-slate-500">Aún no hay registros.</p>
          ) : (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((e) => (
                <Tarjeta<Erogaciones>
                  key={e.id}
                  item={e}
                  title={(x) => `Erogación N° ${String(x.numeroErogacion).padStart(6, "0")}`}
                  subtitle={(x) => x.tipoErogacion || "—"}
                  titleClassName="text-xl md:text-2xl"
                  subtitleClassName="text-base md:text-lg"
                  onClick={() => navigate(`/erogaciones/${e.id}`)}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Footer */}
      <div className="pt-10">
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    </section>
  );
}
