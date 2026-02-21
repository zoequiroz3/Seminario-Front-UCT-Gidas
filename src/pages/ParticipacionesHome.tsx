import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  getParticipaciones,
  eliminarParticipacion,
  type Participacion,
} from "@/services/participacionesServices";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

export default function ParticipacionesHome() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: list = [], isLoading, isError } = useQuery({
    queryKey: ["participaciones", "all"],
    queryFn: () => getParticipaciones(),
  });

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const cancelSelection = () => {
    setSelectMode(false);
    setSelectedIds([]);
    setShowConfirm(false);
  };

  const selectedItems = list
    .filter((d) => selectedIds.includes(d.id))
    .map((d) => d.nombre_evento);

  const confirmDelete = async () => {
    for (const id of selectedIds) {
      await eliminarParticipacion(id);
    }

    qc.invalidateQueries({ queryKey: ["participaciones", "all"] });
    cancelSelection();
  };

  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 md:px-3 lg:px-2 py-2 flex flex-col text-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          Participaciones Relevantes
        </h2>

        {!selectMode ? (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectMode(true)}
            >
              Seleccionar
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/participaciones/nuevo")}
            >
              Agregar nuevo
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button
                size="sm"
                onClick={() => setShowConfirm(true)}
              >
                Eliminar
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              onClick={cancelSelection}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1">
        {isLoading && <p>Cargando…</p>}
        {isError && <p>Error al cargar.</p>}

        {!isLoading && !isError && list.length === 0 && (
          <p className="text-slate-500 text-center py-12">No hay participaciones registradas.</p>
        )}

        {!isLoading && !isError && list.length > 0 && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <Tarjeta<Participacion>
                key={p.id}
                item={p}
                title={(x) => x.nombre_evento}
                subtitle={(x) => x.investigador || "—"}
                selectable={selectMode}
                selected={selectedIds.includes(p.id)}
                onSelectChange={(checked) =>
                  toggleSelect(p.id, checked)
                }
                onClick={() =>
                  !selectMode &&
                  navigate(`/participaciones/${p.id}`)
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar participaciones"
        message="¿Estás seguro de eliminar las siguientes participaciones?"
        items={selectedItems}
        onCancel={cancelSelection}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
