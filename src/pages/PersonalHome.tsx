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
    <section className="flex flex-col gap-8">
      {/* Header: Título + Agregar */}
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-semibold">Personal</h2>
        <Button variant="primary" onClick={() => navigate("/personal/nuevo")}>
          Agregar Personal
        </Button>
      </div>

      {/* Contenido */}
      {isLoading && <p className="text-slate-500">Cargando…</p>}
      {isError && <p className="text-red-600">No se pudo cargar el personal.</p>}
      {!isLoading && !isError && (
        list.length === 0 ? (
          <p className="text-slate-500">Aún no hay personas cargadas.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

      {/* Footer: Volver */}
      <div className="pt-6">
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          Volver
        </Button>
      </div>
    </section>
  );
}
