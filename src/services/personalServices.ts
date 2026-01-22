import { http } from "@/lib/http";

// --- TIPOS ---
export type PersonalType = "INVESTIGADOR" | "PROFESIONAL" | "PTAA" | "BECARIO";

// Tipo unificado para el Frontend
export type Personal = {
  id: string;
  nombreApellido: string;
  horasSemanales: number;
  tipo: PersonalType;
  // Campos específicos (opcionales según el tipo)
  categoriaUtn?: string;
  programaIncentivos?: string;
  dedicacion?: string; 
  tipoPersonal?: string; // Para PTAA (Técnico, Administrativo, Apoyo)
  tipoFormacion?: string; // Para Becario
  fuenteFinanciamiento?: string; // Para Becario
  proyectoCoordinaId?: string | null;
  // Fechas para PTAA
  fechaInicio?: string;
  fechaFin?: string;
};

const BASE = import.meta.env.VITE_API_URL;

// Endpoints del backend según el tipo
const ENDPOINTS = {
  INVESTIGADOR: "/investigadores",
  BECARIO: "/becarios",
  PTAA: "/personal",        // Backend usa la tabla 'personal' genérica para PTAA
  PROFESIONAL: "/personal", // Backend usa la tabla 'personal' genérica para Profesional
};

// --- API ---

// 1. Obtener todo el personal (Usando el endpoint unificado del backend)
export async function getPersonal(params?: { tipo?: PersonalType }): Promise<Personal[]> {
  if (!BASE) return []; // Fallback si no hay backend configurado
  
  // Endpoint especial del backend que devuelve todo junto
  const data = await http<any[]>("/personal-all/");
  
  // Mapeamos la respuesta del backend (snake_case) al formato del frontend (camelCase)
  let mapped = data.map((item: any) => ({
    id: String(item.id),
    nombreApellido: item.nombre_apellido,
    horasSemanales: item.horas_semanales,
    tipo: mapBackendRoleToFront(item.rol), 
    // Mapeos extra para mostrar detalles en la tarjeta si es necesario
    detalle: item.detalle 
  } as Personal));

  if (params?.tipo) {
    mapped = mapped.filter(p => p.tipo === params.tipo);
  }
  return mapped;
}

// 2. Guardar (Crear o Editar)
export async function upsertPersonal(payload: Personal) {
  if (!BASE) throw new Error("Sin conexión al backend");

  // Determinar URL y Método
  // Nota: Para PTAA y Profesional usamos el endpoint genérico /personal del back
  const endpointBase = ENDPOINTS[payload.tipo] || "/personal"; 
  const url = payload.id 
    ? `${endpointBase}/${payload.id}` 
    : endpointBase;
  
  const method = payload.id ? "PUT" : "POST";

  // Objeto base común
  let body: any = {
    nombre_apellido: payload.nombreApellido,
    horas_semanales: payload.horasSemanales,
    grupo_utn_id: await getGrupoId() // Asumimos ID 1 o buscamos
  };

  // --- Lógica específica por tipo para obtener IDs ---
  
  if (payload.tipo === "INVESTIGADOR") {
    // Buscar IDs de cat, dedicacion, incentivos basándonos en el texto seleccionado
    const [dedicacionId, catId, incId] = await Promise.all([
        getIdByName("/tipo-dedicacion/", payload.dedicacion),
        getIdByName("/categoria-utn/", payload.categoriaUtn),
        getIdByName("/programas-incentivos/", payload.programaIncentivos)
    ]);
    
    body = { 
      ...body, 
      tipo_dedicacion_id: dedicacionId, 
      categoria_utn_id: catId, 
      programa_incentivos_id: incId,
      // proyecto_id: ... si fuera necesario
    };
  } 
  else if (payload.tipo === "BECARIO") {
    const [formacionId, fuenteId] = await Promise.all([
        getIdByName("/tipo-formacion/", payload.tipoFormacion),
        getIdByName("/fuente-financiamiento/", payload.fuenteFinanciamiento)
    ]);

    body = { 
      ...body, 
      tipo_formacion_id: formacionId,
      fuente_financiamiento_id: fuenteId 
    };
  }
  else {
    // PTAA / PROFESIONAL -> Tabla 'personal'
    // Necesitamos tipo_personal_id (Técnico, Administrativo, Apoyo, o Profesional)
    const tipoNombre = payload.tipo === "PROFESIONAL" ? "Profesional" : payload.tipoPersonal;
    const tipoId = await getIdByName("/tipo-personal/", tipoNombre || "Apoyo"); // Default a Apoyo si falla
    
    body = { ...body, tipo_personal_id: tipoId };
  }

  return http(url, { method, body: JSON.stringify(body) });
}

// 3. Eliminar
export async function deletePersonal(id: string) {
    // El frontend a veces no sabe el tipo exacto al borrar desde una lista general.
    // Intentamos borrar en orden (esto es un parche robusto).
    try { await http(`/investigadores/${id}`, { method: "DELETE" }); return; } catch {}
    try { await http(`/becarios/${id}`, { method: "DELETE" }); return; } catch {}
    try { await http(`/personal/${id}`, { method: "DELETE" }); return; } catch {}
}

// --- HELPERS INTERNOS ---

// Busca el ID de un registro por su nombre (ej: busca ID de "Exclusiva" en /tipo-dedicacion/)
async function getIdByName(endpoint: string, name: string | undefined): Promise<number | null> {
  if (!name) return null;
  try {
    const list = await http<any[]>(endpoint);
    // Busca exacto o aproximado (insensitive)
    const found = list.find((i: any) => i.nombre.toLowerCase().trim() === name.toLowerCase().trim());
    return found ? found.id : null;
  } catch (e) {
    console.error(`Error buscando ID en ${endpoint}`, e);
    return null;
  }
}

async function getGrupoId(): Promise<number> {
    // Hardcodeado ID 1 porque el sistema es para un solo grupo por ahora
    return 1; 
}

function mapBackendRoleToFront(rol: string): PersonalType {
    if (rol === "investigador") return "INVESTIGADOR";
    if (rol === "becario") return "BECARIO";
    // El endpoint personal-all devuelve 'personal', asumimos PTAA por defecto salvo logica extra
    return "PTAA"; 
}