import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import {
  getActividadesDocencia,
  type ActividadDocencia,
} from "@/services/actividadDocenciaServices";

export default function DocenciaLanding() {
  const navigate = useNavigate();

  const { data: list = [], isLoading, isError } = useQuery({
    queryKey: ["docencia", "all"],
    queryFn: () => getActividadesDocencia(),
  });

  return (
    <section className="w-full min-h-[calc(100vh-96px)] px-10 md:px-5 lg:px-1 py-2 flex flex-col">

      <div className="flex items-center justify-between">
        <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">
          Actividades en Docencia
        </h2>

        <Button
          variant="primary"
          size="sm"
          className="px-3 py-1 text-xs"
          onClick={() => navigate("/docenciaInvestigador/nuevo")}
        >
          Agregar nuevo
        </Button>
      </div>

      <div className="mt-8 flex-1">
        {isLoading && <p>Cargando…</p>}
        {isError && <p>Error al cargar.</p>}

        {!isLoading && !isError && (
          list.length === 0 ? (
            <p>No hay registros.</p>
          ) : (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((d) => (
                <Tarjeta<ActividadDocencia>
                  key={d.id}
                  item={d}
                  title={(x) => x.curso}
                  subtitle={(x) => x.investigador}
                  onClick={() =>
                    navigate(`/docenciaInvestigador/${d.id}`)
                  }
                />
              ))}
            </div>
          )
        )}
      </div>

      <div className="pt-10">
        <Button
          variant="secondary"
          size="sm"
          className="px-3 py-1 text-xs"
          onClick={() => navigate(-1)}
        >
          Volver
        </Button>
      </div>
    </section>
  );
}
