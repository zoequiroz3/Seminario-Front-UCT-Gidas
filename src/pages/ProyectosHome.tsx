import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import SuccessToast from "@/components/SuccessToast";
import CerrarProyectoDialog from "@/components/CerrarProyectoDialog";

import { useProyectos } from "@/hooks/useProyectos";
import { upsertProyectos } from "@/services/proyectosServices";
import type { Proyecto } from "@/services/proyectosServices";
import { cerrarProyecto } from "@/services/proyectosServices";

export default function ProyectosLanding() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: list = [], isLoading, isError } = useProyectos();

  const [showSuccess, setShowSuccess] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showCerrarDialog, setShowCerrarDialog] = useState(false);

  const toggleSelect = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked ? [...prev, id] : prev.filter((x) => x !== id)
    );
  };

  const cancelSelection = () => {
    setSelectMode(false);
    setSelectedIds([]);
    setShowCerrarDialog(false);
  };

  /* =========================
     CONFIRMAR CIERRE
     ========================= */

  const confirmCerrar = async (fecha: Date) => {
  const fechaFormateada = fecha.toISOString().split("T")[0];

  for (const id of selectedIds) {
    await cerrarProyecto(id, fechaFormateada);
  }

  await qc.invalidateQueries({ queryKey: ["proyectos"] });

  cancelSelection();
  setShowCerrarDialog(false);
  setShowSuccess(true);
};


  return (
    <section className="w-full min-h-[calc(100vh-80px)] px-4 md:px-3 lg:px-2 py-2 flex flex-col text-sm">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl md:text-3xl font-semibold leading-none">
          Proyectos
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
              variant="primary"
              size="sm"
              onClick={() => navigate("/proyectos/nuevo")}
            >
              Agregar nuevo
            </Button>
          </div>
        ) : (
          <div className="flex gap-2">
            {selectedIds.length > 0 && (
              <Button
                size="sm"
                className="px-3 py-1.5 text-xs"
                onClick={() => setShowCerrarDialog(true)}
              >
                Cerrar proyectos
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              className="px-3 py-1.5 text-xs"
              onClick={cancelSelection}
            >
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="flex-1">
        {isLoading && <p className="text-slate-500">Cargando…</p>}
        {isError && <p className="text-red-600">Error al cargar.</p>}

        {!isLoading && !isError && (
          list.length === 0 ? (
            <p className="text-slate-500">
              Aún no hay proyectos registrados.
            </p>
          ) : (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => {
  const isCerrado = Boolean(p.fechaFinalizacion);

  return (
    <Tarjeta<Proyecto>
      key={p.id}
      item={p}
      title={(x) =>
        x.fechaFinalizacion
          ? `${x.nombreProyecto} (CERRADO)`
          : x.nombreProyecto
      }
      subtitle={(x) =>
        x.descripcionProyecto ?? "Sin descripción"
      }

      selectable={selectMode && !isCerrado}
      selected={selectedIds.includes(String(p.id))}

      onSelectChange={(checked) =>
        toggleSelect(String(p.id), checked)
      }

      onClick={() =>
        !selectMode && navigate(`/proyectos/${p.id}`)
      }
    />
  );
})}

            </div>
          )
        )}
      </div>

      {/* Dialog para elegir fecha */}
      <CerrarProyectoDialog
        open={showCerrarDialog}
        onCancel={() => setShowCerrarDialog(false)}
        onConfirm={confirmCerrar}
      />

      {/* Toast */}
      <SuccessToast
        open={showSuccess}
        message="Proyecto cerrado con éxito!"
        onClose={() => setShowSuccess(false)}
      />

    </section>
  );
}
