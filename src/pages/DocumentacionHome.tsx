import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import { useDocumentacion } from "@/hooks/useDocumentacion";
import { deleteDocumentacion } from "@/services/documentacionServices";
import SuccessToast from "@/components/SuccessToast";
import { HttpError } from "@/lib/http";
import { useAuth } from "@/context/AuthContext";

export default function DocumentacionHome() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { canCreateRecords, canDeleteRecords } = useAuth();

  const puedeCrear = canCreateRecords();
  const puedeEliminar = canDeleteRecords();

  const [filtroActivos, setFiltroActivos] = useState<
    "true" | "false" | "all"
  >("true");

  const { list = [], isLoading, isError } = useDocumentacion(filtroActivos);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const toggleSelect = (id: number, checked: boolean) => {
    if (!puedeEliminar) return;

    const documento = list.find((x) => x.id === id);

    if (documento?.deleted_at) {
      setErrorMessage("No se puede eliminar un documento que ya fue eliminado.");
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

  const selectedDocuments = list.filter((d) => selectedIds.includes(d.id));
  const selectedActiveDocuments = selectedDocuments.filter(
    (d) => !d.deleted_at
  );

  const selectedItems = selectedActiveDocuments.map((d) => d.titulo);

  const confirmDelete = async () => {
    const invalidItems = selectedDocuments.filter((d) => d.deleted_at);

    if (invalidItems.length > 0) {
      setShowConfirm(false);
      setErrorMessage(
        invalidItems.length === 1
          ? "El documento seleccionado ya fue eliminado."
          : "Uno o más documentos seleccionados ya fueron eliminados."
      );
      setShowError(true);
      return;
    }

    try {
      for (const item of selectedActiveDocuments) {
        await deleteDocumentacion(item.id);
      }

      await qc.invalidateQueries({ queryKey: ["documentacion"] });
      cancelSelection();

      setSuccessMessage(
        selectedActiveDocuments.length === 1
          ? "Documentación eliminada con éxito."
          : "Documentación eliminada con éxito."
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
            "No se pudo eliminar la documentación."
        );
      } else {
        setErrorMessage(
          "Ocurrió un error inesperado al eliminar la documentación."
        );
      }

      setShowError(true);
    }
  };

  const formatTitulo = (titulo: string) =>
    titulo
      .toLowerCase()
      .split(" ")
      .map((word) =>
        word ? word.charAt(0).toUpperCase() + word.slice(1) : ""
      )
      .join(" ");

  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 py-2 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold leading-none">
            Documentación
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
                  onClick={() => navigate("/documentacion/nuevo")}
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

      <div className="flex-1">
        {isLoading && <p className="text-slate-500">Cargando…</p>}
        {isError && <p className="text-red-600">Error al cargar.</p>}

        {!isLoading && !isError && (
          list.length === 0 ? (
            <p className="text-slate-500">
              No hay documentación registrada.
            </p>
          ) : (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((d) => (
                <Tarjeta
                  key={d.id}
                  item={d}
                  title={(x) => formatTitulo(x.titulo)}
                  subtitle={(x) => {
                    const autores = x.autores?.length
                      ? x.autores.map((a) => a.nombre_apellido).join(", ")
                      : "Sin autores";

                    const anio = x.anio ?? "—";

                    return `Autores: ${autores} · Año: ${anio}`;
                  }}
                  badge={(x) => (x.deleted_at ? "ELIMINADA" : "ACTIVA")}
                  selectable={puedeEliminar && selectMode}
                  selectDisabled={!!d.deleted_at}
                  selected={selectedIds.includes(d.id)}
                  onSelectChange={(checked) => toggleSelect(d.id, checked)}
                  onClick={() =>
                    !selectMode && navigate(`/documentacion/${d.id}`)
                  }
                />
              ))}
            </div>
          )
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar documentación"
        message="¿Estás seguro de eliminar los siguientes documentos?"
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
