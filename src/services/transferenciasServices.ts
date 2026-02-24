import { http } from "@/lib/http";
import { isMockMode } from "./tiposContratoService";
import type { Adoptante } from "./adoptantesServices";

/** Forzar modo mock para transferencias (poner false cuando el backend esté listo). */
const FORCE_MOCK = false;
const useMock = () => FORCE_MOCK || isMockMode();

// ─── Tipos ───────────────────────────────────────────────────

/** Lo que devuelve el backend en GET /transferencias */
interface TransferenciaBackend {
    id: number;
    demandante: string;
    descripcion_actividad: string;
    monto: number | null;
    fecha_inicio: string;
    fecha_fin: string | null;
    tipo_contrato: string | null;
    grupo: string | null;
    adoptantes?: Adoptante[];
    numero_transferencia: number;
    denominacion: string;
}

/** Interfaz unificada del frontend (incluye campos mock-only del spec). */
export interface Transferencia {
    id: number;
    demandante: string;
    descripcionActividad: string;
    monto: number | null;
    fechaInicio: string;
    fechaFin?: string;
    tipoContrato: string | null;
    tipoContratoId?: number;
    grupo: string | null;
    grupoUtnId?: number;
    adoptantes: Adoptante[];
    // Campos completos que mapean al backend
    denominacion: string;
    numeroTransferencia: number;
}

/** Payload para crear/editar en el frontend. */
export interface TransferenciaPayload {
    demandante: string;
    descripcionActividad: string;
    monto: number | null;
    fechaInicio: string;
    fechaFin?: string;
    tipoContratoId: number;
    grupoUtnId: number;
    adoptantesIds?: number[];
    // Mapas correctos al back
    denominacion: string;
    numeroTransferencia: number;
}

// ─── Mappers ─────────────────────────────────────────────────

function fromBackend(raw: TransferenciaBackend): Transferencia {
    return {
        id: raw.id,
        demandante: raw.demandante,
        descripcionActividad: raw.descripcion_actividad,
        monto: raw.monto,
        fechaInicio: raw.fecha_inicio,
        fechaFin: raw.fecha_fin ?? undefined,
        tipoContrato: raw.tipo_contrato,
        grupo: raw.grupo,
        adoptantes: raw.adoptantes ?? [],
        denominacion: raw.denominacion || "",
        numeroTransferencia: (raw as any).numero_transferencia || 0,
    };
}

function toBackend(data: TransferenciaPayload): Record<string, unknown> {
    return {
        demandante: data.demandante,
        descripcion_actividad: data.descripcionActividad,
        monto: data.monto,
        fecha_inicio: data.fechaInicio,
        fecha_fin: data.fechaFin || null,
        tipo_contrato_id: data.tipoContratoId,
        grupo_utn_id: data.grupoUtnId,
        denominacion: data.denominacion,
        numero_transferencia: data.numeroTransferencia,
    };
}

// ─── Mock helpers ────────────────────────────────────────────

const MOCK_KEY = "gidas_transferencias_mock";

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

function readMock(): Transferencia[] {
    const raw = localStorage.getItem(MOCK_KEY);
    return raw ? JSON.parse(raw) : [];
}

function writeMock(items: Transferencia[]) {
    localStorage.setItem(MOCK_KEY, JSON.stringify(items));
}

let _mockIdCounter = 100;

function ensureSeed() {
    if (localStorage.getItem(MOCK_KEY) !== null) return;
    const seed: Transferencia[] = [
        {
            id: 1,
            denominacion: "Desarrollo de software de gestión para PyMEs",
            descripcionActividad:
                "Transferencia de sistema de gestión desarrollado por el grupo de investigación para su adopción en pequeñas y medianas empresas de la región.",
            demandante: "Cámara de Comercio Local",
            tipoContrato: "Transferencia de Tecnología",
            tipoContratoId: 1,
            grupo: "GIDAS",
            grupoUtnId: 1,
            monto: 150000,
            fechaInicio: "2024-03-01",
            fechaFin: "2024-12-31",
            numeroTransferencia: 2024001,
            adoptantes: [{ id: 1, nombre: "Empresa Tech SA" }],
        },
        {
            id: 2,
            denominacion: "Capacitación en Machine Learning aplicado",
            descripcionActividad:
                "Curso intensivo de 40 horas sobre técnicas de ML aplicadas al análisis de datos públicos municipales.",
            demandante: "Secretaría de Modernización",
            tipoContrato: "Transferencia de conocimientos",
            tipoContratoId: 3,
            grupo: "GIDAS",
            grupoUtnId: 1,
            monto: 80000,
            numeroTransferencia: 2024002,
            fechaInicio: "2024-06-15",
            adoptantes: [{ id: 2, nombre: "Municipalidad de Resistencia" }],
        },
        {
            id: 3,
            denominacion: "Ensayos de resistencia de materiales",
            descripcionActividad:
                "Realización de ensayos normalizados de compresión y tracción sobre probetas de hormigón para obra en curso.",
            demandante: "Constructora Norte SRL",
            tipoContrato:
                "Servicios Técnicos / de apoyo / supervisión y/o Ensayos de Laboratorio",
            tipoContratoId: 5,
            grupo: "GIDAS",
            grupoUtnId: 1,
            monto: null,
            fechaInicio: "2024-01-10",
            fechaFin: "2024-04-30",
            numeroTransferencia: 2024005,
            adoptantes: [{ id: 3, nombre: "Fundación Educativa del Norte" }],
        },
    ];
    _mockIdCounter = 100;
    writeMock(seed);
}

