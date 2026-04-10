import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";
import { HttpError } from "@/lib/http";

import { useTrabajosReunion } from "@/hooks/useTrabajosReunion";
import { useTiposReunion } from "@/hooks/useTiposReunion";
import { useInvestigadores } from "@/hooks/useInvestigadores";

import {
  deleteTrabajoReunion,
  type TrabajoReunion,
} from "@/services/trabajosReunionServices";
import { useAuth } from "@/context/AuthContext";

const formatFecha = (fecha?: string | null) => {
  if (!fecha) return "—";

  const [y, m, d] = fecha.split("-");
  if (!y || !m || !d) return fecha;

  return `${d}/${m}/${y}`;
};

export default function TrabajosReunionLanding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const location = useLocation();
  const { canCreateRecords, canDeleteRecords } = useAuth();

  const puedeCrear = canCreateRecords();
  const puedeEliminar = canDeleteRecords();

  const [filtroActivos, setFiltroActivos] = useState<"true" | "false" | "all">(
    "true"
  );

  const { list = [], isLoading, isError } = useTrabajosReunion(
    filtroActivos,
    "asc"
  );
  const { tipos = [] } = useTiposReunion();
  const { data: investigadores = [] } = useInvestigadores();

  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    tipo: "",
    procedencia: "",
    investigador: "",
    anio: "",
  });

  const [tempFilters, setTempFilters] = useState(filters);

  const trabajosFiltrados = useMemo(() => {
    return list.filter((t) => {
      const matchSearch =
        t.titulo_trabajo
          ?.toLowerCase()
          .includes(filters.search.toLowerCase()) ||
        t.nombre_reunion
          ?.toLowerCase()
          .includes(filters.search.toLowerCase());

      const matchTipo =
        !filters.tipo || t.tipo_reunion?.id === Number(filters.tipo);

      const matchProcedencia =
        !filters.procedencia ||
        t.procedencia?.toLowerCase().includes(filters.procedencia.toLowerCase());

      const matchInvestigador =
        !filters.investigador ||
        t.investigadores?.some((i) => i.id === Number(filters.investigador));

      const matchAnio =
        !filters.anio ||
        new Date(t.fecha_inicio).getFullYear() === Number(filters.anio);

      return (
        matchSearch &&
        matchTipo &&
        matchProcedencia &&
        matchInvestigador &&
        matchAnio
      );
    });
  }, [list, filters]);

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

    const item = trabajosFiltrados.find((x) => x.id === id);

    if (item?.deleted_at) {
      setErrorMessage(
        "No se puede eliminar un trabajo presentado que ya fue eliminado."
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

  const selectedItems = trabajosFiltrados.filter((t) =>
    selectedIds.includes(t.id)
  );
  const selectedActiveItems = selectedItems.filter((t) => !t.deleted_at);

  const confirmDelete = async () => {
    const invalidItems = selectedItems.filter((t) => t.deleted_at);

    if (invalidItems.length > 0) {
      setShowConfirm(false);
      setErrorMessage(
        invalidItems.length === 1
          ? "El trabajo seleccionado ya fue eliminado."
          : "Uno o más trabajos seleccionados ya fueron eliminados."
      );
      setShowError(true);
      return;
    }

    try {
      for (const id of selectedActiveItems.map((t) => t.id)) {
        await deleteTrabajoReunion(id);
      }

      await qc.invalidateQueries({
        queryKey: ["trabajos-reunion"],
      });

      cancelSelection();

      setSuccessMessage(
        selectedActiveItems.length === 1
          ? "Trabajo eliminado con éxito."
          : "Trabajos eliminados con éxito."
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
            "No se pudo eliminar el trabajo presentado."
        );
      } else {
        setErrorMessage(
          "Ocurrió un error inesperado al eliminar el trabajo presentado."
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
            Trabajos presentados en Congresos
          </h2>

          {!isLoading && (
            <p className="text-sm text-slate-500 mt-1">
              {trabajosFiltrados.length} resultados
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

          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setTempFilters(filters);
              setShowFilters(true);
            }}
          >
            Filtros
          </Button>

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
                  onClick={() => navigate("/trabajos-reunion/nuevo")}
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

        {!isLoading && !isError && trabajosFiltrados.length === 0 && (
          <p className="text-slate-500 text-center py-12">
            No hay trabajos presentados registrados.
          </p>
        )}

        {!isLoading && !isError && trabajosFiltrados.length > 0 && (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {trabajosFiltrados.map((t: TrabajoReunion) => (
              <Tarjeta<TrabajoReunion>
                key={t.id}
                item={t}
                title={(x) => x.titulo_trabajo || "—"}
                subtitle={(x) =>
                  `${x.nombre_reunion || "—"} · ${formatFecha(x.fecha_inicio)}`
                }
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
                selectDisabled={!!t.deleted_at}
                selected={selectedIds.includes(t.id)}
                onSelectChange={(checked) => toggleSelect(t.id, checked)}
                onClick={() =>
                  !selectMode && navigate(`/trabajos-reunion/${t.id}`)
                }
              />
            ))}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar trabajos"
        message="¿Eliminar los siguientes trabajos?"
        items={selectedActiveItems.map((t) => t.titulo_trabajo)}
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
                  placeholder="Título o nombre del congreso"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">
                  Tipo de reunión
                </label>
                <select
                  className={`input mt-1 ${
                    !tempFilters.tipo ? "text-slate-400" : "text-slate-900"
                  }`}
                  value={tempFilters.tipo}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      tipo: e.target.value,
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
                <label className="text-xs text-slate-500">Procedencia</label>
                <input
                  className="input mt-1"
                  value={tempFilters.procedencia}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      procedencia: e.target.value,
                    })
                  }
                  placeholder="Ej: Argentina"
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">Investigador</label>
                <select
                  className={`input mt-1 ${
                    !tempFilters.investigador
                      ? "text-slate-400"
                      : "text-slate-900"
                  }`}
                  value={tempFilters.investigador}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      investigador: e.target.value,
                    })
                  }
                >
                  <option value="">Todos</option>
                  {investigadores.map((i: any) => (
                    <option key={i.id} value={i.id}>
                      {i.nombre_apellido}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500">Año</label>
                <input
                  type="number"
                  className="input mt-1"
                  value={tempFilters.anio}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      anio: e.target.value,
                    })
                  }
                  placeholder="Ej: 2025"
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
                    tipo: "",
                    procedencia: "",
                    investigador: "",
                    anio: "",
                  })
                }
              >
                Limpiar
              </Button>

              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setFilters({
                      search: "",
                      tipo: "",
                      procedencia: "",
                      investigador: "",
                      anio: "",
                    });
                    setTempFilters({
                      search: "",
                      tipo: "",
                      procedencia: "",
                      investigador: "",
                      anio: "",
                    });
                    setShowFilters(false);
                  }}
                >
                  Resetear
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
          </div>
        </>
      )}
    </section>
  );
}
