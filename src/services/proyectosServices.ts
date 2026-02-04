import { http } from "@/lib/http";

export type Proyecto = {
  id: string;
  tipoProyecto: string; 
  codigoProyecto: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFinalizacion: string;
  nombreProyecto: string;
  fuenteFinanciamiento: string;
};

const BASE = import.meta.env.VITE_API_URL;

// Helper para buscar ID de tipo
async function getTipoProyectoId(nombre: string): Promise<number | null> {
    const tipos = await http<any[]>("/tipos-proyecto/");
    const found = tipos.find(t => t.nombre.toLowerCase() === nombre.toLowerCase().trim());
    return found ? found.id : null;
}

export async function getProyectos() {
  if (!BASE) return [];
  const data = await http<any[]>("/proyectos/");
  
  // Mapear respuesta back -> front
  return data.map((p: any) => ({
    id: String(p.id),
    codigoProyecto: String(p.codigo_proyecto),
    nombreProyecto: p.nombre_proyecto,
    fechaInicio: p.fecha_inicio,
    fechaFinalizacion: p.fecha_fin,
    tipoProyecto: p.tipo_proyecto?.nombre || "",
    fuenteFinanciamiento: p.fuente_financiamiento?.nombre || ""
  }));
}

export async function upsertProyectos(payload: Proyecto) {
  if (!BASE) throw new Error("Sin Backend");

  const tipoId = await getTipoProyectoId(payload.tipoProyecto);
  if (!tipoId) throw new Error("Tipo de proyecto no válido o no existe en BD (Cree el tipo primero en el backend)");

  const body = {
    codigo_proyecto: parseInt(payload.codigoProyecto) || 0, // Backend espera int
    nombre_proyecto: payload.nombreProyecto,
    descripcion_proyecto: payload.nombreProyecto, // Usamos nombre como descripción por ahora
    fecha_inicio: payload.fechaInicio,
    fecha_fin: payload.fechaFinalizacion || null,
    tipo_proyecto_id: tipoId,
    // grupo_utn_id: 1, // Se puede agregar si el back lo requiere obligatorio
  };

  const url = payload.id ? `/proyectos/${payload.id}` : "/proyectos";
  const method = payload.id ? "PUT" : "POST";

  return http(url, { method, body: JSON.stringify(body) });
}

export async function deleteProyectos(id: string) {
  return http<void>(`/proyectos/${id}`, { method: "DELETE" });
}