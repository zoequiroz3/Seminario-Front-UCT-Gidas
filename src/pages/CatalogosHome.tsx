import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronDown, Plus, Pencil, Trash2, Check, X } from "lucide-react";
import {
    getCatalogItems,
    createCatalogItem,
    updateCatalogItem,
    deleteCatalogItem,
    type CatalogItem,
} from "@/services/catalogoServices";
import ConfirmDialog from "@/components/ConfirmDialog";
import SuccessToast from "@/components/SuccessToast";
import Button from "@/components/Button";
import Field from "@/components/Field";

/* ───── Catalog definitions ───── */

type FkField = {
    idField: string;
    label: string;
    endpoint: string;
    optionLabel?: string;
};

type CatalogDef = {
    label: string;
    endpoint: string;
    nameField?: string;
    descField?: string;
    fkField?: FkField;
};

const CATALOGS: CatalogDef[] = [
    {
        label: "Becas",
        endpoint: "/becas/",
        nameField: "nombre_beca",
        descField: "descripcion",
        fkField: {
            idField: "fuente_financiamiento_id",
            label: "Fuente de Financiamiento",
            endpoint: "/fuente-financiamiento/",
        },
    },
    { label: "Nivel de Formación", endpoint: "/tipo-formacion/" },
    { label: "Categoría UTN", endpoint: "/categoria-utn/" },
    { label: "Tipo de Dedicación", endpoint: "/tipo-dedicacion/" },
    { label: "Fuente de Financiamiento", endpoint: "/fuente-financiamiento/" },
    { label: "Programa de Incentivos", endpoint: "/programas-incentivos/" },
    { label: "Tipo de Proyecto", endpoint: "/tipos-proyecto/" },
    { label: "Tipo de Erogación", endpoint: "/tipo-erogacion/" },
    { label: "Tipo de Contrato", endpoint: "/tipo-contrato/" },
    { label: "Tipo de Registro Propiedad", endpoint: "/tipo-registro-propiedad/" },
    { label: "Tipo de Reunión Científica", endpoint: "/tipos-reunion-cientifica/" },
    { label: "Grado Académico", endpoint: "/grado-academico" },
    { label: "Rol de Actividad", endpoint: "/rol-actividad" },
];

/* ───── Single catalog CRUD panel ───── */

