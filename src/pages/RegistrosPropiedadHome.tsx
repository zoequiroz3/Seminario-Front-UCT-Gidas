import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";
import { useRegistrosPropiedad } from "@/hooks/useRegistrosPropiedad";
import { deleteRegistroPropiedad } from "@/services/registrosPropiedadServices";

export default function RegistrosPropiedadLanding() {
  const navigate = useNavigate();
  const location = useLocation();
  const qc = useQueryClient();
  const { list, isLoading, isError } = useRegistrosPropiedad();

  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccessMessage(location.state.successMessage);
      setShowSuccess(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const toggleSelect = (id: number, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const confirmDelete = async () => {
    for (const id of selectedIds) {
      await deleteRegistroPropiedad(id);
    }
    qc.invalidateQueries({ queryKey: ["registros-propiedad"] });
    setSelectMode(false);
    setSelectedIds([]);
    setShowConfirm(false);
    setShowSuccess(true);
    setSuccessMessage("Registro eliminado con éxito!");
  };

  return (
    <>
      <section className="w-full px-4 py-4 flex flex-col">
        <div className="flex justify-between mb-6">
          <h2 className="text-3xl font-semibold">
            Registros de Propiedad
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
                onClick={() => navigate("/registros-propiedad/nuevo")}
              >
                Agregar nuevo
              </Button>
            </div>
          ) : (
            <div className="flex gap-2">
              {selectedIds.length > 0 && (
                <Button size="sm" onClick={() => setShowConfirm(true)}>
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

        {isLoading && <p>Cargando…</p>}
        {isError && <p>Error al cargar.</p>}

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((r) => (
            <Tarjeta
              key={r.id}
              item={r}
              title={(x) => x.nombre_articulo}
              subtitle={(x) => x.tipo_registro}
              selectable={selectMode}
              selected={selectedIds.includes(r.id)}
              onSelectChange={(checked) =>
                toggleSelect(r.id, checked)
              }
              onClick={() =>
                navigate(`/registros-propiedad/${r.id}`)
              }
            />
          ))}
        </div>

        <ConfirmDialog
          open={showConfirm}
          title="Eliminar registro"
          message="¿Confirmar eliminación?"
          items={selectedIds.map((id) => `${list.find((r) => r.id === id)?.nombre_articulo}`)}
          onCancel={() => setShowConfirm(false)}
          onConfirm={confirmDelete}
        />
      </section>

      <SuccessToast
        open={showSuccess}
        message={successMessage}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
