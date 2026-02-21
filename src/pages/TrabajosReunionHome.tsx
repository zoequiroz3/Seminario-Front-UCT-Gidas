import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useTrabajosReunion } from "@/hooks/useTrabajosReunion";
import { deleteTrabajoReunion } from "@/services/trabajosReunionServices";
import SuccessToast from "@/components/SuccessToast";

export default function TrabajosReunionLanding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { list, isLoading, isError } = useTrabajosReunion();

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
    .filter((t) => selectedIds.includes(t.id))
    .map((t) => t.titulo_trabajo);

  const confirmDelete = async () => {
    for (const id of selectedIds) {
      await deleteTrabajoReunion(id);
    }
    qc.invalidateQueries({ queryKey: ["trabajos-reunion"] });
    cancelSelection();
    setShowSuccess(true);
  };

  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 py-2 flex flex-col text-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          Trabajos presentados en Congresos
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
                navigate("/trabajos-reunion/nuevo")
              }
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
        {isError && <p className="text-red-600">Error al cargar.</p>}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((t) => (
            <Tarjeta
              key={t.id}
              item={t}
              title={(x) => x.titulo_trabajo}
              subtitle={(x) =>
                `${x.nombre_reunion} · ${x.fecha_inicio}`
              }
              selectable={selectMode}
              selected={selectedIds.includes(t.id)}
              onSelectChange={(checked) =>
                toggleSelect(t.id, checked)
              }
              onClick={() =>
                navigate(`/trabajos-reunion/${t.id}`)
              }
            />
          ))}
        </div>
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar trabajos"
        message="¿Eliminar los siguientes trabajos?"
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