function CatalogPanel({ def }: { def: CatalogDef }) {
    const queryClient = useQueryClient();
    const nameField = def.nameField ?? "nombre";
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(false);

    // FK options
    const [fkOptions, setFkOptions] = useState<CatalogItem[]>([]);

    // Add form
    const [showAdd, setShowAdd] = useState(false);
    const [newName, setNewName] = useState("");
    const [newDesc, setNewDesc] = useState("");
    const [newFkId, setNewFkId] = useState<number | "">("");

    // Edit
    const [editId, setEditId] = useState<number | null>(null);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editFkId, setEditFkId] = useState<number | "">("");

    // Delete confirm
    const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null);

    // Toast
    const [toast, setToast] = useState("");

    const load = async () => {
        setLoading(true);
        try {
            const data = await getCatalogItems(def.endpoint);
            setItems(data);
        } catch {
            /* silently fail */
        }
        setLoading(false);
    };

    useEffect(() => {
        if (def.fkField) {
            getCatalogItems(def.fkField.endpoint)
                .then(setFkOptions)
                .catch(() => { });
        }
    }, [def.fkField?.endpoint]);

    useEffect(() => {
        load();
    }, [def.endpoint]);

    const handleAdd = async () => {
        if (!newName.trim()) return;
        const body: Record<string, unknown> = { [nameField]: newName.trim() };
        if (def.descField && newDesc.trim()) body[def.descField] = newDesc.trim();
        if (def.fkField && newFkId) body[def.fkField.idField] = Number(newFkId);
        try {
            await createCatalogItem(def.endpoint, body);
            setNewName("");
            setNewDesc("");
            setNewFkId("");
            setShowAdd(false);
            setToast("Creado con éxito");
            queryClient.invalidateQueries();
            load();
        } catch {
            setToast("Error al crear");
        }
    };

    const handleUpdate = async (id: number) => {
        if (!editName.trim()) return;
        const body: Record<string, unknown> = { [nameField]: editName.trim() };
        if (def.descField) body[def.descField] = editDesc.trim();
        if (def.fkField) body[def.fkField.idField] = editFkId ? Number(editFkId) : null;
        try {
            await updateCatalogItem(def.endpoint, id, body);
            setEditId(null);
            setToast("Actualizado con éxito");
            queryClient.invalidateQueries();
            load();
        } catch {
            setToast("Error al actualizar");
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await deleteCatalogItem(def.endpoint, deleteTarget.id);
            setDeleteTarget(null);
            setToast("Eliminado con éxito");
            queryClient.invalidateQueries();
            load();
        } catch {
            setToast("Error al eliminar. Puede estar en uso.");
            setDeleteTarget(null);
        }
    };

    const getDisplayName = (item: CatalogItem) =>
        (item[nameField] as string) ?? item.nombre ?? "—";

    const getFkDisplayName = (item: CatalogItem): string | null => {
        if (!def.fkField) return null;
        const fk = item.fuente_financiamiento as { id: number; nombre: string } | null;
        return fk?.nombre ?? null;
    };

    const getFkId = (item: CatalogItem): number | "" => {
        if (!def.fkField) return "";
        const fk = item.fuente_financiamiento as { id: number } | null;
        return fk?.id ?? "";
    };

    const fkLabel = def.fkField?.label ?? "";
    const fkOptionLabel = def.fkField?.optionLabel ?? "nombre";

    return (
        <div className="space-y-4 pt-4">
            {loading && <p className="text-sm text-slate-400">Cargando…</p>}

            {!loading && items.length === 0 && (
                <p className="text-sm text-slate-400 italic">Sin registros</p>
            )}

            {/* Item list */}
            {!loading && items.length > 0 && (
                <div className="space-y-2">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={`rounded-lg border px-4 py-3 transition-colors ${editId === item.id
                                ? "border-sky-200 bg-sky-50/50"
                                : "border-slate-200 bg-white hover:bg-slate-50"
                                }`}
                        >
                            {editId === item.id ? (
                                /* ── Edit mode ── */
                                <div className="space-y-3">
                                    <Field label={def.nameField === "nombre_beca" ? "Nombre de la beca" : "Nombre"}>
                                        <input
                                            className="input"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && handleUpdate(item.id)}
                                            autoFocus
                                        />
                                    </Field>

                                    {def.descField && (
                                        <Field label="Descripción">
                                            <input
                                                className="input"
                                                value={editDesc}
                                                placeholder="Descripción"
                                                onChange={(e) => setEditDesc(e.target.value)}
                                            />
                                        </Field>
                                    )}

                                    {def.fkField && (
                                        <Field label={fkLabel}>
                                            <select
                                                className="input"
                                                value={editFkId}
                                                onChange={(e) => setEditFkId(e.target.value ? +e.target.value : "")}
                                            >
                                                <option value="">Sin {fkLabel.toLowerCase()}</option>
                                                {fkOptions.map((opt) => (
                                                    <option key={opt.id} value={opt.id}>
                                                        {String(opt[fkOptionLabel] ?? opt.nombre)}
                                                    </option>
                                                ))}
                                            </select>
                                        </Field>
                                    )}

                                    <div className="flex justify-end gap-2 pt-1">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setEditId(null)}
                                        >
                                            Cancelar
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            onClick={() => handleUpdate(item.id)}
                                        >
                                            Guardar
                                        </Button>
                                    </div>

                                  
                                </div>
                            ) : (
                                /* ── View mode ── */
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-800 truncate">
                                            {getDisplayName(item)}
                                        </p>
                                        {(def.descField && typeof item[def.descField] === "string") || getFkDisplayName(item) ? (
                                            <p className="text-xs text-slate-400 mt-0.5 truncate">
                                                {def.descField && typeof item[def.descField] === "string" && (
                                                    <span>{item[def.descField] as string}</span>
                                                )}
                                                {def.descField && typeof item[def.descField] === "string" && getFkDisplayName(item) && (
                                                    <span> · </span>
                                                )}
                                                {getFkDisplayName(item) && (
                                                    <span>{fkLabel}: {getFkDisplayName(item)}</span>
                                                )}
                                            </p>
                                        ) : null}
                                    </div>

                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => {
                                                setEditId(item.id);
                                                setEditName(getDisplayName(item));
                                                setEditDesc(
                                                    def.descField
                                                        ? ((item[def.descField] as string) ?? "")
                                                        : ""
                                                );
                                                setEditFkId(getFkId(item));
                                            }}
                                            className="p-2 rounded-lg hover:bg-sky-50 text-sky-600 transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil size={15} />
                                        </button>
                                        <button
                                            onClick={() => setDeleteTarget(item)}
                                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add form */}
            {showAdd ? (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 px-4 py-4 space-y-3">
                    <Field label={def.nameField === "nombre_beca" ? "Nombre de la beca" : "Nombre"} required>
                        <input
                            className="input"
                            placeholder="Nombre"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                            autoFocus
                        />
                    </Field>

                    {def.descField && (
                        <Field label="Descripción">
                            <input
                                className="input"
                                placeholder="Descripción"
                                value={newDesc}
                                onChange={(e) => setNewDesc(e.target.value)}
                            />
                        </Field>
                    )}

                    {def.fkField && (
                        <Field label={fkLabel}>
                            <select
                                className="input"
                                value={newFkId}
                                onChange={(e) => setNewFkId(e.target.value ? +e.target.value : "")}
                            >
                                <option value="">Sin {fkLabel.toLowerCase()}</option>
                                {fkOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>
                                        {String(opt[fkOptionLabel] ?? opt.nombre)}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                                setShowAdd(false);
                                setNewName("");
                                setNewDesc("");
                                setNewFkId("");
                            }}
                        >
                            Cancelar
                        </Button>
                        <Button type="button" size="sm" onClick={handleAdd}>
                            Crear
                        </Button>
                    </div>
                </div>
            ) : (
                <Button type="button" size="sm" onClick={() => setShowAdd(true)}>
                    <span className="flex items-center gap-2"><Plus size={16} /> Agregar nuevo</span>
                </Button>
            )}

            {/* Delete confirm */}
            <ConfirmDialog
                open={!!deleteTarget}
                title="Eliminar registro"
                message={`¿Estás seguro de eliminar "${deleteTarget ? getDisplayName(deleteTarget) : ""}"?`}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDelete}
            />

            {/* Toast */}
            <SuccessToast
                open={!!toast}
                message={toast}
                onClose={() => setToast("")}
            />
        </div>
    );
}

/* ───── Main page ───── */

export default function CatalogosHome() {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});

    const toggle = (label: string) =>
        setExpanded((prev) => ({ ...prev, [label]: !prev[label] }));

    return (
        <section className="w-full">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-semibold leading-none">
                    Gestionar Catálogos
                </h2>
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => navigate(-1)}
                >
                    Volver
                </Button>
            </div>

            <div className="mt-6 space-y-3">
                {CATALOGS.map((cat) => {
                    const isOpen = !!expanded[cat.label];
                    return (
                        <div
                            key={cat.label}
                            className="rounded-2xl border border-slate-200 bg-white overflow-hidden"
                        >
                            <button
                                onClick={() => toggle(cat.label)}
                                className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors"
                            >
                                <span className="text-sm font-medium text-slate-800">
                                    {cat.label}
                                </span>
                                <ChevronDown
                                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""
                                        }`}
                                />
                            </button>

                            <div
                                className={`transition-all duration-300 overflow-hidden ${isOpen
                                    ? "max-h-[3000px] opacity-100"
                                    : "max-h-0 opacity-0"
                                    }`}
                            >
                                <div className="px-6 pb-6 border-t border-slate-100">
                                    {isOpen && <CatalogPanel def={cat} />}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}