import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";
import { useArticulosDivulgacion } from "@/hooks/useArticulosDivulgacion";
import { deleteArticulo } from "@/services/articulosDivulgacionServices";

const formatFecha = (fecha?: string) => {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-AR");
};

export default function ArticulosDivulgacionLanding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { list = [], isLoading, isError } =
    useArticulosDivulgacion();

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] =
    useState<number[]>([]);
  const [showConfirm, setShowConfirm] =
    useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);
  const [successMessage, setSuccessMessage] =
    useState("");

  const location = useLocation();

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked
        ? [...prev, id]
        : prev.filter((x) => x !== id)
    );
  };

  const cancelSelection = () => {
    setSelectMode(false);
    setSelectedIds([]);
    setShowConfirm(false);
  };

  const selectedItems = list
    .filter((a) => selectedIds.includes(a.id))
    .map(
      (a) =>
        `${a.titulo} — ${formatFecha(
          a.fecha_publicacion
        )}`
    );

  const confirmDelete = async () => {
    for (const id of selectedIds) {
      await deleteArticulo(id);
    }

    qc.invalidateQueries({
      queryKey: ["articulos-divulgacion"],
    });

    cancelSelection();
    setShowSuccess(true);
  };

  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 md:px-3 lg:px-2 py-2 flex flex-col text-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          Artículos de Divulgación
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
              onClick={() =>
                navigate(
                  "/articulos-divulgacion/nuevo"
                )
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
        {isLoading && (
          <p className="text-slate-500">
            Cargando…
          </p>
        )}

        {isError && (
          <p className="text-red-600">
            Error al cargar.
          </p>
        )}

        {!isLoading && !isError && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a) => (
              <Tarjeta
                key={a.id}
                item={a}
                title={(x) => x.titulo}
                subtitle={(x) =>
                  formatFecha(
                    x.fecha_publicacion
                  )
                }
                selectable={selectMode}
                selected={selectedIds.includes(
                  a.id
                )}
                onSelectChange={(checked) =>
                  toggleSelect(a.id, checked)
                }
                onClick={() =>
                  navigate(
                    `/articulos-divulgacion/${a.id}`
                  )
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar artículos"
        message="¿Estás seguro de eliminar los siguientes artículos?"
        items={selectedItems}
        onCancel={cancelSelection}
        onConfirm={confirmDelete}
      />

      <SuccessToast
        open={showSuccess}
        message={
          successMessage ||
          "Artículo eliminado con éxito!"
        }
        onClose={() => setShowSuccess(false)}
      />
    </section>
  );
}