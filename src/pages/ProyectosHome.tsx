// src/pages/ProyectosLanding.tsx
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import {
  getProyectos,
  type Proyecto,
} from "@/services/proyectosServices";

function subtitleLine(p: Proyecto): string {
  const fmt = (s?: string) => {
    if (!s) return "—";
    const [y, m, d] = s.split("-");
    return `${d}/${m}/${y}`;
  };
  const ini = fmt(p.fechaInicio);
  const fin = fmt(p.fechaFinalizacion);
  return `Inicio: ${ini} · Fin: ${fin}`;
}

export default function ProyectosLanding() {
  const navigate = useNavigate();

  const { data: list = [], isLoading, isError } = useQuery({
    queryKey: ["proyectos"],
    queryFn: getProyectos,
    staleTime: 60_000,
  });

  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 md:px-3 lg:px-2 py-2 flex flex-col text-sm">
  {/* Header */}
  <div className="flex items-center justify-between mb-4">
    <h2 className="text-2xl md:text-3xl font-semibold leading-none">
      Proyectos
    </h2>

    <Button
      variant="primary"
      size="sm"
      className="px-3 py-1.5 text-xs"
      onClick={() => navigate("/proyectos/nuevo")}
    >
      Agregar nuevo
    </Button>

  </div>

  {/* Contenido */}
  <div className="mt-2 flex-1">
    {isLoading && <p className="text-slate-500 text-sm">Cargando…</p>}
    {isError && <p className="text-red-600 text-sm">No se pudo cargar la lista.</p>}

    {!isLoading && !isError && (
      list.length === 0 ? (
        <p className="text-slate-500 text-sm">Aún no hay registros.</p>
      ) : (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((p) => (
            <Tarjeta<Proyecto>
              key={p.id}
              item={p}
              title={(x) => x.nombreProyecto}
              subtitle={subtitleLine}
              titleClassName="text-lg"
              subtitleClassName="text-xs text-slate-600"
              onClick={() => navigate(`/proyectos/${p.id}`)}
            />
          ))}
        </div>
      )
    )}
  </div>

  {/* Footer */}
  <div className="pt-6">
    <Button
  type="button"
  variant="secondary"
  size="sm"
  className="px-3 py-1.5 text-xs"
  onClick={() => navigate(-1)}
>
  Volver
</Button>

  </div>
</section>

  );
}
