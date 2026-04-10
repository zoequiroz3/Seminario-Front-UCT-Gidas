import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";

import { useErogaciones } from "@/hooks/useErogaciones";
import { useTiposErogacion } from "@/hooks/useTipoErogacion";
import { useFuentesFinanciamiento } from "@/hooks/useFuenteFinanciamiento";
import { deleteErogaciones } from "@/services/erogacionesServices";
import { HttpError } from "@/lib/http";
import { useAuth } from "@/context/AuthContext";

const ITEMS_PER_PAGE = 9;

export default function ErogacionesLanding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const location = useLocation();
  const { canCreateRecords, canDeleteRecords } = useAuth();

  const puedeCrear = canCreateRecords();
  const puedeEliminar = canDeleteRecords();

  const [filtroActivos, setFiltroActivos] = useState<
    "true" | "false" | "all"
  >("true");

  const { list = [], isLoading, isError } = useErogaciones(filtroActivos);
  const { tipos } = useTiposErogacion();
  const { fuentes } = useFuentesFinanciamiento();

  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    tipoId: "",
    fuenteId: "",
    ingresosMin: "",
    egresosMin: "",
    anio: "",
  });

  const [tempFilters, setTempFilters] = useState(filters);

  const filtrosActivos = Object.values(filters).filter(Boolean).length;

  const aniosDisponibles = useMemo(() => {
    const years = list
      .filter((e) => e.fecha)
      .map((e) => new Date(e.fecha).getFullYear());

    return [...new Set(years)].sort((a, b) => b - a);
  }, [list]);

  const erogacionesFiltradas = useMemo(() => {
    return list.filter((e) => {
      const matchSearch =
        !filters.search ||
        String(e.numero_erogacion).includes(filters.search);

      const matchTipo =
        !filters.tipoId ||
        e.tipo_erogacion?.id?.toString() === filters.tipoId;

      const matchFuente =
        !filters.fuenteId ||
        e.fuente?.id?.toString() === filters.fuenteId;

      const matchIngresos =
        !filters.ingresosMin ||
        e.ingresos >= Number(filters.ingresosMin);

      const matchEgresos =
        !filters.egresosMin ||
        e.egresos >= Number(filters.egresosMin);

      const matchAnio =
        !filters.anio ||
        new Date(e.fecha).getFullYear().toString() === filters.anio;

      return (
        matchSearch &&
        matchTipo &&
        matchFuente &&
        matchIngresos &&
        matchEgresos &&
        matchAnio
      );
    });
  }, [list, filters]);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(
    erogacionesFiltradas.length / ITEMS_PER_PAGE
  );

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return erogacionesFiltradas.slice(start, start + ITEMS_PER_PAGE);
  }, [erogacionesFiltradas, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, filtroActivos]);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [showError, setShowError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const toggleSelect = (id: number, checked: boolean) => {
    if (!puedeEliminar) return;

    const erogacion = list.find((x) => x.id === id);

    if (erogacion?.deleted_at) {
      setErrorMessage("No se puede eliminar una erogación que ya fue eliminada.");
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

  const selectedItems = list.filter((e) => selectedIds.includes(e.id));
  const selectedActiveItems = selectedItems.filter((e) => !e.deleted_at);

  const confirmDelete = async () => {
    const invalidItems = selectedItems.filter((e) => e.deleted_at);

    if (invalidItems.length > 0) {
      setShowConfirm(false);
      setErrorMessage(
        invalidItems.length === 1
          ? "La erogación seleccionada ya fue eliminada."
          : "Una o más erogaciones seleccionadas ya fueron eliminadas."
      );
      setShowError(true);
      return;
    }

    try {
      for (const item of selectedActiveItems) {
        await deleteErogaciones(item.id);
      }

      await qc.invalidateQueries({ queryKey: ["erogaciones"] });
      cancelSelection();

      setSuccessMessage(
        selectedActiveItems.length === 1
          ? "Erogación eliminada con éxito."
          : "Erogaciones eliminadas con éxito."
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
            "No se pudo eliminar la erogación."
        );
      } else {
        setErrorMessage("Ocurrió un error inesperado al eliminar la erogación.");
      }

      setShowError(true);
    }
  };

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <section className="w-full min-h-[calc(100vh-120px)] px-4 py-4 flex flex-col">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">
            Resumen de Ingresos y Egresos
          </h2>
          {!isLoading && (
            <p className="text-sm text-slate-500 mt-1">
              Mostrando {erogacionesFiltradas.length} de {list.length} resultados
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
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setTempFilters(filters);
                  setShowFilters(true);
                }}
              >
                Filtros
                {filtrosActivos > 0 && (
                  <span className="ml-2 text-xs bg-slate-800 text-white rounded-full px-2 py-0.5">
                    {filtrosActivos}
                  </span>
                )}
              </Button>

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
                  onClick={() => navigate("/erogaciones/nuevo")}
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
        {isLoading && <p>Cargando…</p>}
        {isError && <p>Error al cargar.</p>}

        <div className="flex-1">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((e) => (
              <Tarjeta
                key={e.id}
                item={e}
                title={(x) =>
                  `Erogación N° ${String(x.numero_erogacion).padStart(6, "0")}`
                }
                subtitle={(x) => x.tipo_erogacion?.nombre || "—"}
                badge={(x) => (
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                      x.deleted_at
                        ? "bg-red-100 text-red-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {x.deleted_at ? "ELIMINADA" : "ACTIVA"}
                  </span>
                )}
                selectable={puedeEliminar && selectMode}
                selectDisabled={!!e.deleted_at}
                selected={selectedIds.includes(e.id)}
                onSelectChange={(checked) => toggleSelect(e.id, checked)}
                onClick={() =>
                  !selectMode && navigate(`/erogaciones/${e.id}`)
                }
              />
            ))}
          </div>
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

      {showFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowFilters(false)}
          />

          <div className="fixed top-0 right-0 h-full w-[380px] bg-white z-50 shadow-2xl p-6 flex flex-col">
            <h3 className="text-xl font-semibold mb-6">Filtros</h3>

            <div className="space-y-4 flex-1">
              <div>
                <label className="text-xs text-slate-500">Año</label>
                <select
                  className="input mt-1"
                  value={tempFilters.anio}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      anio: e.target.value,
                    })
                  }
                >
                  <option value="">Todos</option>
                  {aniosDisponibles.map((anio) => (
                    <option key={anio} value={anio}>
                      {anio}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500">
                  Número de erogación
                </label>
                <input
                  className="input mt-1"
                  value={tempFilters.search}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      search: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">Tipo</label>
                <select
                  className="input mt-1"
                  value={tempFilters.tipoId}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      tipoId: e.target.value,
                    })
                  }
                >
                  <option value="">Todos</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500">Fuente</label>
                <select
                  className="input mt-1"
                  value={tempFilters.fuenteId}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      fuenteId: e.target.value,
                    })
                  }
                >
                  <option value="">Todas</option>
                  {fuentes.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nombre}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500">
                  Ingresos mínimos
                </label>
                <input
                  type="number"
                  className="input mt-1"
                  value={tempFilters.ingresosMin}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      ingresosMin: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">
                  Egresos mínimos
                </label>
                <input
                  type="number"
                  className="input mt-1"
                  value={tempFilters.egresosMin}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      egresosMin: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-6 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setTempFilters({
                    search: "",
                    tipoId: "",
                    fuenteId: "",
                    ingresosMin: "",
                    egresosMin: "",
                    anio: "",
                  })
                }
              >
                Limpiar
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  setFilters(tempFilters);
                  setShowFilters(false);
                }}
              >
                Aplicar
              </Button>
            </div>
          </div>
        </>
      )}

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar erogaciones"
        message="¿Eliminar las siguientes erogaciones?"
        items={selectedActiveItems.map(
          (e) =>
            `Erogación N° ${String(e.numero_erogacion).padStart(6, "0")}`
        )}
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
