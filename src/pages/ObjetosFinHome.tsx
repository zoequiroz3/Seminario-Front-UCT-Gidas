// src/pages/ObjetosLanding.tsx
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { getErogaciones, type Erogaciones } from "@/services/erogacionesServices";
import { getEquipamiento, type Equipamiento } from "@/services/equipamientoServices";
import Tarjeta from "@/components/Tarjeta"; // Asegurate que esta tarjeta tenga diseño

type Item =
  | (Erogaciones & { tipo: "Erogación" })
  | (Equipamiento & { tipo: "Equipamiento" });

function formatearFecha(fecha?: string) {
  if (!fecha) return "—";
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

export default function ObjetosLanding() {
  const navigate = useNavigate();

  const { data: erogaciones = [] } = useQuery({
    queryKey: ["erogaciones"],
    queryFn: getErogaciones,
    staleTime: 60_000,
  });

  const { data: equipamiento = [] } = useQuery({
    queryKey: ["equipamientos"],
    queryFn: getEquipamiento,
    staleTime: 60_000,
  });

  const items: Item[] = [
    ...erogaciones.map((e) => ({ ...e, tipo: "Erogación" as const })),
    ...equipamiento.map((f) => ({ ...f, tipo: "Equipamiento" as const })),
  ];

  return (
    <section className="w-full min-h-[calc(100vh-96px)] px-10 md:px-5 lg:px-1 py-2 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-[38px] md:text-[45px] font-semibold leading-none">
          Objetos y Financiamiento
        </h2>
      </div>

      {/* Tarjetas */}
      <div className="mt-6 flex-1">
        {items.length === 0 ? (
          <p className="text-slate-500">Aún no hay erogaciones ni equipamientos cargados.</p>
        ) : (
          <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <Tarjeta<Item>
                key={`${item.tipo}-${item.id}`}
                item={item}
                title={() =>
                  item.tipo === "Erogación"
                    ? `Erogación N° ${String(item.numeroErogacion).padStart(6, "0")}`
                    : item.denominacion
                }
                subtitle={() =>
                  item.tipo === "Erogación"
                    ? item.tipoErogacion
                    : formatearFecha(item.fechaIncorporacion)
                }
                titleClassName="text-xl md:text-2xl"
                subtitleClassName="text-base md:text-lg"
                onClick={() => {
                  const path =
                    item.tipo === "Erogación"
                      ? `/erogaciones/${item.id}`
                      : `/equipamiento/${item.id}`;
                  navigate(path);
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
