import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import { usePersonal } from "@/hooks/usePersonal";
import { eliminarPersonal } from "@/services/personalServices";
import type { PersonalType } from "@/services/personalServices";
import SuccessToast from "@/components/SuccessToast";

export default function PersonalLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const [sp] = useSearchParams();
  const tipo = sp.get("tipo") as PersonalType | null;

  const { list = [], isLoading, isError } = usePersonal(tipo ?? undefined);

  const [selectMode, setSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<
    { id: number; rol: string; nombre: string }[]
  >([]);
  const [showConfirm, setShowConfirm] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  // 🔥 LEE EL STATE DEL NAVIGATE (CREADO)
  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);

      // Limpia el state para que no reaparezca
      window.history.replaceState({}, document.title);
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
      await eliminarPersonal(item.id, item.rol);
    }

    qc.invalidateQueries({ queryKey: ["personal"] });

    setSuccessMessage("Eliminado con éxito!");
    setShowSuccess(true);

    cancelSelection();
  };

  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 py-2 flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold">
          Personal
        </h2>

        {!selectMode ? (
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setSelectMode(true)}
            >
              Seleccionar
            </Button>

            <Button
              size="sm"
              onClick={() => navigate("/personal/nuevo")}
            >
              Agregar nuevo
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {selectedItems.length > 0 && (
              <Button
                size="sm"
                onClick={() => setShowConfirm(true)}
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

      {/* Lista */}
      {isLoading && <p className="text-slate-500">Cargando…</p>}
      {isError && <p className="text-red-600">Error al cargar.</p>}

      {!isLoading && !isError && (
        list.length === 0 ? (
          <p className="text-slate-500">
            No hay personal.
          </p>
        ) : (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((p) => (
              <Tarjeta
                key={`${p.rol}-${p.id}`}
                item={p}
                title={(x) => x.nombre_apellido}
                subtitle={(x) =>
                  x.rol === "personal" ? "PTAA" :
                    x.rol === "becario" ? "Becario" :
                      x.rol === "investigador" ? "Investigador" :
                        x.rol === "profesional" ? "Profesional" : x.rol
                }
                selectable={selectMode}
                selected={
                  selectedItems.some(
                    (x) => x.id === p.id && x.rol === p.rol
                  )
                }
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
                  navigate(`/personal/${p.rol}/${p.id}`)
                }
              />
            ))}
          </div>
        )
      )}

      {/* Confirm dialog */}
      <ConfirmDialog
        open={showConfirm}
        title="Eliminar personal"
        message="¿Estás seguro de dar de baja los siguientes registros?"
        items={selectedItems.map((x) => x.nombre)}
        onCancel={cancelSelection}
        onConfirm={confirmDelete}
      />

      {/* Toast */}
      <SuccessToast
        open={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </section>
  );
}
