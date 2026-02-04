import { http } from "@/lib/http";

// --- TIPOS ---
export type PersonalType = "INVESTIGADOR" | "PROFESIONAL" | "PTAA" | "BECARIO";

// Tipo unificado para el Frontend. Ahora usa IDs numéricos.
export type Personal = {
  id?: string;
  nombreApellido: string;
  horasSemanales: number;
  tipo: PersonalType;
  // Campos específicos (ahora como IDs)
  categoriaUtnId?: number;
  programaIncentivosId?: number;
  dedicacionId?: number;
  tipoPersonalId?: number;
  tipoFormacionId?: number;
  fuenteFinanciamientoId?: number;
  // Fechas y otros
  fechaInicio?: string;
  fechaFin?: string;
};

const BASE = import.meta.env.VITE_API_URL;

// Endpoints del backend según el tipo
const ENDPOINTS: Record<PersonalType, string> = {
  INVESTIGADOR: "/investigadores",
  BECARIO: "/becarios",
  PTAA: "/personal",
  PROFESIONAL: "/personal",
};

// --- API ---

// 1. Obtener todo el personal (sin cambios)
export async function getPersonal(params?: { tipo?: PersonalType }): Promise<any[]> {
  if (!BASE) return [];
  const data = await http<any[]>("/personal-all/");
  let mapped = data.map((item: any) => ({
    id: String(item.id),
    nombreApellido: item.nombre_apellido,
    horasSemanales: item.horas_semanales,
    tipo: mapBackendRoleToFront(item.rol),
    detalle: item.detalle 
  }));

  if (params?.tipo) {
    mapped = mapped.filter(p => p.tipo === params.tipo);
  }
  return mapped;
}

// 2. Guardar (Crear o Editar) - **SIMPLIFICADO**
export async function upsertPersonal(payload: Personal) {
  if (!BASE) throw new Error("Sin conexión al backend");

  const endpointBase = ENDPOINTS[payload.tipo];
  const url = payload.id ? `${endpointBase}/${payload.id}` : endpointBase;
  const method = payload.id ? "PUT" : "POST";

  // Mapeo directo de camelCase (frontend) a snake_case (backend)
  const body = {
    nombre_apellido: payload.nombreApellido,
    horas_semanales: payload.horasSemanales,
    grupo_utn_id: 1, // Hardcodeado como antes
    // IDs que vienen del payload
    categoria_utn_id: payload.categoriaUtnId,
    programa_incentivos_id: payload.programaIncentivosId,
    tipo_dedicacion_id: payload.dedicacionId,
    tipo_personal_id: payload.tipoPersonalId,
    tipo_formacion_id: payload.tipoFormacionId ? Number(payload.tipoFormacionId) : undefined,
    fuente_financiamiento_id: payload.fuenteFinanciamientoId,
    // Fechas
    fecha_inicio: payload.fechaInicio,
    fecha_fin: payload.fechaFin,
  };

  return http(url, { method, body: JSON.stringify(body) });
}

// 3. Eliminar (sin cambios)
export async function deletePersonal(id: string) {
    try { await http(`/investigadores/${id}`, { method: "DELETE" }); return; } catch {}
    try { await http(`/becarios/${id}`, { method: "DELETE" }); return; } catch {}
    try { await http(`/personal/${id}`, { method: "DELETE" }); return; } catch {}
}


// --- HELPERS INTERNOS ---

function mapBackendRoleToFront(rol: string): PersonalType {
    if (rol === "investigador") return "INVESTIGADOR";
    if (rol === "becario") return "BECARIO";
    return "PTAA"; // Asumir PTAA por defecto
}