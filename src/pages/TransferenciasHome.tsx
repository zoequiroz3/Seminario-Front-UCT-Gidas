import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import MockIndicator from "@/components/MockIndicator";
import SuccessToast from "@/components/SuccessToast";
import { HttpError } from "@/lib/http";
import { useTransferencias } from "@/hooks/useTransferencias";
import { deleteTransferencia } from "@/services/transferenciasServices";
import { useAuth } from "@/context/AuthContext";

export default function TransferenciasHome() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { canCreateRecords, canDeleteRecords } = useAuth();

  const puedeCrear = canCreateRecords();
  const puedeEliminar = canDeleteRecords();

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const location = useLocation();
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [filtroActivos, setFiltroActivos] = useState<"true" | "false" | "all">("true");
  const { list = [], isLoading, isError } = useTransferencias(filtroActivos);

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const isTransferenciaDeleted = (t: any) => t.activo === false || !!t.deletedAt;

  const toggleSelect = (id: number, checked: boolean) => {
    if (!puedeEliminar) return;

    const transferencia = list.find((x) => x.id === id);

    if (transferencia && isTransferenciaDeleted(transferencia)) {
      setErrorMessage("No se puede eliminar una transferencia que ya fue eliminada.");
      setShowError(true);
      return;
    }

    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const cancelSelection = () => {
    setSelectMode(false);
    setSelectedIds([]);
    setShowConfirm(false);
  };

  const selectedTransfers = list.filter((t) => selectedIds.includes(t.id));
  const selectedActiveTransfers = selectedTransfers.filter(
    (t) => !isTransferenciaDeleted(t)
  );

  const selectedItems = selectedActiveTransfers.map(
    (t) => t.denominacion || t.descripcionActividad
  );

  const confirmDelete = async () => {
    const invalidItems = selectedTransfers.filter((t) =>
      isTransferenciaDeleted(t)
    );

    if (invalidItems.length > 0) {
      setShowConfirm(false);
      setErrorMessage(
        invalidItems.length === 1
          ? "La transferencia seleccionada ya fue eliminada."
          : "Una o más transferencias seleccionadas ya fueron eliminadas."
      );
      setShowError(true);
      return;
    }

    try {
      for (const item of selectedActiveTransfers) {
        await deleteTransferencia(item.id);
      }

      await qc.invalidateQueries({ queryKey: ["transferencias"] });
      cancelSelection();

      setSuccessMessage(
        selectedActiveTransfers.length === 1
          ? "Transferencia eliminada con éxito."
          : "Transferencias eliminadas con éxito."
      );
      setShowSuccess(true);
    } catch (error) {
      setShowConfirm(false);

      if (error instanceof HttpError) {
        const body = error.body as
          | {
              message?: string;
              error?: string;
              detalle?: string;
            }
          | undefined;

        setErrorMessage(
          body?.message ||
            body?.error ||
            body?.detalle ||
            "No se pudo eliminar la transferencia."
        );
      } else {
        setErrorMessage(
          "Ocurrió un error inesperado al eliminar la transferencia."
        );
      }

      setShowError(true);
    }
  };

  const formatTitle = (value?: string) =>
    value
      ?.toLowerCase()
      .split(" ")
      .map((word) =>
        word ? word.charAt(0).toUpperCase() + word.slice(1) : ""
      )
      .join(" ") || "";

  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 py-2 flex flex-col">
      <MockIndicator />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">
            Vinculación Socio-Productiva
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            {list.length} resultados
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <div className="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden">
            <button
              type="button"
              onClick={() => setFiltroActivos("true")}
              className={`px-3 py-1.5 text-xs transition-colors ${
                filtroActivos === "true"
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Activas
            </button>

            <button
              type="button"
              onClick={() => setFiltroActivos("all")}
              className={`px-3 py-1.5 text-xs border-l border-slate-200 transition-colors ${
                filtroActivos === "all"
                  ? "bg-slate-800 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              Todas
            </button>
          </div>

          {!selectMode ? (
            <div className="flex gap-2">
              {puedeEliminar && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setSelectMode(true)}
                >
                  Seleccionar
                </Button>
              )}

              {puedeCrear && (
                <Button
                  size="sm"
                  onClick={() => navigate("/transferencias/nuevo")}
                >
                  Agregar nuevo
                </Button>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              {selectedIds.length > 0 && puedeEliminar && (
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
      </div>

      {isLoading && <p className="text-slate-500">Cargando…</p>}
      {isError && <p className="text-red-600">Error al cargar.</p>}

      {!isLoading && !isError && (
        list.length === 0 ? (
          <p className="text-slate-500">
            No hay transferencias registradas.
          </p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((t) => (
              <Tarjeta
                key={t.id}
                item={t}
                title={(x) =>
                  formatTitle(x.denominacion) ||
                  formatTitle(x.descripcionActividad)
                }
                subtitle={(x) =>
                  x.monto !== null && x.monto !== undefined
                    ? `$${x.monto.toLocaleString("es-AR")}`
                    : "Sin monto"
                }
                badge={(x) => (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      isTransferenciaDeleted(x)
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {isTransferenciaDeleted(x) ? "ELIMINADA" : "ACTIVA"}
                  </span>
                )}
                selectable={puedeEliminar && selectMode}
                selectDisabled={isTransferenciaDeleted(t)}
                selected={selectedIds.includes(t.id)}
                onSelectChange={(checked) => toggleSelect(t.id, checked)}
                onClick={() =>
                  !selectMode && navigate(`/transferencias/${t.id}`)
                }
              />
            ))}
          </div>
        )
      )}

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar transferencias"
        message="¿Estás seguro de eliminar las siguientes transferencias?"
        items={selectedItems}
        onCancel={cancelSelection}
        onConfirm={confirmDelete}
      />

      <SuccessToast
        open={showSuccess}
        message={successMessage || "Eliminado con éxito!"}
        onClose={() => setShowSuccess(false)}
      />

      <SuccessToast
        open={showError}
        message={errorMessage}
        onClose={() => setShowError(false)}
      />
    </section>
  );
}
