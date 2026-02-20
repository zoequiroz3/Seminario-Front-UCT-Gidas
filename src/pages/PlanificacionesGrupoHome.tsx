import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import { usePlanificaciones } from "@/hooks/usePlanificacionesGrupo";
import { deletePlanificacion } from "@/services/planificacionGrupoServices";
import SuccessToast from "@/components/SuccessToast";

export default function PlanificacionGrupoLanding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { list = [], isLoading, isError } = usePlanificaciones();

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

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
    .filter((p) => selectedIds.includes(p.id))
    .map((p) => `Planificación ${p.anio}`);

  const confirmDelete = async () => {
    for (const id of selectedIds) {
      await deletePlanificacion(id);
    }
    qc.invalidateQueries({ queryKey: ["planificaciones"] });
    cancelSelection();
    setShowSuccess(true);
  };

  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 py-2 flex flex-col text-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          Planificaciones
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
              size="sm"
              onClick={() =>
                navigate("/planificaciones/nuevo")
              }
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
        {isLoading && <p className="text-slate-500">Cargando…</p>}
        {isError && (
          <p className="text-red-600">Error al cargar.</p>
        )}

        {!isLoading && !isError && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <Tarjeta
                key={p.id}
                item={p}
                title={(x) => `Planificación ${x.anio}`}
                
                selectable={selectMode}
                selected={selectedIds.includes(p.id)}
                onSelectChange={(checked) =>
                  toggleSelect(p.id, checked)
                }
                onClick={() =>
                  navigate(`/planificaciones/${p.id}`)
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar planificaciones"
        message="¿Estás seguro de eliminar las siguientes planificaciones?"
        items={selectedItems}
        onCancel={cancelSelection}
        onConfirm={confirmDelete}
      />

      <SuccessToast
        open={showSuccess}
        message={successMessage || "Eliminado con éxito!"}
        onClose={() => setShowSuccess(false)}
      />
    </section>
  );
}