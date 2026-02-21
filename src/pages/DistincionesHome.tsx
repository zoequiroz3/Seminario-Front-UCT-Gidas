import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import {
  getDistinciones,
  eliminarDistincion,
  type Distincion,
} from "@/services/distincionesServices";

const formatDate = (dateStr: string) => {
  if (!dateStr) return "—";
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
};

export default function DistincionesHome() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: list = [], isLoading, isError } = useQuery({
    queryKey: ["distinciones", "all"],
    queryFn: () => getDistinciones(),
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
    .map((d) => d.descripcion);

  const confirmDelete = async () => {
    for (const id of selectedIds) {
      await eliminarDistincion(id);
    }

    qc.invalidateQueries({ queryKey: ["distinciones", "all"] });
    cancelSelection();
  };

  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 md:px-3 lg:px-2 py-2 flex flex-col text-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          Distinciones Recibidas
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
              onClick={() => navigate("/distinciones/nuevo")}
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
          <div className="text-center py-12">
            <p className="text-slate-500 mb-4">No hay distinciones registradas.</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate("/distinciones/nuevo")}
            >
              Agregar primera distinción
            </Button>
          </div>
        )}

        {!isLoading && !isError && list.length > 0 && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((d) => (
              <Tarjeta<Distincion>
                key={d.id}
                item={d}
                title={(x) => x.descripcion}
                subtitle={(x) => {
                  const fecha = formatDate(x.fecha);
                  const proyecto = x.proyecto?.nombre ? ` - ${x.proyecto.nombre}` : '';
                  return `${fecha}${proyecto}`;
                }}
                selectable={selectMode}
                selected={selectedIds.includes(d.id)}
                onSelectChange={(checked) =>
                  toggleSelect(d.id, checked)
                }
                onClick={() =>
                  !selectMode &&
                  navigate(`/distinciones/${d.id}`)
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar distinciones"
        message="¿Estás seguro de eliminar las siguientes distinciones?"
        items={selectedItems}
        onCancel={cancelSelection}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
