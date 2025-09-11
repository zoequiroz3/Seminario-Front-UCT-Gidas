import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import { getDocencia, type Docencia } from "@/services/docenciaServices";
import { usePersonal } from "@/hooks/usePersonal";
import type { Personal } from "@/services/personalServices";

export default function DocenciaLanding() {
  const navigate = useNavigate();

  // Lista de actividades de docencia
  const { data: list = [], isLoading, isError } = useQuery({
    queryKey: ["docencia", "all"],
    queryFn: () => getDocencia(),
    staleTime: 60_000,
  });

  // Mapa id -> nombre de investigador
  const { list: invs } = usePersonal("INVESTIGADOR");
  const invNameById = useMemo<Map<string, string>>(
    () => new Map((invs as Personal[]).map((p) => [p.id, p.nombreApellido])),
    [invs]
  );

  return (
    <section className="w-full min-h-[calc(100vh-96px)] px-10 md:px-5 lg:px-1 py-2 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">
          Actividades en Docencia
        </h2>
        <Button variant="primary" onClick={() => navigate("/docenciaInvestigador/nuevo")}>
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
              {list.map((d) => (
                <Tarjeta<Docencia>
                  key={d.id}
                  item={d}
                  // Título: nombre del/la investigador/a
                  title={(x) => invNameById.get(x.investigadorId) ?? "—"}
                  // Subtítulo: denominación de cátedra
                  subtitle={(x) => x.denominacionCatedra || "—"}
                  titleClassName="text-xl md:text-2xl"
                  subtitleClassName="text-base md:text-lg"
                  onClick={() => navigate(`/docenciaInvestigador/${d.id}`)}
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