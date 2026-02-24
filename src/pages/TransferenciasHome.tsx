import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import Tarjeta from "@/components/Tarjeta";
import ConfirmDialog from "@/components/ConfirmDialog";
import MockIndicator from "@/components/MockIndicator";
import SuccessToast from "@/components/SuccessToast";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTransferencias } from "@/hooks/useTransferencias";
import { deleteTransferencia } from "@/services/transferenciasServices";

export default function TransferenciasHome() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { list = [], isLoading, isError } = useTransferencias();

    const [selectMode, setSelectMode] = useState(false);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [showConfirm, setShowConfirm] = useState(false);

    const location = useLocation();
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

    const cancelSelection = () => {
        setSelectMode(false);
        setSelectedIds([]);
        setShowConfirm(false);
    };

    const selectedItems = list
        .filter((t) => selectedIds.includes(t.id))
        .map((t) => t.denominacion || t.descripcionActividad);

    const confirmDelete = async () => {
        for (const id of selectedIds) {
            await deleteTransferencia(id);
        }
        qc.invalidateQueries({ queryKey: ["transferencias"] });
        cancelSelection();
        setShowSuccess(true);
    };

    return (
        <section className="w-full min-h-[calc(100vh-80px)] px-4 py-2 flex flex-col">
            <MockIndicator />

            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl md:text-3xl font-semibold">
                    Vinculación Socio-Productiva
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
                            onClick={() => navigate("/transferencias/nuevo")}
                        >
                            Agregar nuevo
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-2">
                        {selectedIds.length > 0 && (
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
                        No hay transferencias registradas.
                    </p>
                ) : (
                    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                        {list.map((t) => (
                            <Tarjeta
                                key={t.id}
                                item={t}
                                title={(x) => x.denominacion || x.descripcionActividad}
                                subtitle={(x) =>
                                    x.monto !== null && x.monto !== undefined
                                        ? `$${x.monto.toLocaleString("es-AR")}`
                                        : "Sin monto"
                                }
                                selectable={selectMode}
                                selected={selectedIds.includes(t.id)}
                                onSelectChange={(checked) => toggleSelect(t.id, checked)}
                                onClick={() =>
                                    !selectMode && navigate(`/transferencias/${t.id}`)
                                }
                            />
                        ))}
                    </div>
                )
            )}

            {/* Confirm dialog */}
            <ConfirmDialog
                open={showConfirm}
                title="Eliminar transferencias"
                message="¿Estás seguro de eliminar las siguientes transferencias?"
                items={selectedItems}
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
