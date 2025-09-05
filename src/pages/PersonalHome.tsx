import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import TarjetaPersonal from "@/components/Tarjeta";
import { getPersonal, type Personal } from "@/services/personalServices";

function roleLine(p: Personal): string {
  switch (p.tipo) {
    case "INVESTIGADOR": return "Investigador/a";
    case "PROFESIONAL":  return "Personal Profesional";
    case "PTAA":         return `Personal ${("tipoPersonal" in p && p.tipoPersonal) || "de Apoyo"}`;
    case "BECARIO":      return ("tipoFormacion" in p && p.tipoFormacion) === "Personal en Formación"
                            ? "Personal en Formación" : "Becario/a";
    default: return "";
  }
}

export default function PersonalLanding() {
  const navigate = useNavigate();

  const { data: list = [], isLoading, isError } = useQuery({
    queryKey: ["personal"],
    queryFn: getPersonal,
    staleTime: 60_000,
  });

  return (
    /**
     * Sin contenedor “estrecho”: px muy chicos para pegar a los bordes del
     * área de contenido (la sidebar queda afuera). Podés ajustar a px-1/px-3 si querés más/menos borde.
     */
    <section className="w-full min-h-[calc(100vh-96px)] px-10 md:px-5 lg:px-1 py-2 flex flex-col">
      {/* Header: título a la IZQ, botón a la DER (bien hacia los bordes del contenido) */}
      <div className="flex items-center justify-between">
        <h2 className="text-[38px] md:text-[50px] font-semibold leading-none">Personal</h2>
        <Button variant="primary" onClick={() => navigate("/personal/nuevo")}>
          Agregar Personal
        </Button>
      </div>

      {/* Contenido */}
      <div className="mt-8 flex-1">
        {isLoading && <p className="text-slate-500">Cargando…</p>}
        {isError && <p className="text-red-600">No se pudo cargar el personal.</p>}
        {!isLoading && !isError && (
          list.length === 0 ? (
            <p className="text-slate-500">Aún no hay personas cargadas.</p>
          ) : (
            <div
              className="
                grid gap-8
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
              "
            >
              {list.map((p) => (
                <TarjetaPersonal<Personal>
                  key={p.id}
                  item={p}
                  title={(x) => x.nombreApellido}
                  subtitle={roleLine}
                  onClick={() => navigate(`/personal/${p.id}`)}
                />
              ))}
            </div>
          )
        )}
      </div>

      {/* Footer: Volver bien abajo-izquierda del área de contenido */}
      <div className="pt-10">
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    </section>
  );
}
