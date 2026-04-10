import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";
import { HttpError } from "@/lib/http";
import { toTitleCase } from "@/utils/format";
import { useAuth } from "@/context/AuthContext";

import {
  getParticipaciones,
  eliminarParticipacion,
  type Participacion,
} from "@/services/participacionesServices";

export default function ParticipacionesHome() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const location = useLocation();
  const { canCreateRecords, canDeleteRecords } = useAuth();

  const puedeCrear = canCreateRecords();
  const puedeEliminar = canDeleteRecords();

  const [filtroActivos, setFiltroActivos] = useState<"true" | "false" | "all">(
    "true"
  );

  const { data: list = [], isLoading, isError } = useQuery({
    queryKey: ["participaciones", filtroActivos],
    queryFn: () =>
      getParticipaciones({
        activos: filtroActivos,
        orden: "asc",
      }),
  });

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
        "No se puede eliminar una participación que ya fue eliminada."
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

  const selectedItems = list.filter((p) => selectedIds.includes(p.id));
  const selectedActiveItems = selectedItems.filter((p) => !p.deleted_at);

  const confirmDelete = async () => {
    const invalidItems = selectedItems.filter((p) => p.deleted_at);

    if (invalidItems.length > 0) {
      setShowConfirm(false);
      setErrorMessage(
        invalidItems.length === 1
          ? "La participación seleccionada ya fue eliminada."
          : "Una o más participaciones seleccionadas ya fueron eliminadas."
      );
      setShowError(true);
      return;
    }

    try {
      for (const item of selectedActiveItems) {
        await eliminarParticipacion(item.id);
      }

      await qc.invalidateQueries({ queryKey: ["participaciones"] });

      cancelSelection();

      setSuccessMessage(
        selectedActiveItems.length === 1
          ? "Participación eliminada con éxito."
          : "Participaciones eliminadas con éxito."
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
            "No se pudo eliminar la participación."
        );
      } else {
        setErrorMessage(
          "Ocurrió un error inesperado al eliminar la participación."
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
            Participaciones Relevantes
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
                  onClick={() => navigate("/participaciones/nuevo")}
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
            No hay participaciones registradas.
          </p>
        )}

        {!isLoading && !isError && list.length > 0 && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p: Participacion) => (
              <Tarjeta<Participacion>
                key={p.id}
                item={p}
                title={(x) => toTitleCase(x.nombre_evento) || "—"}
                subtitle={(x) => toTitleCase(x.investigador) || "—"}
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
                selectDisabled={!!p.deleted_at}
                selected={selectedIds.includes(p.id)}
                onSelectChange={(checked) => toggleSelect(p.id, checked)}
                onClick={() =>
                  !selectMode && navigate(`/participaciones/${p.id}`)
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar participaciones"
        message="¿Eliminar las siguientes participaciones?"
        items={selectedActiveItems.map((p) => toTitleCase(p.nombre_evento))}
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
