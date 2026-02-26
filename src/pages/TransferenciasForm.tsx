import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import Button from "@/components/Button";
import DatePicker from "@/components/Calendar";
import Field from "@/components/Field";
import AdoptanteSelector from "@/components/AdoptanteSelector";
import {
    createTransferencia,
    getTransferenciaById,
    updateTransferencia,
    addAdoptantesToTransferencia,
    removeAdoptantesFromTransferencia,
    type TransferenciaPayload,
} from "@/services/transferenciasServices";
import { useTiposContrato } from "@/hooks/useTransferencias";
import type { Adoptante } from "@/services/adoptantesServices";

// ── Helpers fechas (reutilizados de ProyectosForm) ──

const parseYMD = (s?: string | null): Date | null => {
    if (!s) return null;
    const [y, m, d] = s.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
};

const toYMD = (date: Date | null): string => {
    if (!date) return "";
    return date.toISOString().split("T")[0];
};

// ── Componente ──

export default function TransferenciasForm() {
    const navigate = useNavigate();
    const qc = useQueryClient();
    const { id: idParam } = useParams<{ id: string }>();
    const numericId = idParam ? Number(idParam) : undefined;
    const isEdit = !!numericId;
    const { uct, uctGuard } = useUctGuard();
    const { tipos: tiposContrato, isLoading: loadingTipos } = useTiposContrato();

    // ── Form state ──
    const [data, setData] = useState({
        descripcionActividad: "",
        tipoContratoId: "",
        demandante: "",
        monto: "",
        fechaInicio: "",
        fechaFin: "",
        denominacion: "",
        numeroTransferencia: "",
    });

    const [submitError, setSubmitError] = useState<string | null>(null);
    const [adoptantes, setAdoptantes] = useState<Adoptante[]>([]);
    const [originalAdoptantes, setOriginalAdoptantes] = useState<Adoptante[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ── Cargar datos si edición ──
    const { data: existing, isLoading: loadingExisting } = useQuery({
        queryKey: ["transferencias", numericId],
        queryFn: () => getTransferenciaById(numericId!),
        enabled: isEdit,
    });

    useEffect(() => {
        if (existing) {
            const matchingTipo = tiposContrato.find(
                (t) => t.nombre === existing.tipoContrato
            );

            setData({
                descripcionActividad: existing.descripcionActividad ?? "",
                tipoContratoId: existing.tipoContratoId?.toString()
                    ?? matchingTipo?.id?.toString()
                    ?? "",
                demandante: existing.demandante ?? "",
                monto:
                    existing.monto !== null && existing.monto !== undefined
                        ? String(existing.monto)
                        : "",
                fechaInicio: existing.fechaInicio ?? "",
                fechaFin: existing.fechaFin ?? "",
                denominacion: existing.denominacion ?? "",
                numeroTransferencia: existing.numeroTransferencia?.toString() ?? "",
            });
            setAdoptantes(existing.adoptantes ?? []);
            setOriginalAdoptantes(existing.adoptantes ?? []);
        }
    }, [existing, tiposContrato]);

    // ── Helpers ──
    const change = (k: keyof typeof data) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setData((d) => ({ ...d, [k]: e.target.value }));
            clearError(k);
        };

    const setFecha = (k: "fechaInicio" | "fechaFin") => (dt: Date | null) => {
        setData((d) => ({ ...d, [k]: toYMD(dt) }));
        clearError(k);
    };

    const clearError = (field: string) => {
        setErrors((prev) => {
            const copy = { ...prev };
            delete copy[field];
            return copy;
        });
    };

    // ── Validación ──
    const validate = () => {
        const e: Record<string, string> = {};

        if (!data.descripcionActividad.trim())
            e.descripcionActividad = "Debe ingresar una descripción de la actividad";

        if (!data.tipoContratoId)
            e.tipoContratoId = "Debe seleccionar un tipo de contrato";

        if (!data.demandante.trim())
            e.demandante = "Debe ingresar el demandante";

        if (data.monto && Number(data.monto) <= 0)
            e.monto = "El monto debe ser mayor a 0";

        if (!data.fechaInicio)
            e.fechaInicio = "La fecha de inicio es obligatoria";

        if (data.fechaInicio && data.fechaFin && data.fechaFin < data.fechaInicio)
            e.fechaFin = "La fecha fin debe ser posterior a la fecha inicio";

        if (!data.numeroTransferencia)
            e.numeroTransferencia = "El número de transferencia es obligatorio";
        else if (Number(data.numeroTransferencia) <= 0)
            e.numeroTransferencia = "El número de transferencia debe ser positivo";

        if (!data.denominacion.trim())
            e.denominacion = "La denominación es obligatoria";

        setErrors(e);
        return Object.keys(e).length === 0;
    };

    // ── Mutation ──
    const { mutateAsync, isPending } = useMutation({
        mutationFn: async (payload: TransferenciaPayload) => {
            if (isEdit) {
                const result = await updateTransferencia(numericId!, payload);

                // Gestionar cambios en adoptantes (N:M)
                const currentIds = adoptantes.map((a) => a.id);
                const originalIds = originalAdoptantes.map((a) => a.id);
                const toAdd = currentIds.filter((id) => !originalIds.includes(id));
                const toRemove = originalIds.filter((id) => !currentIds.includes(id));

                if (toAdd.length > 0)
                    await addAdoptantesToTransferencia(numericId!, toAdd);
                if (toRemove.length > 0)
                    await removeAdoptantesFromTransferencia(numericId!, toRemove);

                return result;
            } else {
                return createTransferencia({
                    ...payload,
                    adoptantesIds: adoptantes.map((a) => a.id),
                });
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ["transferencias"] });
            navigate(isEdit ? `/transferencias/${numericId}` : "/transferencias", {
                state: { successMessage: isEdit ? "Transferencia actualizada con éxito!" : "Transferencia cargada con éxito!" }
            });
        },
    });

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitError(null);
        if (!validate()) return;

        if (!uct) {
            setSubmitError("No se encontró un grupo UTN configurado. Debe crear uno en la sección UCT antes de cargar transferencias.");
            return;
        }

        try {
            await mutateAsync({
                demandante: data.demandante.trim(),
                descripcionActividad: data.descripcionActividad.trim(),
                monto: data.monto ? Number(data.monto) : null,
                fechaInicio: data.fechaInicio,
                fechaFin: data.fechaFin || undefined,
                tipoContratoId: Number(data.tipoContratoId),
                grupoUtnId: uct.id,
                denominacion: data.denominacion.trim(),
                numeroTransferencia: Number(data.numeroTransferencia),
            });
        } catch (err: any) {
            const msg =
                err?.body?.error ?? err?.message ?? "Error al guardar la transferencia";
            setSubmitError(msg);
        }
    };

    // ── Loading ──
    if (isEdit && loadingExisting)
        return <p className="text-slate-500">Cargando transferencia…</p>;

    const inputClass = (field: string) =>
        `input ${errors[field] ? "!border-red-500 !ring-2 !ring-red-500" : ""}`;

    return (
        <section className="w-full">
            <h2 className="text-2xl md:text-3xl font-semibold leading-none">
                {isEdit ? "Editar transferencia" : "Nueva transferencia"}
            </h2>

            <form
                onSubmit={onSubmit}
                className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 space-y-6"
            >
                {/* Banner de Errores Generales */}
                {submitError && (
                    <div className="p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg">
                        {submitError}
                    </div>
                )}

                {/* Denominación (mock-only) */}
                <Field label="Denominación">
                    <input
                        className="input"
                        value={data.denominacion}
                        maxLength={200}
                        onChange={change("denominacion")}
                        placeholder="Nombre corto del contrato (opcional)"
                    />
                </Field>

                {/* Descripción de la actividad */}
                <Field label="Descripción de la actividad">
                    <>
                        <textarea
                            className={`${inputClass("descripcionActividad")} min-h-[100px] resize-y`}
                            rows={4}
                            value={data.descripcionActividad}
                            onChange={change("descripcionActividad")}
                            placeholder="Resumen del objetivo, alcance y resultados esperados"
                            required
                        />
                        {errors.descripcionActividad && (
                            <p className="text-red-500 text-sm mt-1">{errors.descripcionActividad}</p>
                        )}
                    </>
                </Field>

                {/* Tipo de Contrato */}
                <Field label="Tipo de contrato">
                    <>
                        <select
                            className={`${inputClass("tipoContratoId")} ${!data.tipoContratoId ? "text-slate-400" : "text-slate-900"
                                }`}
                            value={data.tipoContratoId}
                            onChange={(e) => {
                                setData({ ...data, tipoContratoId: e.target.value });
                                clearError("tipoContratoId");
                            }}
                            required
                        >
                            <option value="" disabled>
                                {loadingTipos ? "Cargando tipos…" : "Seleccionar tipo"}
                            </option>
                            {tiposContrato.map((t) => (
                                <option key={t.id} value={t.id}>
                                    {t.nombre}
                                </option>
                            ))}
                        </select>
                        {errors.tipoContratoId && (
                            <p className="text-red-500 text-sm mt-1">{errors.tipoContratoId}</p>
                        )}
                    </>
                </Field>

                {/* Demandante */}
                <Field label="Demandante">
                    <>
                        <input
                            className={inputClass("demandante")}
                            value={data.demandante}
                            onChange={change("demandante")}
                            placeholder="Parte que solicitó formalmente la actividad"
                            required
                        />
                        {errors.demandante && (
                            <p className="text-red-500 text-sm mt-1">{errors.demandante}</p>
                        )}
                    </>
                </Field>

                {/* Row: Monto + Nro Erogación */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Monto ($)">
                        <>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                className={inputClass("monto")}
                                value={data.monto}
                                onChange={change("monto")}
                                placeholder="Valor económico (opcional)"
                            />
                            {errors.monto && (
                                <p className="text-red-500 text-sm mt-1">{errors.monto}</p>
                            )}
                        </>
                    </Field>

                    <Field label="Número de transferencia *">
                        <input
                            type="number"
                            min="1"
                            className={inputClass("numeroTransferencia")}
                            value={data.numeroTransferencia}
                            onChange={change("numeroTransferencia")}
                            placeholder="Ej. 2024001"
                            required
                        />
                        {errors.numeroTransferencia && (
                            <p className="text-red-500 text-sm mt-1">{errors.numeroTransferencia}</p>
                        )}
                    </Field>
                </div>

                {/* Row: Fechas (usando DatePicker como Proyectos) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field label="Fecha de inicio">
                        <>
                            <DatePicker
                                value={parseYMD(data.fechaInicio)}
                                onChange={setFecha("fechaInicio")}
                                className={inputClass("fechaInicio")}
                                helperText={errors.fechaInicio ?? "DD/MM/AAAA"}
                            />
                            {errors.fechaInicio && (
                                <p className="text-red-500 text-sm mt-1">{errors.fechaInicio}</p>
                            )}
                        </>
                    </Field>

                    <Field label="Fecha de finalización">
                        <>
                            <DatePicker
                                value={parseYMD(data.fechaFin)}
                                onChange={setFecha("fechaFin")}
                                minDate={parseYMD(data.fechaInicio) || undefined}
                                className={inputClass("fechaFin")}
                                helperText={errors.fechaFin ?? "DD/MM/AAAA"}
                            />
                            {errors.fechaFin && (
                                <p className="text-red-500 text-sm mt-1">{errors.fechaFin}</p>
                            )}
                        </>
                    </Field>
                </div>

                {/* Adoptantes */}
                <div className="pt-2 border-t border-slate-100">
                    <AdoptanteSelector
                        selected={adoptantes}
                        onChange={setAdoptantes}
                    />
                </div>

                {/* Acciones */}
                <div className="flex justify-between pt-6">
                    <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => navigate(-1)}
                    >
                        Volver
                    </Button>

                    <Button type="submit" size="sm" disabled={isPending}>
                        {isPending
                            ? "Guardando…"
                            : isEdit
                                ? "Actualizar"
                                : "Cargar"}
                    </Button>
                </div>
            </form>
            
        </section>
    );
}
