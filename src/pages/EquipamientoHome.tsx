import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";
import { HttpError } from "@/lib/http";
import { useEquipamiento } from "@/hooks/useEquipamiento";
import { useAuth } from "@/context/AuthContext";

const ITEMS_PER_PAGE = 9;

export default function EquipamientoLanding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const location = useLocation();
  const { canCreateRecords, canDeleteRecords } = useAuth();

  const puedeCrear = canCreateRecords();
  const puedeEliminar = canDeleteRecords();

  const [filtroActivos, setFiltroActivos] = useState<
    "true" | "false" | "all"
  >("true");

  const { list = [], isLoading, isError, remove } =
    useEquipamiento(filtroActivos);

  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    montoMin: "",
    montoMax: "",
    anio: "",
  });

  const [tempFilters, setTempFilters] = useState(filters);

  const filtrosActivos = Object.values(filters).filter(Boolean).length;

  const aniosDisponibles = useMemo(() => {
    const years = list
      .filter((e) => e.fecha_incorporacion)
      .map((e) => new Date(e.fecha_incorporacion).getFullYear());

    return [...new Set(years)].sort((a, b) => b - a);
  }, [list]);

  const equipamientoFiltrado = useMemo(() => {
    return list.filter((e) => {
      const search = filters.search.toLowerCase().trim();

      const matchSearch =
        !search ||
        e.denominacion?.toLowerCase().includes(search) ||
        e.descripcion_breve?.toLowerCase().includes(search);

      const matchMontoMin =
        !filters.montoMin ||
        e.monto_invertido >= Number(filters.montoMin);

      const matchMontoMax =
        !filters.montoMax ||
        e.monto_invertido <= Number(filters.montoMax);

      const matchAnio =
        !filters.anio ||
        new Date(e.fecha_incorporacion).getFullYear().toString() ===
          filters.anio;

      return matchSearch && matchMontoMin && matchMontoMax && matchAnio;
    });
  }, [list, filters]);

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(
    equipamientoFiltrado.length / ITEMS_PER_PAGE
  );

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return equipamientoFiltrado.slice(start, start + ITEMS_PER_PAGE);
  }, [equipamientoFiltrado, currentPage]);

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

    const item = list.find((x) => x.id === id);

    if (item?.deleted_at) {
      setErrorMessage(
        "No se puede eliminar un equipamiento que ya fue eliminado."
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

  const selectedItems = list.filter((e) => selectedIds.includes(e.id));
  const selectedActiveItems = selectedItems.filter((e) => !e.deleted_at);

  const confirmDelete = async () => {
    const invalidItems = selectedItems.filter((e) => e.deleted_at);

    if (invalidItems.length > 0) {
      setShowConfirm(false);
      setErrorMessage(
        invalidItems.length === 1
          ? "El equipamiento seleccionado ya fue eliminado."
          : "Uno o más equipamientos seleccionados ya fueron eliminados."
      );
      setShowError(true);
      return;
    }

    try {
      for (const item of selectedActiveItems) {
        await remove(item.id);
      }

      await qc.invalidateQueries({ queryKey: ["equipamiento"] });
      cancelSelection();

      setSuccessMessage(
        selectedActiveItems.length === 1
          ? "Equipamiento eliminado con éxito."
          : "Equipamientos eliminados con éxito."
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
            "No se pudo eliminar el equipamiento."
        );
      } else {
        setErrorMessage(
          "Ocurrió un error inesperado al eliminar el equipamiento."
        );
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
            Equipamiento e Infraestructura
          </h2>
          {!isLoading && (
            <p className="text-sm text-slate-500 mt-1">
              Mostrando {equipamientoFiltrado.length} de {list.length} resultados
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
                  onClick={() => navigate("/equipamiento/nuevo")}
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
          {!isLoading && !isError && equipamientoFiltrado.length === 0 ? (
            <p className="text-slate-500">No hay equipamiento registrado.</p>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {paginatedItems.map((e) => (
              <Tarjeta
                key={e.id}
                item={e}
                title={(x) => x.denominacion}
                subtitle={(x) => x.descripcion_breve || "Sin descripción"}
                badge={(x) => (x.deleted_at ? "ELIMINADO" : "ACTIVO")}
                selectable={puedeEliminar && selectMode}
                selectDisabled={!!e.deleted_at}
                selected={selectedIds.includes(e.id)}
                onSelectChange={(checked) => toggleSelect(e.id, checked)}
                onClick={() =>
                  !selectMode && navigate(`/equipamiento/${e.id}`)
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
        title="Eliminar equipamiento"
        message="¿Eliminar los siguientes ítems?"
        items={selectedActiveItems.map((e) => e.denominacion)}
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
                <label className="text-xs text-slate-500">Buscar</label>
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
                <label className="text-xs text-slate-500">Monto mínimo</label>
                <input
                  type="number"
                  className="input mt-1"
                  value={tempFilters.montoMin}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      montoMin: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">Monto máximo</label>
                <input
                  type="number"
                  className="input mt-1"
                  value={tempFilters.montoMax}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      montoMax: e.target.value,
                    })
                  }
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">
                  Año de incorporación
                </label>
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
            </div>

            <div className="flex justify-between gap-2 pt-6 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setTempFilters({
                    search: "",
                    montoMin: "",
                    montoMax: "",
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
    </section>
  );
}