// ─── CRUD Transferencias ─────────────────────────────────────

/** Listar todas las transferencias. */
export async function getTransferencias(): Promise<Transferencia[]> {
    if (useMock()) {
        ensureSeed();
        await delay();
        return readMock();
    }
    const raw = await http<TransferenciaBackend[]>("/transferencias/");
    return raw.map(fromBackend);
}

/** Obtener una transferencia por id. */
export async function getTransferenciaById(
    id: number
): Promise<Transferencia | null> {
    if (useMock()) {
        await delay();
        return readMock().find((t) => t.id === id) ?? null;
    }
    const raw = await http<TransferenciaBackend | null>(`/transferencias/${id}`);
    return raw ? fromBackend(raw) : null;
}

/** Crear una nueva transferencia. */
export async function createTransferencia(
    data: TransferenciaPayload
): Promise<Transferencia> {
    if (useMock()) {
        await delay();
        const item: Transferencia = {
            id: ++_mockIdCounter,
            demandante: data.demandante,
            descripcionActividad: data.descripcionActividad,
            monto: data.monto,
            fechaInicio: data.fechaInicio,
            fechaFin: data.fechaFin,
            tipoContrato: null,
            tipoContratoId: data.tipoContratoId,
            grupo: null,
            grupoUtnId: data.grupoUtnId,
            adoptantes: [],
            denominacion: data.denominacion || "Sin Denominación",
            numeroTransferencia: data.numeroTransferencia,
        };
        const list = readMock();
        list.push(item);
        writeMock(list);
        return item;
    }

    const raw = await http<TransferenciaBackend>("/transferencias/", {
        method: "POST",
        body: JSON.stringify(toBackend(data)),
    });

    const created = fromBackend(raw);

    // Si se pasaron adoptantes, vincularlos por separado
    if (data.adoptantesIds && data.adoptantesIds.length > 0) {
        await addAdoptantesToTransferencia(created.id, data.adoptantesIds);
    }

    return created;
}

/** Actualizar una transferencia existente. */
export async function updateTransferencia(
    id: number,
    data: Partial<TransferenciaPayload>
): Promise<Transferencia> {
    if (useMock()) {
        await delay();
        const list = readMock();
        const idx = list.findIndex((t) => t.id === id);
        if (idx === -1) throw new Error("Transferencia no encontrada");
        list[idx] = { ...list[idx], ...data } as Transferencia;
        writeMock(list);
        return list[idx];
    }

    // Mapear solo los campos presentes al formato backend
    const backendPayload: Record<string, unknown> = {};
    if (data.demandante !== undefined)
        backendPayload.demandante = data.demandante;
    if (data.descripcionActividad !== undefined)
        backendPayload.descripcion_actividad = data.descripcionActividad;
    if (data.monto !== undefined) backendPayload.monto = data.monto;
    if (data.fechaInicio !== undefined)
        backendPayload.fecha_inicio = data.fechaInicio;
    if (data.fechaFin !== undefined)
        backendPayload.fecha_fin = data.fechaFin || null;
    if (data.tipoContratoId !== undefined)
        backendPayload.tipo_contrato_id = data.tipoContratoId;
    if (data.grupoUtnId !== undefined)
        backendPayload.grupo_utn_id = data.grupoUtnId;
    if (data.denominacion !== undefined)
        backendPayload.denominacion = data.denominacion;
    if (data.numeroTransferencia !== undefined)
        backendPayload.numero_transferencia = data.numeroTransferencia;

    const raw = await http<TransferenciaBackend>(`/transferencias/${id}`, {
        method: "PUT",
        body: JSON.stringify(backendPayload),
    });
    return fromBackend(raw);
}

/** Eliminar una transferencia. */
export async function deleteTransferencia(id: number): Promise<void> {
    if (useMock()) {
        await delay();
        writeMock(readMock().filter((t) => t.id !== id));
        return;
    }
    await http<void>(`/transferencias/${id}`, { method: "DELETE" });
}

// ─── Relación N:M — Adoptantes en Transferencia ─────────────

/** Agregar adoptantes a una transferencia (por IDs). */
export async function addAdoptantesToTransferencia(
    transferenciaId: number,
    adoptantesIds: number[]
): Promise<void> {
    if (useMock()) {
        await delay();
        // En mock mode no tenemos la relación real, sería complejo.
        // Se maneja directamente en la transferencia.
        return;
    }
    await http(`/transferencias/${transferenciaId}/adoptantes`, {
        method: "POST",
        body: JSON.stringify({ adoptantes_ids: adoptantesIds }),
    });
}

/** Quitar adoptantes de una transferencia (por IDs). */
export async function removeAdoptantesFromTransferencia(
    transferenciaId: number,
    adoptantesIds: number[]
): Promise<void> {
    if (useMock()) {
        await delay();
        return;
    }
    await http(`/transferencias/${transferenciaId}/adoptantes`, {
        method: "DELETE",
        body: JSON.stringify({ adoptantes_ids: adoptantesIds }),
    });
}
