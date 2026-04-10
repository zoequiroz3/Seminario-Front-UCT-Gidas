import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";
import {
  getActividadesDocencia,
  eliminarActividadDocencia,
  type ActividadDocencia,
} from "@/services/actividadDocenciaServices";
import { toTitleCase } from "@/utils/format";
import { useAuth } from "@/context/AuthContext";

const ITEMS_PER_PAGE = 9;

export default function DocenciaLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();

  const { canCreateRecords, canDeleteRecords } = useAuth();

  const puedeCrear = canCreateRecords();
  const puedeEliminar = canDeleteRecords();

  const [filtroActivos, setFiltroActivos] = useState<"true" | "false" | "all">(
    "true"
  );

  const { data: list = [], isLoading, isError } = useQuery({
    queryKey: ["docencia", "all", filtroActivos],
    queryFn: () => getActividadesDocencia(undefined, filtroActivos),
  });

  const docenciaFiltrada = list;

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(docenciaFiltrada.length / ITEMS_PER_PAGE);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return docenciaFiltrada.slice(start, start + ITEMS_PER_PAGE);
  }, [docenciaFiltrada, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filtroActivos]);

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
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);

  const toggleSelect = (id: number, checked: boolean) => {
    if (!puedeEliminar) return;

    const item = list.find((x) => x.id === id);

    if (item?.deleted_at) {
      setErrorMessage(
        "No se puede eliminar una actividad en docencia que ya fue eliminada."
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

  const selectedItems = list.filter((d) => selectedIds.includes(d.id));
  const selectedActiveItems = selectedItems.filter((d) => !d.deleted_at);

  const confirmDelete = async () => {
    if (!puedeEliminar) return;

    const invalidItems = selectedItems.filter((d) => d.deleted_at);

    if (invalidItems.length > 0) {
      setShowConfirm(false);
      setErrorMessage(
        invalidItems.length === 1
          ? "La actividad seleccionada ya fue eliminada."
          : "Una o más actividades seleccionadas ya fueron eliminadas."
      );
      setShowError(true);
      return;
    }

    try {
      for (const item of selectedActiveItems) {
        await eliminarActividadDocencia(item.id);
      }

      await qc.invalidateQueries({ queryKey: ["docencia"] });
      cancelSelection();

      setSuccessMessage(
        selectedActiveItems.length === 1
          ? "Actividad en docencia eliminada con éxito."
          : "Actividades en docencia eliminadas con éxito."
      );
      setShowSuccess(true);
    } catch {
      setShowConfirm(false);
      setErrorMessage(
        "Ocurrió un error inesperado al eliminar la actividad en docencia."
      );
      setShowError(true);
    }
  };

  return (
    <section className="w-full min-h-[calc(100vh-120px)] px-4 py-4 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">
            Actividades en Docencia
          </h2>

          {!isLoading && (
            <p className="text-sm text-slate-500 mt-1">
              Mostrando {docenciaFiltrada.length} resultados
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2 items-center justify-end">
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
                  onClick={() => navigate("/docenciaInvestigador/nuevo")}
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

      <div className="flex-1 flex flex-col">
        {isLoading && <p className="text-slate-500">Cargando…</p>}
        {isError && <p className="text-slate-500">Error al cargar.</p>}

        <div className="flex-1">
          {!isLoading && !isError && docenciaFiltrada.length === 0 ? (
            <p className="text-slate-500">No hay actividades registradas.</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedItems.map((d) => (
                <Tarjeta<ActividadDocencia>
                  key={d.id}
                  item={d}
                  title={(x) => toTitleCase(x.curso) || "—"}
                  subtitle={(x) => toTitleCase(x.investigador) || "—"}
                  badge={(x) => (x.deleted_at ? "ELIMINADA" : "ACTIVA")}
                  selectable={puedeEliminar && selectMode}
                  selectDisabled={!!d.deleted_at}
                  selected={selectedIds.includes(d.id)}
                  onSelectChange={(checked) => toggleSelect(d.id, checked)}
                  onClick={() =>
                    !selectMode && navigate(`/docenciaInvestigador/${d.id}`)
                  }
                />
              ))}
            </div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="mt-auto pt-8">
            <div className="flex justify-center items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                ←
              </Button>

              {[...Array(totalPages)].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === page
                        ? "bg-slate-800 text-white"
                        : "bg-slate-100 hover:bg-slate-200"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <Button
                size="sm"
                variant="secondary"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                →
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar actividades en docencia"
        message="¿Estás seguro de eliminar las siguientes actividades?"
        items={selectedActiveItems.map((d) => toTitleCase(d.curso) || "—")}
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