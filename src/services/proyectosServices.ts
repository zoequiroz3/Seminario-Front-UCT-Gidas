import { http } from "@/lib/http";
import { Option } from "./optionsService";

export type Proyecto = {
  id?: string;
  tipoProyectoId: number; 
  codigoProyecto: string;
  fechaInicio: string; // YYYY-MM-DD
  fechaFinalizacion?: string;
  nombreProyecto: string;
  fuenteFinanciamiento?: string;
  // Campos para mostrar en la tabla, no para enviar
  tipoProyectoNombre?: string;
};

const BASE = import.meta.env.VITE_API_URL;

export async function getProyectos(): Promise<Proyecto[]> {
  if (!BASE) return [];
  const data = await http<any[]>("/proyectos/");
  
  return data.map((p: any) => ({
    id: String(p.id),
    codigoProyecto: String(p.codigo_proyecto),
    nombreProyecto: p.nombre_proyecto,
    fechaInicio: p.fecha_inicio,
    fechaFinalizacion: p.fecha_fin,
    tipoProyectoId: p.tipo_proyecto?.id,
    tipoProyectoNombre: p.tipo_proyecto?.nombre || "N/A",
    fuenteFinanciamiento: p.fuente_financiamiento?.nombre || "N/A"
  }));
}

export async function upsertProyectos(payload: Proyecto) {
  if (!BASE) throw new Error("Sin Backend");

  const body = {
    codigo_proyecto: parseInt(payload.codigoProyecto, 10) || null,
    nombre_proyecto: payload.nombreProyecto,
    descripcion_proyecto: payload.nombreProyecto, // Usamos nombre como descripción por ahora
    fecha_inicio: payload.fechaInicio,
    fecha_fin: payload.fechaFinalizacion || null,
    tipo_proyecto_id: payload.tipoProyectoId,
    // Asumiendo que fuente de financiamiento también es un ID si existe
    // fuente_financiamiento_id: payload.fuenteFinanciamientoId,
  };

  const url = payload.id ? `/proyectos/${payload.id}` : "/proyectos";
  const method = payload.id ? "PUT" : "POST";

  return http(url, { method, body: JSON.stringify(body) });
}

export async function deleteProyectos(id: string) {
  return http<void>(`/proyectos/${id}`, { method: "DELETE" });
}