// pages/PersonalLanding.tsx
import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "@/components/Button";
import TarjetaPersonal from "@/components/Tarjeta";
import { usePersonal } from "@/hooks/usePersonal";
import type { Personal, PersonalType } from "@/services/personalServices";

function roleLine(p: Pick<Personal, "tipo">): string {
  switch (p.tipo) {
    case "INVESTIGADOR": return "Investigador/a";
    case "PROFESIONAL":  return "Personal Profesional";
    case "PTAA":         return "Administrativo/Técnico/Apoyo";
    case "BECARIO":      return "Becario/a";
  }
}

export default function PersonalLanding({ presetTipo }: { presetTipo?: PersonalType }) {
  const navigate = useNavigate();
  const [sp, setSp] = useSearchParams();

  // lee ?tipo=INVESTIGADOR | PROFESIONAL | PTAA | BECARIO
  const tipo = (sp.get("tipo") as PersonalType) || presetTipo || undefined;

  const { list, isLoading, isError } = usePersonal(tipo);

  // helper opcional para cambiar filtro desde esta misma página
  const setTipo = (t?: PersonalType) => {
    if (!t) {
      sp.delete("tipo");
      setSp(sp, { replace: true });
    } else {
      setSp({ tipo: t }, { replace: true });
    }
  };

  return (
    <section className="w-full min-h-[calc(100vh-96px)] px-10 md:px-5 lg:px-1 py-2 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">
          Personal{tipo ? ` — ${roleLine({ tipo } as any)}` : ""}
        </h2>
        <Button variant="primary" onClick={() => navigate("/personal/nuevo")}>
          Agregar Personal
        </Button>
      </div>

      {/* Chips de filtro (opcionales; podés quitarlos si no los necesitás) */}
      <div className="mt-4 flex flex-wrap gap-2">
        <Chip active={!tipo} onClick={() => setTipo(undefined)}>Todos</Chip>
        <Chip active={tipo === "INVESTIGADOR"} onClick={() => setTipo("INVESTIGADOR")}>Investigadores</Chip>
        <Chip active={tipo === "PROFESIONAL"} onClick={() => setTipo("PROFESIONAL")}>Profesionales</Chip>
        <Chip active={tipo === "PTAA"} onClick={() => setTipo("PTAA")}>PTAA</Chip>
        <Chip active={tipo === "BECARIO"} onClick={() => setTipo("BECARIO")}>Becarios</Chip>
      </div>

      {/* Contenido */}
      <div className="mt-6 flex-1">
        {isLoading && <p className="text-slate-500">Cargando…</p>}
        {isError && <p className="text-red-600">No se pudo cargar el personal.</p>}
        {!isLoading && !isError && (
          list.length === 0 ? (
            <p className="text-slate-500">Aún no hay personal{tipo ? " para este tipo" : ""}.</p>
          ) : (
            <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => (
                <TarjetaPersonal<Personal>
                  key={p.id}
                  item={p}
                  title={(x) => x.nombreApellido}
                  subtitle={roleLine}
                  titleClassName="text-xl md:text-2xl"
                  subtitleClassName="text-base md:text-lg"
                  onClick={() => navigate(`/personal/${p.id}`)}
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

/** Chip minimalista */
function Chip({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded-full border transition
        ${active ? "bg-black text-white border-black" : "bg-white text-black border-black/20 hover:bg-black/5"}`}
    >
      {children}
    </button>
  );
}
