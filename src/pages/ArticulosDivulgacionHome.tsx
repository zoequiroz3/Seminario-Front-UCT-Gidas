import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";
import { HttpError } from "@/lib/http";

import { useArticulosDivulgacion } from "@/hooks/useArticulosDivulgacion";
import type { ArticuloDivulgacion } from "@/services/articulosDivulgacionServices";
import { useAuth } from "@/context/AuthContext";

const formatDate = (dateStr?: string | null) => {
  if (!dateStr) return "—";

  const [y, m, d] = dateStr.split("-");
  if (!y || !m || !d) return dateStr;

  return `${d}/${m}/${y}`;
};

export default function ArticulosDivulgacionHome() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const location = useLocation();
  const { canCreateRecords, canDeleteRecords } = useAuth();

  const puedeCrear = canCreateRecords();
  const puedeEliminar = canDeleteRecords();

  const [filtroActivos, setFiltroActivos] = useState<"true" | "false" | "all">(
    "true"
  );

  const { list, isLoading, isError, remove } =
    useArticulosDivulgacion(filtroActivos);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showError, setShowError] = useState(false);
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

    const item = list.find((x) => x.id === id);

    if (item?.deleted_at) {
      setErrorMessage(
        "No se puede eliminar un artículo de divulgación que ya fue eliminado."
      );
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

  const selectedItems = list.filter((a) => selectedIds.includes(a.id));
  const selectedActiveItems = selectedItems.filter((a) => !a.deleted_at);

  const confirmDelete = async () => {
    const invalidItems = selectedItems.filter((a) => a.deleted_at);

    if (invalidItems.length > 0) {
      setShowConfirm(false);
      setErrorMessage(
        invalidItems.length === 1
          ? "El artículo seleccionado ya fue eliminado."
          : "Uno o más artículos seleccionados ya fueron eliminados."
      );
      setShowError(true);
      return;
    }

    try {
      for (const item of selectedActiveItems) {
        await remove(item.id);
      }

      await qc.invalidateQueries({ queryKey: ["articulos-divulgacion"] });

      cancelSelection();

      setSuccessMessage(
        selectedActiveItems.length === 1
          ? "Artículo de divulgación eliminado con éxito."
          : "Artículos de divulgación eliminados con éxito."
      );
      setShowSuccess(true);
    } catch (error) {
      setShowConfirm(false);

      if (error instanceof HttpError) {
        const body = error.body as
          | { message?: string; error?: string; detalle?: string }
          | undefined;

        setErrorMessage(
          body?.message ||
            body?.error ||
            body?.detalle ||
            "No se pudo eliminar el artículo de divulgación."
        );
      } else {
        setErrorMessage(
          "Ocurrió un error inesperado al eliminar el artículo de divulgación."
        );
      }

      setShowError(true);
    }
  };

  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 py-2 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">
            Artículos de Divulgación
          </h2>

          {!isLoading && (
            <p className="text-sm text-slate-500 mt-1">
              {list.length} resultados
            </p>
          )}
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
              Activos
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
              Todos
            </button>
          </div>

          {!selectMode ? (
            <>
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
                  onClick={() => navigate("/articulos-divulgacion/nuevo")}
                >
                  Agregar nuevo
                </Button>
              )}
            </>
          ) : (
            <>
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
            </>
          )}
        </div>
      </div>

      <div className="flex-1">
        {isLoading && <p className="text-slate-500">Cargando…</p>}
        {isError && <p className="text-slate-500">Error al cargar.</p>}

        {!isLoading && !isError && list.length === 0 && (
          <p className="text-slate-500 text-center py-12">
            No hay artículos de divulgación registrados.
          </p>
        )}

        {!isLoading && !isError && list.length > 0 && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((a: ArticuloDivulgacion) => (
              <Tarjeta<ArticuloDivulgacion>
                key={a.id}
                item={a}
                title={(x) => x.titulo || "—"}
                subtitle={(x) => formatDate(x.fecha_publicacion)}
                badge={(x) => (
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      x.deleted_at
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {x.deleted_at ? "ELIMINADO" : "ACTIVO"}
                  </span>
                )}
                selectable={puedeEliminar && selectMode}
                selectDisabled={!!a.deleted_at}
                selected={selectedIds.includes(a.id)}
                onSelectChange={(checked) => toggleSelect(a.id, checked)}
                onClick={() =>
                  !selectMode && navigate(`/articulos-divulgacion/${a.id}`)
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar artículos de divulgación"
        message="¿Eliminar los siguientes artículos?"
        items={selectedActiveItems.map((a) => a.titulo)}
        onCancel={cancelSelection}
        onConfirm={confirmDelete}
      />

      <SuccessToast
        open={showSuccess}
        message={successMessage}
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
