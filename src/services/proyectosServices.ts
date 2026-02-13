import { http } from "@/lib/http";
import { Option } from "./optionsService";

export type Proyecto = {
  id?: string;
  tipoProyectoId: number; 
  codigoProyecto: number;
  fechaInicio: string; // YYYY-MM-DD
  fechaFinalizacion?: string;
  nombreProyecto: string;
  descripcionProyecto: string; // Nuevo campo obligatorio
  dificultadesProyecto?: string; // Nuevo campo opcional
  grupoUtnId?: number; // Nuevo campo opcional
  fuenteFinanciamientoId?: number; // Cambiado a number
  planificacionId?: number; // Nuevo campo opcional
};

const BASE = import.meta.env.VITE_API_URL;

export async function getProyectos(): Promise<Proyecto[]> {
  if (!BASE) return [];
  const data = await http<any[]>("/proyectos/");
  
  return data.map((p: any) => ({
    id: String(p.id),
    codigoProyecto: p.codigo_proyecto, // Re-added mapping
    nombreProyecto: p.nombre_proyecto,
    descripcionProyecto: p.descripcion_proyecto, // Mapear descripcion_proyecto
    dificultadesProyecto: p.dificultades_proyecto, // Mapear dificultades_proyecto
    fechaInicio: p.fecha_inicio,
    fechaFinalizacion: p.fecha_fin,
    tipoProyectoId: p.tipo_proyecto?.id,
    grupoUtnId: p.grupo_utn?.id, // Mapear grupo_utn_id
    fuenteFinanciamientoId: p.fuente_financiamiento?.id, // Mapear fuente_financiamiento_id
    planificacionId: p.planificacion_id // Mapear planificacion_id
  }));
}

export async function upsertProyectos(payload: Proyecto) {
  if (!BASE) throw new Error("Sin Backend");

  const body = {
    codigo_proyecto: payload.codigoProyecto, // Re-added to payload
    nombre_proyecto: payload.nombreProyecto,
    descripcion_proyecto: payload.descripcionProyecto,
    fecha_inicio: payload.fechaInicio,
    tipo_proyecto_id: payload.tipoProyectoId,
    fecha_fin: payload.fechaFinalizacion || null,
    dificultades_proyecto: payload.dificultadesProyecto || null,
    grupo_utn_id: payload.grupoUtnId || null,
    fuente_financiamiento_id: payload.fuenteFinanciamientoId || null,
    planificacion_id: payload.planificacionId || null,
  };

  const url = payload.id ? `/proyectos/${payload.id}` : "/proyectos";
  const method = payload.id ? "PUT" : "POST";

  return http(url, { method, body: JSON.stringify(body) });
}

export async function deleteProyectos(id: string) {
  return http<void>(`/proyectos/${id}`, { method: "DELETE" });
}