import { http } from "@/lib/http";
import { Option } from "./optionsService";

export type Proyecto = {
  id?: string;
  tipoProyectoId: number;
  tipoProyectoNombre?: string;

  codigoProyecto: string;
  nombreProyecto: string;

  fechaInicio: string;
  fechaFinalizacion?: string;

  fuenteFinanciamientoId?: number;
  fuenteFinanciamientoNombre?: string;
  descripcionProyecto?: string;

  grupoUtnId?: number;
  grupoUtnNombre?: string;

  planificacionId?: number;
  planificacionDescripcion?: string;

  investigadores?: {
    id: number;
    nombre_apellido: string;
  }[];

  becarios?: {
    id: number;
    nombre_apellido: string;
  }[];
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

    fuenteFinanciamientoId: p.fuente_financiamiento?.id,
    fuenteFinanciamientoNombre: p.fuente_financiamiento?.nombre || "N/A",
    descripcionProyecto: p.descripcion_proyecto || "",
    investigadores: p.investigadores || [],
    becarios: p.becarios || [],

  }));

}

export async function upsertProyectos(payload: any) {
  if (!BASE) throw new Error("Sin Backend");

  const body = {
    codigo_proyecto: payload.codigoProyecto, // Re-added to payload
    nombre_proyecto: payload.nombreProyecto,
    descripcion_proyecto: payload.descripcionProyecto, // Usamos nombre como descripción por ahora
    fecha_inicio: payload.fechaInicio,
    tipo_proyecto_id: payload.tipoProyectoId,
    fecha_fin: payload.fechaFinalizacion || null,
    // Asumiendo que fuente de financiamiento también es un ID si existe
    fuente_financiamiento_id: payload.fuenteFinanciamientoId,
  };

  const url = payload.id ? `/proyectos/${payload.id}` : "/proyectos/";
  const method = payload.id ? "PUT" : "POST";

  return http(url, { method, body: JSON.stringify(body) });
}

export async function deleteProyectos(id: string) {
  return http<void>(`/proyectos/${id}`, { method: "DELETE" });
}

export async function getProyectoById(id: number) {
  const data = await http<any>(`/proyectos/${id}`);

  return {
    id: String(data.id),
    codigoProyecto: String(data.codigo_proyecto),
    nombreProyecto: data.nombre_proyecto,
    descripcionProyecto: data.descripcion_proyecto,
    fechaInicio: data.fecha_inicio,
    fechaFinalizacion: data.fecha_fin,

    tipoProyectoId: data.tipo_proyecto?.id,
    tipoProyectoNombre: data.tipo_proyecto?.nombre,

    grupoUtnId: data.grupo_utn?.id,
    grupoUtnNombre: data.grupo_utn?.nombre,

    fuenteFinanciamientoId: data.fuente_financiamiento?.id,
    fuenteFinanciamientoNombre:
      data.fuente_financiamiento?.nombre,

    planificacionId: data.planificacion?.id,
    planificacionDescripcion:
      data.planificacion?.descripcion,
    investigadores: data.investigadores || [],
    becarios: data.becarios || [],
  };
}

export async function cerrarProyecto(
  id: string,
  fechaFin: string
) {
  return http(`/proyectos/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      fecha_fin: fechaFin,
    }),
  });
}

export function vincularInvestigadores(
  proyectoId: number,
  investigadoresIds: number[],
  fechaInicio: string
) {
  return http(`/proyectos/${proyectoId}/investigadores`, {
    method: "POST",
    body: JSON.stringify(
      investigadoresIds.map((id) => ({
        id_investigador: id,
        fecha_inicio: fechaInicio,
      }))
    ),
  });
}

export function vincularBecarios(
  proyectoId: number,
  becariosIds: number[],
  fechaInicio: string
) {
  return http(`/proyectos/${proyectoId}/becarios`, {
    method: "POST",
    body: JSON.stringify(
      becariosIds.map((id) => ({
        id_becario: id,
        fecha_inicio: fechaInicio,
      }))
    ),
  });
}

