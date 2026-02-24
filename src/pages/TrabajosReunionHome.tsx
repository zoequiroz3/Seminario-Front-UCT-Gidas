import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";

import { useTrabajosReunion } from "@/hooks/useTrabajosReunion";
import { useTiposReunion } from "@/hooks/useTiposReunion";
import { useInvestigadores } from "@/hooks/useInvestigadores";

import { deleteTrabajoReunion } from "@/services/trabajosReunionServices";

export default function TrabajosReunionLanding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const location = useLocation();

  const { list = [], isLoading, isError } = useTrabajosReunion();
  const { tipos = [] } = useTiposReunion();
  const { data: investigadores = [] } = useInvestigadores();

  // ==============================
  // 🎯 FILTROS
  // ==============================
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
        !filters.tipo ||
        t.tipo_reunion?.id === Number(filters.tipo);

      const matchProcedencia =
        !filters.procedencia ||
        t.procedencia
          ?.toLowerCase()
          .includes(filters.procedencia.toLowerCase());

      const matchInvestigador =
        !filters.investigador ||
        t.investigadores?.some(
          (i: any) =>
            i.id === Number(filters.investigador)
        );

      const matchAnio =
        !filters.anio ||
        new Date(t.fecha_inicio)
          .getFullYear() === Number(filters.anio);

      return (
        matchSearch &&
        matchTipo &&
        matchProcedencia &&
        matchInvestigador &&
        matchAnio
      );
    });
  }, [list, filters]);

  const limpiarFiltros = () => {
    setFilters({
      search: "",
      tipo: "",
      procedencia: "",
      investigador: "",
      anio: "",
    });
  };

  // ==============================
  // 🗑 SELECCIÓN Y ELIMINACIÓN
  // ==============================
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showSuccess, setShowSuccess] =
    useState(false);
  const [successMessage, setSuccessMessage] =
    useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(
        location.state.successMessage
      );
      setShowSuccess(true);
      window.history.replaceState(
        {},
        document.title
      );
    }
  }, [location.state]);

  const toggleSelect = (
    id: number,
    checked: boolean
  ) => {
    setSelectedIds((prev) =>
      checked
        ? [...prev, id]
        : prev.filter((x) => x !== id)
    );
  };

  const confirmDelete = async () => {
    for (const id of selectedIds) {
      await deleteTrabajoReunion(id);
    }

    qc.invalidateQueries({
      queryKey: ["trabajos-reunion"],
    });

    setSelectedIds([]);
    setSelectMode(false);
    setShowConfirm(false);

    setSuccessMessage(
      "Trabajos eliminados con éxito!"
    );
    setShowSuccess(true);
  };

  // ==============================
  // 🧩 RENDER
  // ==============================
  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 py-2 flex flex-col text-sm">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold">
          Trabajos presentados en Congresos
        </h2>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() =>
              setSelectMode(!selectMode)
            }
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
          </Button>

          <Button
            size="sm"
            onClick={() =>
              navigate(
                "/trabajos-reunion/nuevo"
              )
            }
          >
            Agregar nuevo
          </Button>
        </div>
      </div>

      {/* LISTADO */}
      <div className="flex-1">
        {isLoading && <p>Cargando…</p>}
        {isError && (
          <p className="text-red-600">
            Error al cargar.
          </p>
        )}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {trabajosFiltrados.map((t) => (
            <Tarjeta
              key={t.id}
              item={t}
              title={(x) =>
                x.titulo_trabajo
              }
              subtitle={(x) =>
                x.nombre_reunion
              }
              selectable={selectMode}
              selected={selectedIds.includes(
                t.id
              )}
              onSelectChange={(checked) =>
                toggleSelect(t.id, checked)
              }
              onClick={() =>
                navigate(
                  `/trabajos-reunion/${t.id}`
                )
              }
            />
          ))}
        </div>
      </div>

      {/* CONFIRM DELETE */}
      <ConfirmDialog
        open={showConfirm}
        title="Eliminar trabajos"
        message="¿Eliminar los siguientes trabajos?"
        items={list
          .filter((t) =>
            selectedIds.includes(t.id)
          )
          .map(
            (t) => t.titulo_trabajo
          )}
        onCancel={() =>
          setShowConfirm(false)
        }
        onConfirm={confirmDelete}
      />

      {/* TOAST */}
      <SuccessToast
        open={showSuccess}
        message={successMessage}
        onClose={() =>
          setShowSuccess(false)
        }
      />

      {/* ======================================
              DRAWER LATERAL DE FILTROS
      ====================================== */}
      {showFilters && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() =>
              setShowFilters(false)
            }
          />

          {/* Sidebar */}
          <div className="fixed top-0 right-0 h-full w-[380px] bg-white z-50 shadow-2xl p-6 flex flex-col">

            <h3 className="text-xl font-semibold mb-6">
              Filtros
            </h3>

            <div className="space-y-4 flex-1">

              {/* Buscar */}
              <div>
                <label className="text-xs text-slate-500">
                  Buscar
                </label>
                <input
                  className="input mt-1"
                  value={
                    tempFilters.search
                  }
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      search:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="text-xs text-slate-500">
                  Tipo de reunión
                </label>
                <select
                  className="input mt-1"
                  value={
                    tempFilters.tipo
                  }
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      tipo:
                        e.target.value,
                    })
                  }
                >
                  <option value="">
                    Todos
                  </option>
                  {tipos.map((t) => (
                    <option
                      key={t.id}
                      value={t.id}
                    >
                      {t.nombre}
                    </option>
                  ))}
                </select>
              </div>

              {/* Procedencia */}
              <div>
                <label className="text-xs text-slate-500">
                  Procedencia
                </label>
                <input
                  className="input mt-1"
                  value={
                    tempFilters.procedencia
                  }
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      procedencia:
                        e.target.value,
                    })
                  }
                />
              </div>

              {/* Investigador */}
              <div>
                <label className="text-xs text-slate-500">
                  Investigador
                </label>
                <select
                  className="input mt-1"
                  value={
                    tempFilters.investigador
                  }
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      investigador:
                        e.target.value,
                    })
                  }
                >
                  <option value="">
                    Todos
                  </option>
                  {investigadores.map(
                    (i: any) => (
                      <option
                        key={i.id}
                        value={i.id}
                      >
                        {
                          i.nombre_apellido
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* Año */}
              <div>
                <label className="text-xs text-slate-500">
                  Año
                </label>
                <input
                  type="number"
                  className="input mt-1"
                  value={
                    tempFilters.anio
                  }
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      anio:
                        e.target.value,
                    })
                  }
                />
              </div>
            </div>

            {/* BOTONES */}
            <div className="flex justify-between gap-2 pt-6 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setTempFilters({
                    search: "",
                    tipo: "",
                    procedencia:
                      "",
                    investigador:
                      "",
                    anio: "",
                  })
                }
              >
                Limpiar
              </Button>

              <Button
                size="sm"
                onClick={() => {
                  setFilters(
                    tempFilters
                  );
                  setShowFilters(
                    false
                  );
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