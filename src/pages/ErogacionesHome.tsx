import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useErogaciones } from "@/hooks/useErogaciones";
import { deleteErogaciones } from "@/services/erogacionesServices";
import SuccessToast from "@/components/SuccessToast";


export default function ErogacionesLanding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { list = [], isLoading, isError } = useErogaciones();

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
const [showSuccess, setShowSuccess] = useState(false);
  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };
const location = useLocation();
const [successMessage, setSuccessMessage] = useState("");

useEffect(() => {
  if (location.state?.successMessage) {
    setSuccessMessage(location.state.successMessage);
    setShowSuccess(true);
    window.history.replaceState({}, document.title);
  }
}, [location.state]);
  
  const cancelSelection = () => {
    setSelectMode(false);
    setSelectedIds([]);
    setShowConfirm(false);
  };

  const selectedItems = list
    .filter((e) => selectedIds.includes(e.id))
    .map(
      (e) =>
        `Erogación N° ${String(e.numero_erogacion).padStart(6, "0")} — ${
          e.tipo_erogacion?.nombre ?? "—"
        }`
    );


  const confirmDelete = async () => {
    for (const id of selectedIds) {
      await deleteErogaciones(id);
    }
    qc.invalidateQueries({ queryKey: ["erogaciones"] });
    cancelSelection();
    setShowSuccess(true);

  };

  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 md:px-3 lg:px-2 py-2 flex flex-col text-sm">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          Erogaciones
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
              onClick={() => navigate("/erogaciones/nuevo")}
            >
              Agregar nuevo
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button
                size="sm"
                className="px-3 py-1.5 text-xs"
                onClick={() => setShowConfirm(true)}
              >
                Eliminar
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              className="px-3 py-1.5 text-xs"
              onClick={cancelSelection}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1">
        {isLoading && <p className="text-slate-500">Cargando…</p>}
        {isError && <p className="text-red-600">Error al cargar.</p>}

        {!isLoading && !isError && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((e) => (
              <Tarjeta
                key={e.id}
                item={e}
                title={(x) =>
                  `Erogación N° ${String(x.numero_erogacion).padStart(6, "0")}`
                }
                subtitle={(x) => x.tipo_erogacion?.nombre || "—"}
                selectable={selectMode}
                selected={selectedIds.includes(e.id)}
                onSelectChange={(checked) =>
                  toggleSelect(e.id, checked)
                }
                onClick={() =>
                  navigate(`/erogaciones/${e.id}`)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={showConfirm}
        title="Eliminar erogaciones"
        message="¿Estás seguro de eliminar las siguientes erogaciones?"
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
