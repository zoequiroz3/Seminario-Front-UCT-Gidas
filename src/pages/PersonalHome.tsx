import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import { usePersonal } from "@/hooks/usePersonal";
import type { PersonalType } from "@/services/personalServices";

const tipoLabel = (tipo: PersonalType) => {
  switch (tipo) {
    case "INVESTIGADOR": return "Investigadores";
    case "BECARIO": return "Becarios";
    case "PTAA": return "Personal PTAA";
    case "PROFESIONAL": return "Personal Profesional";
    default: return "";
  }
};

export default function PersonalLanding() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();

  const tipo = sp.get("tipo") as PersonalType | null;

  const { list, isLoading, isError } = usePersonal(tipo ?? undefined);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const cancelSelection = () => {
    setSelectMode(false);
    setSelectedIds([]);
    setShowConfirm(false);
  };

  // 🔥 RUTA UNIFICADA
  const buildPath = (p: any) => {
    return `/personal/${p.rol}/${p.id}`;
  };

  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 py-2 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold">
          Personal{tipo ? ` — ${tipoLabel(tipo)}` : ""}
        </h2>

        {!selectMode ? (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              className="px-3 py-1.5 text-xs"
              onClick={() => setSelectMode(true)}
            >
              Seleccionar
            </Button>

            <Button
              variant="primary"
              size="sm"
              className="px-3 py-1.5 text-xs"
              onClick={() => navigate("/personal/nuevo")}
            >
              Agregar nuevo
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button size="sm" onClick={() => setShowConfirm(true)}>
                Eliminar
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={cancelSelection}>
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {isLoading && <p>Cargando…</p>}
      {isError && <p>Error al cargar personal</p>}

      {!isLoading && !isError && (
        list.length === 0 ? (
          <p className="text-slate-500">
            No hay personal{tipo ? " para este tipo" : ""}.
          </p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <Link key={`${p.rol}-${p.id}`} to={buildPath(p)}>
                <Tarjeta
                  item={p}
                  title={(x) => x.nombre_apellido}
                  subtitle={(x) => x.rol}
                />
              </Link>
            ))}
          </div>
        )
      )}
    </section>
  );
}
