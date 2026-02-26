import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";
import { useEquipamiento } from "@/hooks/useEquipamiento";

const ITEMS_PER_PAGE = 9;

export default function EquipamientoLanding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const location = useLocation();
  const { list = [], isLoading, isError, remove } = useEquipamiento();

  // =========================
  // 🎯 FILTROS
  // =========================
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
      .map((e) =>
        new Date(e.fecha_incorporacion).getFullYear()
      );
    return [...new Set(years)].sort((a, b) => b - a);
  }, [list]);

  const equipamientoFiltrado = useMemo(() => {
    return list.filter((e) => {
      const matchSearch =
        e.denominacion
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        e.descripcion_breve
          ?.toLowerCase()
          .includes(filters.search.toLowerCase());

      const matchMontoMin =
        !filters.montoMin ||
        e.monto_invertido >= Number(filters.montoMin);

      const matchMontoMax =
        !filters.montoMax ||
        e.monto_invertido <= Number(filters.montoMax);

      const matchAnio =
        !filters.anio ||
        new Date(e.fecha_incorporacion)
          .getFullYear()
          .toString() === filters.anio;

      return (
        matchSearch &&
        matchMontoMin &&
        matchMontoMax &&
        matchAnio
      );
    });
  }, [list, filters]);

  // =========================
  // 📄 PAGINADO
  // =========================
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(
    equipamientoFiltrado.length / ITEMS_PER_PAGE
  );

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return equipamientoFiltrado.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [equipamientoFiltrado, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // =========================
  // 🗑 SELECCIÓN
  // =========================
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

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

  const confirmDelete = async () => {
    for (const id of selectedIds) {
      await remove(id);
    }
    qc.invalidateQueries({ queryKey: ["equipamiento"] });
    cancelSelection();
    setShowSuccess(true);
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

      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
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

        <div className="flex gap-2 items-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setSelectMode(!selectMode)}
          >
            Seleccionar
          </Button>

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

          <Button
            size="sm"
            onClick={() => navigate("/equipamiento/nuevo")}
          >
            Agregar nuevo
          </Button>
        </div>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col">

        {isLoading && <p>Cargando…</p>}
        {isError && <p>Error al cargar.</p>}

        <div className="flex-1">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((e) => (
              <Tarjeta
                key={e.id}
                item={e}
                title={(x) => x.denominacion}
                subtitle={(x) => x.descripcion_breve}
                selectable={selectMode}
                selected={selectedIds.includes(e.id)}
                onSelectChange={(checked) =>
                  toggleSelect(e.id, checked)
                }
                onClick={() =>
                  navigate(`/equipamiento/${e.id}`)
                }
              />
            ))}
          </div>
        </div>

        {/* PAGINACIÓN FIJA ABAJO */}
        {totalPages > 1 && (
          <div className="mt-auto pt-8">
            <div className="flex justify-center items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={currentPage === 1}
                onClick={() =>
                  setCurrentPage((p) => p - 1)
                }
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
                onClick={() =>
                  setCurrentPage((p) => p + 1)
                }
              >
                →
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* CONFIRM */}
      <ConfirmDialog
        open={showConfirm}
        title="Eliminar equipamiento"
        message="¿Eliminar los siguientes ítems?"
        items={list
          .filter((e) => selectedIds.includes(e.id))
          .map((e) => e.denominacion)}
        onCancel={cancelSelection}
        onConfirm={confirmDelete}
      />

      <SuccessToast
        open={showSuccess}
        message={successMessage || "Eliminado con éxito!"}
        onClose={() => setShowSuccess(false)}
      />

      {/* DRAWER FILTROS */}
      {showFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowFilters(false)}
          />

          <div className="fixed top-0 right-0 h-full w-[380px] bg-white z-50 shadow-2xl p-6 flex flex-col">

            <h3 className="text-xl font-semibold mb-6">
              Filtros
            </h3>

            <div className="space-y-4 flex-1">

              <div>
                <label className="text-xs text-slate-500">
                  Buscar
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
                <label className="text-xs text-slate-500">
                  Monto mínimo
                </label>
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
                <label className="text-xs text-slate-500">
                  Monto máximo
                </label>
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