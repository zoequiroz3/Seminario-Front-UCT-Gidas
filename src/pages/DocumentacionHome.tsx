import { data, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";

import { useDocumentacion } from "@/hooks/useDocumentacion";
import { deleteDocumentacion } from "@/services/documentacionServices";

const ITEMS_PER_PAGE = 9;

export default function DocumentacionLanding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const location = useLocation();

  const { list = [], isLoading, isError } = useDocumentacion();

  // =========================
  // FILTROS
  // =========================
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    editorial: "",
    anio: "",
  });

  const [tempFilters, setTempFilters] = useState(filters);

  const filtrosActivos = Object.values(filters).filter(Boolean).length;

  // 🔹 EDITORIALES DISPONIBLES
  const editorialesDisponibles = useMemo(() => {
    const editoriales = list
      .filter((d) => d.editorial)
      .map((d) => d.editorial.trim());

    return [...new Set(editoriales)].sort((a, b) =>
      a.localeCompare(b)
    );
  }, [list]);

  // 🔹 AÑOS DISPONIBLES
  const aniosDisponibles = useMemo(() => {
    const years = list
      .filter((d) => d.anio)
      .map((d) => d.anio);

    return [...new Set(years)].sort((a, b) => b - a);
  }, [list]);

  const documentacionFiltrada = useMemo(() => {
    return list.filter((d) => {
      const matchSearch =
        !filters.search ||
        d.titulo.toLowerCase().includes(filters.search.toLowerCase());

      const matchEditorial =
        !filters.editorial ||
        d.editorial === filters.editorial;

      const matchAnio =
        !filters.anio ||
        d.anio?.toString() === filters.anio;

      return matchSearch && matchEditorial && matchAnio;
    });
  }, [list, filters]);

  // =========================
  // PAGINADO
  // =========================
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(
    documentacionFiltrada.length / ITEMS_PER_PAGE
  );

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return documentacionFiltrada.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [documentacionFiltrada, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // =========================
  // SELECCIÓN
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
      await deleteDocumentacion(id);
    }
    qc.invalidateQueries({ queryKey: ["documentacion"] });
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
            Documentación
          </h2>
          {!isLoading && (
            <p className="text-sm text-slate-500 mt-1">
              Mostrando {documentacionFiltrada.length} de {list.length} resultados
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
            onClick={() => navigate("/documentacion/nuevo")}
          >
            Agregar nuevo
          </Button>
        </div>
      </div>

      {/* GRID */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((d) => (
              <Tarjeta
                key={d.id}
                item={d}
                title={(x) => x.titulo}
                subtitle={(x) =>
                  `${x.autores?.map((a) => a.nombre_apellido).join(", ") || "Sin autores"}`
                }
                selectable={selectMode}
                selected={selectedIds.includes(d.id)}
                onSelectChange={(checked) =>
                  toggleSelect(d.id, checked)
                }
                onClick={() =>
                  navigate(`/documentacion/${d.id}`)
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

      {/* DRAWER FILTROS */}
      {showFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setShowFilters(false)}
          />

          <div className="fixed top-0 right-0 h-full w-[380px] bg-white z-50 shadow-2xl p-6 flex flex-col">

            <h3 className="text-lg font-semibold mb-6">
              Filtros
            </h3>

            <div className="space-y-4 flex-1">

              {/* TÍTULO */}
              <div>
                <label className="text-xs text-slate-500">
                  Título
                </label>
                <input
                  className={`input mt-1 text-sm ${
                    tempFilters.search
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
                  placeholder="Buscar título..."
                  value={tempFilters.search}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      search: e.target.value,
                    })
                  }
                />
              </div>

              {/* EDITORIAL */}
              <div>
                <label className="text-xs text-slate-500">
                  Editorial
                </label>
                <select
                  className={`input mt-1 text-sm ${
                    tempFilters.editorial
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
                  value={tempFilters.editorial}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      editorial: e.target.value,
                    })
                  }
                >
                  <option value="">Todas</option>
                  {editorialesDisponibles.map((ed) => (
                    <option key={ed} value={ed}>
                      {ed}
                    </option>
                  ))}
                </select>
              </div>

              {/* AÑO */}
              <div>
                <label className="text-xs text-slate-500">
                  Año
                </label>
                <select
                  className={`input mt-1 text-sm ${
                    tempFilters.anio
                      ? "text-slate-900"
                      : "text-slate-400"
                  }`}
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
                    editorial: "",
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
        title="Eliminar documentación"
        message="¿Eliminar los siguientes registros?"
        items={list
          .filter((d) => selectedIds.includes(d.id))
          .map((d) => d.titulo)}
        onCancel={cancelSelection}
        onConfirm={confirmDelete}
      />

      <SuccessToast
        open={showSuccess}
        message={successMessage || "Eliminado con éxito!"}
        onClose={() => setShowSuccess(false)}
      />
    </section>
  );
}