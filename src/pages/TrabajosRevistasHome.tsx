import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";

import { useTrabajosRevistas } from "@/hooks/useTrabajosRevistas";
import { deleteTrabajoRevista } from "@/services/trabajosRevistasServices";

export default function TrabajosRevistasLanding() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { list, isLoading, isError } =
    useTrabajosRevistas();

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<
    number[]
  >([]);
  const [showConfirm, setShowConfirm] =
    useState(false);

  const location = useLocation();
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
      await deleteTrabajoRevista(id);
    }

    qc.invalidateQueries({
      queryKey: ["trabajos-revistas"],
    });

    setSelectedIds([]);
    setSelectMode(false);
    setShowConfirm(false);
    setShowSuccess(true);
  };

  return (
    <section className="w-full px-4 py-2 flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold">
          Trabajos en Revistas
        </h2>

        {!selectMode ? (
          <div className="flex gap-2">
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
              size="sm"
              onClick={() =>
                navigate(
                  "/trabajos-revistas/nuevo"
                )
              }
            >
              Agregar nuevo
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
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
              onClick={() => {
                setSelectMode(false);
                setSelectedIds([]);
              }}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => (
          <Tarjeta
            key={t.id}
            item={t}
            title={(x) =>
              x.titulo_trabajo
            }
            subtitle={(x) =>
              x.nombre_revista
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
                `/trabajos-revistas/${t.id}`
              )
            }
          />
        ))}
      </div>

      <ConfirmDialog
        open={showConfirm}
        title="Eliminar trabajos"
        message="¿Eliminar los siguientes trabajos?"
        items={list
          .filter((t) =>
            selectedIds.includes(t.id)
          )
          .map((t) => t.titulo_trabajo)}
        onCancel={() =>
          setShowConfirm(false)
        }
        onConfirm={confirmDelete}
      />

      <SuccessToast
        open={showSuccess}
        message={
          successMessage ||
          "Eliminado con éxito!"
        }
        onClose={() =>
          setShowSuccess(false)
        }
      />
    </section>
  );
}