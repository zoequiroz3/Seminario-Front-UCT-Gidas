import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Button from "@/components/Button";
import ConfirmDialog from "@/components/ConfirmDialog";
import MockIndicator from "@/components/MockIndicator";
import SuccessToast from "@/components/SuccessToast";
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import {
    useTransferencia,
    useDeleteTransferencia,
} from "@/hooks/useTransferencias";

/** Convierte claves snake/camel a un label legible. */
const formatearLabel = (key: string) =>
    key
        .replace(/([A-Z])/g, " $1")   // camelCase → espacios
        .replace(/_/g, " ")           // snake_case → espacios
        .replace(/\b\w/g, (l) => l.toUpperCase());

/** Renderiza un valor de forma legible. */
const renderValue = (value: unknown): string => {
    if (value === null || value === undefined) return "—";

    if (Array.isArray(value)) {
        if (value.length === 0) return "—";
        return value
            .map((v) =>
                typeof v === "object" && v !== null
                    ? (v as Record<string, unknown>).nombre ??
                    (v as Record<string, unknown>).nombre_apellido ??
                    JSON.stringify(v)
                    : String(v)
            )
            .join(", ");
    }

    if (typeof value === "object") {
        const obj = value as Record<string, unknown>;
        return String(obj.nombre ?? obj.descripcion ?? JSON.stringify(obj));
    }

    if (typeof value === "number") {
        return value.toLocaleString("es-AR");
    }

    return String(value);
};

/** Claves que no se muestran en la grilla de detalle. */
const HIDDEN_KEYS = new Set([
    "id",
    "grupoUtnId",
    "tipoContratoId",
]);

export default function TransferenciasDetalle() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { id: idParam } = useParams<{ id: string }>();
    const numericId = idParam ? Number(idParam) : undefined;
    const { data: t, isLoading, isError } = useTransferencia(numericId);
    const deleteMut = useDeleteTransferencia();

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

    const doDelete = async () => {
        if (!numericId) return;
        await deleteMut.mutateAsync(numericId);
        // Remove active item query so it doesn't fetch on unmount/invalidate
        qc.removeQueries({ queryKey: ["transferencias", numericId] });
        qc.invalidateQueries({ queryKey: ["transferencias"] });
        navigate("/transferencias", { state: { successMessage: "Transferencia eliminada." } });
    };

    if (isLoading) return <p className="text-slate-500 p-4">Cargando…</p>;

    if (isError || !t)
        return (
            <div className="p-4">
                <p className="text-red-600 mb-4">No se encontró la transferencia.</p>
                <Button variant="secondary" size="sm" onClick={() => navigate(-1)}>
                    Volver
                </Button>
            </div>
        );

    const displayName = t.denominacion || t.descripcionActividad;

    return (
        <section className="flex flex-col gap-6">
            <MockIndicator />

            <h2 className="text-2xl md:text-3xl font-semibold leading-none">
                {displayName}
            </h2>

            <article className="rounded-2xl border border-slate-200 bg-white/80 p-6 shadow-sm">
                <div className="space-y-2 text-sm md:text-base text-slate-500">
                    {Object.entries(t)
                        .filter(([key]) => !HIDDEN_KEYS.has(key))
                        .map(([key, value]) => (
                            <p key={key}>
                                <span className="font-medium text-slate-700">
                                    {formatearLabel(key)}:
                                </span>{" "}
                                {renderValue(value)}
                            </p>
                        ))}
                </div>

                {/* Acciones */}
                <div className="mt-8 flex items-center justify-between">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="px-3 py-1 text-xs"
                        onClick={() => navigate(-1)}
                    >
                        Volver
                    </Button>

                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            className="px-3 py-1 text-xs"
                            onClick={() => navigate(`/transferencias/${numericId}/editar`)}
                        >
                            Editar
                        </Button>

                        <Button
                            variant="secondary"
                            size="sm"
                            className="px-3 py-1 text-xs"
                            onClick={() => setShowConfirm(true)}
                        >
                            Eliminar
                        </Button>
                    </div>
                </div>
            </article>

            {/* Confirm dialog */}
            <ConfirmDialog
                open={showConfirm}
                title="Eliminar transferencia"
                message={`¿Estás seguro de eliminar "${displayName}"?`}
                onCancel={() => setShowConfirm(false)}
                onConfirm={doDelete}
            />

            <SuccessToast
                open={showSuccess}
                message={successMessage || "Operación exitosa"}
                onClose={() => setShowSuccess(false)}
            />
        </section>
    );
}
