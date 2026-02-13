import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useEquipamiento } from "@/hooks/useEquipamiento";

export default function EquipamientoLanding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { list, isLoading, isError, remove } = useEquipamiento();

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
    .filter((e) => selectedIds.includes(e.id))
    .map((e) => e.denominacion);

  const confirmDelete = async () => {
    for (const id of selectedIds) {
      await remove(id);
    }
    qc.invalidateQueries({ queryKey: ["equipamiento"] });
    cancelSelection();
  };




  return (
    
    <section className="w-full min-h-[calc(100vh-80px)] px-4 py-2 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold">Equipamiento</h2>

        {!selectMode ? (
          <div className="flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => setSelectMode(true)}>
              Seleccionar
            </Button>
            <Button size="sm" onClick={() => navigate("/equipamiento/nuevo")}>
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

      {/* Grid */}
      <div className="flex-1">
        {isLoading && <p>Cargando…</p>}
        {isError && <p>Error al cargar.</p>}

        {!isLoading && !isError && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((e) => (
              <Tarjeta
                key={e.id}
                item={e}
                title={(x) => x.denominacion}
                subtitle={(x) => x.descripcion_breve}
                selectable={selectMode}
                selected={selectedIds.includes(e.id)}
                onSelectChange={(checked) => toggleSelect(e.id, checked)}
                onClick={() => navigate(`/equipamiento/${e.id}`)}
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar equipamiento"
        message="¿Estás seguro de eliminar los siguientes ítems?"
        items={selectedItems}
        onCancel={cancelSelection}
        onConfirm={confirmDelete}
      />
    </section>
  );
}
