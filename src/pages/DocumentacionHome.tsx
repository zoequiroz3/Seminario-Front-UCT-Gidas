import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";
import { useDocumentacion } from "@/hooks/useDocumentacion";
import { deleteDocumentacion } from "@/services/documentacionServices";

export default function DocumentacionLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const { list = [], isLoading, isError } = useDocumentacion();

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // 🔥 LEE EL STATE DEL NAVIGATE (CREADO)
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);

      // limpia el state
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

  const selectedDocs = list
    .filter((d) => selectedIds.includes(d.id))
    .map((d) => d.titulo);

  const confirmDelete = async () => {
    for (const id of selectedIds) {
      await deleteDocumentacion(id);
    }

    qc.invalidateQueries({ queryKey: ["documentacion"] });

    setSuccessMessage("Eliminado con éxito!");
    setShowSuccess(true);

    cancelSelection();
  };

  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 py-2 flex flex-col text-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold">
          Documentación
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
              onClick={() => navigate("/documentacion/nuevo")}
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

      {/* Grid */}
      <div className="flex-1">
        {isLoading && <p className="text-slate-500">Cargando…</p>}
        {isError && <p className="text-red-600">Error al cargar.</p>}

        {!isLoading && !isError && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((d) => (
              <Tarjeta
                key={d.id}
                item={d}
                title={(x) => x.titulo}
                subtitle={(x) => `Editorial: ${x.editorial ?? "—"}`}
                selectable={selectMode}
                selected={selectedIds.includes(d.id)}
                onSelectChange={(checked) =>
                  toggleSelect(d.id, checked)
                }
                onClick={() =>
                  !selectMode &&
                  navigate(`/documentacion/${d.id}`)
                }
              />
            ))}
          </div>
        )}
      </div>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={showConfirm}
        title="Eliminar documentación"
        message="¿Estás seguro de eliminar los siguientes documentos?"
        items={selectedDocs}
        onCancel={cancelSelection}
        onConfirm={confirmDelete}
      />

      {/* Toast */}
      <SuccessToast
        open={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </section>
  );
}
