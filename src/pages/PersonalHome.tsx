import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useState, useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";
import { usePersonal } from "@/hooks/usePersonal";
import { eliminarPersonal } from "@/services/personalServices";
import type { PersonalType } from "@/services/personalServices";

const ITEMS_PER_PAGE = 9;

export default function PersonalLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const [sp] = useSearchParams();
  const tipo = sp.get("tipo") as PersonalType | null;

  const { list = [], isLoading, isError } = usePersonal(
    tipo ?? undefined
  );

  // =========================
  // 🎯 FILTROS
  // =========================
  const [showFilters, setShowFilters] = useState(false);

  const [filters, setFilters] = useState({
    activo: "",
    rol: "",
  });

  const [tempFilters, setTempFilters] =
    useState(filters);

  const filtrosActivos =
    Object.values(filters).filter(Boolean).length;

  const rolesDisponibles = useMemo(() => {
    const roles = list.map((p) => p.rol);
    return [...new Set(roles)];
  }, [list]);

  const personalFiltrado = useMemo(() => {
    return list.filter((p) => {
      const matchActivo =
      (filters.activo === "" && p.activo) ||   // 🔥 default = activos
      (filters.activo === "activos" && p.activo) ||
      (filters.activo === "inactivos" && !p.activo) ||
      (filters.activo === "todos");

      const matchRol =
        !filters.rol || p.rol === filters.rol;

      return matchActivo && matchRol;
    });
  }, [list, filters]);

  // =========================
  // 📄 PAGINADO
  // =========================
  const [currentPage, setCurrentPage] =
    useState(1);

  const totalPages = Math.ceil(
    personalFiltrado.length / ITEMS_PER_PAGE
  );

  const paginatedItems = useMemo(() => {
    const start =
      (currentPage - 1) * ITEMS_PER_PAGE;
    return personalFiltrado.slice(
      start,
      start + ITEMS_PER_PAGE
    );
  }, [personalFiltrado, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // =========================
  // 🗑 SELECCIÓN
  // =========================
  const [selectMode, setSelectMode] =
    useState(false);
  const [selectedItems, setSelectedItems] =
    useState<
      { id: number; rol: string; nombre: string }[]
    >([]);
  const [showConfirm, setShowConfirm] =
    useState(false);

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
    rol: string,
    nombre: string,
    checked: boolean
  ) => {
    setSelectedItems((prev) =>
      checked
        ? [...prev, { id, rol, nombre }]
        : prev.filter(
            (x) => !(x.id === id && x.rol === rol)
          )
    );
  };

  const cancelSelection = () => {
    setSelectMode(false);
    setSelectedItems([]);
    setShowConfirm(false);
  };

  const confirmDelete = async () => {
    for (const item of selectedItems) {
      await eliminarPersonal(
        item.id,
        item.rol
      );
    }

    qc.invalidateQueries({
      queryKey: ["personal"],
    });

    setSuccessMessage(
      "Eliminado con éxito!"
    );
    setShowSuccess(true);

    cancelSelection();
  };

  return (
    <section className="w-full min-h-[calc(100vh-120px)] px-4 py-4 flex flex-col">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold">
            Personal
          </h2>
          {!isLoading && (
            <p className="text-sm text-slate-500 mt-1">
              Mostrando {personalFiltrado.length} de{" "}
              {list.length} resultados
            </p>
          )}
        </div>

        {!selectMode ? (
          <div className="flex gap-2 items-center">
            <Button
              variant="secondary"
              size="sm"
              onClick={() =>
                setSelectMode(true)
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
              {filtrosActivos > 0 && (
                <span className="ml-2 text-xs bg-slate-800 text-white rounded-full px-2 py-0.5">
                  {filtrosActivos}
                </span>
              )}
            </Button>

            <Button
              size="sm"
              onClick={() =>
                navigate("/personal/nuevo")
              }
            >
              Agregar nuevo
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {selectedItems.length > 0 && (
              <Button
                size="sm"
                onClick={() =>
                  setShowConfirm(true)
                }
              >
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

      {/* CONTENIDO */}
      <div className="flex-1 flex flex-col">
        {isLoading && (
          <p className="text-slate-500">
            Cargando…
          </p>
        )}
        {isError && (
          <p className="text-red-600">
            Error al cargar.
          </p>
        )}

        <div className="flex-1">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {paginatedItems.map((p) => (
              <Tarjeta
                key={`${p.rol}-${p.id}`}
                item={p}
                title={(x) =>
                  x.nombre_apellido
                }
                subtitle={(x) => x.rol}
                selectable={selectMode}
                selected={selectedItems.some(
                  (x) =>
                    x.id === p.id &&
                    x.rol === p.rol
                )}
                onSelectChange={(checked) =>
                  toggleSelect(
                    p.id,
                    p.rol,
                    p.nombre_apellido,
                    checked
                  )
                }
                onClick={() =>
                  !selectMode &&
                  navigate(
                    `/personal/${p.rol}/${p.id}`
                  )
                }
              />
            ))}
          </div>
        </div>

        {/* PAGINACIÓN */}
        {totalPages > 1 && (
          <div className="mt-auto pt-8">
            <div className="flex justify-center items-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                disabled={
                  currentPage === 1
                }
                onClick={() =>
                  setCurrentPage((p) =>
                    p - 1
                  )
                }
              >
                ←
              </Button>

              {[...Array(totalPages)].map(
                (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() =>
                        setCurrentPage(page)
                      }
                      className={`px-3 py-1 rounded-lg text-sm ${
                        currentPage === page
                          ? "bg-slate-800 text-white"
                          : "bg-slate-100 hover:bg-slate-200"
                      }`}
                    >
                      {page}
                    </button>
                  );
                }
              )}

              <Button
                size="sm"
                variant="secondary"
                disabled={
                  currentPage === totalPages
                }
                onClick={() =>
                  setCurrentPage((p) =>
                    p + 1
                  )
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
        title="Eliminar personal"
        message="¿Estás seguro de dar de baja los siguientes registros?"
        items={selectedItems.map(
          (x) => x.nombre
        )}
        onCancel={cancelSelection}
        onConfirm={confirmDelete}
      />

      <SuccessToast
        open={showSuccess}
        message={successMessage}
        onClose={() =>
          setShowSuccess(false)
        }
      />

      {/* DRAWER FILTROS */}
      {showFilters && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() =>
              setShowFilters(false)
            }
          />

          <div className="fixed top-0 right-0 h-full w-[380px] bg-white z-50 shadow-2xl p-6 flex flex-col">
            <h3 className="text-xl font-semibold mb-6">
              Filtros
            </h3>

            <div className="space-y-4 flex-1">
              <div>
                <label className="text-xs text-slate-500">
                  Estado
                </label>
                <select
                  className="input mt-1"
                  value={tempFilters.activo}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      activo:
                        e.target.value,
                    })
                  }
                >
                  <option value="">
                    Activos (por defecto)
                  </option>
                  <option value="todos">
                    Todos
                  </option>
                  <option value="inactivos">
                    Inactivos
                  </option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-500">
                  Rol
                </label>
                <select
                  className="input mt-1"
                  value={tempFilters.rol}
                  onChange={(e) =>
                    setTempFilters({
                      ...tempFilters,
                      rol:
                        e.target.value,
                    })
                  }
                >
                  <option value="">
                    Todos
                  </option>
                  {rolesDisponibles.map(
                    (rol) => (
                      <option
                        key={rol}
                        value={rol}
                      >
                        {rol}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>

            <div className="flex justify-between gap-2 pt-6 border-t">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setTempFilters({
                    activo: "",
                    rol: "",
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